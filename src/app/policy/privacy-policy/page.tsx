import PrivacyPolicyClient from "@/components/pagesComponent/PrivacyPolicyClient";
import { generatePageMetadata } from "@/helpers/metadata";

export const metadata = generatePageMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Muvment by Autogirl collects, uses, and protects your personal information. Understand your data rights, security measures, and how we handle information for car rental services in Nigeria.",
  keywords: [
    "Muvment privacy policy",
    "Autogirl data protection",
    "car rental privacy Nigeria",
    "personal data security",
    "GDPR compliance Nigeria",
    "data protection policy",
    "rental information privacy",
  ],
  url: "/policy/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
