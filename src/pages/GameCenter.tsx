import { useState } from "react";
import { 
  Gamepad2,
  Users,
  Clock,
  Trophy,
  Play,
  Pause,
  Square,
  Timer,
  DollarSign,
  Plus,
  Settings,
  Monitor,
  Joystick,
  Crown,
  Target,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import CreateTournamentModal from "@/components/game/CreateTournamentModal";
import NewBookingModal from "@/components/game/NewBookingModal";
import StartSessionModal from "@/components/game/StartSessionModal";
import LeaderboardModal from "@/components/game/LeaderboardModal";

interface GameStation {
  id: string;
  name: string;
  type: "console" | "pc" | "vr" | "arcade";
  status: "available" | "occupied" | "maintenance" | "reserved";
  currentPlayer?: string;
  timeRemaining?: number;
  hourlyRate: number;
  games: string[];
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  prizePool: number;
  status: "upcoming" | "active" | "completed";
}

interface Booking {
  id: string;
  stationId: string;
  stationName: string;
  playerName: string;
  startTime: string;
  duration: number;
  totalAmount: number;
  status: "active" | "completed" | "cancelled";
}

const GameCenter = () => {
  const [stations] = useState<GameStation[]>([
    {
      id: "1",
      name: "PlayStation 5 #1",
      type: "console",
      status: "occupied",
      currentPlayer: "Alex Johnson",
      timeRemaining: 45,
      hourlyRate: 25,
      games: ["FIFA 24", "Call of Duty", "Spider-Man", "Gran Turismo"]
    },
    {
      id: "2", 
      name: "Gaming PC #1",
      type: "pc",
      status: "available",
      hourlyRate: 30,
      games: ["Valorant", "League of Legends", "Counter-Strike", "Fortnite"]
    },
    {
      id: "3",
      name: "VR Station #1", 
      type: "vr",
      status: "occupied",
      currentPlayer: "Sarah Chen",
      timeRemaining: 25,
      hourlyRate: 40,
      games: ["Beat Saber", "Half-Life Alyx", "Job Simulator"]
    },
    {
      id: "4",
      name: "Arcade Fighter #1",
      type: "arcade", 
      status: "maintenance",
      hourlyRate: 15,
      games: ["Street Fighter 6", "Tekken 8", "Mortal Kombat"]
    },
    {
      id: "5",
      name: "Xbox Series X #1",
      type: "console",
      status: "reserved", 
      hourlyRate: 25,
      games: ["Halo Infinite", "Forza Horizon", "Gears of War"]
    },
    {
      id: "6",
      name: "Gaming PC #2",
      type: "pc",
      status: "available",
      hourlyRate: 30, 
      games: ["World of Warcraft", "Cyberpunk 2077", "The Witcher 3"]
    }
  ]);

  const [tournaments] = useState<Tournament[]>([
    {
      id: "1",
      name: "FIFA 24 Championship", 
      game: "FIFA 24",
      date: "2024-01-25",
      time: "19:00",
      participants: 12,
      maxParticipants: 16,
      prizePool: 500,
      status: "upcoming"
    },
    {
      id: "2",
      name: "Valorant Tournament",
      game: "Valorant",
      date: "2024-01-22", 
      time: "18:00",
      participants: 8,
      maxParticipants: 10,
      prizePool: 750,
      status: "active"
    },
    {
      id: "3", 
      name: "Street Fighter Battle",
      game: "Street Fighter 6",
      date: "2024-01-20",
      time: "20:00", 
      participants: 16,
      maxParticipants: 16,
      prizePool: 300,
      status: "completed"
    }
  ]);

  const [bookings] = useState<Booking[]>([
    {
      id: "1",
      stationId: "1",
      stationName: "PlayStation 5 #1",
      playerName: "Alex Johnson",
      startTime: "14:30",
      duration: 120,
      totalAmount: 50,
      status: "active"
    },
    {
      id: "2", 
      stationId: "3",
      stationName: "VR Station #1", 
      playerName: "Sarah Chen",
      startTime: "15:00",
      duration: 60,
      totalAmount: 40,
      status: "active"
    }
  ]);

  const [activeTab, setActiveTab] = useState("stations");

  // Modal states
  const [createTournamentOpen, setCreateTournamentOpen] = useState(false);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [startSessionOpen, setStartSessionOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<GameStation | null>(null);

  const stationTypeColors = {
    console: "bg-blue-500",
    pc: "bg-green-500", 
    vr: "bg-purple-500",
    arcade: "bg-orange-500"
  };

  const statusColors = {
    available: "bg-green-500",
    occupied: "bg-red-500",
    maintenance: "bg-yellow-500",
    reserved: "bg-blue-500",
    upcoming: "bg-blue-500",
    active: "bg-green-500", 
    completed: "bg-gray-500",
    cancelled: "bg-red-500"
  };

  const getStationStats = () => {
    return {
      total: stations.length,
      available: stations.filter(s => s.status === "available").length,
      occupied: stations.filter(s => s.status === "occupied").length,
      maintenance: stations.filter(s => s.status === "maintenance").length,
    };
  };

  const getTournamentStats = () => {
    return {
      total: tournaments.length,
      upcoming: tournaments.filter(t => t.status === "upcoming").length,
      active: tournaments.filter(t => t.status === "active").length,
      completed: tournaments.filter(t => t.status === "completed").length,
    };
  };

  const stationStats = getStationStats();
  const tournamentStats = getTournamentStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Game Center</h1>
          <p className="text-muted-foreground">Manage gaming stations, tournaments, and bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreateTournamentOpen(true)}>
            <Trophy className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
          <Button onClick={() => setNewBookingOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="space-y-6">
          {/* Station Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stationStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Stations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stationStats.available}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{stationStats.occupied}</div>
                <div className="text-sm text-muted-foreground">Occupied</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stationStats.maintenance}</div>
                <div className="text-sm text-muted-foreground">Maintenance</div>
              </CardContent>
            </Card>
          </div>

          {/* Stations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => (
              <Card key={station.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {station.type === "console" && <Gamepad2 className="h-5 w-5" />}
                      {station.type === "pc" && <Monitor className="h-5 w-5" />}
                      {station.type === "vr" && <Joystick className="h-5 w-5" />}
                      {station.type === "arcade" && <Gamepad2 className="h-5 w-5" />}
                      {station.name}
                    </CardTitle>
                    <Badge className={`${statusColors[station.status]} text-white`}>
                      {station.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${stationTypeColors[station.type]} text-white`}>
                      {station.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ${station.hourlyRate}/hour
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {station.currentPlayer && (
                      <div>
                        <div className="text-sm text-muted-foreground">Current Player:</div>
                        <div className="font-medium">{station.currentPlayer}</div>
                        {station.timeRemaining && (
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Time Remaining</span>
                              <span>{station.timeRemaining} min</span>
                            </div>
                            <Progress value={(station.timeRemaining / 120) * 100} className="h-2" />
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Available Games:</div>
                      <div className="flex flex-wrap gap-1">
                        {station.games.slice(0, 3).map((game) => (
                          <Badge key={game} variant="secondary" className="text-xs">
                            {game}
                          </Badge>
                        ))}
                        {station.games.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{station.games.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {station.status === "occupied" ? (
                        <>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1">
                            <Square className="h-4 w-4" />
                          </Button>
                        </>
                      ) : station.status === "available" ? (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setSelectedStation(station);
                            setStartSessionOpen(true);
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Session
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-6">
          {/* Tournament Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{tournamentStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Tournaments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{tournamentStats.upcoming}</div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{tournamentStats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">{tournamentStats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Tournaments List */}
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <Card key={tournament.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{tournament.name}</h3>
                        <Badge className={`${statusColors[tournament.status]} text-white`}>
                          {tournament.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Game: </span>
                          <span className="font-medium">{tournament.game}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date & Time: </span>
                          <span className="font-medium">{tournament.date} {tournament.time}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Participants: </span>
                          <span className="font-medium">
                            {tournament.participants}/{tournament.maxParticipants}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prize Pool: </span>
                          <span className="font-medium">${tournament.prizePool}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">${tournament.prizePool}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {tournament.status === "upcoming" && (
                          <Button size="sm">
                            Join Tournament
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          {/* Active Bookings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Bookings</h3>
            {bookings.filter(b => b.status === "active").map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h4 className="font-semibold">{booking.stationName}</h4>
                        <Badge className={`${statusColors[booking.status]} text-white`}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Player: </span>
                          <span className="font-medium">{booking.playerName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Start Time: </span>
                          <span className="font-medium">{booking.startTime}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration: </span>
                          <span className="font-medium">{booking.duration} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-xl font-bold">${booking.totalAmount}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Extend Time
                        </Button>
                        <Button size="sm" variant="destructive">
                          End Session
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
                <p className="text-muted-foreground">Player rankings and statistics would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leaderboard" className="space-y-6">
          {/* Leaderboard Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Gaming Leaderboard</h2>
              <p className="text-muted-foreground">Top players and gaming statistics</p>
            </div>
            <Button onClick={() => setLeaderboardOpen(true)}>
              <Crown className="h-4 w-4 mr-2" />
              Full Leaderboard
            </Button>
          </div>

          {/* Top Players Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center border-yellow-500 bg-yellow-50">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle>Alex Rodriguez</CardTitle>
                <CardDescription>#1 Champion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">24</div>
                <div className="text-sm text-muted-foreground">Tournament Wins</div>
                <Badge className="mt-2 bg-yellow-500 text-white">85% Win Rate</Badge>
              </CardContent>
            </Card>

            <Card className="text-center border-gray-400 bg-gray-50">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Crown className="h-8 w-8 text-gray-400" />
                </div>
                <CardTitle>Sarah Chen</CardTitle>
                <CardDescription>#2 Runner-up</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">22</div>
                <div className="text-sm text-muted-foreground">Tournament Wins</div>
                <Badge className="mt-2 bg-gray-400 text-white">78% Win Rate</Badge>
              </CardContent>
            </Card>

            <Card className="text-center border-amber-600 bg-amber-50">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Target className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle>Mike Johnson</CardTitle>
                <CardDescription>#3 Third Place</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">19</div>
                <div className="text-sm text-muted-foreground">Tournament Wins</div>
                <Badge className="mt-2 bg-amber-600 text-white">82% Win Rate</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Gaming Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">127</div>
                <div className="text-sm text-muted-foreground">Active Players</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">48</div>
                <div className="text-sm text-muted-foreground">Tournaments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">1,456</div>
                <div className="text-sm text-muted-foreground">Hours Played</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">89%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTournamentModal 
        open={createTournamentOpen} 
        onOpenChange={setCreateTournamentOpen}
      />
      
      <NewBookingModal 
        open={newBookingOpen} 
        onOpenChange={setNewBookingOpen}
      />
      
      <StartSessionModal 
        open={startSessionOpen} 
        onOpenChange={setStartSessionOpen}
        station={selectedStation || undefined}
      />
      
      <LeaderboardModal 
        open={leaderboardOpen} 
        onOpenChange={setLeaderboardOpen}
      />
    </div>
  );
};

export default GameCenter;