import SaccoSettingsManager from "@/components/settings/SaccoSettingsManager";

export const metadata = { title: "SACCO settings" };

export default function SuperuserSettingsPage() {
  return <SaccoSettingsManager mode="superuser" />;
}
