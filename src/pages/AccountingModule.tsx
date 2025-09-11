import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  CreditCard,
  Receipt,
  Target,
  AlertCircle
} from "lucide-react";

interface AccountEntry {
  id: string;
  date: string;
  description: string;
  category: 'revenue' | 'expense' | 'asset' | 'liability';
  subCategory: string;
  amount: number;
  reference: string;
  status: 'posted' | 'pending' | 'reconciled';
}

interface FinancialReport {
  period: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  assets: number;
  liabilities: number;
  equity: number;
}

const AccountingModule = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  const [entries] = useState<AccountEntry[]>([
    {
      id: "ACC001",
      date: "2024-01-15",
      description: "Room Revenue - Deluxe Suite Bookings",
      category: 'revenue',
      subCategory: 'Room Revenue',
      amount: 12500.00,
      reference: "REV_ROOMS_001",
      status: 'posted'
    },
    {
      id: "ACC002",
      date: "2024-01-15", 
      description: "Restaurant Sales - F&B Revenue",
      category: 'revenue',
      subCategory: 'Food & Beverage',
      amount: 3450.00,
      reference: "REV_FB_001",
      status: 'posted'
    },
    {
      id: "ACC003",
      date: "2024-01-14",
      description: "Staff Salaries - January Payment",
      category: 'expense',
      subCategory: 'Payroll',
      amount: -8500.00,
      reference: "EXP_PAY_001",
      status: 'posted'
    },
    {
      id: "ACC004",
      date: "2024-01-14",
      description: "Utility Bills - Electricity & Water",
      category: 'expense',
      subCategory: 'Utilities',
      amount: -1250.00,
      reference: "EXP_UTIL_001",
      status: 'reconciled'
    },
    {
      id: "ACC005",
      date: "2024-01-13",
      description: "Equipment Purchase - Kitchen Appliances",
      category: 'asset',
      subCategory: 'Fixed Assets',
      amount: 15000.00,
      reference: "AST_EQUIP_001",
      status: 'posted'
    }
  ]);

  const financialReports: FinancialReport[] = [
    {
      period: "January 2024",
      revenue: 45230.00,
      expenses: 28450.00,
      netIncome: 16780.00,
      assets: 485000.00,
      liabilities: 125000.00,
      equity: 360000.00
    },
    {
      period: "December 2023",
      revenue: 52100.00,
      expenses: 31200.00,
      netIncome: 20900.00,
      assets: 475000.00,
      liabilities: 130000.00,
      equity: 345000.00
    }
  ];

  const currentReport = financialReports[0];
  const previousReport = financialReports[1];

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      revenue: 'bg-success text-success-foreground',
      expense: 'bg-destructive text-destructive-foreground',
      asset: 'bg-accent text-accent-foreground',
      liability: 'bg-warning text-warning-foreground'
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'reconciled': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been generated and is ready for download.`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Financial data export will be available shortly.",
    });
  };

  const revenueChange = calculateChange(currentReport.revenue, previousReport.revenue);
  const expenseChange = calculateChange(Math.abs(currentReport.expenses), Math.abs(previousReport.expenses));
  const netIncomeChange = calculateChange(currentReport.netIncome, previousReport.netIncome);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounting Module</h1>
          <p className="text-muted-foreground">Financial management, reports, and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="button-luxury">
            <Receipt className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="budgets">Budget Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">${currentReport.revenue.toLocaleString()}</div>
                <p className={`text-xs flex items-center gap-1 ${revenueChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(revenueChange).toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">${Math.abs(currentReport.expenses).toLocaleString()}</div>
                <p className={`text-xs flex items-center gap-1 ${expenseChange <= 0 ? 'text-success' : 'text-destructive'}`}>
                  {expenseChange <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {Math.abs(expenseChange).toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Net Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">${currentReport.netIncome.toLocaleString()}</div>
                <p className={`text-xs flex items-center gap-1 ${netIncomeChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {netIncomeChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(netIncomeChange).toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Balance Sheet Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${currentReport.assets.toLocaleString()}</div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Assets</span>
                    <span>$185,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fixed Assets</span>
                    <span>$300,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${currentReport.liabilities.toLocaleString()}</div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Liabilities</span>
                    <span>$45,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Long-term Debt</span>
                    <span>$80,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${currentReport.equity.toLocaleString()}</div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retained Earnings</span>
                    <span>$280,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capital</span>
                    <span>$80,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleGenerateReport("P&L")}>
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">P&L Statement</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleGenerateReport("Balance Sheet")}>
                  <PieChart className="h-6 w-6" />
                  <span className="text-sm">Balance Sheet</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleGenerateReport("Cash Flow")}>
                  <CreditCard className="h-6 w-6" />
                  <span className="text-sm">Cash Flow</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Monthly Close</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          <div className="grid gap-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="card-luxury">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{entry.description}</h3>
                        <p className="text-muted-foreground">{entry.date} • {entry.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${entry.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {entry.amount >= 0 ? '+' : ''}${Math.abs(entry.amount).toLocaleString()}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getCategoryColor(entry.category)}>
                          {entry.category.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{entry.subCategory}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reference</p>
                      <p className="font-medium">{entry.reference}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Profit & Loss Statement</CardTitle>
                <CardDescription>January 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-semibold">Revenue</span>
                    <span className="font-bold text-success">${currentReport.revenue.toLocaleString()}</span>
                  </div>
                  <div className="ml-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Revenue</span>
                      <span>$32,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">F&B Revenue</span>
                      <span>$8,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other Services</span>
                      <span>$4,280</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-semibold">Expenses</span>
                    <span className="font-bold text-destructive">${Math.abs(currentReport.expenses).toLocaleString()}</span>
                  </div>
                  <div className="ml-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payroll</span>
                      <span>$15,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utilities</span>
                      <span>$4,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Maintenance</span>
                      <span>$3,750</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other Operating</span>
                      <span>$5,000</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-accent">
                    <span className="font-bold text-lg">Net Income</span>
                    <span className="font-bold text-xl text-accent">${currentReport.netIncome.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Room Revenue Growth</span>
                    <span className="font-bold text-success">+12.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>F&B Revenue Growth</span>
                    <span className="font-bold text-success">+8.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Daily Rate</span>
                    <span className="font-bold">$285</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Revenue per Guest</span>
                    <span className="font-bold">$425</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Expense Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Labor Cost Ratio</span>
                    <span className="font-bold">33.6%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Utility Cost Ratio</span>
                    <span className="font-bold">10.0%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Operating Margin</span>
                    <span className="font-bold text-success">37.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cost per Occupied Room</span>
                    <span className="font-bold">$95</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Budget vs Actual Performance</CardTitle>
              <CardDescription>Current Month Comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Revenue Budget</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Budgeted</span>
                        <span className="font-bold">$48,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Actual</span>
                        <span className="font-bold text-success">${currentReport.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Variance</span>
                        <span className="font-bold text-destructive">-$2,770 (-5.8%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Expense Budget</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Budgeted</span>
                        <span className="font-bold">$30,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Actual</span>
                        <span className="font-bold text-success">${Math.abs(currentReport.expenses).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Variance</span>
                        <span className="font-bold text-success">+$1,550 (+5.5%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-warning mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Budget Alerts</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>• Room revenue is 5.8% below budget target</p>
                    <p>• Utility expenses are 12% over budget due to increased occupancy</p>
                    <p>• Overall profitability remains within acceptable range</p>
                  </div>
                </div>

                <Button className="button-luxury">
                  <Target className="h-4 w-4 mr-2" />
                  Update Budget Targets
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountingModule;