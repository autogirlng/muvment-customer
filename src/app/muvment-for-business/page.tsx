import { MuvmentForBusiness } from "@/components/muvmentForBusiness/Main";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";

export const metadata = generatePageMetadata({
  title: "Muvment for Business",
  description:
    "Give your team reliable rides from one company wallet. Manage staff, set spending limits and approvals, track trips, and keep company spend in one place with Muvment for Business.",
  keywords: [
    "Muvment for business",
    "corporate mobility Nigeria",
    "company wallet rides",
    "business travel Nigeria",
    "staff transport management",
    "corporate booking platform",
    "team ride management",
  ],
  url: "/muvment-for-business",
});

export default function MuvmentForBusinessPage() {
  return (
    <>
      <JsonLd
        schema={SchemaBuilder.genericWebPage({
          path: "/muvment-for-business",
          name: "Muvment for Business",
          description:
            "Mobility for your whole team. One company wallet, team management, spending limits, approvals, company invoices, and trip tracking.",
        })}
      />
      <MuvmentForBusiness />
    </>
  );
}
