import { useState } from "react";
import { Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useHotelSettings } from "@/hooks/useHotelSettings";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { UserProfileModal } from "@/components/profile/UserProfileModal";
import { UserSettingsModal } from "@/components/settings/UserSettingsModal";
import { SupportModal } from "@/components/support/SupportModal";

export const Header = () => {
  const { profile, signOut } = useAuth();
  const { settings } = useHotelSettings();
  const { formatCurrency } = useGlobalSettings();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50 shrink-0">
      <div className="flex items-center justify-between h-full px-3 md:px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger className="p-2 touch-target shrink-0" />
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-lg font-semibold text-foreground truncate max-w-[200px] md:max-w-none">{settings.hotel_name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative touch-target p-2">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-[10px] md:text-xs bg-destructive p-0">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-popover border z-[100]">
              <DropdownMenuLabel>Notifications (3)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">New order from Table 5</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago • {formatCurrency(45.50)}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Room 204 checkout reminder</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago • Due in 30 minutes</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Low stock alert: Wine bottles</p>
                  <p className="text-xs text-muted-foreground">10 minutes ago • Only 3 left</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center">
                <span className="text-sm text-primary">View all notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 md:gap-2 touch-target p-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-primary rounded-full flex items-center justify-center shrink-0">
                  <User className="h-3 w-3 md:h-4 md:w-4 text-primary-foreground" />
                </div>
                <span className="hidden lg:inline text-sm font-medium truncate max-w-[100px]">
                  {profile?.first_name && profile?.last_name 
                    ? `${profile.first_name} ${profile.last_name}` 
                    : 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-popover border z-[100]">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowProfile(true)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSupport(true)}>
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <UserProfileModal 
        open={showProfile} 
        onOpenChange={setShowProfile} 
      />
      
      <UserSettingsModal 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
      
      <SupportModal 
        open={showSupport} 
        onOpenChange={setShowSupport} 
      />
    </header>
  );
};