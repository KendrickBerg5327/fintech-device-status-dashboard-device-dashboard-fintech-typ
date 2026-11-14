import assert from "node:assert/strict";
import { decideRisk, type PaymentEvent } from "./risk_decision.ts";

const payment: PaymentEvent = {
  deviceId: "terminal-test",
  accountId: "acct-test",
  amountCents: 125000,
  currency: "USD",
  country: "US",
  observedAt: "2026-01-01T00:00:00.000Z"
};

assert.equal(decideRisk(payment), "review");
assert.equal(decideRisk({ ...payment, amountCents: 1250 }), "allow");
console.log("risk decision test passed");
