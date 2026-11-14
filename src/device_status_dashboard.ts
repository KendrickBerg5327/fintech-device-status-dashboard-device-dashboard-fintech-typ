import { InfraiClient } from "./infra_client.ts";
import { paymentRequest } from "./payment_request.ts";
import { decideRisk, type PaymentEvent } from "./risk_decision.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before starting the dashboard stream.");

const event: PaymentEvent = paymentRequest.parse({
  deviceId: process.env.DEVICE_ID ?? "terminal-108",
  accountId: process.env.ACCOUNT_ID ?? "demo-account",
  amountCents: Number(process.env.AMOUNT_CENTS ?? "4250"),
  currency: "USD",
  country: process.env.COUNTRY ?? "US",
  observedAt: new Date().toISOString()
});

const infrai = new InfraiClient(key);
const risk = decideRisk(event);
await infrai.publish(event, risk);
const [presence, metrics] = await Promise.all([infrai.presence(), infrai.dashboardMetrics()]);
if (process.env.CLIENT_ID) await infrai.issueToken(process.env.CLIENT_ID, "fintech-device-status");
console.log(JSON.stringify({ event, risk, presence, metrics }, null, 2));
