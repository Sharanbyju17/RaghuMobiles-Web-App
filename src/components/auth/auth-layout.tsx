import { ReactNode } from "react";
import { SiteLayout } from "@/components/layout/site-layout";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <SiteLayout>
      <section className="container-page py-16 md:py-24 max-w-md mx-auto min-h-[calc(100vh-200px)] flex flex-col justify-center">
        {children}
      </section>
    </SiteLayout>
  );
}
