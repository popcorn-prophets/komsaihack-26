import { AccountSummaryCard } from '@/components/control-center/settings/account-summary-card';
import { AppearanceSettingsCard } from '@/components/control-center/settings/appearance-settings-card';
import { PasswordSettingsForm } from '@/components/control-center/settings/password-settings-form';
import { ProfileSettingsForm } from '@/components/control-center/settings/profile-settings-form';
import { requireUser } from '@/lib/auth/dal';

export default async function Page() {
  const viewer = await requireUser();

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage your profile, password, and appearance for the control center.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="flex flex-col gap-6">
          <ProfileSettingsForm initialFullName={viewer.fullName} />
          <PasswordSettingsForm email={viewer.email} />
        </div>

        <div className="flex flex-col gap-6">
          <AccountSummaryCard viewer={viewer} />
          <AppearanceSettingsCard />
        </div>
      </div>
    </div>
  );
}
