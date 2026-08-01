import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, className, disabled }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and max length 10
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(val);
  };

  return (
    <div className={cn("flex items-stretch gap-2 transition-all duration-200", className)}>
      <div className="grid place-items-center px-4 rounded-xl bg-secondary/50 border border-transparent text-sm font-medium text-secondary-foreground select-none">
        +91
      </div>
      <Input
        value={value}
        onChange={handleChange}
        placeholder="Phone number"
        inputMode="numeric"
        disabled={disabled}
        className="h-12 rounded-xl text-lg tracking-wide focus-visible:ring-1 focus-visible:ring-primary/20 bg-background/50 border-input transition-all duration-300"
      />
    </div>
  );
}
