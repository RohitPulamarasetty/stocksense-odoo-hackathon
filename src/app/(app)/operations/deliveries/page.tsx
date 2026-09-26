import Link from "next/link";
import { ArrowUpFromLine, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentStatusBadge } from "@/components/inventory/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DocumentStatus } from "@/lib/inventory/status";

export default async function DeliveriesPage() {
  const supabase = await createClient();
  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("id, reference, scheduled_date, status, partners(name), locations(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Delivery Orders</h1>
          <p className="text-sm text-muted-foreground">Outgoing stock to customers.</p>
        </div>
        <Link href="/operations/deliveries/new">
          <Button>
            <Plus /> New Delivery
          </Button>
        </Link>
      </div>

      {!deliveries?.length ? (
        <EmptyState icon={ArrowUpFromLine} title="No deliveries yet" description="Create a delivery order to ship stock to a customer." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">
                  <Link href={`/operations/deliveries/${d.id}`} className="hover:underline">
                    {d.reference}
                  </Link>
                </TableCell>
                <TableCell>{d.partners?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{d.locations?.name}</TableCell>
                <TableCell className="text-muted-foreground">{d.scheduled_date}</TableCell>
                <TableCell>
                  <DocumentStatusBadge status={d.status as DocumentStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
