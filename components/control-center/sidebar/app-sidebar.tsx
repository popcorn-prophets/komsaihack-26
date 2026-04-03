'use client';

import {
  IconChartBar,
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
import { User } from '@supabase/supabase-js';
import Logo from '../../brand/logo';

const data = {
  navMain: [
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
      title: 'Team',
      url: '/control-center/team',
      icon: IconUsers,
    },
  ],
  navSecondary: [
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
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
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
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
