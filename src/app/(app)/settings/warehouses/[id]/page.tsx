import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LocationForm } from "@/components/inventory/location-form";
import { createLocation, deleteLocation } from "@/app/(app)/settings/actions";

export default async function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: warehouse }, { data: locations }] = await Promise.all([
    supabase.from("warehouses").select("*").eq("id", id).single(),
    supabase.from("locations").select("*").eq("warehouse_id", id).order("name"),
  ]);

  if (!warehouse) notFound();

  const boundCreateLocation = createLocation.bind(null, warehouse.id);

  return (
    <div className="max-w-lg space-y-6">
      <Link href="/settings/warehouses" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to warehouses
      </Link>

      <div>
        <h1 className="text-lg font-semibold">{warehouse.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">{warehouse.short_code}</p>
        {warehouse.address && <p className="mt-1 text-sm text-muted-foreground">{warehouse.address}</p>}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Locations</p>
        <LocationForm action={boundCreateLocation} />
        <ul className="divide-y divide-border rounded-lg border border-border">
          {locations?.map((loc) => (
            <li key={loc.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span>
                {loc.name} <span className="font-mono text-xs text-muted-foreground">({loc.short_code})</span>
              </span>
              <form action={deleteLocation.bind(null, warehouse.id, loc.id)}>
                <button type="submit" className="text-muted-foreground hover:text-status-canceled" aria-label="Delete location">
                  <Trash2 className="size-4" />
                </button>
              </form>
            </li>
          ))}
          {!locations?.length && (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">No locations yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
