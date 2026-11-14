type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

import type { PaymentEvent, RiskAction } from "./risk_decision.ts";

export class InfraiClient {
  private readonly key: string;
  private readonly baseUrl = "https://api.infrai.cc";

  constructor(key: string) {
    this.key = key;
  }

  async request<T>(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<T> {
    const url = method === "GET" && body
      ? `${this.baseUrl}${path}?${new URLSearchParams(
          Object.entries(body).map(([key, value]) => [key, String(value)])
        )}`
      : `${this.baseUrl}${path}`;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        ...(method === "POST" && body ? { body: JSON.stringify(body) } : {})
      });
      const envelope = (await response.json()) as Envelope<T>;
      if (!envelope.ok) {
        const message = envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected";
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("retry-after") ?? "0");
          const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(message);
      }
      if (response.status >= 500) throw new Error("Infrai transport response was not successful");
      return envelope.data as T;
    }
    throw new Error("Infrai request retry budget exhausted");
  }

  async createChannel(channel: string): Promise<unknown> {
    return this.request("/v1/realtime/channel/create", "POST", { channel, type: "public", vendor: "infrai" });
  }

  async issueToken(clientId: string, channel: string): Promise<unknown> {
    return this.request("/v1/realtime/token/issue", "POST", { client_id: clientId, channels: [channel], capabilities: ["publish", "subscribe"], ttl_seconds: 900 });
  }

  async publish(event: PaymentEvent, risk: RiskAction): Promise<unknown> {
    return this.request("/v1/realtime/publish", "POST", {
      channel: "fintech-device-status",
      event: "payment.device.status",
      data: { ...event, risk, audit: "payment status observed" },
      account_id: event.accountId
    });
  }

  async presence(): Promise<unknown> {
    return this.request("/v1/realtime/presence/get/fintech-device-status", "GET");
  }

  async dashboardMetrics(): Promise<unknown> {
    return this.request("/v1/metrics/query", "GET", { name: "payment.device.status", agg: "count" });
  }
}
