import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/admin-shell";
import { salesTrend, inr } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Recell Admin" }] }),
  component: Reports,
});

const byBrand = [
  { brand: "Apple", value: 58 },
  { brand: "Samsung", value: 21 },
  { brand: "OnePlus", value: 9 },
  { brand: "Google", value: 7 },
  { brand: "Other", value: 5 },
];
const colors = ["var(--color-foreground)", "oklch(0.6 0.02 260)", "oklch(0.72 0.02 260)", "oklch(0.82 0.02 260)", "oklch(0.9 0.005 260)"];

function Reports() {
  return (
    <AdminShell title="Reports & Analytics" subtitle="Last 7 days">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Gross sales", v: "₹5.31L", d: "+18%" },
          { l: "Avg order value", v: inr(42800), d: "+4.2%" },
          { l: "Conversion", v: "3.8%", d: "+0.6%" },
          { l: "Returning customers", v: "42%", d: "+5%" },
        ].map((s) => (
          <div key={s.l} className="card-soft p-5">
            <div className="text-sm text-muted-foreground">{s.l}</div>
            <div className="mt-2 flex items-baseline gap-2"><span className="text-2xl font-semibold">{s.v}</span><Badge variant="secondary" className="rounded-full text-success">{s.d}</Badge></div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="card-soft p-6">
          <h3 className="font-semibold mb-6">Daily sales</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-background)" }} />
                <Bar dataKey="sales" fill="var(--color-foreground)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-6">
          <h3 className="font-semibold mb-6">Sales by brand</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byBrand} dataKey="value" nameKey="brand" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {byBrand.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-background)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
