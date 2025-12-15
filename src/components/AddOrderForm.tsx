import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Package, 
  CreditCard,
  Calendar as CalendarIcon,
  Check
} from 'lucide-react';
import { cn } from './ui/utils';

interface AddOrderFormProps {
  onBack: () => void;
  onSubmit: (orderData: any) => void;
}

interface OrderFormData {
  // Customer Information
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  
  // Order Details
  orderType: 'Sale' | 'Custom Order' | 'Repair' | 'Appraisal';
  priority: 'High' | 'Medium' | 'Low';
  expectedDelivery?: Date;
  assignedTo: string;
  
  // Product Information  
  productName: string;
  category: string;
  metalType: string;
  gemstone: string;
  weight: string;
  purity: string;
  makingCharges: string;
  totalAmount: string;
  
  // Payment Information
  advanceAmount: string;
  paymentMethod: string;
  
  // Additional Information
  notes: string;
  specialInstructions: string;
}

const initialFormData: OrderFormData = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  orderType: 'Sale',
  priority: 'Medium',
  assignedTo: '',
  productName: '',
  category: '',
  metalType: '',
  gemstone: '',
  weight: '',
  purity: '',
  makingCharges: '',
  totalAmount: '',
  advanceAmount: '',
  paymentMethod: '',
  notes: '',
  specialInstructions: ''
};

const steps = [
  {
    id: 'customer',
    title: 'Customer Information',
    icon: User,
    description: 'Customer details and contact'
  },
  {
    id: 'product',
    title: 'Product Details',
    icon: Package,
    description: 'Jewelry specifications'
  },
  {
    id: 'payment',
    title: 'Payment & Delivery',
    icon: CreditCard,
    description: 'Payment and timeline'
  }
];

