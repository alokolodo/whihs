import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Smartphone, 
  Globe, 
  MapPin, 
  DollarSign,
  Settings,
  Check,
  X
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  countries: string[];
  currencies: string[];
  methods: string[];
  enabled: boolean;
  testMode: boolean;
  icon: React.ReactNode;
  color: string;
}

const PaymentGatewayConfig = () => {
  const { toast } = useToast();
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: "paystack",
      name: "Paystack",
      description: "Nigeria's leading payment gateway",
      countries: ["Nigeria", "Ghana", "South Africa", "Kenya"],
      currencies: ["NGN", "GHS", "ZAR", "USD"],
      methods: ["Cards", "Bank Transfer", "USSD", "QR Code", "Mobile Money"],
      enabled: true,
      testMode: true,
      icon: <CreditCard className="h-5 w-5" />,
      color: "bg-blue-600"
    },
    {
      id: "flutterwave",
      name: "Flutterwave",
      description: "Pan-African payment infrastructure",
      countries: ["Nigeria", "Ghana", "Kenya", "Uganda", "Tanzania", "Rwanda", "Zambia"],
      currencies: ["NGN", "GHS", "KES", "UGX", "TZS", "RWF", "ZMW", "USD", "EUR", "GBP"],
      methods: ["Cards", "Mobile Money", "Bank Transfer", "USSD", "Barter"],
      enabled: true,
      testMode: false,
      icon: <Globe className="h-5 w-5" />,
      color: "bg-orange-600"
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Global payment processing",
      countries: ["Global", "USA", "UK", "EU", "Canada", "Australia"],
      currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "SGD"],
      methods: ["Credit Cards", "Debit Cards", "Apple Pay", "Google Pay", "SEPA"],
      enabled: true,
      testMode: true,
      icon: <CreditCard className="h-5 w-5" />,
      color: "bg-purple-600"
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Worldwide digital payments",
      countries: ["Global", "200+ countries"],
      currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"],
      methods: ["PayPal Wallet", "Credit Cards", "Bank Transfer"],
      enabled: false,
      testMode: true,
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-blue-500"
    },
    {
      id: "mobilemoney",
      name: "Mobile Money",
      description: "African mobile payment solutions",
      countries: ["Ghana", "Kenya", "Uganda", "Tanzania", "Rwanda", "Burkina Faso"],
      currencies: ["GHS", "KES", "UGX", "TZS", "RWF", "XOF"],
      methods: ["MTN Mobile Money", "Airtel Money", "Vodafone Cash", "Tigo Cash"],
      enabled: true,
      testMode: false,
      icon: <Smartphone className="h-5 w-5" />,
      color: "bg-green-600"
    },
    {
      id: "razorpay",
      name: "Razorpay",
      description: "India's comprehensive payment solution",
      countries: ["India", "Malaysia", "Singapore"],
      currencies: ["INR", "MYR", "SGD"],
      methods: ["UPI", "Cards", "Net Banking", "Wallets", "EMI"],
      enabled: false,
      testMode: true,
      icon: <MapPin className="h-5 w-5" />,
      color: "bg-indigo-600"
    }
  ]);

  const toggleGateway = (id: string) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === id ? { ...gateway, enabled: !gateway.enabled } : gateway
    ));
    
    const gateway = gateways.find(g => g.id === id);
    toast({
      title: `${gateway?.name} ${!gateway?.enabled ? 'Enabled' : 'Disabled'}`,
      description: `Payment gateway ${!gateway?.enabled ? 'activated' : 'deactivated'} successfully`,
    });
  };

  const toggleTestMode = (id: string) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === id ? { ...gateway, testMode: !gateway.testMode } : gateway
    ));
  };

  const enabledGateways = gateways.filter(g => g.enabled);
  const africanGateways = gateways.filter(g => 
    g.countries.some(country => 
      ["Nigeria", "Ghana", "Kenya", "South Africa", "Uganda", "Tanzania", "Rwanda"].includes(country)
    )
  );
  const globalGateways = gateways.filter(g => 
    g.countries.includes("Global") || g.countries.includes("USA")
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Gateway Configuration</h2>
          <p className="text-muted-foreground">Manage payment methods for your hotel system</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {enabledGateways.length} Active Gateways
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="african">African Gateways</TabsTrigger>
          <TabsTrigger value="global">Global Gateways</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gateways.map((gateway) => (
              <Card key={gateway.id} className={`transition-all ${gateway.enabled ? 'ring-2 ring-green-500/20' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${gateway.color} text-white`}>
                        {gateway.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{gateway.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {gateway.enabled ? (
                            <Badge className="bg-green-600 text-white">
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                          {gateway.testMode && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Test Mode
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Switch 
                      checked={gateway.enabled} 
                      onCheckedChange={() => toggleGateway(gateway.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-3">{gateway.description}</CardDescription>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">SUPPORTED COUNTRIES</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {gateway.countries.slice(0, 3).map((country) => (
                          <Badge key={country} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                        {gateway.countries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{gateway.countries.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">PAYMENT METHODS</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {gateway.methods.slice(0, 2).map((method) => (
                          <Badge key={method} variant="secondary" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                        {gateway.methods.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{gateway.methods.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {gateway.enabled && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <Label className="text-sm">Test Mode</Label>
                      <Switch 
                        checked={gateway.testMode} 
                        onCheckedChange={() => toggleTestMode(gateway.id)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="african" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {africanGateways.map((gateway) => (
              <Card key={gateway.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${gateway.color} text-white`}>
                      {gateway.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{gateway.name}</h3>
                      <p className="text-sm text-muted-foreground">{gateway.description}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={gateway.enabled} 
                    onCheckedChange={() => toggleGateway(gateway.id)}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Supported Countries</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {gateway.countries.map((country) => (
                        <Badge key={country} variant="outline">{country}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Currencies</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {gateway.currencies.map((currency) => (
                        <Badge key={currency} variant="secondary">{currency}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Payment Methods</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {gateway.methods.map((method) => (
                        <Badge key={method} className="bg-muted text-muted-foreground">{method}</Badge>
                      ))}
                    </div>
                  </div>

                  {gateway.enabled && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <Label>Test Mode</Label>
                        <p className="text-xs text-muted-foreground">Use sandbox environment</p>
                      </div>
                      <Switch 
                        checked={gateway.testMode} 
                        onCheckedChange={() => toggleTestMode(gateway.id)}
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {globalGateways.map((gateway) => (
              <Card key={gateway.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${gateway.color} text-white`}>
                      {gateway.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{gateway.name}</h3>
                      <p className="text-sm text-muted-foreground">{gateway.description}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={gateway.enabled} 
                    onCheckedChange={() => toggleGateway(gateway.id)}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Global Coverage</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {gateway.countries.map((country) => (
                        <Badge key={country} variant="outline">{country}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Major Currencies</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {gateway.currencies.map((currency) => (
                        <Badge key={currency} variant="secondary">{currency}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Payment Methods</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {gateway.methods.map((method) => (
                        <Badge key={method} className="bg-muted text-muted-foreground">{method}</Badge>
                      ))}
                    </div>
                  </div>

                  {gateway.enabled && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <Label>Test Mode</Label>
                        <p className="text-xs text-muted-foreground">Use sandbox environment</p>
                      </div>
                      <Switch 
                        checked={gateway.testMode} 
                        onCheckedChange={() => toggleTestMode(gateway.id)}
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentGatewayConfig;