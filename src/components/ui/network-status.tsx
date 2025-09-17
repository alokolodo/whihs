import { Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";

interface NetworkStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const NetworkStatus = ({ className, showDetails = false }: NetworkStatusProps) => {
  const { networkStatus } = useNetworkStatus();
  const { isOnline, isConnected, lastPing } = networkStatus;

  const getStatusIcon = () => {
    if (!isOnline) return WifiOff;
    if (!isConnected) return WifiOff;
    
    if (lastPing === null) return Signal;
    if (lastPing < 100) return SignalHigh;
    if (lastPing < 500) return SignalMedium;
    if (lastPing < 1000) return SignalLow;
    return Signal;
  };

  const getStatusColor = () => {
    if (!isOnline || !isConnected) return "text-destructive";
    if (lastPing === null) return "text-muted-foreground";
    if (lastPing < 200) return "text-green-500";
    if (lastPing < 500) return "text-yellow-500";
    return "text-orange-500";
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (!isConnected) return "No Connection";
    if (lastPing === null) return "Checking...";
    if (lastPing < 100) return "Excellent";
    if (lastPing < 300) return "Good";
    if (lastPing < 600) return "Fair";
    return "Poor";
  };

  const getTooltipContent = () => {
    let content = `Network: ${isOnline ? 'Online' : 'Offline'}`;
    content += `\nServer: ${isConnected ? 'Connected' : 'Disconnected'}`;
    if (lastPing !== null) {
      content += `\nLatency: ${lastPing}ms`;
    }
    return content;
  };

  const StatusIcon = getStatusIcon();

  if (showDetails) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <StatusIcon className={cn("h-4 w-4", getStatusColor())} />
        <Badge variant={isOnline && isConnected ? "default" : "destructive"}>
          {getStatusText()}
        </Badge>
        {lastPing !== null && (
          <span className="text-xs text-muted-foreground">
            {lastPing}ms
          </span>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center", className)}>
            <StatusIcon className={cn("h-4 w-4", getStatusColor())} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs whitespace-pre-line">
            {getTooltipContent()}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};