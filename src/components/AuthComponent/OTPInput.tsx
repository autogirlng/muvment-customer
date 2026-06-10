"use client";
import { useRef, useState } from "react";

interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  align?: "center" | "start";
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  hasError = false,
  disabled = false,
  align = "center",
}: OtpInputProps) {
  const [internal, setInternal] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const controlled = value !== undefined;
  const digits = controlled
    ? Array.from({ length }, (_, i) => value!.charAt(i) || "")
    : internal;

  const emit = (arr: string[]) => {
    if (!controlled) setInternal(arr);
    onChange?.(arr.join(""));
  };

  const setAt = (i: number, ch: string) => {
    const arr = [...digits];
    arr[i] = ch;
    emit(arr);
  };

  const handleChange = (i: number, raw: string) => {
    const ch = raw.replace(/\D/g, "").slice(-1);
    setAt(i, ch);
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        setAt(i, "");
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        setAt(i - 1, "");
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const arr = Array(length).fill("");
    pasted.split("").forEach((c, idx) => (arr[idx] = c));
    emit(arr);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div
      className={`flex gap-2 lg:gap-3 ${align === "start" ? "justify-start" : "justify-center"}`}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={digits[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1}`}
          className={`h-12 w-12 lg:h-14 lg:w-14 rounded-xl border-2 text-center text-xl font-semibold text-[#101928] outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
              : digits[i]
                ? "border-[#0673FF] bg-[#0673FF]/5 focus:ring-2 focus:ring-[#0673FF]/15"
                : "border-gray-200 hover:border-gray-300 focus:border-[#0673FF] focus:ring-2 focus:ring-[#0673FF]/15"
          }`}
        />
      ))}
    </div>
  );
}
