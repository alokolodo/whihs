import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Clock, 
  X, 
  Hotel, 
  Calendar, 
  Users,
  CreditCard,
  Phone,
  Mail
} from "lucide-react";

interface BookingData {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  specialRequests: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  submittedAt: string;
}

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingData[]>([
    {
      id: "BK001",
      guestName: "John Smith",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      checkIn: "2024-01-15",
      checkOut: "2024-01-18",
      guests: 2,
      roomType: "Deluxe Suite",
      specialRequests: "High floor, city view",
      totalAmount: 1047,
      status: 'pending',
      submittedAt: "2024-01-10 14:30"
    },
    {
      id: "BK002", 
      guestName: "Maria Garcia",
      email: "maria@example.com",
      phone: "+1 (555) 987-6543",
      checkIn: "2024-01-20",
      checkOut: "2024-01-22",
      guests: 1,
      roomType: "Standard Room",
      specialRequests: "Ground floor access",
      totalAmount: 398,
      status: 'pending',
      submittedAt: "2024-01-11 09:15"
    }
  ]);

  // Add new booking from landing page if passed via state
  useEffect(() => {
    if (location.state?.newBooking) {
      const newBooking: BookingData = {
        id: `BK${String(Date.now()).slice(-3)}`,
        ...location.state.newBooking,
        status: 'pending' as const,
        submittedAt: new Date().toLocaleString()
      };
      setBookings(prev => [newBooking, ...prev]);
    }
  }, [location.state]);

  const handleConfirmBooking = (bookingId: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'confirmed' as const }
          : booking
      )
    );
    toast({
      title: "Booking Confirmed",
      description: "Guest notification has been sent.",
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      )
    );
    toast({
      title: "Booking Cancelled",
      description: "Guest has been notified of cancellation.",
      variant: "destructive"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-warning text-warning-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Booking Management</h1>
          <p className="text-muted-foreground">Review and manage guest reservations</p>
        </div>
        <Button onClick={() => navigate('/admin')} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking) => {
          const StatusIcon = getStatusIcon(booking.status);
          
          return (
            <Card key={booking.id} className="card-luxury">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <Hotel className="h-5 w-5" />
                      Booking #{booking.id}
                    </CardTitle>
                    <CardDescription>
                      Submitted on {booking.submittedAt}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Guest Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Guest Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-sm text-muted-foreground">Primary Guest</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{booking.email}</p>
                          <p className="text-sm text-muted-foreground">Email Address</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{booking.phone}</p>
                          <p className="text-sm text-muted-foreground">Contact Number</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Booking Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{booking.checkIn} to {booking.checkOut}</p>
                          <p className="text-sm text-muted-foreground">Check-in & Check-out</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Hotel className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{booking.roomType}</p>
                          <p className="text-sm text-muted-foreground">{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">${booking.totalAmount}</p>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div>
                    <h4 className="font-medium mb-2">Special Requests</h4>
                    <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}

                <Separator />

                {booking.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleConfirmBooking(booking.id)}
                      className="button-luxury flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </Button>
                    <Button 
                      onClick={() => handleCancelBooking(booking.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BookingConfirmation;