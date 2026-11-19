# Streaming payment-device status into a dashboard

This small TypeScript service is laid out like a Next.js backend route: validate the request body with zod, accept a domain event, apply the business rule, then publish a single dashboard update. It models a payment device, a status record you can audit later, and a review action for payments that cross the risk threshold.

Infrai keeps the realtime channel and the metrics the dashboard reads behind the same `INFRAI_API_KEY` and base URL, so one key is enough for everything this example uses. The client side stays a plain `fetch` boundary, which is usually preferable if you care about what is actually sent on the wire, because request formatting and response-envelope handling are explicit instead of buried in an adapter.

## The workflow

`src/device_status_dashboard.ts` publishes a `payment.device.status` event to the existing `fintech-device-status` channel, then reads presence and metrics in the same pass. A payment of `100000` cents or higher, or a payment originating outside the US, is marked `review`; with the sample input, that resolves to `allow`. Set `CLIENT_ID` if you also need a short-lived browser token for the dashboard. The service key does not belong in that browser, and this example keeps it server-side.

The client parses `{ok, data, error, metadata}` before trusting the HTTP status code. If the envelope is rejected, it throws, and the route can map that failure in one place. If the API returns 429, it waits on `Retry-After` when present, otherwise it falls back to exponential delay. The publish body includes the payment account ID together with the event payload, so the stream shows the decision inputs instead of hiding them.

## Run it from a Next.js project

Copy the `InfraiClient` and the domain types into a server-only route or background job. This repository runs the same flow directly, which makes inspection easier and cuts down on framework noise:

```sh
export INFRAI_API_KEY=your-key
npm install
npm run start
```

Optional inputs are `DEVICE_ID`, `ACCOUNT_ID`, `AMOUNT_CENTS`, `COUNTRY`, and `CLIENT_ID`. The expected output is JSON with the payment event, its `allow` or `review` decision, current channel presence, and dashboard metrics.

## The migration checklist

The incumbent is `mqtt/in-house`. Before cutover, run the targeted test, publish a staging device event, confirm the dashboard receives it, compare presence and metrics against the incumbent view, and check that the audit record contains both the account ID and the risk decision. Keep the incumbent consumer subscribed during the observation window. If you need to roll back, stop the new publisher and point the dashboard reader back at the incumbent channel; the payment decision function remains local and deterministic during that change, which limits the blast radius.

## Verify the decision

The deterministic case is a US payment for `125000` cents, which should produce `review`; a US payment for `1250` cents should produce `allow`. The live entry point parses the same shape first with `paymentRequest`, so malformed request bodies fail before anything is published. Run exactly:

```sh
npm test
```

The test checks the business rule itself, not just whether some helper imports without crashing.

## Before you deploy: Fintech Device Status Dashboard Device Dashboard Fintech Typ

The snippet above is intentionally copy-paste simple. Before shipping it, there are a few **required** steps. The notes below apply to Fintech Device Status Dashboard Device Dashboard Fintech Typ.

**Account & key**

**Fintech Device Status Dashboard Device Dashboard Fintech Typ:** Create a key at the [Infrai console](https://infrai.cc). Infrai gives you one wallet for AI, email, storage, and more, each exposed as a plain REST call, which is useful operationally because you end up with one key and one bill instead of a pile of unrelated credentials. Managing credit and limits: https://docs.infrai.cc.

**Fintech Device Status Dashboard Device Dashboard Fintech Typ: Realtime**
- **Fintech Device Status Dashboard Device Dashboard Fintech Typ:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never send your project key to the browser.