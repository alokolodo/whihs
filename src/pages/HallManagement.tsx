import { useState } from "react";
import { 
  Calendar,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Hall {
  id: string;
  name: string;
  capacity: number;
  location: string;
  hourlyRate: number;
  amenities: string[];
  availability: "available" | "booked" | "maintenance";
}

interface Booking {
  id: string;
  hallId: string;
  hallName: string;
  event: string;
  organizer: string;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  status: "confirmed" | "pending" | "cancelled";
  totalAmount: number;
}

const HallManagement = () => {
  const [halls] = useState<Hall[]>([
    {
      id: "1",
      name: "Grand Ballroom",
      capacity: 500,
      location: "Ground Floor",
      hourlyRate: 300,
      amenities: ["Stage", "Sound System", "Lighting", "AC", "Catering Kitchen"],
      availability: "available"
    },
    {
      id: "2", 
      name: "Conference Hall A",
      capacity: 100,
      location: "First Floor",
      hourlyRate: 150,
      amenities: ["Projector", "WiFi", "Whiteboard", "AC", "Coffee Station"],
      availability: "booked"
    },
    {
      id: "3",
      name: "Banquet Hall",
      capacity: 200,
      location: "Ground Floor", 
      hourlyRate: 200,
      amenities: ["Dance Floor", "Bar Counter", "Kitchen Access", "Garden View"],
      availability: "available"
    },
    {
      id: "4",
      name: "Meeting Room B",
      capacity: 50,
      location: "Second Floor",
      hourlyRate: 80,
      amenities: ["Video Conferencing", "WiFi", "Presentation Screen"],
      availability: "maintenance"
    }
  ]);

  const [bookings] = useState<Booking[]>([
    {
      id: "1",
      hallId: "1",
      hallName: "Grand Ballroom",
      event: "Wedding Reception",
      organizer: "Smith Family",
      date: "2024-01-20",
      startTime: "18:00",
      endTime: "23:00",
      guests: 350,
      status: "confirmed",
      totalAmount: 1500
    },
    {
      id: "2",
      hallId: "2", 
      hallName: "Conference Hall A",
      event: "Corporate Meeting",
      organizer: "Tech Corp Ltd",
      date: "2024-01-18",
      startTime: "09:00", 
      endTime: "17:00",
      guests: 80,
      status: "confirmed",
      totalAmount: 1200
    },
    {
      id: "3",
      hallId: "3",
      hallName: "Banquet Hall", 
      event: "Birthday Party",
      organizer: "Johnson Family",
      date: "2024-01-25",
      startTime: "15:00",
      endTime: "20:00", 
      guests: 120,
      status: "pending",
      totalAmount: 1000
    }
  ]);

  const [activeTab, setActiveTab] = useState("halls");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const statusColors = {
    available: "bg-green-500",
    booked: "bg-red-500",
    maintenance: "bg-yellow-500",
    confirmed: "bg-green-500",
    pending: "bg-yellow-500", 
    cancelled: "bg-red-500"
  };

  const getHallStats = () => {
    return {
      total: halls.length,
      available: halls.filter(h => h.availability === "available").length,
      booked: halls.filter(h => h.availability === "booked").length,
      maintenance: halls.filter(h => h.availability === "maintenance").length,
    };
  };

  const getBookingStats = () => {
    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      pending: bookings.filter(b => b.status === "pending").length,
      cancelled: bookings.filter(b => b.status === "cancelled").length,
    };
  };

  const hallStats = getHallStats();
  const bookingStats = getBookingStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hall Management & Booking</h1>
          <p className="text-muted-foreground">Manage event halls and bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="halls">Halls</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="halls" className="space-y-6">
          {/* Hall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{hallStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Halls</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{hallStats.available}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{hallStats.booked}</div>
                <div className="text-sm text-muted-foreground">Booked</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{hallStats.maintenance}</div>
                <div className="text-sm text-muted-foreground">Maintenance</div>
              </CardContent>
            </Card>
          </div>

          {/* Halls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {halls.map((hall) => (
              <Card key={hall.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{hall.name}</CardTitle>
                    <Badge className={`${statusColors[hall.availability]} text-white`}>
                      {hall.availability}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {hall.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Capacity</div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold">{hall.capacity}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Hourly Rate</div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">${hall.hourlyRate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Amenities</div>
                      <div className="flex flex-wrap gap-1">
                        {hall.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {hall.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{hall.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      {hall.availability === "available" && (
                        <Button size="sm" className="flex-1">
                          Book Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          {/* Booking Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{bookingStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</div>
                <div className="text-sm text-muted-foreground">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</div>
                <div className="text-sm text-muted-foreground">Cancelled</div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{booking.event}</h3>
                        <Badge className={`${statusColors[booking.status]} text-white`}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Hall: </span>
                          <span className="font-medium">{booking.hallName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Organizer: </span>
                          <span className="font-medium">{booking.organizer}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date & Time: </span>
                          <span className="font-medium">{booking.date} {booking.startTime}-{booking.endTime}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Guests: </span>
                          <span className="font-medium">{booking.guests}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">${booking.totalAmount}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {booking.status === "pending" && (
                          <>
                            <Button size="sm" variant="default">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
                <p className="text-muted-foreground">Calendar integration would be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HallManagement;