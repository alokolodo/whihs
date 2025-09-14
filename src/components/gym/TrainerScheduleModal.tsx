import { useState } from "react";
import { Calendar, Clock, User, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TrainerSession {
  id: string;
  memberName: string;
  sessionType: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

interface Trainer {
  id: string;
  name: string;
  specialization: string[];
  hourlyRate: number;
  availability: string;
  rating: number;
}

interface TrainerScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer?: Trainer;
}

const TrainerScheduleModal = ({ open, onOpenChange, trainer: initialTrainer }: TrainerScheduleModalProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTrainer, setSelectedTrainer] = useState<string>(initialTrainer?.id || "1");
  
  const trainers: Trainer[] = [
    {
      id: "1",
      name: "Alex Rodriguez",
      specialization: ["Weight Training", "HIIT"],
      hourlyRate: 80,
      availability: "available",
      rating: 4.9
    },
    {
      id: "2",
      name: "Emma Davis",
      specialization: ["Yoga", "Pilates"],
      hourlyRate: 70,
      availability: "busy",
      rating: 4.8
    },
    {
      id: "3",
      name: "Chris Brown",
      specialization: ["CrossFit", "Cardio"],
      hourlyRate: 75,
      availability: "available",
      rating: 4.7
    }
  ];

  const mockSessions: { [key: string]: TrainerSession[] } = {
    "1": [
      {
        id: "1",
        memberName: "John Smith",
        sessionType: "Weight Training",
        startTime: "09:00",
        endTime: "10:00",
        status: "completed"
      },
      {
        id: "2",
        memberName: "Sarah Johnson",
        sessionType: "HIIT",
        startTime: "11:00",
        endTime: "12:00",
        status: "in-progress"
      },
      {
        id: "3",
        memberName: "Mike Wilson",
        sessionType: "Personal Training",
        startTime: "14:00",
        endTime: "15:30",
        status: "scheduled"
      },
      {
        id: "4",
        memberName: "Lisa Brown",
        sessionType: "Weight Training",
        startTime: "16:00",
        endTime: "17:00",
        status: "scheduled"
      }
    ],
    "2": [
      {
        id: "5",
        memberName: "Emma Wilson",
        sessionType: "Yoga",
        startTime: "08:00",
        endTime: "09:00",
        status: "completed"
      },
      {
        id: "6",
        memberName: "David Lee",
        sessionType: "Pilates",
        startTime: "10:00",
        endTime: "11:00",
        status: "scheduled"
      },
      {
        id: "7",
        memberName: "Anna Garcia",
        sessionType: "Yoga",
        startTime: "15:00",
        endTime: "16:00",
        status: "scheduled"
      }
    ],
    "3": [
      {
        id: "8",
        memberName: "Robert Johnson",
        sessionType: "CrossFit",
        startTime: "07:00",
        endTime: "08:00",
        status: "completed"
      },
      {
        id: "9",
        memberName: "Maria Rodriguez",
        sessionType: "Cardio",
        startTime: "12:00",
        endTime: "13:00",
        status: "in-progress"
      },
      {
        id: "10",
        memberName: "Tom Anderson",
        sessionType: "CrossFit",
        startTime: "18:00",
        endTime: "19:00",
        status: "scheduled"
      }
    ]
  };

  const currentTrainer = trainers.find(t => t.id === selectedTrainer);
  const todaySessions = mockSessions[selectedTrainer] || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "scheduled": return "bg-orange-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getAvailableSlots = () => {
    const allSlots = [
      "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
      "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
    ];
    
    const bookedSlots = todaySessions.map(session => session.startTime);
    return allSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Trainer Schedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trainer Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trainer" />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{trainer.name}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-sm">{trainer.rating}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[200px] text-center">
                <p className="font-semibold">{formatDate(selectedDate)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Trainer Info */}
          {currentTrainer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg">{currentTrainer.name}</h3>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-muted-foreground">{currentTrainer.rating}/5 Rating</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${currentTrainer.hourlyRate}/hr</div>
                    <Badge variant={currentTrainer.availability === "available" ? "default" : "secondary"}>
                      {currentTrainer.availability}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentTrainer.specialization.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Sessions
                </CardTitle>
                <CardDescription>
                  {todaySessions.length} session(s) scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySessions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sessions scheduled for this day</p>
                  </div>
                ) : (
                  todaySessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{session.memberName}</h4>
                            <p className="text-sm text-muted-foreground">{session.sessionType}</p>
                          </div>
                          <Badge className={`${getStatusColor(session.status)} text-white`}>
                            {session.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{session.startTime} - {session.endTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Available Slots */}
            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
                <CardDescription>
                  {getAvailableSlots().length} slot(s) available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableSlots().map((slot) => (
                    <Button
                      key={slot}
                      variant="outline"
                      size="sm"
                      className="justify-center"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
                {getAvailableSlots().length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    <p>No available slots for this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{todaySessions.filter(s => s.status === "completed").length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{todaySessions.filter(s => s.status === "scheduled").length}</div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{todaySessions.filter(s => s.status === "in-progress").length}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{getAvailableSlots().length}</div>
                <div className="text-sm text-muted-foreground">Available Slots</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainerScheduleModal;