import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, X } from "lucide-react";

interface EditGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestId: string;
  guestName: string;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  status: 'active' | 'vip' | 'blacklisted';
  preferences: string[];
  notes: string;
}

const EditGuestModal = ({ open, onOpenChange, guestId, guestName }: EditGuestModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Guest>({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    nationality: "",
    loyaltyTier: 'Bronze',
    status: 'active',
    preferences: [],
    notes: ""
  });
  const [newPreference, setNewPreference] = useState("");

  // Mock data - in real app this would fetch from database
  useEffect(() => {
    if (open && guestId) {
      // Simulate fetching guest data
      setFormData({
        id: guestId,
        name: guestName,
        email: "john.smith@email.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main St, New York, NY 10001",
        nationality: "USA",
        loyaltyTier: 'Gold',
        status: 'vip',
        preferences: ["Non-smoking", "High floor", "City view"],
        notes: "Prefers late checkout, vegetarian meals"
      });
    }
  }, [open, guestId, guestName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically save to database
    toast({
      title: "Profile Updated",
      description: `${formData.name}'s profile has been updated successfully`,
    });
    
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof Guest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPreference = () => {
    if (newPreference.trim() && !formData.preferences.includes(newPreference.trim())) {
      setFormData(prev => ({
        ...prev,
        preferences: [...prev.preferences, newPreference.trim()]
      }));
      setNewPreference("");
    }
  };

  const removePreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.filter(p => p !== preference)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Guest Profile
          </DialogTitle>
          <DialogDescription>
            Update guest information and preferences
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nationality">Nationality</Label>
              <Input
                id="edit-nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-loyalty">Loyalty Tier</Label>
              <Select value={formData.loyaltyTier} onValueChange={(value) => handleInputChange("loyaltyTier", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Preferences</Label>
            <div className="flex gap-2">
              <Input
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
                placeholder="Add new preference"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreference())}
              />
              <Button type="button" onClick={addPreference} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.preferences.map((pref, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {pref}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removePreference(pref)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Additional Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="button-luxury">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGuestModal;