import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Wallet } from "lucide-react";
import { HallBooking } from "@/hooks/useHallsDB";
import { useHotelSettings } from "@/hooks/useHotelSettings";

interface HallPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: HallBooking;
  onPayment: (amount: number, method: string, reference?: string) => void;
}

export const HallPaymentModal = ({ open, onOpenChange, booking, onPayment }: HallPaymentModalProps) => {
  const { settings } = useHotelSettings();
  const currency = settings?.currency || 'USD';
  
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [reference, setReference] = useState("");

  const remainingAmount = booking.total_amount - booking.amount_paid;
  const paymentProgress = (booking.amount_paid / booking.total_amount) * 100;

  const handleSubmit = () => {
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      return;
    }

    if (paymentAmount > remainingAmount) {
      return;
    }

    onPayment(paymentAmount, paymentMethod, reference || undefined);
    setAmount("");
    setReference("");
    onOpenChange(false);
  };

  const setQuickAmount = (percentage: number) => {
    const quickAmount = (remainingAmount * percentage / 100).toFixed(2);
    setAmount(quickAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="p-4 border rounded-lg space-y-2 bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Event:</span>
              <span className="font-semibold">{booking.event_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Organizer:</span>
              <span className="font-medium">{booking.organizer_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Amount:</span>
              <span className="text-lg font-bold">{currency} {booking.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount Paid:</span>
              <span className="text-green-600 font-semibold">{currency} {booking.amount_paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Balance Due:</span>
              <span className="text-xl font-bold text-red-600">{currency} {remainingAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payment Progress</span>
              <span className="font-medium">{paymentProgress.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${paymentProgress}%` }}
              />
            </div>
            <Badge variant={booking.payment_status === 'paid' ? 'default' : booking.payment_status === 'partial' ? 'secondary' : 'outline'}>
              {booking.payment_status === 'paid' ? 'Fully Paid' : booking.payment_status === 'partial' ? 'Partially Paid' : 'Pending Payment'}
            </Badge>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label>Quick Amount Select</Label>
            <div className="grid grid-cols-4 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setQuickAmount(25)}
              >
                25%
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setQuickAmount(50)}
              >
                50%
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setQuickAmount(75)}
              >
                75%
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setAmount(remainingAmount.toString())}
              >
                Full
              </Button>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                min="0"
                max={remainingAmount}
                step="0.01"
              />
            </div>
            {parseFloat(amount) > remainingAmount && (
              <p className="text-sm text-red-600">Amount cannot exceed balance due</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="mobile">Mobile Money</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input
              id="reference"
              placeholder="Transaction reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {/* Payment History */}
          {booking.payment_history && booking.payment_history.length > 0 && (
            <div className="space-y-2">
              <Label>Payment History</Label>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {booking.payment_history.map((payment, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                    <div>
                      <div className="font-medium">{currency} {payment.amount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {payment.method} • {new Date(payment.date).toLocaleDateString()}
                      </div>
                    </div>
                    {payment.reference && (
                      <Badge variant="outline" className="text-xs">{payment.reference}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount}
          >
            Process Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
