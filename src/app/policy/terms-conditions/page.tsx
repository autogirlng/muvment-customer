import TermsOfServiceClient from "@/components/pagesComponent/TermsConditionClient";
import { generatePageMetadata } from "@/helpers/metadata";

export const metadata = generatePageMetadata({
  title: "Terms of Service",
  description:
    "Read Muvment by Autogirl's terms for car rental in Nigeria: booking, cancellations, refunds, extra charges, self-drive terms, and monthly rental agreements.",
  keywords: [
    "car rental terms Nigeria",
    "Muvment terms and conditions",
    "Autogirl rental policy",
    "vehicle rental agreement",
    "car hire terms Lagos",
    "rental cancellation policy",
    "self-drive terms Nigeria",
  ],
  url: "/policy/terms-conditions",
});

export default function TermsOfServicePage() {
  return <TermsOfServiceClient />;
}
