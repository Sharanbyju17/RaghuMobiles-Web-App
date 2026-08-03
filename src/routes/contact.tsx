import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Raghu Mobiles" }, { name: "description", content: "Get in touch with the Raghu Mobiles team." }] }),
  component: Contact,
});

function Contact() {
  return (
    <SiteLayout>
      <section className="container-page py-14 md:py-20 grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Say hello.</h1>
          <p className="mt-3 text-muted-foreground max-w-md">We'd love to hear from you. Reach out for support, partnerships, or press.</p>
          <div className="mt-10 space-y-5">
            {[
              { i: Mail, l: "Email", v: "hello@raghumobiles.in" },
              { i: Phone, l: "Phone", v: "+91 98200 00000" },
              { i: MapPin, l: "Flagship store", v: "Linking Road, Bandra West, Mumbai" },
            ].map((c) => (
              <div key={c.l} className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary shrink-0"><c.i className="h-4 w-4" /></div>
                <div><div className="text-xs uppercase tracking-wider text-muted-foreground">{c.l}</div><div className="font-medium">{c.v}</div></div>
              </div>
            ))}
          </div>
        </div>
        <form className="card-soft p-6 md:p-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>First name</Label><Input className="mt-2" /></div>
            <div><Label>Last name</Label><Input className="mt-2" /></div>
          </div>
          <div><Label>Email</Label><Input type="email" className="mt-2" /></div>
          <div><Label>Phone</Label><Input className="mt-2" /></div>
          <div><Label>How can we help?</Label><Textarea rows={5} className="mt-2" /></div>
          <Button size="lg" className="w-full rounded-full h-12">Send message</Button>
        </form>
      </section>
    </SiteLayout>
  );
}
