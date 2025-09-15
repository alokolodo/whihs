import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";  
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee as EmployeeType } from "@/hooks/useHR";
import { Users, Mail, Phone, MapPin, Calendar, DollarSign, Clock, Heart } from "lucide-react";

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeType | null;
}

export const EmployeeProfileModal = ({ isOpen, onClose, employee }: EmployeeProfileModalProps) => {
  if (!employee) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {employee.first_name} {employee.last_name}
              </h2>
              <p className="text-muted-foreground">{employee.employee_positions?.title}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-2">
            <Badge className={getDepartmentColor(employee.departments?.name || '')}>
              {employee.departments?.name?.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(employee.status)}>
              {employee.status.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              ID: {employee.employee_id}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{employee.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{employee.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Hire Date</p>
                  <p className="font-medium">{employee.hire_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employment Type</p>
                  <p className="font-medium capitalize">{employee.employment_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{employee.departments?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p className="font-medium">{employee.employee_positions?.title}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Salary</p>
                  <p className="font-bold text-lg">${employee.salary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Salary</p>
                  <p className="font-medium">${(employee.salary / 12).toFixed(0)}</p>
                </div>
                {employee.bank_account && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Account</p>
                    <p className="font-medium">{employee.bank_account}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Leave Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Leave Days</span>
                  <span className="font-medium">{employee.total_leave_days}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Used Days</span>
                  <span className="font-medium">{employee.used_leave_days}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining Days</span>
                  <span className="font-bold text-success">{employee.total_leave_days - employee.used_leave_days}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full"
                    style={{
                      width: `${Math.max(0, ((employee.total_leave_days - employee.used_leave_days) / employee.total_leave_days) * 100)}%`
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{employee.emergency_contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{employee.emergency_contact_phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {employee.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{employee.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};