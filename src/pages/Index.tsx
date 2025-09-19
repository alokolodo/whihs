import { 
  Hotel, 
  Calendar, 
  ShoppingCart, 
  Star, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Waves,
  Dumbbell,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Bed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero-hotel.jpg";

const Index = () => {
  const { rooms, loading } = useRoomsDB();
  const { formatCurrency, settings } = useGlobalSettings();

  // Get available rooms for display (limit to 3 for homepage)
  const availableRooms = rooms.filter(room => room.status === 'available').slice(0, 3);

  const features = [
    {
      icon: Calendar,
      title: "Online Booking",
      description: "Easy room and event space reservations with real-time availability"
    },
    {
      icon: ShoppingCart,
      title: "Hotel Services",
      description: "Touch-friendly point of sale for restaurants, bars, and retail"
    },
    {
      icon: Users,
      title: "Guest Management",
      description: "Complete CRM system with guest preferences and history"
    },
    {
      icon: Hotel,
      title: "Room Management",
      description: "Real-time room status, housekeeping, and maintenance tracking"
    }
  ];

  const amenities = [
    { icon: Wifi, name: "Free WiFi" },
    { icon: Car, name: "Valet Parking" },
    { icon: Coffee, name: "Restaurant & Bar" },
    { icon: Waves, name: "Spa & Pool" },
    { icon: Dumbbell, name: "Fitness Center" },
    { icon: Users, name: "24/7 Concierge" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Hotel className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{settings.hotel_name}</h1>
                <p className="text-sm text-muted-foreground">Management System</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <a href="/rooms">Rooms</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="#amenities">Amenities</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="#contact">Contact</a>
              </Button>
              <Button asChild>
                <a href="/book">Book Now</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth">Staff Login</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img 
          src={heroImage} 
          alt="Luxury hotel lobby interior" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 luxury-gradient opacity-80"></div>
        <div className="relative z-10 text-center text-primary-foreground max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Experience
            <span className="block text-accent">Luxury</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            World-class amenities, exceptional service, and unforgettable memories await you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="button-luxury text-lg px-8 py-4" asChild>
              <a href="/book">
                Book Your Stay
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
              <a href="/rooms">
                Explore Rooms
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Complete Hotel Management Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive system handles every aspect of hotel operations with modern, touch-friendly interfaces
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="card-luxury text-center">
                  <CardContent className="p-8">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto">
                        <Icon className="h-8 w-8 text-accent-foreground" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Room Types Section */}
      <section id="rooms" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Available Rooms
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose from our selection of elegantly appointed rooms and suites
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="card-luxury overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {availableRooms.map((room) => (
                <Card key={room.id} className="card-luxury overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Bed className="h-16 w-16 text-primary/40" />
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
                  <CardContent>
                    {room.description && (
                      <p className="text-sm text-muted-foreground mb-4">{room.description}</p>
                    )}
                    
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="space-y-2 mb-6">
                        {room.amenities.slice(0, 4).map((amenity, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-accent" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                        {room.amenities.length > 4 && (
                          <div className="text-sm text-muted-foreground">
                            +{room.amenities.length - 4} more amenities
                          </div>
                        )}
                      </div>
                    )}
                    <Button className="w-full button-luxury" asChild>
                      <a href={`/book?room=${room.id}`}>Book Now</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No rooms currently available</h3>
                <p className="text-muted-foreground mb-6">
                  All our rooms are currently occupied. Please check back later or contact us for assistance.
                </p>
                <Button asChild>
                  <a href="/rooms">View All Rooms</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {availableRooms.length > 0 && (
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <a href="/rooms">
                  View All Rooms
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              World-Class Amenities
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for a perfect stay
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {amenities.map((amenity, index) => {
              const Icon = amenity.icon;
              return (
                <Card key={index} className="card-luxury text-center p-6">
                  <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <p className="font-medium text-sm">{amenity.name}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Management System Demo */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Try Our Management System
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience the power of our comprehensive hotel management platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-luxury p-8 text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Hotel Services Demo</h3>
              <p className="text-muted-foreground mb-6">
                Try our touch-friendly point of sale system designed for restaurants, bars, and retail operations
              </p>
              <Button className="button-luxury" asChild>
                <a href="/pos">
                  Try Hotel Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Card>
            
            <Card className="card-luxury p-8 text-center">
              <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Hotel className="h-10 w-10 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Admin Dashboard</h3>
              <p className="text-muted-foreground mb-6">
                Explore our comprehensive dashboard for managing bookings, rooms, guests, and operations
              </p>
              <Button className="button-luxury" asChild>
                <a href="/auth">
                  Access Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-muted-foreground">
              Ready to experience luxury? Contact us today
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="card-luxury text-center p-6">
              <Phone className="h-8 w-8 text-accent mx-auto mb-4" />
              <h3 className="font-bold mb-2">Phone</h3>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
            </Card>
            
            <Card className="card-luxury text-center p-6">
              <Mail className="h-8 w-8 text-accent mx-auto mb-4" />
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-muted-foreground">info@luxestay.com</p>
            </Card>
            
            <Card className="card-luxury text-center p-6">
              <MapPin className="h-8 w-8 text-accent mx-auto mb-4" />
              <h3 className="font-bold mb-2">Address</h3>
              <p className="text-muted-foreground">123 Luxury Ave<br />Downtown, NY 10001</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-accent rounded-lg">
                <Hotel className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{settings.hotel_name}</h3>
                <p className="text-sm opacity-80">Management System</p>
              </div>
            </div>
            <p className="opacity-80">
              © 2024 {settings.hotel_name} Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;