import { Badge } from "@/components/ui/badge";
import { Shield, Users, User } from "lucide-react";
import { UserRole } from "@/lib/auth-service";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleConfig = {
    admin: {
      icon: Shield,
      label: "Admin",
      variant: "default" as const,
    },
    staff: {
      icon: Users,
      label: "Staff",
      variant: "secondary" as const,
    },
    customer: {
      icon: User,
      label: "Customer",
      variant: "outline" as const,
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
