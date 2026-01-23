import type { Metadata } from "next";

interface PageMetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  section?: string;
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  image = "/images/image1.png",
  url,
  type = "website",
  section,
  noIndex = false,
}: PageMetadataConfig): Metadata {
  const siteName = "Muvment by Autogirl";
  const baseUrl = "https://www.muvment.ng";
  const fullTitle = `${title} | ${siteName}`;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  // Merge with default keywords
  const defaultKeywords = [
    "Car rental Nigeria",
    "Autogirl",
    "Muvment",
    "Vehicle hire Nigeria",
  ];
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    creator: "Autogirl",
    publisher: "Autogirl Mobility",

    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
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
      canonical: fullUrl,
    },

    // Open Graph (Facebook, LinkedIn, WhatsApp)
    openGraph: {
      type,
      siteName,
      title: fullTitle,
      description,
      url: fullUrl,
      locale: "en_NG",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      site: "@autogirl_ng",
      creator: "@autogirl_ng",
      title: fullTitle,
      description,
      images: [imageUrl],
    },

    category: section || "Transportation",

    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export const RIDE_PURPOSES = [
  "Airport Transfer",
  "Business Meeting",
  "Wedding",
  "Corporate Event",
  "City Tour",
  "Shopping",
  "Medical Appointment",
  "School Run",
  "Party/Night Out",
  "Hotel Transfer",
  "Conference",
  "Funeral",
  "Date Night",
  "Concert/Event",
  "Family Outing",
  "Religious Service",
  "Sports Event",
  "Restaurant Visit",
  "Sightseeing",
  "Other",
];
