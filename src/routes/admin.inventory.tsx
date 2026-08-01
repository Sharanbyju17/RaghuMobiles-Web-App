import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { inr, type Product } from "@/lib/mock-data";
import { Plus, Filter, Search, QrCode, MoreHorizontal, Download, Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { BulkUploadDialog } from "@/components/inventory/bulk-upload-dialog";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Recell Admin" }] }),
  component: Inventory,
});

const conditionColor: Record<string, string> = {
  "Like New": "bg-success/10 text-success border-success/20",
  "Excellent": "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  "Good": "bg-warning/10 text-warning-foreground border-warning/20",
  "Fair": "bg-muted text-muted-foreground border-border",
  "New": "bg-success/10 text-success border-success/20",
  "Not Applicable": "bg-muted text-muted-foreground border-border",
};

const statusColor: Record<string, string> = {
  "In Stock": "bg-success/10 text-success border-success/20",
  "Reserved": "bg-warning/10 text-warning-foreground border-warning/20",
  "Sold": "bg-muted text-muted-foreground border-border",
  "Refurbishing": "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
};

function BatteryBar({ v }: { v: number }) {
  const color = v >= 90 ? "bg-success" : v >= 80 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${v}%` }} /></div>
      <span className="text-xs tabular-nums">{v}%</span>
    </div>
  );
}

function Inventory() {
  const [q, setQ] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inventory, setInventory] = useState<any[]>([]);
  const { session } = useAuth();
  const navigate = useNavigate();

  const fetchInventory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/inventory/products", {
        headers: {
          "Authorization": `Bearer ${session?.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Map backend data to frontend expectations
        const mapped = data.map((p: any) => ({
          id: p.id,
          brand: p.brand?.name || p.specifications?.brand_name || "Unknown",
          model: p.title,
          sku: p.sku,
          storage: p.specifications?.storage || "",
          color: p.specifications?.color || "",
          price: p.price,
          condition: p.condition,
          batteryHealth: p.specifications?.batteryHealth || 100,
          warrantyMonths: p.specifications?.warrantyMonths || 0,
          imei: p.sku,
          status: p.stock_quantity > 0 ? "In Stock" : "Reserved",
          stock: p.stock_quantity,
          image: p.images?.[0] || ""
        }));
        setInventory(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    }
  };

  useEffect(() => {
    if (session?.token) fetchInventory();
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/inventory/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session?.token}` }
      });
      if (res.ok) {
        fetchInventory();
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  const rows = useMemo(() => inventory.filter((p) =>
    (brandFilter === "all" || p.brand === brandFilter) &&
    (statusFilter === "all" || p.status === statusFilter) &&
    (q === "" || `${p.brand} ${p.model} ${p.imei}`.toLowerCase().includes(q.toLowerCase()))
  ), [q, brandFilter, statusFilter, inventory]);

  return (
    <AdminShell
      title="Inventory"
      subtitle={`${rows.length} devices`}
      actions={
        <div className="flex gap-2">
          <BulkUploadDialog onUploaded={fetchInventory} />
          <Button variant="outline" className="rounded-full"><Download className="h-4 w-4 mr-1.5" />Export</Button>
          <Button asChild className="rounded-full">
            <Link to="/admin/inventory/add">
              <Plus className="h-4 w-4 mr-1.5" />Add New Product
            </Link>
          </Button>
        </div>
      }
    >
      <div className="card-soft overflow-hidden">
        <div className="p-4 md:p-5 flex flex-wrap gap-3 items-center border-b border-border/60">
          <div className="relative flex-1 min-w-64">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search model, IMEI…" className="pl-9 rounded-full bg-secondary border-0" />
          </div>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-36 rounded-full bg-secondary border-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              <SelectItem value="Apple">Apple</SelectItem>
              <SelectItem value="Samsung">Samsung</SelectItem>
              <SelectItem value="OnePlus">OnePlus</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Xiaomi">Xiaomi</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 rounded-full bg-secondary border-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Reserved">Reserved</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
              <SelectItem value="Refurbishing">Refurbishing</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="rounded-full"><Filter className="h-4 w-4" /></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Device</th>
                <th className="px-2 py-3 font-medium">IMEI</th>
                <th className="px-2 py-3 font-medium">Storage</th>
                <th className="px-2 py-3 font-medium">Condition</th>
                <th className="px-2 py-3 font-medium">Battery</th>
                <th className="px-2 py-3 font-medium">Warranty</th>
                <th className="px-2 py-3 font-medium">Price</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-border/60 hover:bg-surface/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image || "https://placehold.co/400?text=No+Image"} alt="" className="h-10 w-10 rounded-lg object-cover bg-surface" />
                      <div className="min-w-0"><div className="font-medium truncate">{p.model}</div><div className="text-xs text-muted-foreground">{p.brand} · {p.color}</div></div>
                    </div>
                  </td>
                  <td className="px-2 py-3"><div className="flex items-center gap-1.5"><QrCode className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-mono text-xs">{p.imei.slice(-8)}</span></div></td>
                  <td className="px-2 py-3">{p.storage}</td>
                  <td className="px-2 py-3"><Badge variant="outline" className={`rounded-full ${conditionColor[p.condition] || 'bg-muted text-muted-foreground'}`}>{p.condition}</Badge></td>
                  <td className="px-2 py-3"><BatteryBar v={p.batteryHealth} /></td>
                  <td className="px-2 py-3 text-muted-foreground">{p.warrantyMonths} mo</td>
                  <td className="px-2 py-3 font-medium">{inr(p.price)}</td>
                  <td className="px-2 py-3"><Badge variant="outline" className={`rounded-full ${statusColor[p.status] || 'bg-muted'}`}>{p.status}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="rounded-full h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate({ to: '/admin/inventory/$id/edit', params: { id: p.id } })}>
                          <Edit className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
