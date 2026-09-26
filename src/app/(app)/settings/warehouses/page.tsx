import Link from "next/link";
import { Warehouse as WarehouseIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { WarehouseForm } from "@/components/inventory/warehouse-form";

export default async function WarehousesPage() {
  const supabase = await createClient();
  const { data: warehouses } = await supabase
    .from("warehouses")
    .select("id, name, short_code, address, locations(count)")
    .order("name");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Warehouses</h1>
          <p className="text-sm text-muted-foreground">Each warehouse holds its own storage locations.</p>
        </div>

        {!warehouses?.length ? (
          <EmptyState icon={WarehouseIcon} title="No warehouses yet" description="Add your first warehouse to start organizing stock locations." />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {warehouses.map((wh) => (
              <li key={wh.id}>
                <Link href={`/settings/warehouses/${wh.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-surface-muted">
                  <div>
                    <p className="text-sm font-medium">{wh.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{wh.short_code}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{wh.locations?.[0]?.count ?? 0} locations</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <WarehouseForm />
    </div>
  );
}
