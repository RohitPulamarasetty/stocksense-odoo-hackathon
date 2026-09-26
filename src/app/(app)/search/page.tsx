import Link from "next/link";
import { SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentStatusBadge } from "@/components/inventory/status-badge";
import type { DocumentStatus } from "@/lib/inventory/status";

const DOCUMENT_KINDS = [
  { table: "receipts" as const, label: "Receipts", href: "/operations/receipts" },
  { table: "deliveries" as const, label: "Delivery Orders", href: "/operations/deliveries" },
  { table: "transfers" as const, label: "Internal Transfers", href: "/operations/transfers" },
  { table: "adjustments" as const, label: "Adjustments", href: "/operations/adjustments" },
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const supabase = await createClient();

  if (!query) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Search</h1>
        <p className="text-sm text-muted-foreground">Search products by name or SKU, or documents by reference.</p>
      </div>
    );
  }

  const [{ data: products }, ...documentResults] = await Promise.all([
    supabase.from("products").select("id, sku, name, uom").or(`name.ilike.%${query}%,sku.ilike.%${query}%`).limit(10),
    ...DOCUMENT_KINDS.map((kind) =>
      supabase.from(kind.table).select("id, reference, status").ilike("reference", `%${query}%`).limit(10),
    ),
  ]);

  const hasResults = (products?.length ?? 0) > 0 || documentResults.some((r) => (r.data?.length ?? 0) > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Search results for &ldquo;{query}&rdquo;</h1>
      </div>

      {!hasResults ? (
        <EmptyState icon={SearchX} title="No matches found" description="Try a different product name, SKU, or document reference." />
      ) : (
        <div className="space-y-4">
          {products && products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {products.map((p) => (
                    <li key={p.id} className="py-2 text-sm">
                      <Link href={`/products/${p.id}`} className="hover:underline">
                        <span className="font-mono text-xs text-muted-foreground">{p.sku}</span> {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {DOCUMENT_KINDS.map((kind, i) => {
            const rows = documentResults[i].data ?? [];
            if (!rows.length) return null;
            return (
              <Card key={kind.table}>
                <CardHeader>
                  <CardTitle>{kind.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border">
                    {rows.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
                        <Link href={`${kind.href}/${doc.id}`} className="font-mono text-xs hover:underline">
                          {doc.reference}
                        </Link>
                        <DocumentStatusBadge status={doc.status as DocumentStatus} />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
