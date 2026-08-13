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
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow digits, control keys, and keyboard shortcuts
    if (
      !/^[0-9]$/.test(e.key) &&
      !['Backspace', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'].includes(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    // Allow paste only if it contains just numbers
    if (!/^\d+$/.test(pastedText.replace(/\s+/g, ''))) {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("flex items-stretch gap-2 transition-all duration-200", className)}>
      <div className="grid place-items-center px-4 rounded-xl bg-secondary/50 border border-transparent text-sm font-medium text-secondary-foreground select-none">
        +91
      </div>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Phone number"
        maxLength={10}
        disabled={disabled}
        className="h-12 rounded-xl text-lg tracking-wide focus-visible:ring-1 focus-visible:ring-primary/20 bg-background/50 border-input transition-all duration-300"
      />
    </div>
  );
}
