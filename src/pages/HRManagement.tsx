import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  useEmployees, 
  useLeaveRequests, 
  useEmployeeLoans, 
  useStaffRecognition, 
  useHRSummary,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
  Employee as EmployeeType
} from "@/hooks/useHR";
import { AddEmployeeModal } from "@/components/hr/AddEmployeeModal";
import { LeaveRequestModal } from "@/components/hr/LeaveRequestModal";
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
  MapPin,
  Loader2
} from "lucide-react";

const HRManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("employees");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isLeaveRequestModalOpen, setIsLeaveRequestModalOpen] = useState(false);

  const { data: employeeData = [], isLoading: employeesLoading } = useEmployees();
  const { data: leaveData = [], isLoading: leavesLoading } = useLeaveRequests();
  const { data: loanData = [], isLoading: loansLoading } = useEmployeeLoans();
  const { data: recognitionData = [], isLoading: recognitionLoading } = useStaffRecognition();
  const { data: stats, isLoading: summaryLoading } = useHRSummary();

  const approveLeaveRequestMutation = useApproveLeaveRequest();
  const rejectLeaveRequestMutation = useRejectLeaveRequest();

  const filteredEmployees = employeeData.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_positions?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.departments?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDepartmentColor = (deptName: string) => {
    const colors: { [key: string]: string } = {
      'Front Desk': 'bg-blue-500 text-white',
      'Housekeeping': 'bg-purple-500 text-white', 
      'Kitchen': 'bg-green-500 text-white',
      'Maintenance': 'bg-orange-500 text-white',
      'Management': 'bg-accent text-accent-foreground',
      'Security': 'bg-gray-600 text-white'
    };
    return colors[deptName] || 'bg-gray-500 text-white';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'on-leave': return 'bg-warning text-warning-foreground';
      case 'terminated': return 'bg-destructive text-destructive-foreground';
      case 'suspended': return 'bg-muted text-muted-foreground';
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

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await approveLeaveRequestMutation.mutateAsync(leaveId);
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await rejectLeaveRequestMutation.mutateAsync({ leaveId });
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const handleProcessSalary = () => {
    toast({
      title: "Salary Processing Started",
      description: "Monthly salary processing has been initiated.",
    });
  };

  if (summaryLoading || employeesLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Management</h1>
          <p className="text-muted-foreground">Manage staff, salaries, leaves, and employee welfare</p>
        </div>
        <Button className="button-luxury" onClick={() => setIsAddEmployeeModalOpen(true)}>
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
                        <h3 className="text-xl font-bold">{employee.first_name} {employee.last_name}</h3>
                        <p className="text-muted-foreground">{employee.employee_positions?.title}</p>
                        <p className="text-sm text-muted-foreground">Employee ID: {employee.employee_id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getDepartmentColor(employee.departments?.name || '')}>
                        {employee.departments?.name?.toUpperCase()}
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
                          <p className="font-medium">{employee.hire_date}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <p className="capitalize">{employee.employment_type}</p>
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
                          <span className="font-medium">{employee.total_leave_days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Used</span>
                          <span className="font-medium">{employee.used_leave_days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className="font-bold text-success">{employee.total_leave_days - employee.used_leave_days}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Emergency Contact</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Contact:</span>
                          <p className="font-medium">{employee.emergency_contact_name}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Phone:</span>
                          <p>{employee.emergency_contact_phone}</p>
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
                      <span className="font-bold">{stats?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Salaries</span>
                      <span className="font-bold">${stats?.totalSalaries.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Loan Deductions</span>
                      <span className="font-bold text-warning">${loanData.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthly_deduction, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Net Payroll</span>
                      <span>${((stats?.totalSalaries || 0) - loanData.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthly_deduction, 0)).toLocaleString()}</span>
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
                <h4 className="font-semibold">Individual Salary Details</h4>
                <div className="grid gap-4">
                  {employeeData.slice(0, 5).map((employee) => (
                    <Card key={employee.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-bold">{employee.first_name} {employee.last_name}</h5>
                            <p className="text-sm text-muted-foreground">{employee.employee_positions?.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${employee.salary.toLocaleString()}/year</p>
                            <p className="text-sm text-muted-foreground">${(employee.salary / 12).toFixed(0)}/month</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Leave Management</h3>
            <Button onClick={() => setIsLeaveRequestModalOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              New Leave Request
            </Button>
          </div>

          <div className="grid gap-4">
            {leaveData.map((leave: any) => (
              <Card key={leave.id} className="card-luxury">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{leave.employees?.first_name} {leave.employees?.last_name}</h3>
                        <p className="text-muted-foreground capitalize">{leave.leave_type} Leave • {leave.total_days} days</p>
                      </div>
                    </div>
                    <Badge className={getLeaveStatusColor(leave.status)}>
                      {leave.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{leave.start_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{leave.end_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Applied On</p>
                      <p className="font-medium">{new Date(leave.applied_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{leave.total_days} days</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="text-sm">{leave.reason}</p>
                  </div>

                  {leave.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-success hover:bg-success hover:text-success-foreground"
                        onClick={() => handleApproveLeave(leave.id)}
                        disabled={approveLeaveRequestMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRejectLeave(leave.id)}
                        disabled={rejectLeaveRequestMutation.isPending}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
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
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Employee Loans</CardTitle>
              <CardDescription>Track and manage employee loan requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {loanData.map((loan: any) => (
                  <Card key={loan.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{loan.employees?.first_name} {loan.employees?.last_name}</h3>
                            <p className="text-muted-foreground">{loan.purpose}</p>
                          </div>
                        </div>
                        <Badge className={loan.status === 'active' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                          {loan.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Loan Amount</p>
                          <p className="font-bold">${loan.loan_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Deduction</p>
                          <p className="font-medium">${loan.monthly_deduction.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Remaining</p>
                          <p className="font-medium text-warning">${loan.remaining_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium">{loan.start_date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff-month" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Staff of the Month
              </CardTitle>
              <CardDescription>Recognize outstanding employee performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Recent Winners</h4>
                <div className="grid gap-4">
                  {recognitionData.map((recognition: any) => (
                    <Card key={recognition.id} className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Award className="h-8 w-8 text-warning" />
                            <div>
                              <h5 className="font-bold">{recognition.employees?.first_name} {recognition.employees?.last_name}</h5>
                              <p className="text-sm text-muted-foreground">
                                {recognition.employees?.departments?.name} • {new Date(recognition.month_year).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-warning">{recognition.votes} votes</p>
                            <p className="text-sm text-muted-foreground">Winner</p>
                          </div>
                        </div>
                        <p className="text-sm mt-2">{recognition.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Active workforce</p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats?.active || 0}</div>
                <p className="text-xs text-muted-foreground">Currently working</p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Leaves</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats?.pendingLeaves || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Payroll</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${((stats?.totalSalaries || 0) / 12).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Monthly cost</p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Set(employeeData.map(emp => emp.departments?.name))).filter(Boolean).map((deptName) => {
                  const deptEmployees = employeeData.filter(emp => emp.departments?.name === deptName);
                  const avgSalary = deptEmployees.reduce((sum, emp) => sum + emp.salary, 0) / deptEmployees.length;
                  
                  return (
                    <div key={deptName} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{deptName}</h4>
                        <p className="text-sm text-muted-foreground">{deptEmployees.length} employees</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${avgSalary.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Avg. salary</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddEmployeeModal 
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
      />
      
      <LeaveRequestModal
        isOpen={isLeaveRequestModalOpen}
        onClose={() => setIsLeaveRequestModalOpen(false)}
      />
    </div>
  );
};

export default HRManagement;