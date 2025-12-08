import type { Metadata } from "next";
import "./globals.css";
import ClientRoot from "@/components/utils/ClientRoot";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/controllers/connnector/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Muvment by Autogirl",
    template: "%s | Muvment by Autogirl",
  },

  description:
    "Unlock your next adventure with Muvment by Autogirl. Rent cars for business, travel, and daily mobility with flexible pricing, fast booking, and trusted support across Nigeria.",

  keywords: [
    "Car rental Nigeria",
    "Vehicle hire",
    "Autogirl",
    "Muvment",
    "Rent a car Lagos",
    "Short term car rental",
    "Luxury car hire",
    "Ride services",
  ],

  authors: [{ name: "Autogirl" }],
  creator: "Autogirl",

  metadataBase: new URL("https://www.muvment.ng"),

  openGraph: {
    title: "Muvment by Autogirl ",
    description:
      "Book reliable vehicles for business, travel, and daily trips. Fast booking. Affordable pricing. Powered by Autogirl.",
    url: "https://www.muvment.ng",
    images: [
      {
        url: "/images/image1.png",
        width: 1200,
        height: 630,
        alt: "Muvment by Autogirl",
      },
    ],
    locale: "en_NG",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Muvment by Autogirl ",
    description:
      "Book reliable vehicles for business, travel, and daily trips with Muvment by Autogirl.",
    images: ["/images/image1.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/images/image1.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <QueryProvider>
          <ClientRoot>{children}</ClientRoot>
          <ToastContainer position="top-right" autoClose={3000} />
        </QueryProvider>
      </body>
    </html>
  );
}
