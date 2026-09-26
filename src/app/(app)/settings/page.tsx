import Link from "next/link";
import { Warehouse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-lg font-semibold">Settings</h1>
      <Link href="/settings/warehouses">
        <Card className="transition-colors hover:bg-surface-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="size-4" /> Warehouses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Manage warehouses and their storage locations.</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
