'use client';

import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Bot,
  Brain,
  ChevronsUpDown,
  Combine,
  CreditCard,
  FlaskConical,
  Funnel,
  Key,
  LayoutDashboard,
  Library,
  Link,
  LogOut,
  Scale,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/redpanda-ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/redpanda-ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/redpanda-ui/dropdown-menu';
import { MCPIcon } from '@/components/redpanda-ui/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/redpanda-ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const REDPANDA_LOGO_URL = 'https://pbs.twimg.com/profile_images/1542929095507558402/P_MSXBQB_400x400.jpg';
const REDPANDA_USER_AVATAR_URL = 'https://avatars.githubusercontent.com/u/9860550?v=4';

const DATA = {
  user: {
    name: 'Beniamin Malinski',
    email: 'ben.m@redpanda.com',
    avatar: REDPANDA_USER_AVATAR_URL,
  },
  navMain: [
    {
      title: 'Back to clusters',
      url: '#',
      icon: ArrowLeft,
    },
    {
      title: 'Overview',
      url: '#',
      icon: LayoutDashboard,
    },
    {
      title: 'Metrics',
      url: '#',
      icon: TrendingUp,
    },
    {
      title: 'Topics',
      url: '#',
      icon: Library,
    },
    {
      title: 'Schema Registry',
      url: '#',
      icon: Combine,
    },
    {
      title: 'Consumer Groups',
      url: '#',
      icon: Funnel,
    },
    {
      title: 'Secrets Store',
      url: '#',
      icon: Key,
    },
    {
      title: 'AI',
      url: '#',
      icon: Sparkles,
      isActive: true,
      items: [
        {
          title: 'Agents',
          url: '#',
          icon: Workflow,
        },
        {
          title: 'Knowledge Base',
          url: '#',
          icon: Brain,
          isDisabled: true,
          disabledReason: 'Coming soon',
        },
        {
          title: 'Remote MCP',
          url: '#',
          icon: MCPIcon,
          isActive: true,
        },
      ],
    },
    {
      title: 'Security',
      url: '#',
      icon: ShieldCheck,
    },
    {
      title: 'Quotas',
      url: '#',
      icon: Scale,
    },
    {
      title: 'Connect',
      url: '#',
      icon: Link,
    },
    {
      title: 'Transforms',
      url: '#',
      icon: Bot,
    },
    {
      title: 'Reassign Partitions',
      url: '#',
      icon: FlaskConical,
      isDisabled: true,
      disabledReason: 'The Kafka cluster does not support this feature.',
    },
    {
      title: 'Cluster Settings',
      url: '#',
      icon: Settings,
    },
  ],
};

export const DemoSidebar = () => {
  const isMobile = useIsMobile();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {/* biome-ignore lint/performance/noImgElement: part of sidebar console demo */}
                <img src={REDPANDA_LOGO_URL} alt="Redpanda Production" className="aspect-square size-8 rounded-lg" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Redpanda Admin</span>
                <span className="truncate text-xs">Integration</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Cloud</SidebarGroupLabel>
          <SidebarMenu>
            {DATA.navMain.map((item) =>
              item.items && item.items.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className={cn('group/collapsible', item.isDisabled && 'opacity-50 cursor-not-allowed')}
                  disabled={item.isDisabled}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        disabled={item.isDisabled}
                        tooltip={
                          item.isDisabled && 'disabledReason' in item
                            ? (item as { disabledReason: string }).disabledReason
                            : item.title
                        }
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem
                            key={subItem.title}
                            className={cn(subItem.isDisabled && 'opacity-50 cursor-not-allowed')}
                          >
                            <SidebarMenuSubButton
                              asChild
                              aria-disabled={subItem.isDisabled}
                              disabled={subItem.isDisabled}
                              tooltip={subItem.isDisabled ? subItem.disabledReason : subItem.title}
                            >
                              <a href={subItem.url}>
                                {subItem.icon && <subItem.icon />}
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title} className={cn(item.isDisabled && 'opacity-50 cursor-not-allowed')}>
                  <SidebarMenuButton
                    asChild
                    disabled={item.isDisabled}
                    tooltip={
                      item.isDisabled && 'disabledReason' in item
                        ? (item as { disabledReason: string }).disabledReason
                        : item.title
                    }
                  >
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={DATA.user.avatar} alt={DATA.user.name} />
                    <AvatarFallback className="rounded-lg">BM</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{DATA.user.name}</span>
                    <span className="truncate text-xs">{DATA.user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={DATA.user.avatar} alt={DATA.user.name} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{DATA.user.name}</span>
                      <span className="truncate text-xs">{DATA.user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};