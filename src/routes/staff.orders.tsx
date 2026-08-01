import { createFileRoute } from "@tanstack/react-router";
import { StaffShell } from "@/components/layout/staff-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const Route = createFileRoute("/staff/orders")({
  component: StaffOrders,
});

const dummyOrders = [
  { id: "#1", cust: "Raj Kumar", product: "iPhone 15 Pro Max", price: "₹1,34,900", date: "2024-02-20", status: "pending" },
  { id: "#2", cust: "Priya Singh", product: "Samsung Galaxy S24", price: "₹79,999", date: "2024-02-19", status: "delivered" },
  { id: "#3", cust: "Arun Raj", product: "OnePlus 12", price: "₹64,999", date: "2024-02-21", status: "pending" },
];

function StaffOrders() {
  const [orders, setOrders] = useState(dummyOrders);

  const markShipped = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "shipped" } : o))
    );
  };

  const statusBadge: Record<string, string> = {
    pending: "bg-orange-100 text-orange-600 border-orange-200",
    shipped: "bg-blue-100 text-blue-600 border-blue-200",
    delivered: "bg-black text-white border-black",
  };

  return (
    <StaffShell>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
          <div className="text-3xl font-bold mt-2">3</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <span className="text-sm font-medium text-muted-foreground">Pending</span>
          <div className="text-3xl font-bold mt-2 text-orange-600">2</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <span className="text-sm font-medium text-muted-foreground">Shipped</span>
          <div className="text-3xl font-bold mt-2 text-blue-600">0</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <span className="text-sm font-medium text-muted-foreground">Delivered</span>
          <div className="text-3xl font-bold mt-2 text-green-600">1</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden p-6">
        <h2 className="font-semibold mb-6">All Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border font-medium">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Product</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-medium">{o.id}</td>
                  <td className="py-4">{o.cust}</td>
                  <td className="py-4">{o.product}</td>
                  <td className="py-4 font-semibold">{o.price}</td>
                  <td className="py-4 text-muted-foreground">{o.date}</td>
                  <td className="py-4">
                    <Badge variant="outline" className={`rounded-full capitalize ${statusBadge[o.status] || ""}`}>
                      {o.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    {o.status === "pending" && (
                      <Button 
                        size="sm" 
                        onClick={() => markShipped(o.id)}
                        className="bg-black hover:bg-black/90 text-white rounded-md text-xs h-8"
                      >
                        Mark Shipped
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StaffShell>
  );
}
