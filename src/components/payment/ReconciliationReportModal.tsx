import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format as formatDate } from "date-fns";
import { Calendar as CalendarIcon, Download, FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReconciliationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReconciliationReportModal = ({ isOpen, onClose }: ReconciliationReportModalProps) => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("daily");
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({
    from: new Date(),
    to: new Date()
  });
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeDiscrepancies, setIncludeDiscrepancies] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save file to chosen location
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `reconciliation-report-${exportFormat === 'pdf' ? '.pdf' : '.xlsx'}`,
          types: [{
            description: exportFormat === 'pdf' ? 'PDF files' : 'Excel files',
            accept: {
              [exportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']: 
              [exportFormat === 'pdf' ? '.pdf' : '.xlsx']
            }
          }]
        });
        
        // Create mock file content
        const content = exportFormat === 'pdf' 
          ? generatePDFContent() 
          : generateExcelContent();
        
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        
        toast({
          title: "Report Generated",
          description: `Reconciliation report saved successfully`,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast({
            title: "Error",
            description: "Failed to save report",
            variant: "destructive"
          });
        }
      }
    } else {
      // Fallback for browsers without File System Access API
      const content = exportFormat === 'pdf' ? generatePDFContent() : generateExcelContent();
      const blob = new Blob([content], { 
        type: exportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reconciliation-report-${Date.now()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Downloaded",
        description: "Reconciliation report downloaded to your default folder",
      });
    }
    
    setIsGenerating(false);
    onClose();
  };

  const generatePDFContent = () => {
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
100 700 Td
(RECONCILIATION REPORT) Tj
0 -20 Td
(Generated on: ${new Date().toLocaleDateString()}) Tj
0 -20 Td
(Report Type: ${reportType.toUpperCase()}) Tj
0 -20 Td
(Total Transactions: $1,735.50) Tj
0 -20 Td
(Bank Settlements: $1,735.50) Tj
0 -20 Td
(Status: RECONCILED) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000354 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
605
%%EOF`;
  };

  const generateExcelContent = () => {
    return `Transaction ID,Guest Name,Amount,Method,Status,Date,Reconciled
TXN_20240115_001,John Smith,1200.00,card,completed,2024-01-15 14:30,Yes
TXN_20240115_002,Maria Garcia,85.50,paystack,completed,2024-01-15 16:45,Yes
TXN_20240115_003,David Johnson,450.00,bank,pending,2024-01-15 18:20,Pending
TXN_20240114_025,Sarah Wilson,-200.00,card,refunded,2024-01-14 11:15,Yes`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Reconciliation Report</DialogTitle>
          <DialogDescription>
            Create a detailed reconciliation report for your payment transactions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Reconciliation</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                      <SelectItem value="custom">Custom Date Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(reportType === "custom" || reportType === "weekly" || reportType === "monthly") && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? formatDate(dateRange.from, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? formatDate(dateRange.to, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeDetails" 
                    checked={includeDetails}
                    onCheckedChange={(checked) => setIncludeDetails(checked === true)}
                  />
                  <Label htmlFor="includeDetails" className="text-sm">
                    Include detailed transaction list
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeDiscrepancies" 
                    checked={includeDiscrepancies}
                    onCheckedChange={(checked) => setIncludeDiscrepancies(checked === true)}
                  />
                  <Label htmlFor="includeDiscrepancies" className="text-sm">
                    Highlight discrepancies and unmatched transactions
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeSummary" 
                    checked={includeSummary}
                    onCheckedChange={(checked) => setIncludeSummary(checked === true)}
                  />
                  <Label htmlFor="includeSummary" className="text-sm">
                    Include executive summary and charts
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Report Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total System Transactions:</span>
                  <span className="font-bold">$1,735.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank Settlement Total:</span>
                  <span className="font-bold">$1,735.50</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reconciliation Status:</span>
                  <span className="font-bold text-success">MATCHED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unmatched Transactions:</span>
                  <span className="font-bold">0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="button-luxury"
            >
              {isGenerating ? (
                <>
                  <FileText className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate & Save Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};