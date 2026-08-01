import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { PhoneInput } from "@/components/auth/phone-input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { ArrowRight, ShieldCheck, Loader2, CheckCircle2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AuthService, UserRole } from "@/lib/auth-service";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Recell" },
      { name: "description", content: "Sign in with your phone number." },
    ],
  }),
  component: Login,
});

type AuthStep = "landing" | "phone" | "signup_form" | "otp" | "loading" | "role" | "success";

function Login() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [step, setStep] = useState<AuthStep>("landing");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [detectedRole, setDetectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSendOTP = async () => {
    if (phone.length === 10) {
      setError(null);
      // Call backend to trigger OTP (logs to console in dev)
      await AuthService.sendOTP(phone);
      setStep("otp");
    }
  };

  const handleVerifyOTP = async (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      setIsVerifying(true);
      setError(null);

      try {
        let result;
        if (isSignUpMode) {
          // They are signing up, so send full details
          result = await AuthService.registerUser({ phone, otp: value, fullName, city: address });
        } else {
          // They are signing in
          result = await AuthService.verifyOTP(phone, value);
        }

        if (!result.success) {
          setError("Verification failed. Please try again.");
          setIsVerifying(false);
          return;
        }

        setStep("loading");

        if (result.isNewUser && !isSignUpMode) {
          // They tried to sign in but don't exist
          setStep("phone");
          setError("Account not found. Please sign up.");
          setIsVerifying(false);
          return;
        } else if (result.user && result.token) {
          setDetectedRole(result.user.role);
          // Use the REAL JWT token from the backend
          login(result.user, result.token);

          setTimeout(() => {
            setStep("role");
            setTimeout(() => {
              // Redirect based on role
              if (result.user?.role === "admin") navigate({ to: "/admin" });
              else if (result.user?.role === "staff") navigate({ to: "/staff" });
              else navigate({ to: "/" });
            }, 2000);
          }, 1000);
        }
      } catch (e) {
        setError("An error occurred. Please try again.");
        setIsVerifying(false);
      }
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        {step === "landing" && (
          <div className="animate-fade-up flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-foreground text-background mb-6 shadow-xl">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Welcome to Recell</h1>
            <p className="text-muted-foreground mb-8">
              Sign in or create an account to manage your certified pre-owned devices.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button size="lg" className="w-full rounded-full h-12 text-md" onClick={() => { setIsSignUpMode(false); setStep("phone"); }}>
                Sign In
              </Button>
              <Button size="lg" variant="outline" className="w-full rounded-full h-12 text-md" onClick={() => { setIsSignUpMode(true); setStep("signup_form"); }}>
                Sign Up
              </Button>
            </div>
          </div>
        )}

        {step === "phone" && (
          <div className="animate-fade-left">
            <div className="mb-8">
              <button onClick={() => setStep("landing")} className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                ← Back
              </button>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                We'll send you a one-time password to verify your number.
              </p>
            </div>
            <div className="space-y-6">
              <PhoneInput value={phone} onChange={setPhone} />
              
              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button size="lg" className="w-full rounded-full h-12" disabled={phone.length !== 10} onClick={handleSendOTP}>
                Send OTP <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By continuing you agree to our Terms & Privacy Policy.
              </p>
            </div>
          </div>
        )}

        {step === "signup_form" && (
          <div className="animate-fade-up">
            <div className="mb-8">
              <button onClick={() => setStep("landing")} className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                ← Back
              </button>
              <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Please fill in your details to sign up.
              </p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="h-12 rounded-xl bg-background/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="h-12 rounded-xl bg-background/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <PhoneInput value={phone} onChange={setPhone} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="New Delhi" className="h-12 rounded-xl bg-background/50" />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" size="lg" className="w-full rounded-full h-12 mt-6" disabled={isVerifying || phone.length !== 10 || !fullName || !address || !email}>
                Send Verification Code
              </Button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div className="animate-fade-left">
            <div className="mb-8">
              <button onClick={() => setStep(isSignUpMode ? "signup_form" : "phone")} className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                ← Back
              </button>
              <h1 className="text-2xl font-semibold tracking-tight">Verify OTP</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Code sent to +91 {phone}. <span className="text-primary font-medium">(Check backend terminal for OTP)</span>
              </p>
            </div>
            <div className="flex flex-col items-center space-y-6">
              <InputOTP maxLength={6} value={otp} onChange={handleVerifyOTP} disabled={isVerifying}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} className="h-12 w-12 sm:h-14 sm:w-14 text-lg rounded-xl transition-all" />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}

              {isVerifying && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}

              <div className="text-xs text-muted-foreground mt-4">
                Didn't receive code? <button className="underline hover:text-foreground" onClick={handleSendOTP}>Resend</button>
              </div>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="animate-fade-up flex flex-col items-center justify-center py-12 text-center space-y-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-medium tracking-tight">Verifying your identity...</h2>
            <p className="text-sm text-muted-foreground">Please wait a moment while we securely sign you in.</p>
          </div>
        )}

        {step === "role" && (
          <div className="animate-fade-in flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Sign in successful!</h2>
            <p className="text-muted-foreground">
              Welcome back. You are signed in as a <span className="font-semibold text-foreground capitalize">{detectedRole}</span>.
            </p>
            <p className="text-sm text-muted-foreground animate-pulse">Redirecting to your dashboard...</p>
          </div>
        )}

      </AuthCard>
    </AuthLayout>
  );
}
