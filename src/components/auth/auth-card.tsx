import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div className={cn("card-soft p-8 md:p-10 animate-fade-up relative overflow-hidden", className)}>
      {children}
    </div>
  );
}
