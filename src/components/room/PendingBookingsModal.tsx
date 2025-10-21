import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Calendar, User, Phone, Mail, DollarSign } from "lucide-react";
import { useRoomsDB, RoomBooking } from "@/hooks/useRoomsDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { toast } from "sonner";

interface PendingBookingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PendingBookingsModal({ open, onOpenChange }: PendingBookingsModalProps) {
  const { bookings, rooms, confirmBooking, updateBookingStatus } = useRoomsDB();
  const { formatCurrency } = useGlobalSettings();
  const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>({});

  const pendingBookings = bookings.filter(
    b => b.booking_status === 'pending' && b.payment_status === 'pending'
  );

  const handleConfirm = async (booking: RoomBooking) => {
    const paymentMethod = paymentMethods[booking.id] || 'cash';
    try {
      await confirmBooking(booking.id, paymentMethod);
      onOpenChange(false);
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  const handleReject = async (booking: RoomBooking) => {
    try {
      await updateBookingStatus(booking.id, 'cancelled');
      toast.success("Booking request rejected");
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  const getRoomDetails = (roomId: string) => {
    return rooms.find(r => r.id === roomId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Pending Booking Requests</DialogTitle>
          <DialogDescription>
            Review and confirm customer booking requests. Payment confirmation will add the transaction to accounting.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {pendingBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending booking requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => {
                const room = getRoomDetails(booking.room_id);
                return (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Room {room?.room_number} - {room?.room_type}
                          </h3>
                          <Badge variant="secondary">{formatCurrency(room?.rate || 0)}/night</Badge>
                        </div>
                        <Badge className="bg-yellow-500">Pending</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Guest:</span>
                            <span>{booking.guest_name}</span>
                          </div>
                          {booking.guest_phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.guest_phone}</span>
                            </div>
                          )}
                          {booking.guest_email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.guest_email}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Check-in:</span>
                            <span>{new Date(booking.check_in_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Check-out:</span>
                            <span>{new Date(booking.check_out_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Total:</span>
                            <span className="font-bold">{formatCurrency(booking.total_amount)}</span>
                          </div>
                        </div>
                      </div>

                      {booking.special_requests && (
                        <div className="mb-4 p-3 bg-muted/50 rounded">
                          <p className="text-sm font-medium mb-1">Special Requests:</p>
                          <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-3 border-t">
                        <Select
                          value={paymentMethods[booking.id] || 'cash'}
                          onValueChange={(value) => 
                            setPaymentMethods(prev => ({ ...prev, [booking.id]: value }))
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex gap-2 ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(booking)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(booking)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirm Payment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
