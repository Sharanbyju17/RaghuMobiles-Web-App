import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { LayoutDashboard, Package, UserCog, BarChart3, ScanLine, ArrowLeft, Bell, Search, CalendarClock } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/staff/pos", label: "POS Billing", icon: ScanLine },
  { to: "/staff/products", label: "Products", icon: Package },
  { to: "/staff/leave", label: "Leave", icon: CalendarClock },
  { to: "/staff/reports", label: "Reports", icon: BarChart3 },
];

function StaffAvatar() {
  const { user, logout } = useAuth();
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:block">{user?.fullName || "Staff"}</span>
      <button
        onClick={logout}
        title="Logout"
        className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold hover:bg-muted transition-colors"
      >
        {initials}
      </button>
    </div>
  );
}

function StaffSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to));
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/staff" className="flex items-center gap-2 px-2 py-1">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background text-sm font-bold">R</div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">Recell</span>
            <span className="text-[11px] text-muted-foreground">Staff Console</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.to}>
                  <SidebarMenuButton asChild isActive={active(it.to, it.exact)} tooltip={it.label}>
                    <Link to={it.to}>
                      <it.icon className="h-4 w-4" />
                      <span>{it.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to site">
              <Link to="/"><ArrowLeft className="h-4 w-4" /><span>Back to site</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function StaffShell({ title, subtitle, actions, children }: {
  title?: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-surface">
        <StaffSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
            <div className="h-full px-4 md:px-6 flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden md:flex items-center gap-2 max-w-md w-full">
                <div className="relative w-full">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search inventory, orders, customers…" className="pl-9 rounded-full bg-secondary border-0 h-9" />
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full"><Bell className="h-4 w-4" /></Button>
                <StaffAvatar />
              </div>
            </div>
          </header>
          <div className="p-4 md:p-8 flex-1">
            {(title || subtitle || actions) && (
              <div className="mb-6 md:mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  {title && <h1 className="text-2xl md:text-3xl font-semibold tracking-tight truncate">{title}</h1>}
                  {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="shrink-0 flex gap-2">{actions}</div>}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
