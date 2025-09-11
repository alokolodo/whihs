import { useState } from "react";
import { 
  Calendar,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  Search,
  Hotel,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RoomReservation {
  id: string;
  type: "room";
  roomNumber: string;
  roomType: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "confirmed" | "pending" | "checked-in" | "checked-out" | "cancelled";
  totalAmount: number;
  specialRequests?: string;
}

interface HallReservation {
  id: string;
  type: "hall";
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

interface OccupiedRoom {
  id: string;
  roomNumber: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "occupied";
}

const BookingManagement = () => {
  const [roomReservations] = useState<RoomReservation[]>([
    {
      id: "1",
      type: "room",
      roomNumber: "101",
      roomType: "King Size",
      guestName: "John Smith",
      checkIn: "2024-01-15",
      checkOut: "2024-01-17",
      guests: 2,
      status: "checked-in",
      totalAmount: 300,
      specialRequests: "Late checkout"
    },
    {
      id: "2",
      type: "room",
      roomNumber: "205",
      roomType: "Executive Room",
      guestName: "Sarah Wilson",
      checkIn: "2024-01-20",
      checkOut: "2024-01-22",
      guests: 1,
      status: "confirmed",
      totalAmount: 560
    },
    {
      id: "3",
      type: "room",
      roomNumber: "301",
      roomType: "Suite",
      guestName: "Michael Brown",
      checkIn: "2024-01-18",
      checkOut: "2024-01-21",
      guests: 3,
      status: "pending",
      totalAmount: 960
    }
  ]);

  const [hallReservations] = useState<HallReservation[]>([
    {
      id: "1",
      type: "hall",
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
      type: "hall",
      hallName: "Conference Hall A",
      event: "Corporate Meeting",
      organizer: "Tech Corp Ltd",
      date: "2024-01-18",
      startTime: "09:00",
      endTime: "17:00",
      guests: 80,
      status: "confirmed",
      totalAmount: 1200
    }
  ]);

  const [occupiedRooms] = useState<OccupiedRoom[]>([
    {
      id: "1",
      roomNumber: "101",
      guestName: "John Smith",
      checkIn: "2024-01-15",
      checkOut: "2024-01-17",
      guests: 2,
      status: "occupied"
    },
    {
      id: "2",
      roomNumber: "201",
      guestName: "Sarah Johnson",
      checkIn: "2024-01-14",
      checkOut: "2024-01-16",
      guests: 2,
      status: "occupied"
    }
  ]);

  const [activeTab, setActiveTab] = useState("reservations");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allReservations = [...roomReservations, ...hallReservations];

  const statusColors = {
    confirmed: "bg-green-500",
    pending: "bg-yellow-500",
    "checked-in": "bg-blue-500",
    "checked-out": "bg-gray-500",
    cancelled: "bg-red-500",
    occupied: "bg-red-500"
  };

  const filteredReservations = allReservations.filter(reservation => {
    const matchesType = filterType === "all" || reservation.type === filterType;
    const matchesStatus = filterStatus === "all" || reservation.status === filterStatus;
    const matchesSearch = 
      (reservation.type === "room" && 
        ((reservation as RoomReservation).roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (reservation as RoomReservation).guestName.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (reservation.type === "hall" && 
        ((reservation as HallReservation).hallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (reservation as HallReservation).organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (reservation as HallReservation).event.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesType && matchesStatus && matchesSearch;
  });

  const getReservationStats = () => {
    return {
      total: allReservations.length,
      rooms: roomReservations.length,
      halls: hallReservations.length,
      confirmed: allReservations.filter(r => r.status === "confirmed").length,
      pending: allReservations.filter(r => r.status === "pending").length,
    };
  };

  const stats = getReservationStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground">Manage room and hall reservations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reservations">All Reservations</TabsTrigger>
          <TabsTrigger value="occupied">Occupied Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.rooms}</div>
                <div className="text-sm text-muted-foreground">Room Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.halls}</div>
                <div className="text-sm text-muted-foreground">Hall Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                <div className="text-sm text-muted-foreground">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search bookings..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="room">Room Bookings</SelectItem>
                    <SelectItem value="hall">Hall Bookings</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="checked-in">Checked In</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reservations List */}
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <Card key={`${reservation.type}-${reservation.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {reservation.type === "room" ? 
                            <Hotel className="h-4 w-4 text-blue-500" /> : 
                            <Building className="h-4 w-4 text-purple-500" />
                          }
                          <h3 className="text-lg font-semibold">
                            {reservation.type === "room" ? 
                              `Room ${(reservation as RoomReservation).roomNumber}` : 
                              (reservation as HallReservation).event
                            }
                          </h3>
                        </div>
                        <Badge className={`${statusColors[reservation.status]} text-white`}>
                          {reservation.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {reservation.type === "room" ? (
                          <>
                            <div>
                              <span className="text-muted-foreground">Guest: </span>
                              <span className="font-medium">{(reservation as RoomReservation).guestName}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Room Type: </span>
                              <span className="font-medium">{(reservation as RoomReservation).roomType}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Check-in: </span>
                              <span className="font-medium">{(reservation as RoomReservation).checkIn}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Check-out: </span>
                              <span className="font-medium">{(reservation as RoomReservation).checkOut}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="text-muted-foreground">Hall: </span>
                              <span className="font-medium">{(reservation as HallReservation).hallName}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Organizer: </span>
                              <span className="font-medium">{(reservation as HallReservation).organizer}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date: </span>
                              <span className="font-medium">{(reservation as HallReservation).date}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Time: </span>
                              <span className="font-medium">
                                {(reservation as HallReservation).startTime}-{(reservation as HallReservation).endTime}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Guests: </span>
                          <span className="font-medium">{reservation.guests}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">${reservation.totalAmount}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {reservation.status === "pending" && (
                          <>
                            <Button size="sm" variant="default">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {reservation.type === "room" && reservation.status === "confirmed" && (
                          <Button size="sm" variant="default">
                            Check In
                          </Button>
                        )}
                        {reservation.type === "room" && reservation.status === "checked-in" && (
                          <Button size="sm" variant="secondary">
                            Check Out
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="occupied" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{occupiedRooms.length}</div>
                <div className="text-sm text-muted-foreground">Currently Occupied</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {occupiedRooms.filter(r => new Date(r.checkOut) <= new Date()).length}
                </div>
                <div className="text-sm text-muted-foreground">Due for Checkout</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {occupiedRooms.map((room) => (
              <Card key={room.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Hotel className="h-4 w-4 text-red-500" />
                        <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                        <Badge className="bg-red-500 text-white">Occupied</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Guest: </span>
                          <span className="font-medium">{room.guestName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Check-in: </span>
                          <span className="font-medium">{room.checkIn}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Check-out: </span>
                          <span className="font-medium">{room.checkOut}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Guests: </span>
                          <span className="font-medium">{room.guests}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        Check Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingManagement;