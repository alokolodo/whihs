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
  type: string;
  status: "available" | "occupied" | "cleaning" | "maintenance" | "out-of-order";
  guest?: string;
  checkIn?: string;
  checkOut?: string;
  rate: number;
  amenities: string[];
  floor: number;
}

const RoomManagement = () => {
  const [rooms] = useState<Room[]>([
    { id: "1", number: "101", type: "Standard Single", status: "occupied", guest: "John Smith", checkIn: "2024-01-15", checkOut: "2024-01-17", rate: 120, amenities: ["WiFi", "AC", "TV"], floor: 1 },
    { id: "2", number: "102", type: "Standard Double", status: "available", rate: 150, amenities: ["WiFi", "AC", "TV", "Mini Bar"], floor: 1 },
    { id: "3", number: "103", type: "Suite", status: "cleaning", rate: 280, amenities: ["WiFi", "AC", "TV", "Mini Bar", "Balcony"], floor: 1 },
    { id: "4", number: "201", type: "Deluxe Single", status: "occupied", guest: "Sarah Johnson", checkIn: "2024-01-14", checkOut: "2024-01-16", rate: 180, amenities: ["WiFi", "AC", "TV", "Mini Bar"], floor: 2 },
    { id: "5", number: "202", type: "Presidential Suite", status: "available", rate: 500, amenities: ["WiFi", "AC", "TV", "Mini Bar", "Balcony", "Kitchen"], floor: 2 },
    { id: "6", number: "203", type: "Standard Double", status: "maintenance", rate: 150, amenities: ["WiFi", "AC", "TV"], floor: 2 },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFloor, setFilterFloor] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const statusColors = {
    available: "bg-green-500",
    occupied: "bg-red-500", 
    cleaning: "bg-yellow-500",
    maintenance: "bg-orange-500",
    "out-of-order": "bg-gray-500"
  };

  const statusLabels = {
    available: "Available",
    occupied: "Occupied",
    cleaning: "Cleaning",
    maintenance: "Maintenance", 
    "out-of-order": "Out of Order"
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
      available: rooms.filter(r => r.status === "available").length,
      occupied: rooms.filter(r => r.status === "occupied").length,
      cleaning: rooms.filter(r => r.status === "cleaning").length,
      maintenance: rooms.filter(r => r.status === "maintenance").length,
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
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-muted-foreground">Available</div>
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
            <div className="text-2xl font-bold text-yellow-600">{stats.cleaning}</div>
            <div className="text-sm text-muted-foreground">Cleaning</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
            <div className="text-sm text-muted-foreground">Maintenance</div>
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
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out-of-order">Out of Order</SelectItem>
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
                  {room.status === "available" && (
                    <Button size="sm" className="flex-1">
                      <Calendar className="h-4 w-4" />
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