import { useState } from "react";
import { UserCheck, Search, Clock, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  membershipType: string;
  status: string;
  expiryDate: string;
  lastCheckIn?: string;
}

interface MemberCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MemberCheckInModal = ({ open, onOpenChange }: MemberCheckInModalProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  const mockMembers: Member[] = [
    {
      id: "1",
      name: "John Smith",
      membershipType: "monthly",
      status: "active",
      expiryDate: "2024-02-15",
      lastCheckIn: "2024-01-10 14:30"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      membershipType: "yearly",
      status: "active",
      expiryDate: "2024-12-01",
      lastCheckIn: "2024-01-12 09:15"
    },
    {
      id: "3",
      name: "Mike Wilson",
      membershipType: "day-pass",
      status: "expired",
      expiryDate: "2024-01-15"
    }
  ];

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.id.includes(searchQuery)
  );

  const handleCheckIn = (member: Member) => {
    if (member.status === "expired") {
      toast({
        title: "Membership Expired",
        description: `${member.name}'s membership expired on ${member.expiryDate}`,
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const checkInTime = now.toLocaleString();
    
    toast({
      title: "Check-in Successful",
      description: `${member.name} checked in at ${checkInTime}`,
    });

    // Update member's last check-in (in real app, this would update the database)
    setSelectedMember(null);
    setSearchQuery("");
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case "day-pass": return "bg-blue-500";
      case "monthly": return "bg-green-500";
      case "yearly": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "expired": return "bg-red-500";
      case "suspended": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Member Check-In
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by member name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Access Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSearchQuery("John")}
            >
              Quick: John Smith
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSearchQuery("Sarah")}
            >
              Quick: Sarah Johnson
            </Button>
          </div>

          {/* Member List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredMembers.length === 0 && searchQuery && (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  No members found matching "{searchQuery}"
                </CardContent>
              </Card>
            )}

            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {member.id}</p>
                        {member.lastCheckIn && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last check-in: {member.lastCheckIn}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge className={`${getMembershipColor(member.membershipType)} text-white mb-1`}>
                          {member.membershipType}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Expires: {member.expiryDate}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(member.status)} text-white`}>
                          {member.status}
                        </Badge>
                        
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(member)}
                          disabled={member.status === "expired"}
                          className="min-w-[100px]"
                        >
                          {member.status === "expired" ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Expired
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Check In
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Check-ins */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Recent Check-ins</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>John Smith</span>
                  <span className="text-muted-foreground">2 minutes ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Emma Davis</span>
                  <span className="text-muted-foreground">5 minutes ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Chris Brown</span>
                  <span className="text-muted-foreground">8 minutes ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberCheckInModal;