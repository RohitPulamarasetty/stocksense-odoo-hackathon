import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const operations = [
  { href: "/operations/receipts", label: "Receipts", description: "Record incoming stock from vendors.", icon: ArrowDownToLine },
  { href: "/operations/deliveries", label: "Delivery Orders", description: "Ship stock out to customers.", icon: ArrowUpFromLine },
  { href: "/operations/transfers", label: "Internal Transfers", description: "Move stock between locations.", icon: ArrowLeftRight },
  { href: "/operations/adjustments", label: "Inventory Adjustments", description: "Reconcile counted stock against the system.", icon: ClipboardList },
];

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Operations</h1>
        <p className="text-sm text-muted-foreground">Every stock-changing workflow, in one place.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {operations.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:bg-surface-muted">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-4" /> {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
