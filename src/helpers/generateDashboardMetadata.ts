import type { Metadata } from "next";

interface DashboardMetadataConfig {
  title: string;
  description: string;
}

export function generateDashboardMetadata({
  title,
  description,
}: DashboardMetadataConfig): Metadata {
  return {
    title,
    description,
    robots: {
      index: false, // Never index authenticated pages
      follow: false,
    },
    openGraph: {
      title: `${title} | Dashboard - Muvment by Autogirl`,
      description,
      siteName: "Muvment by Autogirl",
    },
    twitter: {
      card: "summary",
      title: `${title} | Dashboard`,
      description,
    },
  };
}
