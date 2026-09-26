import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentStatusBadge } from "@/components/inventory/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DocumentStatus } from "@/lib/inventory/status";

export default async function AdjustmentsPage() {
  const supabase = await createClient();
  const { data: adjustments } = await supabase
    .from("adjustments")
    .select("id, reference, reason, status, created_at, locations(name, warehouses(name))")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Inventory Adjustments</h1>
          <p className="text-sm text-muted-foreground">Reconcile physical counts against system stock.</p>
        </div>
        <Link href="/operations/adjustments/new">
          <Button>
            <Plus /> New Adjustment
          </Button>
        </Link>
      </div>

      {!adjustments?.length ? (
        <EmptyState icon={ClipboardList} title="No adjustments yet" description="Record a physical count to reconcile stock." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">
                  <Link href={`/operations/adjustments/${a.id}`} className="hover:underline">
                    {a.reference}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {a.locations?.warehouses?.name} / {a.locations?.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{a.reason ?? "Physical count"}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DocumentStatusBadge status={a.status as DocumentStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
