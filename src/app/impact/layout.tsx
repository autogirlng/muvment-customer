import { Playfair_Display } from "next/font/google";

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
    <div className={`${playfair.variable} bg-white text-[#101928]`}>
      {children}
    </div>
  );
}
