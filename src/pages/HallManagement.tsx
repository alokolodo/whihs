import { useState } from "react";
import { 
  Calendar as CalendarIcon,
  Users,
  MapPin,
  DollarSign,
  Plus,
  Edit,
  Search,
  CheckCircle,
  XCircle,
  Banknote,
  Building2,
  Sofa
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHallsDB } from "@/hooks/useHallsDB";
import { useGuestsDB } from "@/hooks/useGuestsDB";
import { toast } from "@/hooks/use-toast";
import { format, differenceInHours } from "date-fns";
import { cn } from "@/lib/utils";
import { HallPaymentModal } from "@/components/hall/HallPaymentModal";
import { AddHallModal } from "@/components/hall/AddHallModal";

const HallManagement = () => {
  const { halls, bookings, loading, createBooking, updateBooking, cancelBooking, addPayment, addHall, getHallsByType } = useHallsDB();
  const { guests: registeredGuests } = useGuestsDB();

  const [activeTab, setActiveTab] = useState("halls");
  const [venueTypeFilter, setVenueTypeFilter] = useState<"all" | "hall" | "lounge">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showAddHall, setShowAddHall] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any>(null);
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedGuest, setSelectedGuest] = useState("");
  const [selectedHall, setSelectedHall] = useState("");
  const [eventName, setEventName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const statusColors = {
    available: "bg-green-500",
    booked: "bg-red-500",
    maintenance: "bg-yellow-500",
    confirmed: "bg-green-500",
    pending: "bg-yellow-500", 
    cancelled: "bg-red-500",
    paid: "bg-green-500",
    partial: "bg-blue-500"
  };

  const filteredHalls = halls.filter(hall => {
    const matchesSearch = hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hall.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = venueTypeFilter === "all" || hall.venue_type === venueTypeFilter;
    return matchesSearch && matchesType;
  });

  const hallsByType = {
    halls: getHallsByType('hall'),
    lounges: getHallsByType('lounge')
  };

  const getVenueStats = () => {
    return {
      totalHalls: hallsByType.halls.length,
      totalLounges: hallsByType.lounges.length,
      availableHalls: hallsByType.halls.filter(h => h.availability === "available").length,
      availableLounges: hallsByType.lounges.filter(h => h.availability === "available").length,
    };
  };

  const getBookingStats = () => {
    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      pending: bookings.filter(b => b.status === "pending").length,
      cancelled: bookings.filter(b => b.status === "cancelled").length,
      fullyPaid: bookings.filter(b => b.payment_status === "paid").length,
      partiallyPaid: bookings.filter(b => b.payment_status === "partial").length,
    };
  };

  const venueStats = getVenueStats();
  const bookingStats = getBookingStats();

  const handleNewBooking = async () => {
    if (!selectedGuest || !selectedHall || !selectedDate || !eventName.trim() || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required booking details",
        variant: "destructive",
      });
      return;
    }

    const hall = halls.find(h => h.id === selectedHall);
    const guest = registeredGuests.find(g => g.id === selectedGuest);
    
    if (!hall || !guest) return;

    // Calculate total amount based on hours
    const start = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${startTime}`);
    const end = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${endTime}`);
    const hours = differenceInHours(end, start);
    const totalAmount = hours * hall.hourly_rate;

    try {
      await createBooking({
        hall_id: selectedHall,
        event_name: eventName,
        organizer_name: guest.name,
        guest_id: selectedGuest,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        number_of_guests: numberOfGuests ? parseInt(numberOfGuests) : undefined,
        total_amount: totalAmount,
        payment_status: 'pending',
        status: 'pending',
        special_requests: specialRequests || undefined,
      });

      // Reset form
      setSelectedGuest("");
      setSelectedHall("");
      setSelectedDate(new Date());
      setEventName("");
      setStartTime("");
      setEndTime("");
      setNumberOfGuests("");
      setSpecialRequests("");
      setShowNewBooking(false);
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handlePayment = async (bookingId: string, amount: number, method: string, reference?: string) => {
    try {
      await addPayment(bookingId, amount, method, reference);
      setShowPaymentModal(false);
      setSelectedBookingForPayment(null);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Hall & Lounge Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage event halls, lounges and bookings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowAddHall(true)} className="flex-1 md:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Hall/Lounge</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button variant="outline" onClick={() => setShowCalendar(true)} className="flex-1 md:flex-none">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">View Calendar</span>
            <span className="sm:hidden">Calendar</span>
          </Button>
          <Button onClick={() => setShowNewBooking(true)} className="flex-1 md:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Booking</span>
            <span className="sm:hidden">Book</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="halls">Venues</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="halls" className="space-y-4 md:space-y-6">
          {/* Venue Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardContent className="p-3 md:p-4">
                <Building2 className="h-5 w-5 mb-2 text-primary" />
                <div className="text-xl md:text-2xl font-bold">{venueStats.totalHalls}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Total Halls</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <Sofa className="h-5 w-5 mb-2 text-primary" />
                <div className="text-xl md:text-2xl font-bold">{venueStats.totalLounges}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Total Lounges</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-green-600">{venueStats.availableHalls}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Available Halls</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-green-600">{venueStats.availableLounges}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Available Lounges</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={venueTypeFilter} onValueChange={(value: any) => setVenueTypeFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Venues</SelectItem>
                <SelectItem value="hall">Halls Only</SelectItem>
                <SelectItem value="lounge">Lounges Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredHalls.map((hall) => (
              <Card key={hall.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {hall.venue_type === 'hall' ? 
                        <Building2 className="h-5 w-5 text-primary" /> : 
                        <Sofa className="h-5 w-5 text-primary" />
                      }
                      <CardTitle className="text-base md:text-lg">{hall.name}</CardTitle>
                    </div>
                    <Badge className={`${statusColors[hall.availability]} text-white text-xs`}>
                      {hall.availability}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs md:text-sm">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                    {hall.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Capacity</div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="text-sm md:text-base font-semibold">{hall.capacity}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Hourly Rate</div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="text-sm md:text-base font-semibold">${hall.hourly_rate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Amenities</div>
                    <div className="flex flex-wrap gap-1">
                      {hall.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {hall.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{hall.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    {hall.availability === "available" && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedHall(hall.id);
                          setShowNewBooking(true);
                        }}
                      >
                        <span className="hidden sm:inline">Book Now</span>
                        <span className="sm:hidden">Book</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4 md:space-y-6">
          {/* Booking Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold">{bookingStats.total}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-green-600">{bookingStats.confirmed}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-red-600">{bookingStats.cancelled}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Cancelled</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-green-600">{bookingStats.fullyPaid}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Fully Paid</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-blue-600">{bookingStats.partiallyPaid}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Partial</div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings List */}
          <div className="space-y-3 md:space-y-4">
            {bookings.map((booking) => {
              const hall = halls.find(h => h.id === booking.hall_id);
              const remainingAmount = booking.total_amount - booking.amount_paid;
              
              return (
                <Card key={booking.id}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base md:text-lg font-semibold">{booking.event_name}</h3>
                          <Badge className={`${statusColors[booking.status]} text-white text-xs`}>
                            {booking.status}
                          </Badge>
                          <Badge className={`${statusColors[booking.payment_status]} text-white text-xs`}>
                            {booking.payment_status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                          <div>
                            <span className="text-muted-foreground">Venue: </span>
                            <span className="font-medium">{hall?.name || 'Unknown'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Organizer: </span>
                            <span className="font-medium">{booking.organizer_name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date: </span>
                            <span className="font-medium">{booking.booking_date}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time: </span>
                            <span className="font-medium">{booking.start_time}-{booking.end_time}</span>
                          </div>
                        </div>
                        {booking.payment_status !== 'paid' && (
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <span className="text-muted-foreground">Balance:</span>
                            <span className="font-bold text-red-600">${remainingAmount.toLocaleString()}</span>
                            <span className="text-muted-foreground">of ${booking.total_amount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end gap-2">
                        <div className="text-lg md:text-2xl font-bold">${Number(booking.total_amount).toLocaleString()}</div>
                        <div className="flex flex-wrap gap-2">
                          {booking.payment_status !== 'paid' && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => {
                                setSelectedBookingForPayment(booking);
                                setShowPaymentModal(true);
                              }}
                            >
                              <Banknote className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              <span className="hidden sm:inline">Pay</span>
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          {booking.status === "pending" && (
                            <>
                              <Button size="sm" variant="default" onClick={() => updateBooking(booking.id, { status: 'confirmed' })}>
                                <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => cancelBooking(booking.id)}>
                                <XCircle className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-base md:text-lg font-semibold">Booking Calendar</h3>
                  <Button onClick={() => setShowNewBooking(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Booking
                  </Button>
                </div>
                
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border pointer-events-auto"
                  />
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <h4 className="font-medium text-sm md:text-base">
                    Bookings for {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                  </h4>
                  <div className="space-y-2">
                    {bookings
                      .filter(booking => booking.booking_date === (selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""))
                      .map(booking => {
                        const hall = halls.find(h => h.id === booking.hall_id);
                        return (
                          <div key={booking.id} className="p-3 border rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <div className="font-medium text-sm md:text-base">{booking.event_name}</div>
                                <div className="text-xs md:text-sm text-muted-foreground">
                                  {hall?.name || 'Unknown'} • {booking.start_time}-{booking.end_time}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={`${statusColors[booking.status]} text-white text-xs`}>
                                  {booking.status}
                                </Badge>
                                <Badge className={`${statusColors[booking.payment_status]} text-white text-xs`}>
                                  {booking.payment_status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                    {selectedDate && bookings.filter(booking => 
                      booking.booking_date === format(selectedDate, "yyyy-MM-dd")
                    ).length === 0 && (
                      <div className="text-center py-6 md:py-8 text-muted-foreground">
                        <CalendarIcon className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm md:text-base">No bookings for this date</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Calendar View</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* New Booking Dialog */}
      <Dialog open={showNewBooking} onOpenChange={setShowNewBooking}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest">Guest *</Label>
                <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select guest" />
                  </SelectTrigger>
                  <SelectContent>
                    {registeredGuests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.name} - {guest.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hall">Venue *</Label>
                <Select value={selectedHall} onValueChange={setSelectedHall}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.filter(hall => hall.availability === "available").map((hall) => (
                      <SelectItem key={hall.id} value={hall.id}>
                        {hall.name} ({hall.venue_type}) - ${hall.hourly_rate}/hr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Event Name *</Label>
              <Input
                id="event"
                placeholder="Enter event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">End Time *</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                type="number"
                placeholder="Expected number of guests"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requests">Special Requests</Label>
              <Textarea
                id="requests"
                placeholder="Any special requirements..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBooking(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewBooking}>
              Create Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Hall/Lounge Modal */}
      <AddHallModal
        open={showAddHall}
        onOpenChange={setShowAddHall}
        onAdd={async (hallData) => {
          try {
            await addHall(hallData);
          } catch (error) {
            console.error('Error adding venue:', error);
          }
        }}
      />

      {/* Payment Modal */}
      {selectedBookingForPayment && (
        <HallPaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          booking={selectedBookingForPayment}
          onPayment={(amount, method, reference) => 
            handlePayment(selectedBookingForPayment.id, amount, method, reference)
          }
        />
      )}
    </div>
  );
};

export default HallManagement;
