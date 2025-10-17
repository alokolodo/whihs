import { useState, useEffect } from "react";
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
  XCircle,
  Package,
  Edit,
  Play,
  Check
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
import { useHousekeeping } from "@/hooks/useHousekeeping";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface InventoryItem {
  id: string;
  item_name: string;
  current_quantity: number;
  unit: string;
}

interface SupplyRequest {
  item_id: string;
  quantity: number;
}

const HousekeepingManagement = () => {
  const { tasks, loading, createTask, updateTask, startTask, completeTask, deleteTask, issueSupplies } = useHousekeeping();
  const { rooms } = useRoomsDB();
  
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showSuppliesModal, setShowSuppliesModal] = useState(false);
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  
  // New task form state
  const [newTask, setNewTask] = useState({
    room_id: '',
    assigned_to: '',
    task_type: 'cleaning',
    priority: 'medium',
    description: '',
    estimated_duration: 30
  });

  // Fetch employees and inventory
  useEffect(() => {
    const fetchData = async () => {
      const { data: empData } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email')
        .eq('status', 'active');
      
      if (empData) setEmployees(empData);

      const { data: invData } = await supabase
        .from('inventory')
        .select('id, item_name, current_quantity, unit')
        .eq('category', 'housekeeping')
        .gt('current_quantity', 0);
      
      if (invData) setInventory(invData);
    };

    fetchData();
  }, []);

  const taskTypeIcons: any = {
    cleaning: Droplets,
    maintenance: AlertCircle,
    laundry: Shirt,
    inspection: CheckCircle
  };

  const statusColors: any = {
    pending: "bg-yellow-500",
    in_progress: "bg-blue-500",
    completed: "bg-green-500",
    overdue: "bg-red-500"
  };

  const priorityColors: any = {
    low: "bg-gray-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    urgent: "bg-red-500"
  };

  const getRoomNumber = (roomId: string | null) => {
    if (!roomId) return 'N/A';
    const room = rooms.find(r => r.id === roomId);
    return room?.room_number || roomId.substring(0, 8);
  };

  const getEmployeeName = (empId: string | null) => {
    if (!empId) return 'Unassigned';
    const emp = employees.find(e => e.id === empId);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown';
  };

  const filteredTasks = tasks.filter(task => {
    const roomNumber = getRoomNumber(task.room_id);
    const employeeName = getEmployeeName(task.assigned_to);
    
    const matchesSearch = roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesType = filterType === "all" || task.task_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddTask = async () => {
    if (!newTask.room_id || !newTask.assigned_to || !newTask.description) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTask(newTask);
      setIsAddTaskOpen(false);
      setNewTask({
        room_id: '',
        assigned_to: '',
        task_type: 'cleaning',
        priority: 'medium',
        description: '',
        estimated_duration: 30
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTaskForCompletion) return;
    
    const task = tasks.find(t => t.id === selectedTaskForCompletion);
    try {
      await completeTask(selectedTaskForCompletion, task?.room_id || null, completionNotes);
      setSelectedTaskForCompletion(null);
      setCompletionNotes("");
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleIssueSupplies = async () => {
    if (supplyRequests.length === 0) {
      toast({
        title: "No Supplies Selected",
        description: "Please select supplies to issue",
        variant: "destructive"
      });
      return;
    }

    try {
      await issueSupplies(supplyRequests.map(req => ({ ...req, room_number: undefined })));
      setShowSuppliesModal(false);
      setSupplyRequests([]);
    } catch (error) {
      // Error handled in hook
    }
  };

  const getDashboardStats = () => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === "pending").length;
    const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const overdueTasks = tasks.filter(t => t.status === "overdue").length;
    const availableStaff = employees.length;
    
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

  const TaskCard = ({ task }: { task: typeof tasks[0] }) => {
    const TaskIcon = taskTypeIcons[task.task_type] || Droplets;
    const roomNumber = getRoomNumber(task.room_id);
    const employeeName = getEmployeeName(task.assigned_to);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className={`p-1.5 md:p-2 rounded-lg ${statusColors[task.status] || 'bg-gray-500'} text-white shrink-0`}>
                <TaskIcon className="h-3 w-3 md:h-4 md:w-4" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xs md:text-sm truncate">Room {roomNumber}</CardTitle>
                <CardDescription className="text-[10px] md:text-xs capitalize truncate">
                  {task.task_type.replace("_", " ")}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`${priorityColors[task.priority] || 'bg-gray-500'} text-white border-0 text-xs shrink-0`}
            >
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2 md:space-y-3">
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] md:text-xs">
              <span className="flex items-center gap-1 truncate mr-2">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{employeeName}</span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {task.estimated_duration || 30}min
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${statusColors[task.status] || 'bg-gray-500'} text-white border-0 text-xs`}
              >
                {task.status.replace("_", " ")}
              </Badge>
              
              {task.status !== "completed" && (
                <div className="flex gap-1 sm:ml-auto w-full sm:w-auto">
                  {task.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startTask(task.id)}
                      className="h-7 md:h-8 px-2 text-xs flex-1 sm:flex-initial"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {task.status === "in_progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTaskForCompletion(task.id);
                      }}
                      className="h-7 md:h-8 px-2 text-xs flex-1 sm:flex-initial"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTask(task.id)}
                    className="h-7 md:h-8 px-2 text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {task.completed_at && (
              <div className="text-xs text-muted-foreground">
                Completed: {new Date(task.completed_at).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading housekeeping data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Housekeeping Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage room cleaning, maintenance, and operations
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowSuppliesModal(true)}
            className="flex-1 sm:flex-initial"
          >
            <Package className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Supplies</span>
          </Button>
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button className="button-luxury flex-1 sm:flex-initial">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Housekeeping Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Room</Label>
                    <Select value={newTask.room_id} onValueChange={(val) => setNewTask(prev => ({ ...prev, room_id: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.room_number} - {room.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Task Type</Label>
                    <Select value={newTask.task_type} onValueChange={(val) => setNewTask(prev => ({ ...prev, task_type: val }))}>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Select value={newTask.assigned_to} onValueChange={(val) => setNewTask(prev => ({ ...prev, assigned_to: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newTask.priority} onValueChange={(val) => setNewTask(prev => ({ ...prev, priority: val }))}>
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
                  <Textarea 
                    placeholder="Task description..." 
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Estimated Time (minutes)</Label>
                  <Input 
                    type="number" 
                    placeholder="30" 
                    value={newTask.estimated_duration}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleAddTask} className="w-full sm:w-auto">
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
          <TabsTrigger value="staff" className="text-xs sm:text-sm">Staff</TabsTrigger>
          <TabsTrigger value="supplies" className="text-xs sm:text-sm">Supplies</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-bold">{stats.totalTasks}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total Tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pendingTasks}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Overdue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.availableStaff}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Staff</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-bold">{stats.completionRate}%</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Rate</p>
                <Progress value={stats.completionRate} className="mt-2 h-1 md:h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Tasks</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Latest housekeeping activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {tasks.slice(0, 8).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
              {tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No tasks found</p>
                  <p className="text-xs">Create a new task to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40 h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-40 h-10">
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
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks match your filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {employees.map(person => {
              const personTasks = tasks.filter(t => t.assigned_to === person.id);
              const activeTasks = personTasks.filter(t => t.status !== 'completed');
              
              return (
                <Card key={person.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{person.first_name} {person.last_name}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm truncate">{person.email}</CardDescription>
                      </div>
                      <Badge 
                        variant={activeTasks.length === 0 ? "default" : "secondary"}
                        className={activeTasks.length === 0 ? "bg-green-500 shrink-0" : "bg-blue-500 shrink-0"}
                      >
                        {activeTasks.length === 0 ? "Available" : "Busy"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Tasks:</span>
                      <span className="font-medium">{activeTasks.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Tasks:</span>
                      <span className="font-medium">{personTasks.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-medium text-green-600">
                        {personTasks.filter(t => t.status === 'completed').length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {employees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No housekeeping staff found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="supplies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Housekeeping Supplies</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Current inventory available for housekeeping</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {inventory.map(item => (
                  <Card key={item.id} className="border-2">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm truncate mr-2">{item.item_name}</h4>
                        <Package className="h-4 w-4 text-accent shrink-0" />
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">In Stock:</span>
                        <span className="font-bold">{item.current_quantity} {item.unit}</span>
                      </div>
                      <Badge 
                        variant={item.current_quantity > 20 ? "default" : "destructive"}
                        className="mt-2 w-full justify-center"
                      >
                        {item.current_quantity > 20 ? "Good Stock" : "Low Stock"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {inventory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No housekeeping supplies in inventory</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Completion Modal */}
      <Dialog open={!!selectedTaskForCompletion} onOpenChange={(open) => !open && setSelectedTaskForCompletion(null)}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Completion Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about the completed task..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSelectedTaskForCompletion(null)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleCompleteTask} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplies Issue Modal */}
      <Dialog open={showSuppliesModal} onOpenChange={setShowSuppliesModal}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Housekeeping Supplies</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select supplies to issue for housekeeping operations
            </p>
            <div className="space-y-3">
              {inventory.map(item => {
                const existing = supplyRequests.find(r => r.item_id === item.id);
                
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground">Available: {item.current_quantity} {item.unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        className="w-20 h-9"
                        value={existing?.quantity || ''}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 0;
                          setSupplyRequests(prev => {
                            const filtered = prev.filter(r => r.item_id !== item.id);
                            if (qty > 0) {
                              return [...filtered, { item_id: item.id, quantity: qty }];
                            }
                            return filtered;
                          });
                        }}
                        max={item.current_quantity}
                      />
                      <span className="text-xs text-muted-foreground">{item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => {
              setShowSuppliesModal(false);
              setSupplyRequests([]);
            }} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleIssueSupplies} className="w-full sm:w-auto">
              <Package className="h-4 w-4 mr-2" />
              Issue Supplies ({supplyRequests.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HousekeepingManagement;