// Helper function for date formatting
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export function AddOrderForm({ onBack, onSubmit }: AddOrderFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OrderFormData>(() => {
    // Check if there's pre-populated data from lead conversion
    const storedData = localStorage.getItem('orderFormData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        localStorage.removeItem('orderFormData'); // Clear after using
        return { ...initialFormData, ...parsedData };
      } catch (error) {
        console.error('Error parsing stored order data:', error);
        return initialFormData;
      }
    }
    return initialFormData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepIndex) {
      case 0: // Customer Information
        if (!formData.customerName) newErrors.customerName = 'Customer name is required';
        if (!formData.customerEmail) newErrors.customerEmail = 'Email is required';
        if (!formData.customerPhone) newErrors.customerPhone = 'Phone is required';
        break;
      case 1: // Product Details
        if (!formData.productName) newErrors.productName = 'Product name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.totalAmount) newErrors.totalAmount = 'Total amount is required';
        break;
      case 2: // Payment & Delivery
        if (!formData.assignedTo) newErrors.assignedTo = 'Assignment is required';
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Customer Information
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => updateFormData('customerName', e.target.value)}
                placeholder="Enter customer name"
                className={errors.customerName ? 'border-red-500' : ''}
              />
              {errors.customerName && (
                <p className="text-sm text-red-500 mt-1">{errors.customerName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => updateFormData('customerEmail', e.target.value)}
                  placeholder="Enter email"
                  className={errors.customerEmail ? 'border-red-500' : ''}
                />
                {errors.customerEmail && (
                  <p className="text-sm text-red-500 mt-1">{errors.customerEmail}</p>
                )}
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => updateFormData('customerPhone', e.target.value)}
                  placeholder="Enter phone number"
                  className={errors.customerPhone ? 'border-red-500' : ''}
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-500 mt-1">{errors.customerPhone}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="customerAddress">Address</Label>
              <Textarea
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) => updateFormData('customerAddress', e.target.value)}
                placeholder="Enter customer address"
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderType">Order Type</Label>
                <Select value={formData.orderType} onValueChange={(value) => updateFormData('orderType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Custom Order">Custom Order</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Appraisal">Appraisal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 1: // Product Details
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => updateFormData('productName', e.target.value)}
                placeholder="Enter product name"
                className={errors.productName ? 'border-red-500' : ''}
              />
              {errors.productName && (
                <p className="text-sm text-red-500 mt-1">{errors.productName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rings">Rings</SelectItem>
                    <SelectItem value="Necklaces">Necklaces</SelectItem>
                    <SelectItem value="Bracelets">Bracelets</SelectItem>
                    <SelectItem value="Earrings">Earrings</SelectItem>
                    <SelectItem value="Watches">Watches</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
              </div>
              <div>
                <Label htmlFor="metalType">Metal Type</Label>
                <Select value={formData.metalType} onValueChange={(value) => updateFormData('metalType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="22K Gold">22K Gold</SelectItem>
                    <SelectItem value="18K Gold">18K Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                    <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', e.target.value)}
                  placeholder="e.g., 25.5g"
                />
              </div>
              <div>
                <Label htmlFor="purity">Purity</Label>
                <Input
                  id="purity"
                  value={formData.purity}
                  onChange={(e) => updateFormData('purity', e.target.value)}
                  placeholder="e.g., 916"
                />
              </div>
              <div>
                <Label htmlFor="gemstone">MADHAVAN JEWELLERS</Label>
                <Input
                  id="gemstone"
                  value={formData.gemstone}
                  onChange={(e) => updateFormData('gemstone', e.target.value)}
                  placeholder="Diamond, Ruby, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="makingCharges">Making Charges (₹)</Label>
                <Input
                  id="makingCharges"
                  type="number"
                  value={formData.makingCharges}
                  onChange={(e) => updateFormData('makingCharges', e.target.value)}
                  placeholder="Enter making charges"
                />
              </div>
              <div>
                <Label htmlFor="totalAmount">Total Amount (₹) *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => updateFormData('totalAmount', e.target.value)}
                  placeholder="Enter total amount"
                  className={errors.totalAmount ? 'border-red-500' : ''}
                />
                {errors.totalAmount && (
                  <p className="text-sm text-red-500 mt-1">{errors.totalAmount}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Product Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder="Any special notes about the product"
                className="min-h-[80px]"
              />
            </div>
          </div>
        );

      case 2: // Payment & Delivery
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="advanceAmount">Advance Amount (₹)</Label>
                <Input
                  id="advanceAmount"
                  type="number"
                  value={formData.advanceAmount}
                  onChange={(e) => updateFormData('advanceAmount', e.target.value)}
                  placeholder="Enter advance amount"
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => updateFormData('paymentMethod', value)}>
                  <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Card">Card Payment</SelectItem>
                    <SelectItem value="Mixed">Mixed Payment</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-500 mt-1">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="assignedTo">Assigned To *</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => updateFormData('assignedTo', value)}>
                <SelectTrigger className={errors.assignedTo ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Master Jeweler Alex">Master Jeweler Alex</SelectItem>
                  <SelectItem value="Sales Associate Maria">Sales Associate Maria</SelectItem>
                  <SelectItem value="Watch Specialist John">Watch Specialist John</SelectItem>
                  <SelectItem value="Designer Arjun">Designer Arjun</SelectItem>
                  <SelectItem value="Senior Jeweler Meera">Senior Jeweler Meera</SelectItem>
                </SelectContent>
              </Select>
              {errors.assignedTo && (
                <p className="text-sm text-red-500 mt-1">{errors.assignedTo}</p>
              )}
            </div>

            <div>
              <Label>Expected Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expectedDelivery && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expectedDelivery ? formatDate(formData.expectedDelivery) : "Select delivery date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expectedDelivery}
                    onSelect={(date) => updateFormData('expectedDelivery', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                placeholder="Any special instructions for this order"
                className="min-h-[80px]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Create New Order</h1>
            <p className="text-muted-foreground">Add a new jewelry order</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                  isActive && "bg-primary/10 text-primary",
                  isCompleted && "text-green-600",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-green-600 text-white",
                  !isActive && !isCompleted && "bg-muted"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, { className: "w-5 h-5" })}
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center gap-3">
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Create Order
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}