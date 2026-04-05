import { ResidentsDirectory } from '@/components/control-center/residents-directory';
import { requireRole } from '@/lib/auth/dal';
import { getResidentDirectory } from '@/lib/residents/directory';

export default async function Page() {
  await requireRole(['responder', 'admin', 'super_admin']);

  const residents = await getResidentDirectory();

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
      <ResidentsDirectory residents={residents} />
    </div>
  );
}
