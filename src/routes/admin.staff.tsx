import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AddStaffDialog } from "@/components/staff/add-staff-dialog";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff — Recell Admin" }] }),
  component: Staff,
});

const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  "Off-duty": "bg-muted text-muted-foreground border-border",
  "On Leave": "bg-warning/10 text-warning-foreground border-warning/20",
  Terminated: "bg-destructive/10 text-destructive border-destructive/20",
};

const leaveStatusColor: Record<string, string> = {
  Pending: "bg-warning/10 text-warning-foreground border-warning/20",
  Approved: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

type StaffMember = {
  id: string;
  status: string;
  hire_date?: string;
  address?: string;
  id_proof_url?: string;
  store?: { name: string } | null;
  user?: { id: string; phone: string; email?: string; full_name?: string; city?: string } | null;
};

type LeaveRequest = {
  id: string;
  staff_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: string;
  staff_name?: string;
  staff_phone?: string;
};

const API = "http://localhost:8000/api/v1";

function Staff() {
  const [tab, setTab] = useState<"directory" | "leaves">("directory");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { session } = useAuth();

  const authHeaders = { Authorization: `Bearer ${session?.token}` };

  const fetchStaff = useCallback(async () => {
    if (!session?.token) return;
    setLoadingStaff(true);
    try {
      const res = await fetch(`${API}/staff/`, { headers: authHeaders });
      if (res.ok) setStaffList(await res.json());
    } catch (e) {
      console.error("Failed to fetch staff", e);
    } finally {
      setLoadingStaff(false);
    }
  }, [session]);

  const fetchLeaves = useCallback(async () => {
    if (!session?.token) return;
    setLoadingLeaves(true);
    try {
      const res = await fetch(`${API}/leaves/`, { headers: authHeaders });
      if (res.ok) setLeaves(await res.json());
    } catch (e) {
      console.error("Failed to fetch leaves", e);
    } finally {
      setLoadingLeaves(false);
    }
  }, [session]);

  useEffect(() => {
    fetchStaff();
    fetchLeaves();
  }, [fetchStaff, fetchLeaves]);

  const handleLeaveAction = async (leaveId: string, newStatus: "Approved" | "Rejected") => {
    setActionLoading(leaveId);
    try {
      const res = await fetch(`${API}/leaves/${leaveId}`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeaves((prev) =>
          prev.map((l) => (l.id === leaveId ? { ...l, status: updated.status } : l))
        );
      }
    } catch (e) {
      console.error("Failed to update leave", e);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = leaves.filter((l) => l.status === "Pending").length;

  return (
    <AdminShell
      title="Staff"
      subtitle={`${staffList.length} team members`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { fetchStaff(); fetchLeaves(); }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <AddStaffDialog onAdded={fetchStaff} />
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-secondary p-1 rounded-full w-fit">
        <button
          onClick={() => setTab("directory")}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
            tab === "directory" ? "bg-background shadow text-foreground" : "text-muted-foreground"
          }`}
        >
          Staff Directory
        </button>
        <button
          onClick={() => setTab("leaves")}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            tab === "leaves" ? "bg-background shadow text-foreground" : "text-muted-foreground"
          }`}
        >
          Leave Approval
          {pendingCount > 0 && (
            <span className="h-5 min-w-5 px-1 rounded-full bg-warning text-warning-foreground text-[10px] font-bold grid place-items-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Staff Directory Tab */}
      {tab === "directory" && (
        <>
          {loadingStaff ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-soft p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : staffList.length === 0 ? (
            <div className="card-soft p-12 text-center">
              <p className="text-muted-foreground">No staff members yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Staff" to invite your first team member.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {staffList.map((s) => {
                const name = s.user?.full_name || "Unknown";
                const phone = s.user?.phone || "";
                const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div key={s.id} className="card-soft p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-secondary">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{name}</div>
                        <div className="text-xs text-muted-foreground">{phone}</div>
                        {s.user?.email && <div className="text-xs text-muted-foreground truncate">{s.user.email}</div>}
                      </div>
                      <Button size="icon" variant="ghost" className="rounded-full h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.store && (
                        <Badge variant="outline" className="rounded-full">
                          {s.store.name}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`rounded-full ${statusColor[s.status] || ""}`}
                      >
                        {s.status}
                      </Badge>
                    </div>
                    {s.hire_date && (
                      <div className="mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                        Joined {new Date(s.hire_date).toLocaleDateString("en-IN")}
                      </div>
                    )}
                    {s.address && (
                      <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        📍 {s.address}
                      </div>
                    )}
                    {s.id_proof_url && (
                      <div className="mt-2 text-xs">
                        <a href={s.id_proof_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          📄 View ID Proof
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Leave Approval Tab */}
      {tab === "leaves" && (
        <>
          {loadingLeaves ? (
            <div className="card-soft p-6 animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl" />
              ))}
            </div>
          ) : leaves.length === 0 ? (
            <div className="card-soft p-12 text-center">
              <p className="text-muted-foreground">No leave requests yet.</p>
            </div>
          ) : (
            <div className="card-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface/50">
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3 font-medium">Staff</th>
                      <th className="px-3 py-3 font-medium">Type</th>
                      <th className="px-3 py-3 font-medium">Duration</th>
                      <th className="px-3 py-3 font-medium">Reason</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => {
                      const start = new Date(leave.start_date).toLocaleDateString("en-IN");
                      const end = new Date(leave.end_date).toLocaleDateString("en-IN");
                      const days = Math.ceil(
                        (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1;
                      const isPending = leave.status === "Pending";
                      const isActing = actionLoading === leave.id;
                      return (
                        <tr
                          key={leave.id}
                          className="border-t border-border/60 hover:bg-surface/40 transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div className="font-medium">{leave.staff_name || "Staff"}</div>
                            <div className="text-xs text-muted-foreground">{leave.staff_phone}</div>
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant="secondary" className="rounded-full">
                              {leave.leave_type}
                            </Badge>
                          </td>
                          <td className="px-3 py-3">
                            <div className="text-xs">
                              {start} → {end}
                            </div>
                            <div className="text-xs text-muted-foreground">{days} day{days !== 1 ? "s" : ""}</div>
                          </td>
                          <td className="px-3 py-3 max-w-[180px]">
                            <p className="text-xs text-muted-foreground truncate">{leave.reason || "—"}</p>
                          </td>
                          <td className="px-3 py-3">
                            <Badge
                              variant="outline"
                              className={`rounded-full ${leaveStatusColor[leave.status] || ""}`}
                            >
                              {leave.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                              {leave.status === "Approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {leave.status === "Rejected" && <XCircle className="h-3 w-3 mr-1" />}
                              {leave.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            {isPending ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full h-7 px-3 text-xs text-success border-success/40 hover:bg-success/10"
                                  disabled={isActing}
                                  onClick={() => handleLeaveAction(leave.id, "Approved")}
                                >
                                  {isActing ? "..." : <><CheckCircle2 className="h-3 w-3 mr-1" />Approve</>}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full h-7 px-3 text-xs text-destructive border-destructive/40 hover:bg-destructive/10"
                                  disabled={isActing}
                                  onClick={() => handleLeaveAction(leave.id, "Rejected")}
                                >
                                  {isActing ? "..." : <><XCircle className="h-3 w-3 mr-1" />Reject</>}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
