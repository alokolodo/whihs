import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Sofa, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddHallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (hallData: {
    name: string;
    venue_type: 'hall' | 'lounge';
    location: string;
    capacity: number;
    rate: number;
    rate_type: 'hourly' | 'daily';
    amenities: string[];
    availability: 'available' | 'booked' | 'maintenance';
  }) => void;
}

export const AddHallModal = ({ open, onOpenChange, onAdd }: AddHallModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [venueType, setVenueType] = useState<'hall' | 'lounge'>('hall');
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [rate, setRate] = useState("");
  const [rateType, setRateType] = useState<'hourly' | 'daily'>('hourly');
  const [availability, setAvailability] = useState<'available' | 'booked' | 'maintenance'>('available');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");

  const commonAmenities = [
    "WiFi",
    "Air Conditioning",
    "Projector",
    "Sound System",
    "Whiteboard",
    "Tables & Chairs",
    "Stage",
    "Kitchen Access",
    "Parking",
    "Restrooms",
    "Catering Service",
    "Bar Service"
  ];

  const handleAddAmenity = (amenity: string) => {
    if (amenity.trim() && !amenities.includes(amenity.trim())) {
      setAmenities([...amenities, amenity.trim()]);
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const handleSubmit = () => {
    if (!name.trim() || !location.trim() || !capacity || !rate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const capacityNum = parseInt(capacity);
    const rateNum = parseFloat(rate);

    if (capacityNum <= 0 || rateNum <= 0) {
      toast({
        title: "Invalid Values",
        description: "Capacity and rate must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      name: name.trim(),
      venue_type: venueType,
      location: location.trim(),
      capacity: capacityNum,
      rate: rateNum,
      rate_type: rateType,
      amenities,
      availability,
    });

    // Reset form
    setName("");
    setVenueType('hall');
    setLocation("");
    setCapacity("");
    setRate("");
    setRateType('hourly');
    setAvailability('available');
    setAmenities([]);
    setNewAmenity("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Hall or Lounge</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Venue Type */}
          <div className="space-y-2">
            <Label>Venue Type *</Label>
            <Select value={venueType} onValueChange={(value: 'hall' | 'lounge') => setVenueType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hall">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Hall (Large Events)
                  </div>
                </SelectItem>
                <SelectItem value="lounge">
                  <div className="flex items-center gap-2">
                    <Sofa className="h-4 w-4" />
                    Lounge (Intimate Gatherings)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Venue Name *</Label>
            <Input
              id="name"
              placeholder={`e.g., ${venueType === 'hall' ? 'Grand Ballroom' : 'Executive Lounge'}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Ground Floor, East Wing"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Capacity and Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (People) *</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g., 100"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate Amount *</Label>
              <Input
                id="rate"
                type="number"
                placeholder="e.g., 150"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>Rate Type *</Label>
              <Select value={rateType} onValueChange={(value: 'hourly' | 'daily') => setRateType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Per Hour</SelectItem>
                  <SelectItem value="daily">Per Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Availability Status */}
          <div className="space-y-2">
            <Label>Initial Status</Label>
            <Select value={availability} onValueChange={(value: any) => setAvailability(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="maintenance">Under Maintenance</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label>Amenities & Features</Label>
            
            {/* Quick Select Common Amenities */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Quick Add:</div>
              <div className="flex flex-wrap gap-2">
                {commonAmenities.map((amenity) => (
                  <Button
                    key={amenity}
                    type="button"
                    size="sm"
                    variant={amenities.includes(amenity) ? "default" : "outline"}
                    onClick={() => {
                      if (amenities.includes(amenity)) {
                        handleRemoveAmenity(amenity);
                      } else {
                        handleAddAmenity(amenity);
                      }
                    }}
                    className="text-xs"
                  >
                    {amenity}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amenity Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom amenity"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity(newAmenity);
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => handleAddAmenity(newAmenity)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Amenities */}
            {amenities.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Selected Amenities:</div>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="pr-1">
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(amenity)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <div className="text-sm font-medium">Preview:</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium capitalize">{venueType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Capacity:</span>
                <span className="ml-2 font-medium">{capacity || '0'} people</span>
              </div>
              <div>
                <span className="text-muted-foreground">Rate:</span>
                <span className="ml-2 font-medium">{rate || '0'}/{rateType === 'hourly' ? 'hr' : 'day'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Amenities:</span>
                <span className="ml-2 font-medium">{amenities.length}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add {venueType === 'hall' ? 'Hall' : 'Lounge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
