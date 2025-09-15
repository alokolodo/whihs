import { useNotificationSystem, UserRole } from "@/hooks/useNotificationSystem";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, Bell, BellOff, Volume2, VolumeX } from "lucide-react";

interface GlobalInventoryNotificationsProps {
  userRole: UserRole;
  className?: string;
  onItemClick?: (itemId: string) => void;
}

const GlobalInventoryNotifications = ({ 
  userRole, 
  className = "",
  onItemClick
}: GlobalInventoryNotificationsProps) => {
  const {
    critical,
    lowStock,
    permissions,
    preferences,
    dismissAlert,
    updatePreferences,
  } = useNotificationSystem({ userRole });

  // Don't show notifications if user has no relevant permissions
  if (!permissions.canViewAll && critical.length === 0 && lowStock.length === 0) {
    return null;
  }

  const totalAlerts = critical.length + lowStock.length;
  
  if (totalAlerts === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Critical Items Alert */}
      {critical.length > 0 && (
        <Alert variant="destructive" className="relative">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {critical.length} item{critical.length > 1 ? 's' : ''} out of stock
                </span>
                {permissions.canManage && (
                  <Badge variant="destructive" className="text-xs">
                    Action Required
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
                  className="h-6 w-6 p-0"
                >
                  {preferences.soundEnabled ? 
                    <Volume2 className="h-3 w-3" /> : 
                    <VolumeX className="h-3 w-3" />
                  }
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updatePreferences({ toastEnabled: !preferences.toastEnabled })}
                  className="h-6 w-6 p-0"
                >
                  {preferences.toastEnabled ? 
                    <Bell className="h-3 w-3" /> : 
                    <BellOff className="h-3 w-3" />
                  }
                </Button>
              </div>
            </div>
            
            {/* Show items for high priority users */}
            {permissions.priority === 'high' && critical.length <= 5 && (
              <div className="mt-2 space-y-1">
                {critical.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3" />
                      <span 
                        className={onItemClick ? "cursor-pointer hover:underline" : ""}
                        onClick={() => onItemClick?.(item.id)}
                      >
                        {item.item_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlert(item.id)}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Low Stock Alert */}
      {lowStock.length > 0 && !preferences.criticalOnly && (
        <Alert className="relative">
          <Package className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {lowStock.length} item{lowStock.length > 1 ? 's' : ''} running low
                </span>
                {permissions.canManage && (
                  <Badge variant="secondary" className="text-xs">
                    Monitor
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updatePreferences({ criticalOnly: !preferences.criticalOnly })}
                  className="text-xs"
                >
                  {preferences.criticalOnly ? 'Show All' : 'Critical Only'}
                </Button>
              </div>
            </div>
            
            {/* Show some items for context */}
            {permissions.priority !== 'low' && lowStock.length <= 3 && (
              <div className="mt-2 space-y-1">
                {lowStock.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3" />
                      <span 
                        className={onItemClick ? "cursor-pointer hover:underline" : ""}
                        onClick={() => onItemClick?.(item.id)}
                      >
                        {item.item_name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.current_quantity} {item.unit} left
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlert(item.id)}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GlobalInventoryNotifications;