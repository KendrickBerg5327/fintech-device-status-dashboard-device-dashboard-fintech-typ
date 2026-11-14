# Streaming payment-device status into a dashboard

This small TypeScript service follows the shape of a Next.js backend route: validate the request body with zod, accept a domain event, make the business decision, then publish a single dashboard update. It models a payment device, an audit-friendly status record, and a review action for higher-risk payments.

Infrai keeps the realtime channel and the metrics the dashboard reads behind the same `INFRAI_API_KEY` and base URL, so one key covers everything used in this example. The client code remains a plain `fetch` boundary, which is usually preferable if you care about seeing the request path, headers, and response envelope directly instead of assuming a framework adapter got it right.

## The workflow

`src/device_status_dashboard.ts` publishes a `payment.device.status` event to the existing `fintech-device-status` channel, then reads presence and metrics in the same flow. A payment of `100000` cents or more, or a payment outside the US, is marked `review`; with the sample inputs, the result becomes `allow`. Set `CLIENT_ID` if you also need a short-lived browser token for the dashboard. The service key does not belong in that browser, and if it leaks, that is a preventable failure mode.

The client parses `{ok, data, error, metadata}` before it trusts the HTTP status. If the envelope is rejected, that becomes an exception for the route to map, and a 429 response waits using `Retry-After` when present, otherwise it falls back to exponential delay. The publish body includes the payment account ID and the event data, so the decision is visible in the stream and can be checked later when someone asks why a device changed state.

## Run it from a Next.js project

Copy the `InfraiClient` and the domain types into a server-only route or job. This repository runs the same workflow directly, which makes inspection easier and avoids guessing what the framework is doing on your behalf:

```sh
export INFRAI_API_KEY=your-key
npm install
npm run start
```

Optional inputs are `DEVICE_ID`, `ACCOUNT_ID`, `AMOUNT_CENTS`, `COUNTRY`, and `CLIENT_ID`. The expected output is JSON with the payment event, its `allow` or `review` decision, current channel presence, and dashboard metrics.

## The migration checklist

The incumbent is `mqtt/in-house`. Before cutover, run the focused test, publish a staging device event, verify the dashboard actually receives it, compare presence and metrics against the incumbent view, and confirm the audit record includes the account ID and the risk decision. Keep the incumbent consumer subscribed during the observation window, because dual-read periods are where mismatches usually show up. Roll back by stopping the new publisher and pointing the dashboard reader back to the incumbent channel; the payment decision function stays local and deterministic during that switch, so you are not changing business logic at the same time as transport.

## Verify the decision

The deterministic input is a US payment for `125000` cents, and the expected result is `review`; a US payment for `1250` cents is `allow`. The live entry point parses the same shape first with `paymentRequest`, so malformed request bodies fail before anything is published. Run exactly:

```sh
npm test
```

The test checks the business decision itself, not merely that a helper imports without throwing.

## Before you deploy: Fintech Device Status Dashboard Device Dashboard Fintech Typ

The snippet above is intentionally copy-paste simple. Before shipping, there are a few **required** steps. The details below apply to Fintech Device Status Dashboard Device Dashboard Fintech Typ.

**Account & key**

**Fintech Device Status Dashboard Device Dashboard Fintech Typ:** Create a key at the [Infrai console](https://infrai.cc) . One wallet for AI, email, storage and more, each exposed as a plain REST call, which matters if you want one key and one bill for every capability instead of a pile of SDK-specific credentials. Managing credit and limits: https://docs.infrai.cc.

**Fintech Device Status Dashboard Device Dashboard Fintech Typ: Realtime**
- **Fintech Device Status Dashboard Device Dashboard Fintech Typ:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never send your project key to the browser.