import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { salesTrend, orders, products, inr } from "@/lib/mock-data";
import { ArrowUpRight, IndianRupee, Package, Users, ShoppingCart, ScanLine } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Raghu Mobiles" }] }),
  component: Dashboard,
});

function Stat({ icon: Icon, label, value, delta }: { icon: any; label: string; value: string; delta: string }) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary"><Icon className="h-4 w-4" /></div>
        <span className="text-xs text-success font-medium flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />{delta}</span>
      </div>
      <div className="mt-6 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    total_orders: 0,
    active_products: 0,
    total_users: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const { session, user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard/metrics", {
          headers: {
            "Authorization": `Bearer ${session?.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          setRecentOrders(data.recent_orders);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard metrics", err);
      }
    };
    if (session?.token) fetchDashboard();
  }, [session]);

  return (
    <AdminShell
      title="Overview"
      subtitle={`Welcome back, ${session?.user?.fullName || user?.fullName || "Admin"}`}
      actions={<Button asChild className="rounded-full"><Link to="/admin/pos"><ScanLine className="h-4 w-4 mr-1.5" />Start POS</Link></Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={IndianRupee} label="Total Revenue" value={inr(metrics.total_revenue)} delta="--%" />
        <Stat icon={ShoppingCart} label="Total Orders" value={metrics.total_orders.toString()} delta="--%" />
        <Stat icon={Package} label="Active Products" value={metrics.active_products.toString()} delta="--%" />
        <Stat icon={Users} label="Total Users" value={metrics.total_users.toString()} delta="--%" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="card-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h3 className="font-semibold">Sales this week</h3><p className="text-xs text-muted-foreground">Online + in-store</p></div>
            <Badge variant="secondary" className="rounded-full">₹5.31L</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-background)" }} />
                <Area type="monotone" dataKey="sales" stroke="var(--color-foreground)" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-6">
          <h3 className="font-semibold mb-4">Top selling</h3>
          <div className="space-y-3">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover bg-surface" />
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{p.model}</div><div className="text-xs text-muted-foreground">{p.storage}</div></div>
                <div className="text-sm font-semibold">{inr(p.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 card-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent orders</h3>
          <Button variant="ghost" size="sm" className="rounded-full">View all</Button>
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="pb-3 pr-4">Order</th><th className="pb-3 pr-4">Customer</th><th className="pb-3 pr-4">Total</th><th className="pb-3 pr-4">Payment</th><th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? recentOrders.map((o: any) => (
                <tr key={o.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs">{o.order_number}</td>
                  <td className="py-3 pr-4">User {o.user_id}</td>
                  <td className="py-3 pr-4 font-medium">{inr(o.total_amount)}</td>
                  <td className="py-3 pr-4 text-muted-foreground">-</td>
                  <td className="py-3"><Badge variant="secondary" className="rounded-full capitalize">{o.status}</Badge></td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No recent orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
