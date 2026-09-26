import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const kpis = [
  { label: "Total Inventory Value" },
  { label: "Total Units" },
  { label: "Low Stock" },
  { label: "Out of Stock" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Operational snapshot of inventory across all warehouses.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle className="text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">—</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No stock movements have been recorded yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
