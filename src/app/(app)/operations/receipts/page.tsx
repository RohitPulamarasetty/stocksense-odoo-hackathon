import Link from "next/link";
import { ArrowDownToLine, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentStatusBadge } from "@/components/inventory/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DocumentStatus } from "@/lib/inventory/status";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const { data: receipts } = await supabase
    .from("receipts")
    .select("id, reference, scheduled_date, status, partners(name), locations(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Receipts</h1>
          <p className="text-sm text-muted-foreground">Incoming stock from vendors.</p>
        </div>
        <Link href="/operations/receipts/new">
          <Button>
            <Plus /> New Receipt
          </Button>
        </Link>
      </div>

      {!receipts?.length ? (
        <EmptyState icon={ArrowDownToLine} title="No receipts yet" description="Create a receipt when stock arrives from a vendor." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">
                  <Link href={`/operations/receipts/${r.id}`} className="hover:underline">
                    {r.reference}
                  </Link>
                </TableCell>
                <TableCell>{r.partners?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.locations?.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.scheduled_date}</TableCell>
                <TableCell>
                  <DocumentStatusBadge status={r.status as DocumentStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
