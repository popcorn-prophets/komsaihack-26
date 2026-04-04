import { ChartAreaInteractive } from '@/components/control-center/chart-area-interactive';
import { SectionCards } from '@/components/control-center/section-cards';

export default async function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <SectionCards />
      <ChartAreaInteractive />
    </div>
  );
}
