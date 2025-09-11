import { Calendar, Clock, Users, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImage from "@/assets/hero-hotel.jpg";

const BookingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <header className="bg-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">LuxeStay Hotel</h1>
                <p className="text-sm text-muted-foreground">Book Your Perfect Stay</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <a href="/">Home</a>
              </Button>
              <Button variant="ghost">Rooms</Button>
              <Button variant="ghost">Amenities</Button>
              <Button variant="ghost">Contact</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Luxury hotel lobby" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-primary-foreground">
              <h2 className="text-4xl font-bold mb-4">Experience Luxury</h2>
              <p className="text-xl opacity-90">Book your perfect stay with world-class amenities and exceptional service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="text-2xl">Make a Reservation</CardTitle>
                <CardDescription>Fill in your details to book your stay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkin">Check-in Date</Label>
                    <Input type="date" id="checkin" className="touch-target" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout">Check-out Date</Label>
                    <Input type="date" id="checkout" className="touch-target" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Select>
                      <SelectTrigger className="touch-target">
                        <SelectValue placeholder="Select guests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Guest</SelectItem>
                        <SelectItem value="2">2 Guests</SelectItem>
                        <SelectItem value="3">3 Guests</SelectItem>
                        <SelectItem value="4">4 Guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-type">Room Type</Label>
                    <Select>
                      <SelectTrigger className="touch-target">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Room</SelectItem>
                        <SelectItem value="deluxe">Deluxe Room</SelectItem>
                        <SelectItem value="suite">Executive Suite</SelectItem>
                        <SelectItem value="king">King Size Room</SelectItem>
                        <SelectItem value="queen">Queen Size Room</SelectItem>
                        <SelectItem value="twin">Twin Beds Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" className="touch-target" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" placeholder="your@email.com" className="touch-target" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input type="tel" id="phone" placeholder="+1 (555) 000-0000" className="touch-target" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requests">Special Requests</Label>
                  <Textarea id="requests" placeholder="Any special requests or preferences..." className="min-h-24" />
                </div>

                <Button className="w-full button-luxury text-lg py-6">
                  Book Room
                </Button>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Or Book Event Hall</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Event Date</Label>
                      <Input type="date" id="event-date" className="touch-target" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hall-type">Hall Type</Label>
                      <Select>
                        <SelectTrigger className="touch-target">
                          <SelectValue placeholder="Select hall" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ballroom">Grand Ballroom</SelectItem>
                          <SelectItem value="conference">Conference Hall</SelectItem>
                          <SelectItem value="banquet">Banquet Hall</SelectItem>
                          <SelectItem value="meeting">Meeting Room</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full button-luxury text-lg py-6" variant="outline">
                    Book Event Hall
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hotel Information */}
            <div className="space-y-6">
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>Hotel Amenities</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-sm">24/7 Concierge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Event Spaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Spa & Wellness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Prime Location</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-accent" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-accent" />
                    <span>reservations@luxestay.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>123 Luxury Avenue, Downtown, NY 10001</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingPage;