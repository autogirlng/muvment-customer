import { SubmitKYCPage } from "@/components/settingsComponent/SubmitKYC";
import IntegrationAccessGuard from "@/components/settingsComponent/IntegrationAccessGuard";

export default function Page() {
  return (
    <IntegrationAccessGuard>
      <SubmitKYCPage />
    </IntegrationAccessGuard>
  );
}
