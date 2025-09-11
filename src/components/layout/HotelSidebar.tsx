import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Settings, 
  Hotel,
  CreditCard,
  Package,
  ChefHat
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "POS System", url: "/pos", icon: ShoppingCart },
  { title: "Bookings", url: "/admin/bookings", icon: Calendar },
  { title: "Rooms", url: "/admin/rooms", icon: Hotel },
  { title: "Guests", url: "/admin/guests", icon: Users },
  { title: "Restaurant", url: "/admin/restaurant", icon: ChefHat },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Inventory", url: "/admin/inventory", icon: Package },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function HotelSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `w-full ${isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"}`;

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"}>
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          {state !== "collapsed" && (
            <div>
              <h2 className="text-lg font-bold text-foreground">LuxeStay</h2>
              <p className="text-sm text-muted-foreground">Hotel Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}