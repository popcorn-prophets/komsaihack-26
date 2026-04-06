'use client';

import {
  IconAddressBook,
  IconChartBar,
  IconDatabaseExport,
  IconDashboard,
  IconHelp,
  IconListDetails,
  IconMap,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import * as React from 'react';

import { NavMain } from '@/components/control-center/sidebar/nav-main';
import { NavSecondary } from '@/components/control-center/sidebar/nav-secondary';
import { NavUser } from '@/components/control-center/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { AuthUser } from '@/lib/auth/types';
import { canAccessIncidentExport } from '@/lib/incidents/export-config';
import Logo from '../../brand/logo';

export function AppSidebar({
  viewer,
  ...props
}: React.ComponentProps<typeof Sidebar> & { viewer: AuthUser }) {
  const canAccessAdminPanel = viewer.roles.some(
    (assignment) =>
      assignment.role === 'admin' || assignment.role === 'super_admin'
  );
  const canAccessExport = canAccessIncidentExport(viewer);

  const navMain = [
    {
      title: 'Dashboard',
      url: '/control-center',
      icon: IconDashboard,
    },
    {
      title: 'Incidents',
      url: '/control-center/incidents',
      icon: IconListDetails,
    },
    {
      title: 'Advisories',
      url: '/control-center/advisories',
      icon: IconChartBar,
    },
    {
      title: 'Map',
      url: '/control-center/map',
      icon: IconMap,
    },
    {
      title: 'Residents',
      url: '/control-center/residents',
      icon: IconAddressBook,
    },
    ...(canAccessExport
      ? [
          {
            title: 'Export',
            url: '/control-center/export',
            icon: IconDatabaseExport,
          },
        ]
      : []),
    ...(canAccessAdminPanel
      ? [
          {
            title: 'Admin Panel',
            url: '/control-center/admin-panel',
            icon: IconUsers,
          },
        ]
      : []),
  ];

  const navSecondary = [
    {
      title: 'Settings',
      url: '/control-center/settings',
      icon: IconSettings,
    },
    {
      title: 'Get Help',
      url: '/control-center/help',
      icon: IconHelp,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <Logo className="w-full" />
                <span className="text-base font-semibold">DRRMO</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={viewer} />
      </SidebarFooter>
    </Sidebar>
  );
}
