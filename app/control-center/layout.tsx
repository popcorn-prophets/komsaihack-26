import { AppSidebar } from '@/components/control-center/sidebar/app-sidebar';
import { SiteHeader } from '@/components/control-center/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireUser } from '@/lib/auth/dal';

export default async function ControlCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await requireUser();

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" viewer={viewer} />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
