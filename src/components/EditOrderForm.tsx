import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  type: string;
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  orderDate: string;
  expectedDelivery: string;
  assignedTo: string;
  priority: string;
  notes?: string;
}

interface EditOrderFormProps {
  order: Order;
  onBack: () => void;
  onSubmit: (orderData: any) => void;
}

export function EditOrderForm({ order, onBack, onSubmit }: EditOrderFormProps) {
  const [formData, setFormData] = useState({
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    status: order.status,
    orderType: order.type,
    productName: order.items[0]?.name || '',
    category: order.items[0]?.category || '',
    quantity: order.items[0]?.quantity.toString() || '1',
    productPrice: order.items[0]?.price.toString() || '',
    totalAmount: order.totalAmount.toString(),
    advanceAmount: order.paidAmount.toString(),
    paymentStatus: order.paymentStatus,
    assignedTo: order.assignedTo,
    priority: order.priority,
    notes: order.notes || '',
    specialInstructions: ''
  });

  const [expectedDelivery, setExpectedDelivery] = useState<Date | undefined>(
    order.expectedDelivery ? new Date(order.expectedDelivery) : undefined
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-calculate payment status based on amounts
    if (field === 'totalAmount' || field === 'advanceAmount') {
      const total = parseFloat(field === 'totalAmount' ? value : formData.totalAmount) || 0;
      const advance = parseFloat(field === 'advanceAmount' ? value : formData.advanceAmount) || 0;
      
      let paymentStatus = 'Pending';
      if (advance > 0 && advance < total) {
        paymentStatus = 'Partial';
      } else if (advance >= total && total > 0) {
        paymentStatus = 'Paid';
      } else if (advance > 0) {
        paymentStatus = 'Advance Paid';
      }
      
      setFormData(prev => ({ ...prev, paymentStatus }));
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) newErrors.customerEmail = 'Valid email is required';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone number is required';
    if (!formData.orderType) newErrors.orderType = 'Order type is required';
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) newErrors.totalAmount = 'Valid total amount is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Please assign to someone';
    if (!formData.priority) newErrors.priority = 'Priority is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const submitData = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      status: formData.status,
      type: formData.orderType,
      items: [{
        name: formData.productName,
        category: formData.category,
        quantity: parseInt(formData.quantity) || 1,
        price: parseFloat(formData.totalAmount) || 0
      }],
      totalAmount: parseFloat(formData.totalAmount) || 0,
      paidAmount: parseFloat(formData.advanceAmount) || 0,
      paymentStatus: formData.paymentStatus,
      expectedDelivery: expectedDelivery ? expectedDelivery.toISOString().split('T')[0] : order.expectedDelivery,
      assignedTo: formData.assignedTo,
      priority: formData.priority,
      notes: formData.notes || formData.specialInstructions || ''
    };

    await onSubmit(submitData);
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
        <div>
          <h1 className="text-2xl font-medium">Edit Order</h1>
          <p className="text-muted-foreground">Update order information and details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className={errors.customerName ? 'border-red-500' : ''}
              />
              {errors.customerName && <p className="text-sm text-red-600">{errors.customerName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  className={errors.customerEmail ? 'border-red-500' : ''}
                />
                {errors.customerEmail && <p className="text-sm text-red-600">{errors.customerEmail}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  className={errors.customerPhone ? 'border-red-500' : ''}
                />
                {errors.customerPhone && <p className="text-sm text-red-600">{errors.customerPhone}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderType">Order Type *</Label>
                <Select value={formData.orderType} onValueChange={(value) => handleInputChange('orderType', value)}>
                  <SelectTrigger className={errors.orderType ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Custom Order">Custom Order</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Appraisal">Appraisal</SelectItem>
                  </SelectContent>
                </Select>
                {errors.orderType && <p className="text-sm text-red-600">{errors.orderType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="In Production">In Production</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="e.g., Diamond Engagement Ring"
                className={errors.productName ? 'border-red-500' : ''}
              />
              {errors.productName && <p className="text-sm text-red-600">{errors.productName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rings">Rings</SelectItem>
                    <SelectItem value="Necklaces">Necklaces</SelectItem>
                    <SelectItem value="Earrings">Earrings</SelectItem>
                    <SelectItem value="Bracelets">Bracelets</SelectItem>
                    <SelectItem value="Chains">Chains</SelectItem>
                    <SelectItem value="Pendants">Pendants</SelectItem>
                    <SelectItem value="Sets">Sets</SelectItem>
                    <SelectItem value="Bangles">Bangles</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expectedDelivery && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedDelivery ? formatDate(expectedDelivery) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expectedDelivery}
                      onSelect={setExpectedDelivery}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (₹) *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                  className={errors.totalAmount ? 'border-red-500' : ''}
                />
                {errors.totalAmount && <p className="text-sm text-red-600">{errors.totalAmount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="advanceAmount">Paid Amount (₹)</Label>
                <Input
                  id="advanceAmount"
                  type="number"
                  value={formData.advanceAmount}
                  onChange={(e) => handleInputChange('advanceAmount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) => handleInputChange('paymentStatus', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Advance Paid">Advance Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment & Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment & Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To *</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                  <SelectTrigger className={errors.assignedTo ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jeweler Rajesh">Jeweler Rajesh</SelectItem>
                    <SelectItem value="Sales Manager Kavya">Sales Manager Kavya</SelectItem>
                    <SelectItem value="Designer Arjun">Designer Arjun</SelectItem>
                    <SelectItem value="Senior Jeweler Meera">Senior Jeweler Meera</SelectItem>
                    <SelectItem value="Consultant Amit">Consultant Amit</SelectItem>
                    <SelectItem value="Store Manager Priya">Store Manager Priya</SelectItem>
                  </SelectContent>
                </Select>
                {errors.assignedTo && <p className="text-sm text-red-600">{errors.assignedTo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-sm text-red-600">{errors.priority}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special instructions or notes about this order..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Order'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}