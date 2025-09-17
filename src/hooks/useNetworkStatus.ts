import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isConnected: boolean;
  lastPing: number | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isConnected: false,
    lastPing: null,
  });

  const checkServerConnection = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });
      
      const pingTime = Date.now() - startTime;
      
      setNetworkStatus(prev => ({
        ...prev,
        isConnected: response.ok,
        lastPing: pingTime,
      }));
      
      return response.ok;
    } catch (error) {
      // Fallback to a simple fetch to test connectivity
      try {
        const startTime = Date.now();
        await fetch('/', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000),
        });
        const pingTime = Date.now() - startTime;
        
        setNetworkStatus(prev => ({
          ...prev,
          isConnected: true,
          lastPing: pingTime,
        }));
        return true;
      } catch {
        setNetworkStatus(prev => ({
          ...prev,
          isConnected: false,
          lastPing: null,
        }));
        return false;
      }
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: true }));
      checkServerConnection();
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({ 
        ...prev, 
        isOnline: false, 
        isConnected: false,
        lastPing: null 
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkServerConnection();

    // Periodic connection check every 30 seconds
    const interval = setInterval(checkServerConnection, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { networkStatus, checkConnection: checkServerConnection };
};