import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInventoryIntegration } from '@/hooks/useInventoryIntegration';

export type UserRole = 'admin' | 'storekeeper' | 'manager' | 'staff' | 'kitchen' | 'housekeeping';

interface NotificationPreferences {
  soundEnabled: boolean;
  popupEnabled: boolean;
  toastEnabled: boolean;
  criticalOnly: boolean;
}

interface UseNotificationSystemProps {
  userRole: UserRole;
  onStockAlert?: (items: any[]) => void;
}

export const useNotificationSystem = ({ 
  userRole, 
  onStockAlert 
}: UseNotificationSystemProps) => {
  const { toast } = useToast();
  const { inventory } = useInventoryIntegration();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    soundEnabled: true,
    popupEnabled: true,
    toastEnabled: true,
    criticalOnly: false,
  });
  
  const [lastCheckTime, setLastCheckTime] = useState<number>(Date.now());
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Get permission levels based on user role
  const getPermissionLevel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { 
          canViewAll: true, 
          canManage: true, 
          priority: 'high',
          notificationFrequency: 'immediate' 
        };
      case 'storekeeper':
        return { 
          canViewAll: true, 
          canManage: true, 
          priority: 'high',
          notificationFrequency: 'immediate' 
        };
      case 'manager':
        return { 
          canViewAll: true, 
          canManage: false, 
          priority: 'medium',
          notificationFrequency: 'periodic' 
        };
      case 'kitchen':
        return { 
          canViewAll: false, 
          canManage: false, 
          priority: 'medium',
          notificationFrequency: 'contextual',
          relevantCategories: ['food', 'beverages']
        };
      case 'housekeeping':
        return { 
          canViewAll: false, 
          canManage: false, 
          priority: 'medium',
          notificationFrequency: 'contextual',
          relevantCategories: ['housekeeping', 'maintenance']
        };
      default:
        return { 
          canViewAll: false, 
          canManage: false, 
          priority: 'low',
          notificationFrequency: 'minimal' 
        };
    }
  };

  const permissions = getPermissionLevel(userRole);

  // Filter inventory based on user role and permissions
  const getRelevantInventory = useCallback(() => {
    if (permissions.canViewAll) {
      return inventory;
    }
    
    if (permissions.relevantCategories) {
      return inventory.filter(item => 
        permissions.relevantCategories?.includes(item.category)
      );
    }
    
    return [];
  }, [inventory, permissions]);

  // Get critical and low stock items
  const getCriticalItems = useCallback(() => {
    const relevantInventory = getRelevantInventory();
    
    const critical = relevantInventory.filter(item => 
      item.current_quantity === 0 && !dismissedAlerts.includes(item.id)
    );
    
    const lowStock = relevantInventory.filter(item => 
      item.current_quantity > 0 && 
      item.current_quantity <= item.min_threshold && 
      !dismissedAlerts.includes(item.id)
    );

    return { critical, lowStock };
  }, [getRelevantInventory, dismissedAlerts]);

  // Play notification sound with different urgency levels
  const playNotificationSound = useCallback((urgency: 'critical' | 'warning' | 'info' = 'warning') => {
    if (!preferences.soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sound patterns for different urgency levels
      switch (urgency) {
        case 'critical':
          // Rapid beeping for critical alerts
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.stop(audioContext.currentTime + 0.4);
          break;
          
        case 'warning':
          // Double beep for warnings
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.stop(audioContext.currentTime + 0.2);
          break;
          
        case 'info':
          // Single soft beep for info
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          oscillator.stop(audioContext.currentTime + 0.15);
          break;
      }
      
      oscillator.start(audioContext.currentTime);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [preferences.soundEnabled]);

  // Show toast notifications based on user role and preferences
  const showToastNotification = useCallback((
    title: string, 
    description: string, 
    variant: 'default' | 'destructive' = 'default'
  ) => {
    if (!preferences.toastEnabled) return;
    
    toast({
      title,
      description,
      variant,
      duration: variant === 'destructive' ? 10000 : 5000, // Critical alerts stay longer
    });
  }, [preferences.toastEnabled, toast]);

  // Main notification check function
  const checkAndNotify = useCallback(() => {
    const currentTime = Date.now();
    const timeSinceLastCheck = currentTime - lastCheckTime;
    
    // Different check frequencies based on user role
    const checkInterval = permissions.notificationFrequency === 'immediate' ? 15000 : 
                         permissions.notificationFrequency === 'periodic' ? 60000 : 
                         permissions.notificationFrequency === 'contextual' ? 120000 : 300000;
    
    if (timeSinceLastCheck < checkInterval) return;
    
    const { critical, lowStock } = getCriticalItems();
    
    if (critical.length > 0 || lowStock.length > 0) {
      // Call callback if provided
      onStockAlert?.(critical.concat(lowStock));
      
      // Role-specific notifications
      if (permissions.priority === 'high') {
        if (critical.length > 0) {
          playNotificationSound('critical');
          showToastNotification(
            "Critical Stock Alert!",
            `${critical.length} items are out of stock`,
            'destructive'
          );
        } else if (lowStock.length > 0) {
          playNotificationSound('warning');
          showToastNotification(
            "Low Stock Alert",
            `${lowStock.length} items are running low`
          );
        }
      } else if (permissions.priority === 'medium') {
        if (critical.length > 0) {
          playNotificationSound('warning');
          showToastNotification(
            "Stock Alert",
            `${critical.length} items need attention`,
            'destructive'
          );
        } else if (lowStock.length > 0 && !preferences.criticalOnly) {
          showToastNotification(
            "Stock Notice",
            `${lowStock.length} items are running low`
          );
        }
      } else {
        // Low priority users only get critical notifications
        if (critical.length > 0) {
          showToastNotification(
            "Stock Notice",
            "Some items need restocking. Please notify inventory team."
          );
        }
      }
      
      setLastCheckTime(currentTime);
    }
  }, [
    lastCheckTime,
    getCriticalItems,
    onStockAlert,
    permissions,
    playNotificationSound,
    showToastNotification,
    preferences.criticalOnly
  ]);

  // Auto-check for notifications
  useEffect(() => {
    checkAndNotify();
  }, [inventory, checkAndNotify]);

  // Dismiss alert functions
  const dismissAlert = useCallback((itemId: string) => {
    setDismissedAlerts(prev => [...prev, itemId]);
  }, []);

  const clearAllDismissed = useCallback(() => {
    setDismissedAlerts([]);
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  return {
    ...getCriticalItems(),
    permissions,
    preferences,
    dismissAlert,
    clearAllDismissed,
    updatePreferences,
    playNotificationSound,
    showToastNotification,
    checkAndNotify,
  };
};