import { z } from "zod";
import type { PaymentEvent } from "./risk_decision.ts";

export const paymentRequest = z.object({
  deviceId: z.string().min(1),
  accountId: z.string().min(1),
  amountCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  country: z.string().length(2),
  observedAt: z.string().datetime()
}) as unknown as z.ZodType<PaymentEvent>;

export type PaymentRequest = z.infer<typeof paymentRequest>;
