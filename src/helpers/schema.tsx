import React from "react";
import { SEO_DEFAULTS } from "./metadata";

const BASE = SEO_DEFAULTS.baseUrl;

// ─── Internal helper ──────────────────────────────────────────────────────────

function buildBreadcrumb(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── SchemaBuilder ────────────────────────────────────────────────────────────
// Each static method returns a plain JSON-LD object ready to be passed to
// <JsonLd schema={...} />.  Compose them with SchemaBuilder.graph() when a
// page needs multiple types merged under a single @graph.

export class SchemaBuilder {
  // ── Reusable nodes ──────────────────────────────────────────────────────────

  static organization() {
    return {
      "@type": "Organization",
      "@id": `${BASE}/#organization`,
      name: SEO_DEFAULTS.siteName,
      url: BASE,
      description:
        "Muvment by Autogirl helps you rent cars for business, trips, events and daily mobility across Nigeria.",
      foundingLocation: {
        "@type": "Place",
        name: "Lagos, Nigeria",
      },
      logo: {
        "@type": "ImageObject",
        url: `${BASE}${SEO_DEFAULTS.defaultImage}`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+2348167474165",
        email: "info@muvment.ng",
        areaServed: "NG",
        availableLanguage: "English",
      },
      areaServed: { "@type": "Country", name: "Nigeria" },
      sameAs: [
        "https://twitter.com/autogirl_ng",
        "https://www.instagram.com/autogirl_ng",
        "https://www.linkedin.com/company/autogirl",
      ],
    };
  }

  static webSite() {
    return {
      "@type": "WebSite",
      "@id": `${BASE}/#website`,
      name: SEO_DEFAULTS.siteName,
      url: BASE,
      description: SEO_DEFAULTS.defaultDescription,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE}/booking/search?city={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };
  }

  // ── Page schemas ─────────────────────────────────────────────────────────────

  static webPage() {
    return {
      "@type": "WebPage",
      "@id": `${BASE}/#webpage`,
      url: BASE,
      name: SEO_DEFAULTS.defaultTitle,
      description: SEO_DEFAULTS.defaultDescription,
      inLanguage: "en-NG",
      isPartOf: { "@id": `${BASE}/#website` },
      about: { "@id": `${BASE}/#organization` },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        ],
      },
    };
  }

  static localBusiness() {
    return {
      "@type": "LocalBusiness",
      "@id": `${BASE}/#localbusiness`,
      name: SEO_DEFAULTS.siteName,
      url: BASE,
      image: `${BASE}${SEO_DEFAULTS.defaultImage}`,
      email: "info@muvment.ng",
      telephone: "+2348167474165",
      address: {
        "@type": "PostalAddress",
        streetAddress: "16 Bankole Street, Oregun",
        addressLocality: "Ikeja",
        addressRegion: "Lagos",
        postalCode: "100281",
        addressCountry: "NG",
      },
      geo: { "@type": "GeoCoordinates", latitude: 6.5836, longitude: 3.3528 },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday", "Tuesday", "Wednesday",
          "Thursday", "Friday", "Saturday", "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
      areaServed: { "@type": "Country", name: "Nigeria" },
      priceRange: "₦₦",
    };
  }

  static faqPage() {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I need an account to book?",
          acceptedAnswer: { "@type": "Answer", text: "No, you don't need to create an account to book. However, you must provide accurate contact details, including an emergency contact, to help us properly identify and reach the customer, especially in case of emergencies or support-related issues." },
        },
        {
          "@type": "Question",
          name: "How long is the standard rental period on Muvment?",
          acceptedAnswer: { "@type": "Answer", text: "Our standard rental period is 12 hours. Any use of the vehicle beyond this time will attract overtime charges, which vary depending on the vehicle category. You can view applicable overtime rates at checkout or in your booking summary." },
        },
        {
          "@type": "Question",
          name: "What happens if I need the car for longer than 12 hours?",
          acceptedAnswer: { "@type": "Answer", text: "If you plan to extend your trip, please make the request and complete payment before your initial 12-hour period expires. This ensures the vehicle remains available for you and avoids overtime disputes. If payment isn't made in time, the driver may leave after notifying you via call or SMS." },
        },
        {
          "@type": "Question",
          name: "Can I reject a vehicle if something is wrong with it?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. You have a 1-hour inspection window once the vehicle is delivered. If there's a mechanical issue, like a faulty AC, you can reject the vehicle within that period, and our support team will step in to assist." },
        },
        {
          "@type": "Question",
          name: "Will I always have the same driver during my trip?",
          acceptedAnswer: { "@type": "Answer", text: "For trips that last three days or longer, your initially assigned chauffeur may be replaced by another verified Muvment driver. This rotation is for safety reasons, ensuring our drivers stay well-rested and alert. Rest assured, all our chauffeurs are professional, courteous, and fully vetted." },
        },
        {
          "@type": "Question",
          name: "Are prices the same across all locations in Lagos?",
          acceptedAnswer: { "@type": "Answer", text: "Our pricing covers most central city areas in Lagos. However, trips involving outskirts locations like Sangotedo, Ikorodu Town, Festac, Badagry, or Alimosho will attract additional charges. The fee reflects the longer travel times and logistics involved in serving those areas." },
        },
        {
          "@type": "Question",
          name: "Do I need to fuel the car during my rental?",
          acceptedAnswer: { "@type": "Answer", text: "For daily rentals, each vehicle comes with a half tank of fuel included. If the fuel runs out within the 24-hour rental period, you are required to refill the vehicle. For self-drive rentals, fuel is not included and you are fully responsible for fueling the vehicle throughout your rental period." },
        },
        {
          "@type": "Question",
          name: "Can I book a trip outside Lagos?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, but any journey outside Lagos is treated as a full-day rental. Your rental period ends upon your return to Lagos, it doesn't continue after reentry." },
        },
        {
          "@type": "Question",
          name: "What happens if I forget something in the vehicle?",
          acceptedAnswer: { "@type": "Answer", text: "Please notify us within 24 hours of the trip ending if you've left something behind. While we do our best to help, Muvment is not liable for lost items after that window." },
        },
      ],
    };
  }

  /** Homepage: WebSite (with SearchAction) + Organization + WebPage + LocalBusiness */
  static homePage() {
    return SchemaBuilder.graph([
      SchemaBuilder.webSite(),
      SchemaBuilder.organization(),
      SchemaBuilder.webPage(),
      SchemaBuilder.localBusiness(),
    ]);
  }

  /** /about-us */
  static aboutPage() {
    return {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${BASE}/about-us`,
      name: `About ${SEO_DEFAULTS.siteName}`,
      url: `${BASE}/about-us`,
      description:
        "Learn about Muvment by Autogirl — Nigeria's premier car rental service delivering quality vehicles, transparent pricing, and outstanding customer service.",
      breadcrumb: buildBreadcrumb([
        { name: "Home", url: BASE },
        { name: "About Us", url: `${BASE}/about-us` },
      ]),
      mainEntity: SchemaBuilder.organization(),
    };
  }

  /** /blog (blog index page) */
  static blogIndex() {
    return SchemaBuilder.graph([
      {
        "@type": "Blog",
        "@id": `${BASE}/blog`,
        name: "Muvment Blog",
        url: `${BASE}/blog`,
        description:
          "Insights, guides, and stories about car rental, mobility, and travel across Nigeria. Practical advice from the Muvment team.",
        inLanguage: "en-NG",
        isPartOf: { "@id": `${BASE}/#website` },
        publisher: {
          "@id": `${BASE}/#organization`,
        },
      },
      buildBreadcrumb([
        { name: "Home", url: BASE },
        { name: "Blog", url: `${BASE}/blog` },
      ]),
    ]);
  }

  /** Generic WebPage schema for content pages without a more specific type */
  static genericWebPage({
    path,
    name,
    description,
  }: {
    path: string;
    name: string;
    description: string;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${BASE}${path}`,
      name,
      url: `${BASE}${path}`,
      description,
      inLanguage: "en-NG",
      isPartOf: { "@id": `${BASE}/#website` },
      breadcrumb: buildBreadcrumb([
        { name: "Home", url: BASE },
        { name, url: `${BASE}${path}` },
      ]),
    };
  }

  /** /contact-us */
  static contactPage() {
    return {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": `${BASE}/contact-us`,
      name: `Contact ${SEO_DEFAULTS.siteName}`,
      url: `${BASE}/contact-us`,
      description:
        "Get in touch with Muvment by Autogirl. Reach us via phone, email, or visit us at 16 Bankole Street, Oregun, Ikeja, Lagos.",
      breadcrumb: buildBreadcrumb([
        { name: "Home", url: BASE },
        { name: "Contact Us", url: `${BASE}/contact-us` },
      ]),
      mainEntity: {
        "@type": "LocalBusiness",
        "@id": `${BASE}/#localbusiness`,
        name: SEO_DEFAULTS.siteName,
        url: BASE,
        image: `${BASE}${SEO_DEFAULTS.defaultImage}`,
        email: "info@muvment.ng",
        telephone: "+2348167474165",
        address: {
          "@type": "PostalAddress",
          streetAddress: "16 Bankole Street, Oregun",
          addressLocality: "Ikeja",
          addressRegion: "Lagos",
          postalCode: "100281",
          addressCountry: "NG",
        },
        geo: { "@type": "GeoCoordinates", latitude: 6.5836, longitude: 3.3528 },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday","Tuesday","Wednesday",
            "Thursday","Friday","Saturday","Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
        areaServed: { "@type": "Country", name: "Nigeria" },
        priceRange: "₦₦",
      },
    };
  }

  /**
   * /explore  or  /booking/search
   * @param city     - city from URL param (default "Lagos")
   * @param category - optional vehicle category name
   * @param path     - route path, e.g. "/explore" or "/booking/search"
   */
  static searchResultsPage({
    city,
    category,
    path = "/booking/search",
  }: {
    city: string;
    category?: string;
    path?: string;
  }) {
    const title = category
      ? `${category} for Rent in ${city}`
      : `Rent Cars in ${city}`;
    const pageUrl = `${BASE}${path}?city=${encodeURIComponent(city)}`;

    return {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "@id": pageUrl,
      name: `${title} | ${SEO_DEFAULTS.siteName}`,
      url: pageUrl,
      description: `Browse verified rental vehicles available in ${city}. Sedans, SUVs, luxury cars and more, all with professional chauffeurs.`,
      breadcrumb: buildBreadcrumb([
        { name: "Home", url: BASE },
        { name: "Search Vehicles", url: `${BASE}${path}` },
        ...(city.toLowerCase() !== "lagos"
          ? [{ name: `Cars in ${city}`, url: pageUrl }]
          : []),
      ]),
      provider: {
        "@type": "Organization",
        "@id": `${BASE}/#organization`,
        name: SEO_DEFAULTS.siteName,
        url: BASE,
      },
    };
  }

  /**
   * /blog/[id]
   * Pass the full post object; only used fields are typed here.
   */
  static article(post: {
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    authAuthorName?: string;
    authorName?: string;
    authAuthorEmail?: string;
    authorEmail?: string;
    approvedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    blogCategory?: { id: string; name: string };
    tags?: string[];
    metrics?: { likes?: number; commentCount?: number; views?: number };
  }) {
    const description =
      post.excerpt || post.content?.replace(/<[^>]+>/g, "").slice(0, 160);

    return SchemaBuilder.graph([
      {
        "@type": "Article",
        headline: post.title,
        description,
        ...(post.coverImage && { image: post.coverImage }),
        author: {
          "@type": "Person",
          name: post.authAuthorName || post.authorName,
          email: post.authAuthorEmail || post.authorEmail,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${BASE}/#organization`,
          name: SEO_DEFAULTS.siteName,
        },
        datePublished: post.approvedAt || post.createdAt,
        dateModified: post.updatedAt,
        articleSection: post.blogCategory?.name,
        keywords: (post.tags ?? []).join(", "),
        interactionStatistic: [
          {
            "@type": "InteractionCounter",
            interactionType: { "@type": "LikeAction" },
            userInteractionCount: post.metrics?.likes ?? 0,
          },
          {
            "@type": "InteractionCounter",
            interactionType: { "@type": "CommentAction" },
            userInteractionCount: post.metrics?.commentCount ?? 0,
          },
          {
            "@type": "InteractionCounter",
            interactionType: { "@type": "WatchAction" },
            userInteractionCount: post.metrics?.views ?? 0,
          },
        ],
      },
      buildBreadcrumb([
        { name: "Home", url: BASE },
        { name: "Blog", url: `${BASE}/blog` },
        ...(post.blogCategory
          ? [
              {
                name: post.blogCategory.name,
                url: `${BASE}/blog?category=${encodeURIComponent(post.blogCategory.name)}`,
              },
            ]
          : []),
        { name: post.title, url: `${BASE}/blog/${post.slug}` },
      ]),
    ]);
  }

  /**
   * /booking/details/[id]
   * Pass the vehicle object and the route id.
   */
  static vehicle(
    vehicle: {
      name: string;
      description?: string;
      city?: string;
      year?: string | number;
      vehicleMakeName?: string;
      numberOfSeats?: number;
      photos?: { cloudinaryUrl: string }[];
      allPricingOptions?: { price: number }[];
    },
    slug: string,
  ) {
    const lowestPrice =
      vehicle.allPricingOptions && vehicle.allPricingOptions.length > 0
        ? Math.min(...vehicle.allPricingOptions.map((o) => o.price))
        : 0;

    return {
      "@context": "https://schema.org",
      "@type": "Car",
      name: vehicle.name,
      description:
        vehicle.description || `Rent a ${vehicle.name} in ${vehicle.city}`,
      image: vehicle.photos?.map((p) => p.cloudinaryUrl) || [],
      vehicleModelDate: vehicle.year ? `${vehicle.year}-01-01` : undefined,
      manufacturer: {
        "@type": "Organization",
        name: vehicle.vehicleMakeName,
      },
      seatingCapacity: vehicle.numberOfSeats,
      offers: {
        "@type": "Offer",
        priceCurrency: "NGN",
        price: lowestPrice,
        availability: "https://schema.org/InStock",
        url: `${BASE}/booking/details/${slug}`,
      },
    };
  }

  // ── Utility ──────────────────────────────────────────────────────────────────

  /** Wrap multiple schema nodes into a single @graph document */
  static graph(nodes: Record<string, unknown>[]) {
    return {
      "@context": "https://schema.org",
      "@graph": nodes,
    };
  }
}

// ─── JsonLd component ─────────────────────────────────────────────────────────
// Works in both server and client components.

export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
