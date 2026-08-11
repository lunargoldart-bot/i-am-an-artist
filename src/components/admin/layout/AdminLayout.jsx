import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Palette } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarRail, SidebarInset,
} from '@/components/ui/sidebar';
import { ADMIN_NAV } from './adminNav';
import { useAuth } from '@/lib/AuthContext';
import { AdminThemeProvider } from '@/lib/AdminTheme';
import AdminHeader from './AdminHeader';

function SidebarNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isActive = (href) => (href === '/admin' ? pathname === '/admin' : pathname === href);
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg green-gradient text-primary-foreground">
            <Palette className="h-4 w-4" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-playfair text-sm font-bold leading-tight text-foreground">I Am An Artist</p>
            <p className="text-[11px] text-muted-foreground">Admin Console</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {ADMIN_NAV.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <NavLink to={item.href} end={item.href === '/admin'}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2">
          <p className="text-[11px] text-muted-foreground">Signed in as</p>
          <p className="truncate text-xs font-medium text-foreground">{user?.email || 'Admin'}</p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default function AdminLayout() {
  return (
    <AdminThemeProvider>
      <SidebarProvider>
        <SidebarNav />
        <SidebarInset>
          <AdminHeader />
          <main className="flex-1 space-y-6 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminThemeProvider>
  );
}