export type PaymentEvent = {
  deviceId: string;
  accountId: string;
  amountCents: number;
  currency: string;
  country: string;
  observedAt: string;
};

export type RiskAction = "allow" | "review";

export function decideRisk(event: PaymentEvent): RiskAction {
  return event.amountCents >= 100000 || event.country !== "US" ? "review" : "allow";
}
