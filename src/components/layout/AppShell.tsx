import { Link, Outlet, useLocation } from 'react-router-dom';
import { Search, Truck } from 'lucide-react';
import { ROUTES } from '@/core/routes/paths';
import { NAV_ITEMS, PAGE_TITLES } from '@/constants/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function getPageTitle(pathname: string): string {
  if (pathname === ROUTES.invoices.new) return 'Create Invoice';
  if (pathname.endsWith('/edit')) return 'Edit Invoice';
  if (/^\/invoices\/[^/]+$/.test(pathname)) return 'Invoice';
  return PAGE_TITLES[pathname] ?? 'UltraShip';
}

export function AppShell() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Truck className="size-4" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">UltraShip</p>
              <p className="truncate text-xs text-muted-foreground">
                Transportation Finance
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link to={item.href} />}
                      isActive={
                        !item.disabled &&
                        (item.href === ROUTES.dashboard
                          ? location.pathname === ROUTES.dashboard
                          : location.pathname.startsWith(item.href))
                      }
                      className={cn(item.disabled && 'pointer-events-none opacity-50')}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                      {item.disabled ? (
                        <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground group-data-[collapsible=icon]:hidden">
                          Soon
                        </span>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <p className="px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            Accounts Payable Ledger
          </p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <Separator orientation="vertical" className="h-4" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-medium">{pageTitle}</h2>
          </div>
          <div className="hidden w-56 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search…"
                className="h-8 pl-8"
                disabled
                aria-label="Global search"
              />
            </div>
          </div>
          <div
            className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground"
            aria-label="User placeholder"
          >
            US
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
