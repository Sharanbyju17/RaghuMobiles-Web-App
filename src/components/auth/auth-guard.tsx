import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/lib/auth-service";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirect to login but save the attempted URL
      navigate({ to: "/login", search: { redirect: location.href } });
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      navigate({ to: "/unauthorized" });
      return;
    }

    setIsChecking(false);
  }, [isLoading, isAuthenticated, user, allowedRoles, navigate, location.href]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
