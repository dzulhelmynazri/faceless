import { PageHeader } from "@/components/page-header";

import { ConnectedAccounts } from "./_components/connected-accounts";
import { DangerZone } from "./_components/danger-zone";

const SettingsPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader
      title="Connected accounts"
      description="Connect your social media accounts for automatic content distribution."
    />
    <ConnectedAccounts />
    <DangerZone />
  </div>
);

export default SettingsPage;
