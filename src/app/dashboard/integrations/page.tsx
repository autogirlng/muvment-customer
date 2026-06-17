import { SettingsPage } from "@/components/Dashboard/SettingPage";
import IntegrationAccessGuard from "@/components/settingsComponent/IntegrationAccessGuard";

export default function Page() {
  return (
    <IntegrationAccessGuard>
      <SettingsPage />
    </IntegrationAccessGuard>
  );
}
