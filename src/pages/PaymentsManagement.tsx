import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PaymentDetailsModal } from "@/components/payment/PaymentDetailsModal";
import { PrintReceiptModal } from "@/components/payment/PrintReceiptModal";
import { ReconciliationReportModal } from "@/components/payment/ReconciliationReportModal";
import { BankStatementUploadModal } from "@/components/payment/BankStatementUploadModal";
import {
  CreditCard,
  Search,
  Download,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";

interface Payment {
  id: string;
  transactionId: string;
  guestName: string;
  amount: number;
  method: 'card' | 'cash' | 'bank' | 'paystack' | 'flutterwave';
  type: 'booking' | 'pos' | 'service' | 'refund';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  description: string;
  roomNumber?: string;
  reference: string;
}

interface PaymentSummary {
  totalRevenue: number;
  todayRevenue: number;
  pendingAmount: number;
  refundedAmount: number;
  transactionCount: number;
  avgTransactionValue: number;
}

const PaymentsManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  const [isBankUploadModalOpen, setIsBankUploadModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [payments] = useState<Payment[]>([
    {
      id: "PAY001",
      transactionId: "TXN_20240115_001",
      guestName: "John Smith",
      amount: 1200.00,
      method: 'card',
      type: 'booking',
      status: 'completed',
      date: "2024-01-15 14:30",
      description: "Room booking payment - Deluxe Suite",
      roomNumber: "305",
      reference: "REF_BK001"
    },
    {
      id: "PAY002", 
      transactionId: "TXN_20240115_002",
      guestName: "Maria Garcia",
      amount: 85.50,
      method: 'paystack',
      type: 'pos',
      status: 'completed',
      date: "2024-01-15 16:45",
      description: "Restaurant bill payment",
      reference: "REF_POS002"
    },
    {
      id: "PAY003",
      transactionId: "TXN_20240115_003", 
      guestName: "David Johnson",
      amount: 450.00,
      method: 'bank',
      type: 'service',
      status: 'pending',
      date: "2024-01-15 18:20",
      description: "Spa services payment",
      reference: "REF_SPA001"
    },
    {
      id: "PAY004",
      transactionId: "TXN_20240114_025",
      guestName: "Sarah Wilson",
      amount: -200.00,
      method: 'card',
      type: 'refund',
      status: 'refunded',
      date: "2024-01-14 11:15",
      description: "Booking cancellation refund",
      reference: "REF_REF001"
    }
  ]);

  const filteredPayments = payments.filter(payment =>
    payment.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentSummary = (): PaymentSummary => {
    const completed = payments.filter(p => p.status === 'completed');
    const today = payments.filter(p => p.date.startsWith('2024-01-15'));
    
    return {
      totalRevenue: completed.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0),
      todayRevenue: today.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0),
      pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      refundedAmount: Math.abs(payments.filter(p => p.type === 'refund').reduce((sum, p) => sum + p.amount, 0)),
      transactionCount: payments.length,
      avgTransactionValue: completed.length > 0 ? completed.reduce((sum, p) => sum + Math.abs(p.amount), 0) / completed.length : 0
    };
  };

  const summary = getPaymentSummary();

  const getMethodBadge = (method: string) => {
    const colors = {
      card: 'bg-blue-500 text-white',
      cash: 'bg-green-500 text-white', 
      bank: 'bg-purple-500 text-white',
      paystack: 'bg-orange-500 text-white',
      flutterwave: 'bg-yellow-500 text-black'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      case 'refunded': return 'bg-muted text-muted-foreground';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return AlertCircle;
      case 'refunded': return RefreshCw;
      default: return Clock;
    }
  };

  const handleProcessRefund = (paymentId: string) => {
    toast({
      title: "Refund Initiated",
      description: "Refund processing will take 3-5 business days.",
    });
  };

  const handleExportPayments = async () => {
    // Use File System Access API if available
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `payments-report-${Date.now()}.xlsx`,
          types: [{
            description: 'Excel files',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
            }
          }]
        });
        
        // Create mock Excel content
        const content = generateExcelReport();
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        
        toast({
          title: "Export Complete",
          description: "Payment report saved successfully",
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
      // Fallback download
      const content = generateExcelReport();
      const blob = new Blob([content], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-report-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Started",
        description: "Payment report downloaded to your default folder",
      });
    }
  };

  const generateExcelReport = () => {
    return `Payment ID,Guest Name,Amount,Method,Type,Status,Date,Description,Reference
${payments.map(p => 
  `${p.id},${p.guestName},${p.amount},${p.method},${p.type},${p.status},${p.date},"${p.description}",${p.reference}`
).join('\n')}`;
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  const handlePrintReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments Management</h1>
          <p className="text-muted-foreground">Track and manage all payment transactions</p>
        </div>
        <Button onClick={handleExportPayments} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest name, transaction ID, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredPayments.map((payment) => {
              const StatusIcon = getStatusIcon(payment.status);
              
              return (
                <Card key={payment.id} className="card-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{payment.guestName}</h3>
                          <p className="text-muted-foreground">{payment.transactionId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">
                          {payment.amount < 0 ? '-' : ''}${Math.abs(payment.amount).toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <Badge className={getMethodBadge(payment.method)}>
                          {payment.method.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Transaction Type</p>
                        <p className="font-medium capitalize">{payment.type}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(payment.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {payment.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Reference</p>
                        <p className="font-medium">{payment.reference}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium">{payment.description}</p>
                      {payment.roomNumber && (
                        <p className="text-sm text-muted-foreground">Room: {payment.roomNumber}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(payment)}
                      >
                        View Details
                      </Button>
                      {payment.status === 'completed' && payment.type !== 'refund' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleProcessRefund(payment.id)}
                        >
                          Process Refund
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePrintReceipt(payment)}
                      >
                        Print Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +15.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.todayRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  From {payments.filter(p => p.date.startsWith('2024-01-15')).length} transactions
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.pendingAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Payment Methods Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['card', 'paystack', 'bank', 'cash'].map(method => {
                    const count = payments.filter(p => p.method === method).length;
                    const percentage = (count / payments.length) * 100;
                    return (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getMethodBadge(method)} variant="outline">
                            {method.toUpperCase()}
                          </Badge>
                          <span className="text-sm">{count} transactions</span>
                        </div>
                        <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Transactions</span>
                  <span className="font-bold">{summary.transactionCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average Transaction</span>
                  <span className="font-bold">${summary.avgTransactionValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Refunded</span>
                  <span className="font-bold text-destructive">${summary.refundedAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Daily Reconciliation</CardTitle>
              <CardDescription>
                Match transactions with bank statements and payment gateway reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">System Records</h4>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Card Payments</span>
                      <span className="font-bold">$1,200.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Bank Transfers</span>
                      <span className="font-bold">$450.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Digital Payments</span>
                      <span className="font-bold">$85.50</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>$1,735.50</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Bank Statement</h4>
                  <div className="bg-success/10 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Card Settlements</span>
                      <span className="font-bold">$1,200.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Bank Transfers</span>
                      <span className="font-bold">$450.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Gateway Settlements</span>
                      <span className="font-bold">$85.50</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>$1,735.50</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 p-4 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-success font-medium">
                  All transactions reconciled successfully
                </span>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="button-luxury"
                  onClick={() => setIsReconciliationModalOpen(true)}
                >
                  Generate Reconciliation Report
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsBankUploadModalOpen(true)}
                >
                  Upload Bank Statement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PaymentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />

      <PrintReceiptModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />

      <ReconciliationReportModal
        isOpen={isReconciliationModalOpen}
        onClose={() => setIsReconciliationModalOpen(false)}
      />

      <BankStatementUploadModal
        isOpen={isBankUploadModalOpen}
        onClose={() => setIsBankUploadModalOpen(false)}
      />
    </div>
  );
};

export default PaymentsManagement;