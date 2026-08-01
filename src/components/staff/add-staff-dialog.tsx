import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2, CheckCircle2, Phone, Upload } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface AddStaffDialogProps {
  onAdded: () => void;
}

export function AddStaffDialog({ onAdded }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    id_proof_url: "",
  });

  const update = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/v1/staff/create-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone,
          email: form.email || undefined,
          address: form.address || undefined,
          id_proof_url: form.id_proof_url || undefined,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setForm({ full_name: "", phone: "", email: "", address: "", id_proof_url: "" });
          onAdded();
        }, 2500);
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to create staff member.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/v1/staff/upload-id", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        update("id_proof_url", data.url);
      } else {
        const err = await res.json();
        setError(err.detail || "Failed to upload ID proof.");
      }
    } catch (err) {
      setError("Network error while uploading. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add Staff
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8 text-center gap-4 animate-fade-in">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">Staff Member Added!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              An OTP has been sent to <span className="font-medium text-foreground">{form.phone}</span>.
              They can log in with this number to access the system.
            </p>
            <div className="flex items-center gap-2 text-xs bg-secondary rounded-full px-4 py-2">
              <Phone className="h-3.5 w-3.5" />
              Check the backend terminal for the OTP (dev mode)
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="staff-name"
                  required
                  placeholder="Ravi Kumar"
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="ravi@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Phone */}
            <div className="space-y-2">
              <Label htmlFor="staff-phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-secondary text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="staff-phone"
                  required
                  className="rounded-l-none"
                  placeholder="9876543210"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                An OTP will be sent to this number for the staff member to log in.
              </p>
            </div>

            {/* Row 3: ID Proof */}
            <div className="space-y-2">
              <Label htmlFor="id-proof">
                ID Proof (Upload File) <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left bg-black text-white hover:bg-black/90 hover:text-white"
                  onClick={() => document.getElementById("id-proof-upload")?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
                <div className="text-sm text-muted-foreground w-full truncate">
                  {form.id_proof_url ? "File uploaded successfully" : "No file chosen"}
                </div>
                <Input
                  id="id-proof-upload"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {/* Row 3: Address */}
            <div className="space-y-2">
              <Label htmlFor="staff-address">Full Address</Label>
              <Textarea
                id="staff-address"
                placeholder="123, MG Road, Erode, Tamil Nadu - 638001"
                rows={3}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isUploading || form.phone.length !== 10 || !form.full_name || !form.id_proof_url}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Staff Member"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
