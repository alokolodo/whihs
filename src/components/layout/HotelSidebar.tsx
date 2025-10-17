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
  ChefHat,
  Building,
  Dumbbell,
  Gamepad2,
  Truck,
  Star,
  Crown,
  Gem,
  KeyRound,
  Castle,
  UserPlus,
  LogOut,
  Shield
} from "lucide-react";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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

// Role-based navigation configuration
const navigationItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3, roles: ['admin', 'manager', 'supervisor', 'staff', 'front_desk', 'accounting'] },
  { title: "Hotel Services", url: "/pos", icon: ShoppingCart, roles: ['admin', 'manager', 'supervisor', 'staff', 'bartender', 'front_desk'] },
  { title: "Restaurant POS", url: "/pos/restaurant", icon: ChefHat, roles: ['admin', 'manager', 'supervisor', 'kitchen', 'staff', 'bartender'] },
  { title: "Bookings", url: "/admin/bookings", icon: Calendar, roles: ['admin', 'manager', 'supervisor', 'front_desk', 'staff'] },
  { title: "Rooms", url: "/admin/rooms", icon: Hotel, roles: ['admin', 'manager', 'supervisor', 'front_desk', 'housekeeping'] },
  { title: "Halls", url: "/admin/halls", icon: Building, roles: ['admin', 'manager', 'supervisor', 'front_desk'] },
  { title: "Gym", url: "/admin/gym", icon: Dumbbell, roles: ['admin', 'manager', 'supervisor', 'staff'] },
  { title: "Game Center", url: "/admin/game-center", icon: Gamepad2, roles: ['admin', 'manager', 'supervisor', 'staff'] },
  { title: "Guests", url: "/admin/guests", icon: Users, roles: ['admin', 'manager', 'supervisor', 'front_desk', 'staff'] },
  { title: "Menu Management", url: "/admin/menu", icon: ChefHat, roles: ['admin', 'manager', 'supervisor', 'kitchen'] },
  { title: "Recipe Management", url: "/admin/recipes", icon: ChefHat, roles: ['admin', 'manager', 'supervisor', 'kitchen'] },
  { title: "Payments", url: "/admin/payments", icon: CreditCard, roles: ['admin', 'manager', 'accounting', 'front_desk'] },
  { title: "Inventory", url: "/admin/inventory", icon: Package, roles: ['admin', 'manager', 'supervisor', 'procurement', 'kitchen', 'housekeeping'] },
  { title: "Suppliers", url: "/admin/suppliers", icon: Truck, roles: ['admin', 'manager', 'procurement', 'accounting'] },
  { title: "Accounting", url: "/admin/accounting", icon: BarChart3, roles: ['admin', 'manager', 'accounting'] },
  { title: "HR Management", url: "/admin/hr", icon: Users, roles: ['admin', 'manager', 'hr'] },
  { title: "Housekeeping", url: "/admin/housekeeping", icon: Home, roles: ['admin', 'manager', 'supervisor', 'housekeeping'] },
];

const adminItems = [
  { title: "User Management", url: "/admin/users", icon: UserPlus, adminOnly: true },
  { title: "Settings", url: "/admin/settings", icon: Settings, adminOnly: true },
];

export function HotelSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { settings } = useGlobalSettings();
  const { profile, signOut, isAdmin, userRoles } = useAuth();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `w-full ${isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"}`;

  // Get the appropriate icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Hotel,
      Home,
      Building,
      Castle,
      Star,
      Crown,
      Gem,
      Key: KeyRound,
    };
    return iconMap[iconName] || Hotel;
  };

  const IconComponent = getIconComponent(settings.hotel_icon || "Hotel");

  // Filter navigation items based on user roles
  const userRolesList = userRoles || [];
  const filteredNavItems = navigationItems.filter(item => {
    // Admin and manager can see everything
    if (isAdmin || userRolesList.includes('manager')) return true;
    // Check if user has any of the required roles for this item
    return item.roles?.some(role => userRolesList.includes(role));
  });

  return (
    <Sidebar 
      className={state === "collapsed" ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border/50 p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-gradient-primary rounded-lg shrink-0">
            <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
          </div>
          {state !== "collapsed" && (
            <div className="overflow-hidden">
              <h2 className="text-base md:text-lg font-bold text-foreground truncate">{settings.hotel_name}</h2>
              <p className="text-xs md:text-sm text-muted-foreground truncate">Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 shrink-0" />
                      {state !== "collapsed" && <span className="text-sm md:text-base truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <Shield className="h-4 w-4 mr-2" />
              {state !== "collapsed" && "Administration"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 shrink-0" />
                        {state !== "collapsed" && <span className="text-sm md:text-base truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="p-2 md:p-3 border-t border-border">
                  {state !== "collapsed" && (
                    <div className="mb-2">
                      <p className="text-xs md:text-sm font-medium truncate">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground capitalize truncate">
                        {userRoles[0] || 'Staff'}
                      </p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="w-full justify-start touch-target"
                  >
                    <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-2 shrink-0" />
                    {state !== "collapsed" && <span className="text-xs md:text-sm">Sign Out</span>}
                  </Button>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}