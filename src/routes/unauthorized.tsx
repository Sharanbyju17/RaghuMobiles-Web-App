import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  component: Unauthorized,
});

function Unauthorized() {
  return (
    <SiteLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4">
        <div className="max-w-md text-center animate-fade-up">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-destructive/10 text-destructive mb-6">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Denied</h1>
          <p className="mt-4 text-muted-foreground">
            You do not have permission to access this page. Please contact your administrator or switch to an authorized account.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/">Go Home</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
