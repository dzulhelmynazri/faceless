import { ConnectedAccounts } from "./_components/connected-accounts";
import { DangerZone } from "./_components/danger-zone";

const SettingsPage = () => (
  <div className="flex flex-col gap-6">
    <ConnectedAccounts />
    <DangerZone />
  </div>
);

export default SettingsPage;
