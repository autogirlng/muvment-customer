import type { Metadata } from "next";
import "./globals.css";
import ClientRoot from "@/components/utils/ClientRoot";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/controllers/connnector/QueryProvider";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/services/analytics";
import GoogleAnalytics from "@/components/general/GoogleAnalytics";
import LiveChat from "@/components/LiveChat/LiveChat";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.muvment.ng"),

  title: {
    default: "Muvment by Autogirl | Rent Cars Anywhere in Nigeria",
    template: "%s | Muvment by Autogirl",
  },

  description:
    "Muvment by Autogirl helps you rent cars easily for business, trips, events, and daily mobility across Nigeria. Flexible pricing. Verified cars. Fast booking.",

  keywords: [
    "Car rental Nigeria",
    "Rent a car Lagos",
    "Vehicle hire",
    "Chauffeur service Nigeria",
    "Luxury car hire",
    "Self drive car rental",
    "Daily car rental",
    "Autogirl",
    "Muvment",
  ],

  authors: [{ name: "Autogirl" }],
  creator: "Autogirl",
  publisher: "Autogirl Mobility",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "https://www.muvment.ng",
  },

  openGraph: {
    type: "website",
    siteName: "Muvment by Autogirl",
    title: "Muvment by Autogirl | Smart Car Booking in Nigeria",
    description:
      "Book verified vehicles for business, travel and everyday movement across Nigeria.",
    url: "https://www.muvment.ng",
    locale: "en_NG",
    images: [
      {
        url: "/images/image1.png",
        width: 1200,
        height: 630,
        alt: "Muvment by Autogirl",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@autogirl_ng",
    creator: "@autogirl_ng",
    title: "Muvment by Autogirl",
    description:
      "Book reliable vehicles instantly for trips, business, events and everyday rides.",
    images: ["/images/image1.png"],
  },

  icons: {
    icon: "/images/image1.png",
    apple: "/apple-touch-icon.png",
  },

  category: "Transportation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className}>
        {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
        <QueryProvider>
          <ClientRoot>{children}</ClientRoot>
          <ToastContainer position="top-right" autoClose={3000} />
        </QueryProvider>
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){
                  (c[a].q=c[a].q||[]).push(arguments)
                };
                t=l.createElement(r);t.async=1;
                t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];
                y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uih9lxpegu");
          `}
        </Script>
        {/* Microsoft Clarity Integration */}
        {CLARITY_PROJECT_ID && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
            `}
          </Script>
        )}
        <LiveChat />
      </body>
    </html>
  );
}
