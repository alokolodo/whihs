import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  UserPlus,
  DollarSign,
  Calendar,
  Clock,
  Award,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: 'front-desk' | 'housekeeping' | 'kitchen' | 'maintenance' | 'management' | 'security';
  email: string;
  phone: string;
  address: string;
  hireDate: string;
  salary: number;
  employmentType: 'full-time' | 'part-time' | 'contract';
  status: 'active' | 'on-leave' | 'terminated';
  emergencyContact: string;
  emergencyPhone: string;
  totalLeaves: number;
  usedLeaves: number;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'emergency' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}

interface Loan {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  purpose: string;
  approvedDate: string;
  monthlyDeduction: number;
  remainingAmount: number;
  status: 'active' | 'completed' | 'pending';
}

interface StaffVote {
  id: string;
  month: string;
  nominees: { employeeId: string; name: string; votes: number; department: string }[];
  winner?: { employeeId: string; name: string; department: string };
  votingOpen: boolean;
}

const HRManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("employees");
  const [searchTerm, setSearchTerm] = useState("");

  const [employees] = useState<Employee[]>([
    {
      id: "EMP001",
      name: "Maria Santos",
      position: "Housekeeping Supervisor",
      department: 'housekeeping',
      email: "maria.santos@hotel.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, City, State 12345",
      hireDate: "2022-03-15",
      salary: 45000,
      employmentType: 'full-time',
      status: 'active',
      emergencyContact: "Carlos Santos",
      emergencyPhone: "+1 (555) 765-4321",
      totalLeaves: 25,
      usedLeaves: 8
    },
    {
      id: "EMP002",
      name: "James Wilson",
      position: "Front Desk Manager", 
      department: 'front-desk',
      email: "james.wilson@hotel.com",
      phone: "+1 (555) 234-5678",
      address: "456 Oak Ave, City, State 12345",
      hireDate: "2021-07-20",
      salary: 52000,
      employmentType: 'full-time',
      status: 'active',
      emergencyContact: "Sarah Wilson",
      emergencyPhone: "+1 (555) 876-5432",
      totalLeaves: 25,
      usedLeaves: 12
    },
    {
      id: "EMP003",
      name: "Chef Martinez",
      position: "Executive Chef",
      department: 'kitchen',
      email: "chef.martinez@hotel.com",
      phone: "+1 (555) 345-6789",
      address: "789 Pine St, City, State 12345",
      hireDate: "2020-01-10",
      salary: 65000,
      employmentType: 'full-time',
      status: 'active',
      emergencyContact: "Elena Martinez",
      emergencyPhone: "+1 (555) 987-6543",
      totalLeaves: 28,
      usedLeaves: 15
    }
  ]);

  const [leaveRequests] = useState<LeaveRequest[]>([
    {
      id: "LR001",
      employeeId: "EMP001",
      employeeName: "Maria Santos",
      leaveType: 'annual',
      startDate: "2024-02-15",
      endDate: "2024-02-20",
      days: 6,
      reason: "Family vacation",
      status: 'pending',
      appliedOn: "2024-01-15"
    },
    {
      id: "LR002",
      employeeId: "EMP002", 
      employeeName: "James Wilson",
      leaveType: 'sick',
      startDate: "2024-01-18",
      endDate: "2024-01-19",
      days: 2,
      reason: "Medical appointment and recovery",
      status: 'approved',
      appliedOn: "2024-01-17"
    }
  ]);

  const [loans] = useState<Loan[]>([
    {
      id: "LN001",
      employeeId: "EMP003",
      employeeName: "Chef Martinez",
      amount: 5000,
      purpose: "Home renovation",
      approvedDate: "2023-12-01",
      monthlyDeduction: 500,
      remainingAmount: 2500,
      status: 'active'
    },
    {
      id: "LN002",
      employeeId: "EMP001",
      employeeName: "Maria Santos", 
      amount: 2000,
      purpose: "Medical expenses",
      approvedDate: "2024-01-05",
      monthlyDeduction: 200,
      remainingAmount: 1800,
      status: 'active'
    }
  ]);

  const [staffVoting] = useState<StaffVote>({
    id: "SV001",
    month: "January 2024",
    nominees: [
      { employeeId: "EMP001", name: "Maria Santos", votes: 12, department: "Housekeeping" },
      { employeeId: "EMP002", name: "James Wilson", votes: 8, department: "Front Desk" },
      { employeeId: "EMP003", name: "Chef Martinez", votes: 15, department: "Kitchen" }
    ],
    winner: { employeeId: "EMP003", name: "Chef Martinez", department: "Kitchen" },
    votingOpen: false
  });

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDepartmentColor = (dept: string) => {
    const colors = {
      'front-desk': 'bg-blue-500 text-white',
      'housekeeping': 'bg-purple-500 text-white', 
      'kitchen': 'bg-green-500 text-white',
      'maintenance': 'bg-orange-500 text-white',
      'management': 'bg-accent text-accent-foreground',
      'security': 'bg-gray-600 text-white'
    };
    return colors[dept as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'on-leave': return 'bg-warning text-warning-foreground';
      case 'terminated': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success text-success-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-warning text-warning-foreground';
    }
  };

  const handleApproveLeave = (leaveId: string) => {
    toast({
      title: "Leave Approved",
      description: "Employee has been notified of the leave approval.",
    });
  };

  const handleRejectLeave = (leaveId: string) => {
    toast({
      title: "Leave Rejected", 
      description: "Employee has been notified of the leave rejection.",
      variant: "destructive"
    });
  };

  const handleProcessSalary = () => {
    toast({
      title: "Salary Processing Started",
      description: "Monthly salary processing has been initiated.",
    });
  };

  const getHRStats = () => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'active').length;
    const onLeave = employees.filter(e => e.status === 'on-leave').length;
    const pendingLeaves = leaveRequests.filter(lr => lr.status === 'pending').length;
    const activeLoans = loans.filter(l => l.status === 'active').length;
    const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0);

    return { total, active, onLeave, pendingLeaves, activeLoans, totalSalaries };
  };

  const stats = getHRStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Management</h1>
          <p className="text-muted-foreground">Manage staff, salaries, leaves, and employee welfare</p>
        </div>
        <Button className="button-luxury">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="salaries">Salaries</TabsTrigger>
          <TabsTrigger value="leaves">Leave Management</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="staff-month">Staff of Month</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name, position, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="card-luxury">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{employee.name}</h3>
                        <p className="text-muted-foreground">{employee.position}</p>
                        <p className="text-sm text-muted-foreground">Employee ID: {employee.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getDepartmentColor(employee.department)}>
                        {employee.department.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Contact Information</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Employment Details</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Hire Date:</span>
                          <p className="font-medium">{employee.hireDate}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <p className="capitalize">{employee.employmentType}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Salary:</span>
                          <p className="font-bold">${employee.salary.toLocaleString()}/year</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Leave Balance</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Leaves</span>
                          <span className="font-medium">{employee.totalLeaves}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Used</span>
                          <span className="font-medium">{employee.usedLeaves}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className="font-bold text-success">{employee.totalLeaves - employee.usedLeaves}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Emergency Contact</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Contact:</span>
                          <p className="font-medium">{employee.emergencyContact}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Phone:</span>
                          <p>{employee.emergencyPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Payroll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="salaries" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Salary Management</CardTitle>
              <CardDescription>Process monthly salaries and deductions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Current Month Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Employees</span>
                      <span className="font-bold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Salaries</span>
                      <span className="font-bold">${stats.totalSalaries.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Loan Deductions</span>
                      <span className="font-bold text-warning">${loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthlyDeduction, 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Net Payroll</span>
                      <span>${(stats.totalSalaries - loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthlyDeduction, 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Payroll Actions</h4>
                  <div className="space-y-3">
                    <Button className="w-full button-luxury" onClick={handleProcessSalary}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Monthly Salaries
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Generate Payslips
                    </Button>
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Tax Reports
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Individual Salaries</h4>
                <div className="grid gap-3">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(employee.salary / 12).toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Monthly</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-6">
          <div className="grid gap-4">
            {leaveRequests.map((leave) => (
              <Card key={leave.id} className="card-luxury">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{leave.employeeName}</h3>
                        <p className="text-muted-foreground capitalize">{leave.leaveType} Leave • {leave.days} days</p>
                      </div>
                    </div>
                    <Badge className={getLeaveStatusColor(leave.status)}>
                      {leave.status === 'pending' ? <Clock className="h-3 w-3 mr-1" /> : 
                       leave.status === 'approved' ? <CheckCircle className="h-3 w-3 mr-1" /> : 
                       <AlertCircle className="h-3 w-3 mr-1" />}
                      {leave.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{leave.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{leave.endDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Applied On</p>
                      <p className="font-medium">{leave.appliedOn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{leave.days} days</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="font-medium">{leave.reason}</p>
                  </div>

                  {leave.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveLeave(leave.id)}
                        className="button-luxury"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRejectLeave(leave.id)}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <div className="grid gap-4">
            {loans.map((loan) => (
              <Card key={loan.id} className="card-luxury">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{loan.employeeName}</h3>
                        <p className="text-muted-foreground">{loan.purpose}</p>
                      </div>
                    </div>
                    <Badge className={loan.status === 'active' ? 'bg-warning text-warning-foreground' : 'bg-success text-success-foreground'}>
                      {loan.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Loan Amount</p>
                      <p className="font-bold text-lg">${loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Deduction</p>
                      <p className="font-bold text-warning">${loan.monthlyDeduction}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining Balance</p>
                      <p className="font-bold">${loan.remainingAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved Date</p>
                      <p className="font-medium">{loan.approvedDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="staff-month" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Staff of the Month - {staffVoting.month}
              </CardTitle>
              <CardDescription>
                {staffVoting.votingOpen ? "Voting is currently open" : "Voting has concluded"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {staffVoting.winner && !staffVoting.votingOpen && (
                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Award className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-accent">🎉 {staffVoting.winner.name}</h3>
                      <p className="text-lg text-muted-foreground">{staffVoting.winner.department} Department</p>
                      <p className="text-sm text-muted-foreground">Winner of {staffVoting.month}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold">Voting Results</h4>
                <div className="space-y-3">
                  {staffVoting.nominees.map((nominee, index) => (
                    <div key={nominee.employeeId} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{nominee.name}</p>
                          <p className="text-sm text-muted-foreground">{nominee.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-accent" />
                        <span className="font-bold">{nominee.votes} votes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {staffVoting.votingOpen && (
                <Button className="button-luxury">
                  <Award className="h-4 w-4 mr-2" />
                  Close Voting & Announce Winner
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Employee Wellness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Health & Wellness</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="h-4 w-4 mr-2" />
                      Medical Insurance Claims
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Health Checkup Schedule
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Emergency Contacts
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Work Schedule</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="h-4 w-4 mr-2" />
                      Shift Management
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Off Day Schedule
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Department Roster
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active} active • {stats.onLeave} on leave
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Leaves
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.pendingLeaves}</div>
                <p className="text-xs text-muted-foreground">
                  Require approval
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeLoans}</div>
                <p className="text-xs text-muted-foreground">
                  ${loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.remainingAmount, 0).toLocaleString()} outstanding
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Payroll
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(stats.totalSalaries / 12).toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">
                  Average monthly cost
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['front-desk', 'housekeeping', 'kitchen', 'maintenance', 'management', 'security'].map(dept => {
                  const count = employees.filter(e => e.department === dept).length;
                  const percentage = (count / employees.length) * 100;
                  return (
                    <div key={dept} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getDepartmentColor(dept)} variant="outline">
                          {dept.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm">{count} employees</span>
                      </div>
                      <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRManagement;