import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/admin-shell";
import { ProductForm } from "@/components/inventory/product-form";

export const Route = createFileRoute("/admin/inventory_/add")({
  head: () => ({ meta: [{ title: "Add Product — Raghu Mobiles Admin" }] }),
  component: AddProduct,
});

function AddProduct() {
  const navigate = useNavigate();

  return (
    <AdminShell
      title="Add New Product"
      subtitle="Enter device details and upload media"
    >
      <div className="max-w-4xl mx-auto py-6">
        <ProductForm onSubmitSuccess={() => navigate({ to: "/admin/inventory" })} />
      </div>
    </AdminShell>
  );
}
