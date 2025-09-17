import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Users,
  DollarSign,
  Hotel,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Clock,
  FileSpreadsheet
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days");
  const [selectedFormat, setSelectedFormat] = useState("pdf");

  const reportCategories = [
    {
      title: "Financial Reports",
      description: "Revenue, expenses, and financial analytics",
      icon: DollarSign,
      reports: [
        { name: "Daily Revenue Report", description: "Daily sales and revenue breakdown", lastGenerated: "2 hours ago" },
        { name: "Monthly P&L Statement", description: "Profit and loss analysis", lastGenerated: "1 day ago" },
        { name: "Cash Flow Report", description: "Cash inflow and outflow tracking", lastGenerated: "3 days ago" },
        { name: "Tax Summary Report", description: "Tax calculations and summaries", lastGenerated: "1 week ago" },
      ]
    },
    {
      title: "Occupancy Reports",
      description: "Room availability and booking analytics",
      icon: Hotel,
      reports: [
        { name: "Occupancy Rate Report", description: "Room occupancy trends and statistics", lastGenerated: "1 hour ago" },
        { name: "ADR & RevPAR Report", description: "Average Daily Rate and Revenue per Available Room", lastGenerated: "4 hours ago" },
        { name: "Booking Forecast", description: "Future booking predictions and trends", lastGenerated: "1 day ago" },
        { name: "Cancellation Analysis", description: "Booking cancellation patterns", lastGenerated: "2 days ago" },
      ]
    },
    {
      title: "Guest Reports",
      description: "Customer analytics and satisfaction metrics",
      icon: Users,
      reports: [
        { name: "Guest Demographics", description: "Customer profile and segmentation analysis", lastGenerated: "6 hours ago" },
        { name: "Guest Satisfaction Survey", description: "Customer feedback and ratings analysis", lastGenerated: "1 day ago" },
        { name: "Loyalty Program Report", description: "Member activity and rewards tracking", lastGenerated: "3 days ago" },
        { name: "Guest History Report", description: "Individual guest stay patterns", lastGenerated: "1 week ago" },
      ]
    },
    {
      title: "Operational Reports",
      description: "Staff performance and operational metrics",
      icon: BarChart3,
      reports: [
        { name: "Staff Performance Report", description: "Employee productivity and KPI tracking", lastGenerated: "3 hours ago" },
        { name: "Housekeeping Efficiency", description: "Room cleaning and maintenance metrics", lastGenerated: "5 hours ago" },
        { name: "Inventory Usage Report", description: "Stock levels and consumption patterns", lastGenerated: "1 day ago" },
        { name: "Maintenance Log Report", description: "Equipment and facility maintenance tracking", lastGenerated: "2 days ago" },
      ]
    }
  ];

  const quickReports = [
    { name: "Today's Summary", icon: Clock, color: "bg-blue-100 text-blue-600" },
    { name: "This Week", icon: Calendar, color: "bg-green-100 text-green-600" },
    { name: "This Month", icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
    { name: "Year to Date", icon: BarChart3, color: "bg-orange-100 text-orange-600" },
  ];

  const handleGenerateReport = (reportName: string) => {
    // Here you would implement the actual report generation logic
    console.log(`Generating ${reportName} report for period: ${selectedPeriod}, format: ${selectedFormat}`);
    // Show success toast or handle report generation
  };

  const handleDownloadReport = (reportName: string) => {
    // Here you would implement the download logic
    console.log(`Downloading ${reportName}`);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports Center</h1>
          <p className="text-muted-foreground">Generate, schedule, and download comprehensive business reports</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button className="button-luxury">
            <FileText className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Quick Reports */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Reports
          </CardTitle>
          <CardDescription>Generate instant reports for common time periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickReports.map((report, index) => {
              const Icon = report.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleGenerateReport(report.name)}
                >
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm">{report.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Configuration */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>Configure report parameters and format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Date Range</label>
              <div className="flex gap-2">
                <Input type="date" placeholder="Start Date" />
                <Input type="date" placeholder="End Date" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="guest">Guest</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
        </TabsList>

        {reportCategories.map((category, categoryIndex) => (
          <TabsContent 
            key={categoryIndex} 
            value={category.title.toLowerCase().split(' ')[0]} 
            className="space-y-6"
          >
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {category.reports.map((report, reportIndex) => (
                    <div 
                      key={reportIndex}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              Last generated: {report.lastGenerated}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report.name)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          className="button-luxury"
                          onClick={() => handleGenerateReport(report.name)}
                        >
                          <FileSpreadsheet className="h-3 w-3 mr-1" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Reports;