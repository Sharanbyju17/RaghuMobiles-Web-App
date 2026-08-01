import { createFileRoute } from "@tanstack/react-router";
import { StaffShell } from "@/components/layout/staff-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/staff/leave")({
  component: StaffLeave,
});

const API = "http://localhost:8000/api/v1";

function StaffLeave() {
  const { session, user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    reason: "",
    leave_type: "Casual",
  });

  useEffect(() => {
    if (session?.token) fetchMyLeaves();
  }, [session]);

  const fetchMyLeaves = async () => {
    try {
      // For now, staff uses the same endpoint if they can only see their own,
      // or we use the specific staff endpoint if known.
      // But we modified the backend so staff can just hit GET /leaves/ and if it's admin it returns all, 
      // wait, the backend GET /leaves returns all. Let's filter by phone or we should use /leaves/staff/{staff_id}.
      // Since we don't have staff_id in token, let's just fetch all and filter by phone for now (hack for this demo) 
      // or just assume they see all leaves for now.
      const res = await fetch(`${API}/leaves/`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // filter by current user's phone to simulate 'my leaves'
        setLeaves(data.filter((l: any) => l.staff_phone === user?.phone));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/leaves/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          leave_type: form.leave_type,
          start_date: form.start_date,
          end_date: form.end_date,
          reason: form.reason || undefined,
        }),
      });

      if (res.ok) {
        setForm({ start_date: "", end_date: "", reason: "", leave_type: "Casual" });
        fetchMyLeaves();
      } else {
        const err = await res.json();
        setError(err.detail || "Failed to submit leave request.");
      }
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor: Record<string, string> = {
    Pending: "bg-warning/10 text-warning-foreground border-warning/20",
    Approved: "bg-success/10 text-success border-success/20",
    Rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <StaffShell title="Leave Management">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Apply Leave Form */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <h2 className="font-semibold mb-4">Apply for Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  required
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  required
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  placeholder="Reason for leave"
                  rows={3}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-[#10703B] hover:bg-[#0e6133] text-white"
                disabled={submitting || !form.start_date || !form.end_date}
              >
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Submit Request
              </Button>
            </form>
          </div>
        </div>

        {/* My Leaves List */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <h2 className="font-semibold mb-4">My Leaves</h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-muted rounded w-full"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
              </div>
            ) : leaves.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have no leave requests.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Duration</th>
                      <th className="px-4 py-2 font-medium">Reason</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((l) => (
                      <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="font-medium">{new Date(l.start_date).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">to {new Date(l.end_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-3">
                          {Math.ceil((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                        </td>
                        <td className="px-4 py-3 max-w-[150px] truncate text-muted-foreground">
                          {l.reason || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`rounded-full ${statusColor[l.status]}`}>
                            {l.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                            {l.status === "Approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {l.status === "Rejected" && <XCircle className="h-3 w-3 mr-1" />}
                            {l.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
