import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/admin-shell";
import { customers, inr } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Recell Admin" }] }),
  component: Customers,
});

const tierColor = { Gold: "bg-warning/10 text-warning-foreground border-warning/20", Silver: "bg-muted text-muted-foreground border-border", Regular: "" } as const;

function Customers() {
  return (
    <AdminShell title="Customers" subtitle={`${customers.length} total`}
      actions={<Button className="rounded-full"><Plus className="h-4 w-4 mr-1.5" />Add customer</Button>}>
      <div className="card-soft overflow-hidden">
        <div className="p-4 border-b border-border/60">
          <div className="relative max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customers…" className="pl-9 rounded-full bg-secondary border-0" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-2 py-3 font-medium">Phone</th>
                <th className="px-2 py-3 font-medium">Orders</th>
                <th className="px-2 py-3 font-medium">Lifetime value</th>
                <th className="px-2 py-3 font-medium">Since</th>
                <th className="px-2 py-3 font-medium">Tier</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-border/60 hover:bg-surface/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-secondary text-xs">{c.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                      <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground font-mono">{c.id}</div></div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{c.phone}</td>
                  <td className="px-2 py-3">{c.orders}</td>
                  <td className="px-2 py-3 font-medium">{inr(c.spent)}</td>
                  <td className="px-2 py-3 text-muted-foreground">{c.since}</td>
                  <td className="px-2 py-3"><Badge variant="outline" className={`rounded-full ${tierColor[c.tier]}`}>{c.tier}</Badge></td>
                  <td className="px-5 py-3 text-right"><Button size="icon" variant="ghost" className="rounded-full h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
