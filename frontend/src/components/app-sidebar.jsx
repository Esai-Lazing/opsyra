"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Truck,
  Users,
  Settings,
  HelpCircle,
  Search,
  FileText,
  BarChart3,
  History,
  Fuel,
  AlertTriangle,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import authService from "@/services/authService"

const data = {
  navMain: [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Gestion des engins",
      url: "/dashboard/engins",
      icon: Settings,
      items: [
        { title: "Tous les engins", url: "/dashboard/engins" },
        { title: "Maintenance", url: "/dashboard/maintenance" },
      ]
    },
    {
      title: "Logistique",
      url: "#",
      icon: Truck,
      items: [
        { title: "Camions", url: "/dashboard/camions" },
        { title: "Missions", url: "/dashboard/missions" },
      ]
    },
    {
      title: "Ressources Humaines",
      url: "#",
      icon: Users,
      items: [
        { title: "Personnel", url: "/dashboard/personnel" },
        { title: "Assignations", url: "/dashboard/assignments" },
      ]
    },
  ],
  analytics: [
    {
      name: "Rapports",
      url: "/dashboard/reports",
      icon: BarChart3,
    },
    {
      name: "Consommation Fuel",
      url: "/dashboard/fuel",
      icon: Fuel,
    },
    {
      name: "Historique",
      url: "/dashboard/history",
      icon: History,
    },
  ],
  support: [
    {
      title: "Incidents",
      url: "/dashboard/incidents",
      icon: AlertTriangle,
      badge: "3",
    },
    {
      title: "Aide & Support",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Paramètres",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }) {
  const user = authService.getCurrentUser() || {
    name: "Utilisateur",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                  <Truck className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-foreground">Engin<span className="font-normal text-muted-foreground">Manager</span></span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium tracking-wider text-muted-foreground/70 uppercase">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive} className="font-medium text-muted-foreground hover:text-foreground data-[active=true]:text-foreground data-[active=true]:font-semibold">
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium tracking-wider text-muted-foreground/70 uppercase">Analytique</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.analytics.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name} className="font-medium text-muted-foreground hover:text-foreground">
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-xs font-medium tracking-wider text-muted-foreground/70 uppercase">Support & Système</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.support.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="font-medium text-muted-foreground hover:text-foreground">
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

