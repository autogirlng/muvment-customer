"use client";
import { useState, useRef, useEffect } from "react";

interface OtpInputProps {
  length?: number; // Default 6
  onChange?: (value: string) => void;
}

export default function OtpInput({ length = 6, onChange }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  useEffect(() => {
    onChange?.(otp.join(""));
  }, [otp, onChange]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) setActiveIndex(index + 1);
    if (value && index === length - 1) inputRefs.current[index]?.blur();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        setActiveIndex(index - 1);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) setActiveIndex(index - 1);
    if (e.key === "ArrowRight" && index < length - 1) setActiveIndex(index + 1);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pasted)) return;
    const newOtp = pasted.split("");
    while (newOtp.length < length) newOtp.push("");
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    setActiveIndex(nextEmpty === -1 ? length - 1 : nextEmpty);
  };

  return (
    <div className="flex justify-center items-center gap-[1vw] mt-4 w-full">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={index !== activeIndex}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`text-center rounded-xl border border-gray-300 
            focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
            font-bold 
            w-[10vw] h-[10vw] text-[5vw] 
            sm:w-[8vw] sm:h-[8vw] sm:text-[3vw]
            md:w-[8vw] md:h-[8vw] md:text-[1.8vw]
            lg:w-[7vw] lg:h-[7vw] lg:text-[1.5vw]
            max-w-[80px] max-h-[80px] min-w-[40px] min-h-[40px]`}
        />
      ))}
    </div>
  );
}
