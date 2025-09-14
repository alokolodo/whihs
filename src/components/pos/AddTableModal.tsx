import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRestaurantTables } from "@/hooks/useRestaurantTables";

interface AddTableModalProps {
  onClose: () => void;
}

const AddTableModal = ({ onClose }: AddTableModalProps) => {
  const [tableNumber, setTableNumber] = useState("");
  const [seats, setSeats] = useState("4");
  const [loading, setLoading] = useState(false);
  const { addTable } = useRestaurantTables();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableNumber.trim()) return;

    setLoading(true);
    try {
      await addTable(tableNumber.trim(), parseInt(seats) || 4);
      onClose();
    } catch (error) {
      console.error('Error adding table:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-40 flex items-center justify-center">
      <Card className="w-96 bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Add New Table</h3>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Enter table number"
                required
                autoFocus
              />
            </div>
            
            <div>
              <Label htmlFor="seats">Number of Seats</Label>
              <Input
                id="seats"
                type="number"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                placeholder="Number of seats"
                min="1"
                max="20"
                required
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !tableNumber.trim()}
                className="flex-1"
              >
                {loading ? "Adding..." : "Add Table"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AddTableModal;