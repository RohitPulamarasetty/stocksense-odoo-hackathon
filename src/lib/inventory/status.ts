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

export type MovementType = "opening" | "receipt" | "delivery" | "transfer_in" | "transfer_out" | "adjustment";

export const movementTypeLabel: Record<MovementType, string> = {
  opening: "Opening Stock",
  receipt: "Receipt",
  delivery: "Delivery",
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
  adjustment: "Adjustment",
};
