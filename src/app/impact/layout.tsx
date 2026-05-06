import { DM_Sans, Playfair_Display } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-impact-dm",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-impact-playfair",
  display: "swap",
});

export default function ImpactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${playfair.variable} ${dmSans.className} bg-[#FAFAF7] text-[#1C1C1C]`}
    >
      {children}
    </div>
  );
}
