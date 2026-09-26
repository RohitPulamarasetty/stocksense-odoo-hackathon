export type DocumentStatus = "draft" | "waiting" | "ready" | "done" | "canceled";

export const documentStatusLabel: Record<DocumentStatus, string> = {
  draft: "Draft",
  waiting: "Waiting",
  ready: "Ready",
  done: "Done",
  canceled: "Canceled",
};

export type StockHealth = "healthy" | "low" | "critical" | "out" | "dead";

export const stockHealthLabel: Record<StockHealth, string> = {
  healthy: "Healthy",
  low: "Low Stock",
  critical: "Critical",
  out: "Out of Stock",
  dead: "Dead Stock",
};
