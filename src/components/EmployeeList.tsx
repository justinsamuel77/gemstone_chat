import React, { useState } from 'react';
import { useDataManager } from './DataManager';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Icons } from './ui/icons';
import { AddEmployeeForm } from './AddEmployeeForm';
import { EditEmployeeForm } from './EditEmployeeForm';
import { showToast } from './ui/toast';

interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  status: 'active' | 'inactive';
  address?: string;
  notes?: string;
  created_at: string;
}

export function EmployeeList() {
  const { employees, deleteEmployee, isLoading } = useDataManager();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (window.confirm(`Are you sure you want to delete employee "${employeeName}"?`)) {
      const success = await deleteEmployee(employeeId);
      if (success) {
        showToast('Employee deleted successfully', 'success');
      } else {
        showToast('Failed to delete employee', 'error');
      }
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (employee.email && employee.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (employee.position && employee.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  if (showAddForm) {
    return (
      <AddEmployeeForm
        onBack={() => setShowAddForm(false)}
        onSuccess={() => {
          setShowAddForm(false);
          showToast('Employee added successfully!', 'success');
        }}
      />
    );
  }

  if (editingEmployee) {
    return (
      <EditEmployeeForm
        employee={editingEmployee}
        onBack={() => setEditingEmployee(null)}
        onSuccess={() => {
          setEditingEmployee(null);
          showToast('Employee updated successfully!', 'success');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Employees</h1>
          <p className="text-muted-foreground">Manage your team members and assignments</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Icons.Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icons.Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-xl font-semibold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icons.UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-semibold">
                  {employees.filter(emp => emp.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icons.UserX className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-xl font-semibold">
                  {employees.filter(emp => emp.status === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icons.Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No employees found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No employees match your search criteria.' : 'Get started by adding your first employee.'}
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    {employee.position && (
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    )}
                  </div>
                  {getStatusBadge(employee.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee.department && (
                  <div className="flex items-center space-x-2">
                    <Icons.Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{employee.department}</span>
                  </div>
                )}
                
                {employee.email && (
                  <div className="flex items-center space-x-2">
                    <Icons.Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                )}
                
                {employee.phone && (
                  <div className="flex items-center space-x-2">
                    <Icons.Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                )}

                {employee.hire_date && (
                  <div className="flex items-center space-x-2">
                    <Icons.Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Hired: {new Date(employee.hire_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingEmployee(employee)}
                    className="flex-1"
                  >
                    <Icons.Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Icons.Trash className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}