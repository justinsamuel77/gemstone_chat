import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Calendar as CalendarIcon,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { cn } from './ui/utils';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'Pending' | 'Confirmed' | 'In Production' | 'Ready' | 'Delivered' | 'Cancelled';
  type: 'Sale' | 'Custom Order' | 'Repair' | 'Appraisal';
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue' | 'Advance Paid';
  orderDate: string;
  expectedDelivery: string;
  assignedTo: string;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
}

interface OrderListProps {
  orders: Order[];
  onSelectOrder: (orderId: string) => void;
  onAddOrder: () => void;
  onEditOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2344',
    customerName: 'Priya Mehta',
    customerEmail: 'Priya.Mehta@gmail.com',
    customerPhone: '+91 93849 81389',
    status: 'In Production',
    type: 'Custom Order',
    items: [
      { name: 'Custom Gold Bridal Ring', category: 'Rings', quantity: 1, price: 1100500 }
    ],
    totalAmount: 1100500,
    paidAmount: 1000500,
    paymentStatus: 'Advance Paid',
    orderDate: '2024-01-10',
    expectedDelivery: '2024-02-15',
    assignedTo: 'Rahul',
    priority: 'High',
    notes: 'Customer requested antique finish and adjustable lock'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh.kumar@email.com',
    customerPhone: '+91 98765 43210',
    status: 'Ready',
    type: 'Sale',
    items: [
      { name: 'Gold Tennis Bracelet', category: 'Bracelets', quantity: 1, price: 120000 },
      { name: 'Pearl Earrings', category: 'Earrings', quantity: 1, price: 80000 }
    ],
    totalAmount: 200000,
    paidAmount: 200000,
    paymentStatus: 'Paid',
    orderDate: '2024-01-08',
    expectedDelivery: '2024-01-20',
    assignedTo: 'Sales Associate Maria',
    priority: 'Medium'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerName: 'Anjali Patel',
    customerEmail: 'anjali.patel@email.com',
    customerPhone: '+91 87654 32109',
    status: 'Confirmed',
    type: 'Repair',
    items: [
      { name: 'Vintage Watch Repair', category: 'Watches', quantity: 1, price: 45000 }
    ],
    totalAmount: 45000,
    paidAmount: 0,
    paymentStatus: 'Pending',
    orderDate: '2024-01-12',
    expectedDelivery: '2024-01-25',
    assignedTo: 'Watch Specialist John',
    priority: 'Medium'
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.singh@email.com',
    customerPhone: '+91 76543 21098',
    status: 'Delivered',
    type: 'Sale',
    items: [
      { name: 'Silver Wedding Bands Set', category: 'Rings', quantity: 2, price: 60000 }
    ],
    totalAmount: 60000,
    paidAmount: 60000,
    paymentStatus: 'Paid',
    orderDate: '2024-01-05',
    expectedDelivery: '2024-01-18',
    assignedTo: 'Sales Associate Lisa',
    priority: 'Low'
  }
];

export function OrderList({ orders, onSelectOrder, onAddOrder, onEditOrder, onDeleteOrder }: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Helper function for date formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'In Production': 'bg-purple-100 text-purple-800',
      'Ready': 'bg-green-100 text-green-800',
      'Delivered': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-800',
      'Advance Paid': 'bg-blue-100 text-blue-800',
      'Partial': 'bg-yellow-100 text-yellow-800',
      'Pending': 'bg-orange-100 text-orange-800',
      'Overdue': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'Pending': Clock,
      'Confirmed': CheckCircle,
      'In Production': Package,
      'Ready': CheckCircle,
      'Delivered': Truck,
      'Cancelled': XCircle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesType = typeFilter === 'all' || order.type === typeFilter;
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || order.assignedTo === assigneeFilter;
      
      const orderDate = new Date(order.orderDate);
      const matchesDateFrom = !dateFrom || orderDate >= dateFrom;
      const matchesDateTo = !dateTo || orderDate <= dateTo;

      return matchesSearch && matchesStatus && matchesType && 
             matchesPayment && matchesPriority && matchesAssignee && 
             matchesDateFrom && matchesDateTo;
    });
  }, [orders, searchTerm, statusFilter, typeFilter, paymentFilter, priorityFilter, assigneeFilter, dateFrom, dateTo]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const uniqueAssignees = [...new Set(orders.map(order => order.assignedTo))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order Management</h1>
          <p className="text-muted-foreground">Track and manage all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={onAddOrder} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {/* Search */}
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="In Production">In Production</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Sale">Sale</SelectItem>
                <SelectItem value="Custom Order">Custom Order</SelectItem>
                <SelectItem value="Repair">Repair</SelectItem>
                <SelectItem value="Appraisal">Appraisal</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Filter */}
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Advance Paid">Advance Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Date From */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? formatDate(dateFrom.toISOString()) : "Date from"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || paymentFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || dateFrom || dateTo) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setPaymentFilter('all');
                  setPriorityFilter('all');
                  setAssigneeFilter('all');
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedOrders.length} of {filteredOrders.length} orders
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Order</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Items</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Expected Delivery</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(order.orderDate)}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-200 text-gray-700">
                            {order.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={cn("flex items-center gap-1", getStatusColor(order.status))}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{order.type}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.items[0].name}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">${order.totalAmount.toLocaleString()}</div>
                      {order.paidAmount < order.totalAmount && (
                        <div className="text-sm text-muted-foreground">
                          Paid: ${order.paidAmount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{formatDate(order.expectedDelivery)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectOrder(order.id)}
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {/* Dropdown menu with edit and delete options */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onEditOrder(order.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDeleteOrder(order.id)}>
                              <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                              <span className="text-red-600">Delete Order</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}