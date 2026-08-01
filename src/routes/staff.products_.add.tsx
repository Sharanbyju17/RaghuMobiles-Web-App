import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StaffShell } from "@/components/layout/staff-shell";
import { ProductForm } from "@/components/inventory/product-form";

export const Route = createFileRoute("/staff/products_/add")({
  head: () => ({ meta: [{ title: "Add Product — Recell Staff" }] }),
  component: AddProduct,
});

function AddProduct() {
  const navigate = useNavigate();

  return (
    <StaffShell
      title="Add New Product"
      subtitle="Enter device details and upload media"
    >
      <div className="max-w-4xl mx-auto py-6">
        <ProductForm onSubmitSuccess={() => navigate({ to: "/staff/products" })} />
      </div>
    </StaffShell>
  );
}
