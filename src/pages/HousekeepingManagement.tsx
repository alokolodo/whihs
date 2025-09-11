import { useState } from "react";
import { 
  Bed, 
  CheckCircle, 
  Clock, 
  User, 
  Trash2, 
  Droplets, 
  Shirt, 
  Coffee,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface HousekeepingTask {
  id: string;
  roomNumber: string;
  taskType: "cleaning" | "maintenance" | "laundry" | "inspection";
  status: "pending" | "in-progress" | "completed" | "overdue";
  assignedTo: string;
  priority: "low" | "medium" | "high" | "urgent";
  estimatedTime: number;
  description: string;
  completedAt?: string;
  notes?: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  isAvailable: boolean;
  currentTasks: number;
}

const HousekeepingManagement = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const [tasks, setTasks] = useState<HousekeepingTask[]>([
    {
      id: "1",
      roomNumber: "201",
      taskType: "cleaning",
      status: "pending",
      assignedTo: "Maria Santos",
      priority: "high",
      estimatedTime: 45,
      description: "Standard room cleaning after checkout"
    },
    {
      id: "2",
      roomNumber: "305",
      taskType: "maintenance",
      status: "in-progress",
      assignedTo: "John Smith",
      priority: "urgent",
      estimatedTime: 120,
      description: "Fix air conditioning unit"
    },
    {
      id: "3",
      roomNumber: "102",
      taskType: "laundry",
      status: "completed",
      assignedTo: "Sarah Johnson",
      priority: "medium",
      estimatedTime: 30,
      description: "Collect and replace linens",
      completedAt: "2025-01-11 14:30"
    },
    {
      id: "4",
      roomNumber: "408",
      taskType: "inspection",
      status: "overdue",
      assignedTo: "Mike Wilson",
      priority: "high",
      estimatedTime: 20,
      description: "Weekly room inspection"
    }
  ]);

  const [staff, setStaff] = useState<Staff[]>([
    { id: "1", name: "Maria Santos", role: "Head Housekeeper", isAvailable: true, currentTasks: 3 },
    { id: "2", name: "Sarah Johnson", role: "Housekeeper", isAvailable: true, currentTasks: 2 },
    { id: "3", name: "John Smith", role: "Maintenance", isAvailable: false, currentTasks: 1 },
    { id: "4", name: "Mike Wilson", role: "Supervisor", isAvailable: true, currentTasks: 1 },
    { id: "5", name: "Lisa Chen", role: "Laundry Staff", isAvailable: true, currentTasks: 0 }
  ]);

  const taskTypeIcons = {
    cleaning: Droplets,
    maintenance: AlertCircle,
    laundry: Shirt,
    inspection: CheckCircle
  };

  const statusColors = {
    pending: "bg-yellow-500",
    "in-progress": "bg-blue-500",
    completed: "bg-green-500",
    overdue: "bg-red-500"
  };

  const priorityColors = {
    low: "bg-gray-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    urgent: "bg-red-500"
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.roomNumber.includes(searchTerm) || 
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesType = filterType === "all" || task.taskType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus as any,
            completedAt: newStatus === "completed" ? new Date().toLocaleString() : undefined
          }
        : task
    ));
    
    toast({
      title: "Task Updated",
      description: `Task status updated to ${newStatus}`,
    });
  };

  const getDashboardStats = () => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === "pending").length;
    const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const overdueTasks = tasks.filter(t => t.status === "overdue").length;
    const availableStaff = staff.filter(s => s.isAvailable).length;
    
    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      availableStaff,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const stats = getDashboardStats();

  const TaskCard = ({ task }: { task: HousekeepingTask }) => {
    const TaskIcon = taskTypeIcons[task.taskType];
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${statusColors[task.status]} text-white`}>
                <TaskIcon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm">Room {task.roomNumber}</CardTitle>
                <CardDescription className="text-xs capitalize">
                  {task.taskType.replace("-", " ")}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`${priorityColors[task.priority]} text-white border-0`}
            >
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {task.assignedTo}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedTime}min
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${statusColors[task.status]} text-white border-0 text-xs`}
              >
                {task.status.replace("-", " ")}
              </Badge>
              
              {task.status !== "completed" && (
                <div className="flex gap-1 ml-auto">
                  {task.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTaskStatus(task.id, "in-progress")}
                      className="h-6 px-2 text-xs"
                    >
                      Start
                    </Button>
                  )}
                  {task.status === "in-progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTaskStatus(task.id, "completed")}
                      className="h-6 px-2 text-xs"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {task.completedAt && (
              <div className="text-xs text-muted-foreground">
                Completed: {task.completedAt}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Housekeeping Management</h1>
          <p className="text-muted-foreground">
            Manage room cleaning, maintenance, and housekeeping operations
          </p>
        </div>
        
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button className="button-luxury">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Housekeeping Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input placeholder="e.g., 201" />
                </div>
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="laundry">Laundry</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.filter(s => s.isAvailable).map(person => (
                        <SelectItem key={person.id} value={person.name}>
                          {person.name} ({person.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Task description..." />
              </div>
              
              <div className="space-y-2">
                <Label>Estimated Time (minutes)</Label>
                <Input type="number" placeholder="30" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddTaskOpen(false)}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.availableStaff}</div>
                <p className="text-xs text-muted-foreground">Available Staff</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <Progress value={stats.completionRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Latest housekeeping activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.slice(0, 6).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="laundry">Laundry</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map(person => (
              <Card key={person.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{person.name}</CardTitle>
                      <CardDescription>{person.role}</CardDescription>
                    </div>
                    <Badge 
                      variant={person.isAvailable ? "default" : "secondary"}
                      className={person.isAvailable ? "bg-green-500" : "bg-gray-500"}
                    >
                      {person.isAvailable ? "Available" : "Busy"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Tasks:</span>
                      <span className="font-medium">{person.currentTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <span className={`text-sm font-medium ${
                        person.isAvailable ? "text-green-600" : "text-red-600"
                      }`}>
                        {person.isAvailable ? "Ready for tasks" : "Currently assigned"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Schedule</CardTitle>
              <CardDescription>Housekeeping schedule for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.filter(t => t.status !== "completed").map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">Room {task.roomNumber}</div>
                      <Badge variant="outline">{task.taskType}</Badge>
                      <div className="text-sm text-muted-foreground">
                        Assigned to {task.assignedTo}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{task.estimatedTime}min</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HousekeepingManagement;