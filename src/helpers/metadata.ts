import type { Metadata } from "next";

// ─── Shared brand defaults ────────────────────────────────────────────────────
export const SEO_DEFAULTS = {
  siteName: "Muvment by Autogirl",
  baseUrl: "https://www.muvment.ng",
  defaultImage: "/images/image1.png",
  twitterHandle: "@autogirl_ng",
  locale: "en_NG",
  category: "Transportation",
  authors: [{ name: "Autogirl", url: "https://www.muvment.ng" }],
  creator: "Autogirl",
  publisher: "Autogirl Mobility",
  keywords: [
    "Car rental Nigeria",
    "Autogirl",
    "Muvment",
    "Vehicle hire Nigeria",
    "Rent a car Lagos",
    "Chauffeur service Nigeria",
    "Luxury car hire Lagos",
    "Monthly car rental Lagos",
    "Daily car rental Lagos",
    "Airport transfer Lagos",
    "Hourly car rental Nigeria",
    "Book a car Nigeria",
    "Private car hire",
    "Corporate car hire Nigeria",
    "Abuja car rental",
  ],
  defaultTitle: "Rent a Car Anywhere in Nigeria | Muvment by Autogirl",
  titleTemplate: "%s | Muvment by Autogirl",
  defaultDescription:
    "Muvment by Autogirl helps you rent cars easily for business, trips, events, and daily mobility across Nigeria. Flexible pricing. Verified cars. Fast booking.",
} as const;

// ─── Meta description length guard ────────────────────────────────────────────
// Search engines truncate descriptions past roughly 160 characters, and audits
// flag anything longer. We clamp every description to a safe ceiling at a word
// boundary so no page can ship an over-length tag, whatever the source text.
export const META_DESCRIPTION_MAX = 158;

export function clampMetaDescription(
  input: string,
  max = META_DESCRIPTION_MAX
): string {
  const text = (input || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const slice = text.slice(0, max - 1); // reserve one char for the ellipsis
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return trimmed.replace(/[\s.,;:!?-]+$/, "") + "…";
}

// ─── Config interface ─────────────────────────────────────────────────────────
interface PageMetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  section?: string;
  noIndex?: boolean;
  /** When true, the title is used as-is without the " | Muvment by Autogirl" template suffix. */
  titleAbsolute?: boolean;
  /** Optional JSON-LD structured data object (will be serialized as script tag via your layout) */
  structuredData?: Record<string, unknown>;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  image = SEO_DEFAULTS.defaultImage,
  url,
  type = "website",
  section,
  noIndex = false,
  titleAbsolute = false,
}: PageMetadataConfig): Metadata {
  const { siteName, baseUrl, twitterHandle, locale, creator, publisher } =
    SEO_DEFAULTS;

  const fullTitle = `${title} | ${siteName}`;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  const allKeywords = [...new Set([...keywords, ...SEO_DEFAULTS.keywords])];

  const safeDescription = clampMetaDescription(description);

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description: safeDescription,
    keywords: allKeywords,
    authors: [...SEO_DEFAULTS.authors],
    creator,
    publisher,

    robots: noIndex
      ? { index: false, follow: false }
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

    alternates: { canonical: fullUrl },

    openGraph: {
      type,
      siteName,
      title: fullTitle,
      description: safeDescription,
      url: fullUrl,
      locale,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },

    twitter: {
      card: "summary_large_image",
      site: twitterHandle,
      creator: twitterHandle,
      title: fullTitle,
      description: safeDescription,
      images: [imageUrl],
    },

    category: section || SEO_DEFAULTS.category,

    referrer: "origin-when-cross-origin",
    formatDetection: { email: false, address: false, telephone: false },
    icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
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
