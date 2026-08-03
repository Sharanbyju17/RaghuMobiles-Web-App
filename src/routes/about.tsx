import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { ShieldCheck, Recycle, Award, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Raghu Mobiles" }, { name: "description", content: "Our mission to make premium phones accessible and sustainable." }] }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="container-page py-20 md:py-28 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">About Raghu Mobiles</div>
        <h1 className="mt-3 text-5xl md:text-6xl font-semibold tracking-tight leading-tight">Great phones, second time around.</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          We're a team of engineers, technicians and retailers making premium smartphones accessible — while keeping them out of landfills.
          Every device we sell is inspected, restored and warranted.
        </p>
      </section>

      <section className="container-page pb-20 grid gap-4 md:grid-cols-4">
        {[
          { icon: ShieldCheck, k: "40+", v: "Quality checks" },
          { icon: Award, k: "50k+", v: "Happy customers" },
          { icon: Recycle, k: "180T", v: "E-waste diverted" },
          { icon: Users, k: "24", v: "Retail stores" },
        ].map((s) => (
          <div key={s.v} className="card-soft p-6">
            <s.icon className="h-5 w-5 text-muted-foreground" />
            <div className="mt-6 text-3xl font-semibold">{s.k}</div>
            <div className="text-sm text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </section>

      <section className="container-page pb-24 grid gap-8 md:grid-cols-2">
        <div className="rounded-3xl bg-surface p-10 border border-border">
          <h3 className="text-2xl font-semibold tracking-tight">Our promise</h3>
          <p className="mt-3 text-muted-foreground">Every phone is graded honestly, priced transparently, and covered by real warranty. If it isn't right, we make it right.</p>
        </div>
        <div className="rounded-3xl bg-foreground text-background p-10">
          <h3 className="text-2xl font-semibold tracking-tight">Built for shops.</h3>
          <p className="mt-3 text-background/70">Our platform powers 24 retail stores with offline POS, inventory, and staff tools — all in one place.</p>
        </div>
      </section>
    </SiteLayout>
  );
}
