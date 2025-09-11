import { useState } from "react";
import { 
  Bed, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Settings,
  Calendar,
  DollarSign,
  Search,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Room {
  id: string;
  number: string;
  type: "Standard Single" | "Standard Double" | "King Size" | "Queen Size" | "Twin Beds" | "Suite" | "Deluxe Single" | "Deluxe Double" | "Presidential Suite" | "Executive Room";
  status: "ready" | "occupied" | "vacant-dirty" | "under-repairs";
  guest?: string;
  checkIn?: string;
  checkOut?: string;
  rate: number;
  amenities: string[];
  floor: number;
  bedType: string;
  roomSize: number; // in square meters
}

const RoomManagement = () => {
  const [rooms] = useState<Room[]>([
    { 
      id: "1", 
      number: "101", 
      type: "King Size", 
      status: "occupied",
      guest: "John Smith", 
      checkIn: "2024-01-15", 
      checkOut: "2024-01-17", 
      rate: 150, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power"], 
      floor: 1,
      bedType: "King Size Bed",
      roomSize: 35
    },
    { 
      id: "2", 
      number: "102", 
      type: "Queen Size", 
      status: "ready",
      rate: 130, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Mini Bar", "Solar Power"], 
      floor: 1,
      bedType: "Queen Size Bed",
      roomSize: 32
    },
    { 
      id: "3", 
      number: "103", 
      type: "Presidential Suite", 
      status: "vacant-dirty", 
      rate: 450, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power", "Balcony", "Kitchen", "Living Room"], 
      floor: 1,
      bedType: "King Size Bed + Sofa Bed",
      roomSize: 85
    },
    { 
      id: "4", 
      number: "201", 
      type: "Twin Beds", 
      status: "occupied", 
      guest: "Sarah Johnson", 
      checkIn: "2024-01-14", 
      checkOut: "2024-01-16", 
      rate: 140, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power"], 
      floor: 2,
      bedType: "Two Single Beds",
      roomSize: 38
    },
    { 
      id: "5", 
      number: "202", 
      type: "Executive Room", 
      status: "ready",
      rate: 280, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power", "Work Desk", "Coffee Machine"], 
      floor: 2,
      bedType: "King Size Bed",
      roomSize: 45
    },
    { 
      id: "6", 
      number: "203", 
      type: "Standard Double", 
      status: "under-repairs", 
      rate: 110, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power"], 
      floor: 2,
      bedType: "Double Bed",
      roomSize: 28
    },
    { 
      id: "7", 
      number: "301", 
      type: "Suite", 
      status: "ready",
      rate: 320, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power", "Balcony", "Kitchenette"], 
      floor: 3,
      bedType: "King Size Bed",
      roomSize: 55
    },
    { 
      id: "8", 
      number: "302", 
      type: "Deluxe Double", 
      status: "ready", 
      rate: 180, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power", "Mini Fridge"], 
      floor: 3,
      bedType: "Double Bed",
      roomSize: 40
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFloor, setFilterFloor] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const statusColors = {
    ready: "bg-green-500",
    occupied: "bg-red-500", 
    "vacant-dirty": "bg-yellow-500",
    "under-repairs": "bg-orange-500"
  };

  const statusLabels = {
    ready: "Ready",
    occupied: "Occupied",
    "vacant-dirty": "Vacant Dirty", 
    "under-repairs": "Under Repairs"
  };

  const filteredRooms = rooms.filter(room => {
    const matchesStatus = filterStatus === "all" || room.status === filterStatus;
    const matchesFloor = filterFloor === "all" || room.floor.toString() === filterFloor;
    const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (room.guest && room.guest.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesFloor && matchesSearch;
  });

  const getStatusStats = () => {
    return {
      total: rooms.length,
      ready: rooms.filter(r => r.status === "ready").length,
      occupied: rooms.filter(r => r.status === "occupied").length,
      vacantDirty: rooms.filter(r => r.status === "vacant-dirty").length,
      underRepairs: rooms.filter(r => r.status === "under-repairs").length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage hotel rooms, occupancy, and maintenance</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Rooms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            <div className="text-sm text-muted-foreground">Ready</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
            <div className="text-sm text-muted-foreground">Occupied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.vacantDirty}</div>
            <div className="text-sm text-muted-foreground">Vacant Dirty</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.underRepairs}</div>
            <div className="text-sm text-muted-foreground">Under Repairs</div>
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
                placeholder="Search rooms, guests..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant-dirty">Vacant Dirty</SelectItem>
                <SelectItem value="under-repairs">Under Repairs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Room {room.number}</CardTitle>
                <Badge 
                  className={`${statusColors[room.status]} text-white`}
                >
                  {statusLabels[room.status]}
                </Badge>
              </div>
              <CardDescription>{room.type}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rate:</span>
                  <span className="font-bold">${room.rate}/night</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Floor:</span>
                  <span>{room.floor}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bed Type:</span>
                  <span className="text-sm">{room.bedType}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Size:</span>
                  <span className="text-sm">{room.roomSize}m²</span>
                </div>

                {room.guest && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Guest:</span>
                      <span className="text-sm">{room.guest}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check-out:</span>
                      <span className="text-sm">{room.checkOut}</span>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {room.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{room.amenities.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="h-4 w-4" />
                  </Button>
                  {room.status === "occupied" && (
                    <Button size="sm" className="flex-1">
                      Check Out
                    </Button>
                  )}
                  {room.status === "ready" && (
                    <Button size="sm" className="flex-1">
                      Check In
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoomManagement;