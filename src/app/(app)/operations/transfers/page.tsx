import Link from "next/link";
import { ArrowLeftRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentStatusBadge } from "@/components/inventory/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DocumentStatus } from "@/lib/inventory/status";

export default async function TransfersPage() {
  const supabase = await createClient();
  const { data: transfers } = await supabase
    .from("transfers")
    .select(
      "id, reference, scheduled_date, status, source:locations!transfers_source_location_id_fkey(name), destination:locations!transfers_destination_location_id_fkey(name)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Internal Transfers</h1>
          <p className="text-sm text-muted-foreground">Move stock between locations.</p>
        </div>
        <Link href="/operations/transfers/new">
          <Button>
            <Plus /> New Transfer
          </Button>
        </Link>
      </div>

      {!transfers?.length ? (
        <EmptyState icon={ArrowLeftRight} title="No transfers yet" description="Move stock between warehouses or storage locations." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">
                  <Link href={`/operations/transfers/${t.id}`} className="hover:underline">
                    {t.reference}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{t.source?.name}</TableCell>
                <TableCell className="text-muted-foreground">{t.destination?.name}</TableCell>
                <TableCell className="text-muted-foreground">{t.scheduled_date}</TableCell>
                <TableCell>
                  <DocumentStatusBadge status={t.status as DocumentStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
