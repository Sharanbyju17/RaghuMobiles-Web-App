import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Zap, Truck, Wallet, ArrowRight } from "lucide-react";
import { inr } from "@/lib/mock-data";

export const Route = createFileRoute("/sell")({
  head: () => ({ meta: [{ title: "Sell Your Phone — Recell" }, { name: "description", content: "Get an instant quote for your old phone. Free pickup, instant payment." }] }),
  component: Sell,
});

function Sell() {
  const [step, setStep] = useState(1);
  const [quote, setQuote] = useState(0);

  const generateQuote = () => {
    setQuote(28500 + Math.floor(Math.random() * 6000));
    setStep(3);
  };

  return (
    <SiteLayout>
      <section className="container-page py-14 md:py-20 max-w-4xl">
        <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Sell your phone</div>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">Instant quote in 60 seconds.</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">Tell us about your device — we'll give you the best price, arrange free pickup and pay you instantly.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[{ i: Zap, t: "Instant quote" }, { i: Truck, t: "Free doorstep pickup" }, { i: Wallet, t: "Same-day payment" }].map((f) => (
            <div key={f.t} className="card-soft p-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary"><f.i className="h-4 w-4" /></div>
              <span className="font-medium text-sm">{f.t}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 card-soft p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold transition-colors ${
                  step >= n ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                }`}>{step > n ? <Check className="h-4 w-4" /> : n}</div>
                {n < 3 && <div className={`h-px w-10 md:w-20 ${step > n ? "bg-foreground" : "bg-border"}`} />}
              </div>
            ))}
            <span className="ml-4 text-sm text-muted-foreground">Step {step} of 3</span>
          </div>

          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-xl font-semibold">Device details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Brand</Label><Select><SelectTrigger className="mt-2"><SelectValue placeholder="Apple" /></SelectTrigger><SelectContent><SelectItem value="apple">Apple</SelectItem><SelectItem value="samsung">Samsung</SelectItem><SelectItem value="oneplus">OnePlus</SelectItem></SelectContent></Select></div>
                <div><Label>Model</Label><Select><SelectTrigger className="mt-2"><SelectValue placeholder="iPhone 13" /></SelectTrigger><SelectContent><SelectItem value="13">iPhone 13</SelectItem><SelectItem value="14">iPhone 14</SelectItem></SelectContent></Select></div>
                <div><Label>Storage</Label><Select><SelectTrigger className="mt-2"><SelectValue placeholder="128 GB" /></SelectTrigger><SelectContent><SelectItem value="128">128 GB</SelectItem><SelectItem value="256">256 GB</SelectItem></SelectContent></Select></div>
                <div><Label>Age of device</Label><Select><SelectTrigger className="mt-2"><SelectValue placeholder="1–2 years" /></SelectTrigger><SelectContent><SelectItem value="1">Under 1 year</SelectItem><SelectItem value="2">1–2 years</SelectItem></SelectContent></Select></div>
              </div>
              <Button size="lg" className="rounded-full mt-4" onClick={() => setStep(2)}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-xl font-semibold">Condition</h3>
              <RadioGroup defaultValue="excellent" className="grid gap-3">
                {[
                  { v: "likenew", t: "Like new", d: "No scratches, in original box" },
                  { v: "excellent", t: "Excellent", d: "Minor signs of use" },
                  { v: "good", t: "Good", d: "Visible scratches but works perfectly" },
                  { v: "fair", t: "Fair", d: "Heavy use, functional" },
                ].map((o) => (
                  <label key={o.v} className="flex items-center gap-4 border border-border rounded-2xl p-4 cursor-pointer hover:bg-secondary/50">
                    <RadioGroupItem value={o.v} />
                    <div><div className="font-medium">{o.t}</div><div className="text-xs text-muted-foreground">{o.d}</div></div>
                  </label>
                ))}
              </RadioGroup>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => setStep(1)}>Back</Button>
                <Button className="rounded-full" onClick={generateQuote}>Get quote</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-scale-in">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Your instant quote</div>
              <div className="text-6xl font-semibold tracking-tight mt-3">{inr(quote)}</div>
              <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">Final price confirmed after a quick inspection at pickup. We'll pay via UPI same day.</p>
              <div className="mt-8 max-w-sm mx-auto space-y-3">
                <Input placeholder="Your phone number" className="h-12 rounded-full text-center" />
                <Button size="lg" className="w-full rounded-full h-12">Schedule free pickup</Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
