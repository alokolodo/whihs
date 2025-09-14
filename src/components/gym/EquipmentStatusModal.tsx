import { useState } from "react";
import { Dumbbell, Settings, Wrench, CheckCircle, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: "available" | "in-use" | "maintenance";
  location: string;
  lastMaintenance: string;
  currentUser?: string;
}

interface EquipmentStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment;
}

const EquipmentStatusModal = ({ open, onOpenChange, equipment: initialEquipment }: EquipmentStatusModalProps) => {
  const { toast } = useToast();
  
  const [equipmentList] = useState<Equipment[]>([
    {
      id: "1",
      name: "Treadmill #1",
      category: "Cardio",
      status: "in-use",
      location: "Cardio Zone",
      lastMaintenance: "2024-01-10",
      currentUser: "John Smith"
    },
    {
      id: "2",
      name: "Bench Press",
      category: "Strength",
      status: "available",
      location: "Weight Room",
      lastMaintenance: "2024-01-08"
    },
    {
      id: "3",
      name: "Rowing Machine",
      category: "Cardio",
      status: "maintenance",
      location: "Cardio Zone",
      lastMaintenance: "2024-01-05"
    },
    {
      id: "4",
      name: "Leg Press",
      category: "Strength",
      status: "available",
      location: "Weight Room",
      lastMaintenance: "2024-01-12"
    },
    {
      id: "5",
      name: "Elliptical #2",
      category: "Cardio",
      status: "in-use",
      location: "Cardio Zone",
      lastMaintenance: "2024-01-09",
      currentUser: "Sarah Johnson"
    }
  ]);

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(initialEquipment || null);
  const [updateData, setUpdateData] = useState({
    newStatus: "",
    notes: "",
    estimatedTime: "",
    maintenanceType: ""
  });

  const statusOptions = [
    { value: "available", label: "Available", icon: CheckCircle, color: "bg-green-500" },
    { value: "in-use", label: "In Use", icon: Clock, color: "bg-blue-500" },
    { value: "maintenance", label: "Maintenance", icon: Wrench, color: "bg-red-500" }
  ];

  const maintenanceTypes = [
    "Routine Maintenance",
    "Repair",
    "Deep Cleaning",
    "Safety Inspection",
    "Calibration",
    "Parts Replacement"
  ];

  const handleEquipmentSelect = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setUpdateData({
      newStatus: equipment.status,
      notes: "",
      estimatedTime: "",
      maintenanceType: ""
    });
  };

  const handleStatusUpdate = () => {
    if (!selectedEquipment || !updateData.newStatus) {
      toast({
        title: "Missing Information",
        description: "Please select equipment and new status",
        variant: "destructive",
      });
      return;
    }

    const statusLabel = statusOptions.find(s => s.value === updateData.newStatus)?.label;
    
    toast({
      title: "Status Updated",
      description: `${selectedEquipment.name} status changed to ${statusLabel}`,
    });

    // Reset form
    setUpdateData({
      newStatus: "",
      notes: "",
      estimatedTime: "",
      maintenanceType: ""
    });
    setSelectedEquipment(null);
  };

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    if (!statusOption) return CheckCircle;
    return statusOption.icon;
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || "bg-gray-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Equipment Status Management
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipment List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Equipment</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {equipmentList.map((equipment) => {
                const StatusIcon = getStatusIcon(equipment.status);
                return (
                  <Card 
                    key={equipment.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedEquipment?.id === equipment.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleEquipmentSelect(equipment)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Dumbbell className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-semibold">{equipment.name}</h4>
                            <p className="text-sm text-muted-foreground">{equipment.category} • {equipment.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={`${getStatusColor(equipment.status)} text-white`}>
                            {equipment.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {equipment.currentUser && (
                        <div className="text-xs text-muted-foreground">
                          Current user: {equipment.currentUser}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        Last maintenance: {equipment.lastMaintenance}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Status Update Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Update Status</h3>
            
            {selectedEquipment ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      {selectedEquipment.name}
                    </CardTitle>
                    <CardDescription>
                      Current Status: 
                      <Badge className={`ml-2 ${getStatusColor(selectedEquipment.status)} text-white`}>
                        {selectedEquipment.status}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div>
                  <Label htmlFor="newStatus">New Status *</Label>
                  <Select value={updateData.newStatus} onValueChange={(value) => setUpdateData(prev => ({ ...prev, newStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => {
                        const Icon = status.icon;
                        return (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {status.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {updateData.newStatus === "maintenance" && (
                  <>
                    <div>
                      <Label htmlFor="maintenanceType">Maintenance Type</Label>
                      <Select value={updateData.maintenanceType} onValueChange={(value) => setUpdateData(prev => ({ ...prev, maintenanceType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select maintenance type" />
                        </SelectTrigger>
                        <SelectContent>
                          {maintenanceTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="estimatedTime">Estimated Completion Time</Label>
                      <Input
                        id="estimatedTime"
                        type="datetime-local"
                        value={updateData.estimatedTime}
                        onChange={(e) => setUpdateData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={updateData.notes}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes or details about the status change..."
                    rows={3}
                  />
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Equipment Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span>{selectedEquipment.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{selectedEquipment.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Maintenance:</span>
                        <span>{selectedEquipment.lastMaintenance}</span>
                      </div>
                      {selectedEquipment.currentUser && (
                        <div className="flex justify-between">
                          <span>Current User:</span>
                          <span>{selectedEquipment.currentUser}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select equipment from the list to update its status</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} disabled={!selectedEquipment || !updateData.newStatus}>
            <Settings className="h-4 w-4 mr-2" />
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentStatusModal;