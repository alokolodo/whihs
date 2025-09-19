import { useState, useEffect } from "react";
import { 
  Bed, 
  Users, 
  Wifi,
  Tv,
  Coffee,
  Car,
  Bath,
  ArrowLeft,
  Star,
  ChevronDown,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { Skeleton } from "@/components/ui/skeleton";

const RoomsPage = () => {
  const { rooms, loading } = useRoomsDB();
  const { formatCurrency, settings } = useGlobalSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("price-low");

  // Get available rooms only (for customer view)
  const availableRooms = rooms.filter(room => room.status === 'available');

  // Filter and sort rooms
  const filteredRooms = availableRooms
    .filter(room => {
      const matchesSearch = room.room_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           room.room_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || room.room_type.toLowerCase().includes(filterType.toLowerCase());
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.rate - b.rate;
        case "price-high":
          return b.rate - a.rate;
        case "capacity":
          return b.capacity - a.capacity;
        case "type":
          return a.room_type.localeCompare(b.room_type);
        default:
          return 0;
      }
    });

  // Get unique room types for filter
  const roomTypes = [...new Set(availableRooms.map(room => room.room_type))];

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (amenityLower.includes('tv') || amenityLower.includes('television')) return <Tv className="h-4 w-4" />;
    if (amenityLower.includes('coffee') || amenityLower.includes('bar')) return <Coffee className="h-4 w-4" />;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car className="h-4 w-4" />;
    if (amenityLower.includes('bath') || amenityLower.includes('shower')) return <Bath className="h-4 w-4" />;
    return <Star className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </a>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{settings.hotel_name}</h1>
                  <p className="text-sm text-muted-foreground">Available Rooms</p>
                </div>
              </div>
              <Button asChild>
                <a href="/book">Book Now</a>
              </Button>
            </div>
          </div>
        </header>

        {/* Loading Skeletons */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </a>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{settings.hotel_name}</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredRooms.length} available room{filteredRooms.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button asChild>
              <a href="/book">Book Now</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search rooms..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {roomTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="capacity">Capacity</SelectItem>
                  <SelectItem value="type">Room Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Grid */}
      <div className="container mx-auto px-4 pb-8">
        {filteredRooms.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No rooms available</h3>
              <p className="text-muted-foreground">
                {availableRooms.length === 0 
                  ? "All rooms are currently occupied. Please check back later."
                  : "No rooms match your search criteria. Try adjusting your filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {/* Room Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Bed className="h-16 w-16 text-primary/40" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">Available</Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-2xl font-bold">{formatCurrency(room.rate)}</div>
                    <div className="text-sm opacity-90">per night</div>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Room {room.room_number}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{room.capacity}</span>
                    </div>
                  </div>
                  <CardDescription className="text-lg font-medium text-foreground">
                    {room.room_type}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {room.description && (
                    <p className="text-sm text-muted-foreground">{room.description}</p>
                  )}

                  {/* Room Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Floor:</span>
                      <span className="ml-2 font-medium">{room.floor_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="ml-2 font-medium">{room.capacity} guests</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 6).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <span className="mr-1">{getAmenityIcon(amenity)}</span>
                            {amenity}
                          </Badge>
                        ))}
                        {room.amenities.length > 6 && (
                          <Badge variant="secondary" className="text-xs">
                            +{room.amenities.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Book Now Button */}
                  <Button className="w-full mt-4 group-hover:shadow-md transition-shadow" asChild>
                    <a href={`/book?room=${room.id}`}>
                      Book This Room
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;