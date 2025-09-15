import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInventoryIntegration } from "@/hooks/useInventoryIntegration";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package, Volume2, VolumeX, X, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LowStockNotificationProps {
  userRole?: 'admin' | 'storekeeper' | 'manager' | 'staff';
  onRestockRequest?: (itemId: string) => void;
}

const LowStockNotificationSystem = ({ 
  userRole = 'staff',
  onRestockRequest 
}: LowStockNotificationProps) => {
  const { toast } = useToast();
  const { inventory } = useInventoryIntegration();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [lastCheckTime, setLastCheckTime] = useState<number>(Date.now());

  // Get low stock and out of stock items
  const criticalItems = inventory.filter(item => 
    item.current_quantity === 0 && !dismissedAlerts.includes(item.id)
  );
  
  const lowStockItems = inventory.filter(item => 
    item.current_quantity > 0 && 
    item.current_quantity <= item.min_threshold && 
    !dismissedAlerts.includes(item.id)
  );

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Critical alert: higher pitched, more urgent
      if (criticalItems.length > 0) {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      } else {
        // Low stock: softer tone
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [soundEnabled, criticalItems.length]);

  // Check for new alerts and trigger notifications
  useEffect(() => {
    const currentTime = Date.now();
    const timeSinceLastCheck = currentTime - lastCheckTime;
    
    // Only check every 30 seconds to avoid spam
    if (timeSinceLastCheck < 30000) return;
    
    const totalAlerts = criticalItems.length + lowStockItems.length;
    
    if (totalAlerts > 0) {
      // Show different notifications based on user role
      if (userRole === 'admin' || userRole === 'storekeeper') {
        playNotificationSound();
        
        // Show toast notification
        toast({
          title: criticalItems.length > 0 ? "Critical Stock Alert!" : "Low Stock Alert",
          description: `${criticalItems.length} items out of stock, ${lowStockItems.length} items low`,
          variant: criticalItems.length > 0 ? "destructive" : "default",
        });
        
        // Show modal for critical alerts
        if (criticalItems.length > 0) {
          setShowNotificationModal(true);
        }
      } else {
        // Staff and managers get simpler notifications
        if (criticalItems.length > 0) {
          toast({
            title: "Items Out of Stock",
            description: "Please notify inventory manager",
            variant: "destructive",
          });
        }
      }
      
      setLastCheckTime(currentTime);
    }
  }, [inventory, criticalItems.length, lowStockItems.length, userRole, playNotificationSound, toast, lastCheckTime]);

  const dismissAlert = (itemId: string) => {
    setDismissedAlerts(prev => [...prev, itemId]);
  };

  const clearAllDismissed = () => {
    setDismissedAlerts([]);
  };

  // Don't show anything if no alerts and user is staff
  if ((criticalItems.length === 0 && lowStockItems.length === 0) || 
      (userRole === 'staff' && criticalItems.length === 0)) {
    return null;
  }

  return (
    <>
      {/* Floating notification panel for admin/storekeeper */}
      {(userRole === 'admin' || userRole === 'storekeeper') && (
        <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
          {/* Critical alerts */}
          {criticalItems.length > 0 && (
            <Card className="border-destructive bg-destructive/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Out of Stock ({criticalItems.length})
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                    >
                      {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowNotificationModal(true)}
                    >
                      <Bell className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {criticalItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="font-medium">{item.item_name}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs"
                        onClick={() => dismissAlert(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {criticalItems.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{criticalItems.length - 3} more items
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Low stock alerts */}
          {lowStockItems.length > 0 && (
            <Card className="border-warning bg-warning/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-warning-foreground">
                    <Package className="h-4 w-4" />
                    Low Stock ({lowStockItems.length})
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearAllDismissed}
                  >
                    <Bell className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {lowStockItems.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span>{item.item_name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.current_quantity} left
                      </Badge>
                    </div>
                  ))}
                  {lowStockItems.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{lowStockItems.length - 2} more items
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Detailed notification modal */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Inventory Alert Dashboard
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Critical Items */}
            {criticalItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-destructive mb-2">
                  Out of Stock Items ({criticalItems.length})
                </h3>
                <div className="space-y-2">
                  {criticalItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-destructive" />
                        <div>
                          <div className="font-medium">{item.item_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Category: {item.category}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Out of Stock</Badge>
                        <Button
                          size="sm"
                          onClick={() => onRestockRequest?.(item.id)}
                        >
                          Reorder Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Stock Items */}
            {lowStockItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-warning-foreground mb-2">
                  Low Stock Items ({lowStockItems.length})
                </h3>
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{item.item_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.current_quantity} {item.unit} remaining
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {item.current_quantity}/{item.min_threshold}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRestockRequest?.(item.id)}
                        >
                          Restock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {soundEnabled ? "Mute" : "Unmute"} Alerts
                </Button>
              </div>
              <Button onClick={() => setShowNotificationModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LowStockNotificationSystem;
