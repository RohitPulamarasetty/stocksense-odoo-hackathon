import { Badge } from "@/components/ui/badge";
import { documentStatusLabel, stockHealthLabel, type DocumentStatus, type StockHealth } from "@/lib/inventory/status";

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return <Badge variant={status}>{documentStatusLabel[status]}</Badge>;
}

export function StockHealthBadge({ health }: { health: StockHealth }) {
  return <Badge variant={health}>{stockHealthLabel[health]}</Badge>;
}
