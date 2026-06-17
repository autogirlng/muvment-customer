import { CreateOrganizationPage } from "@/components/settingsComponent/CreateOrganization";
import IntegrationAccessGuard from "@/components/settingsComponent/IntegrationAccessGuard";

export default function Page() {
  return (
    <IntegrationAccessGuard>
      <CreateOrganizationPage />
    </IntegrationAccessGuard>
  );
}
