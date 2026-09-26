import type { StockHealth } from "@/lib/inventory/status";

const DEAD_STOCK_DAYS = 90;

export function computeStockHealth(params: {
  onHand: number;
  reorderLevel: number;
  daysSinceLastMovement: number | null;
}): StockHealth {
  const { onHand, reorderLevel, daysSinceLastMovement } = params;

  if (onHand <= 0) return "out";
  if (daysSinceLastMovement !== null && daysSinceLastMovement >= DEAD_STOCK_DAYS) return "dead";
  if (reorderLevel > 0 && onHand < reorderLevel * 0.5) return "critical";
  if (reorderLevel > 0 && onHand < reorderLevel) return "low";
  return "healthy";
}

export function daysSince(dateString: string | null): number | null {
  if (!dateString) return null;
  const ms = Date.now() - new Date(dateString).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
