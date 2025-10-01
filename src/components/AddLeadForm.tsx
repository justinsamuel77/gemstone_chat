import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Icons } from './ui/icons';
import { cn } from './ui/utils';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AddLeadFormProps {
  onBack: () => void;
  onSubmit: (leadData: any) => void;
}

interface LeadFormData {
  // Basic Information
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  marriageDate?: Date;
  address: string;
  
  // Product Information
  productInterest: string;
  productImage?: File | null;
  productImageUrl?: string;
  netWeight: string;
  estimatedPrice: string;
  estimatedDeliveryDate?: Date;
  
  // Lead Information
  source: string;
  notes: string;
  
  // Internal fields (existing)
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string;
}

const initialFormData: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  productInterest: '',
  netWeight: '',
  estimatedPrice: '',
  source: '',
  notes: '',
  priority: 'Medium',
  assignedTo: 'Unassigned'
};

// Helper function for date formatting
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export function AddLeadForm({ onBack, onSubmit }: AddLeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  const updateFormData = (field: keyof LeadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateFormData('productImage', file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.productInterest.trim()) newErrors.productInterest = 'Product interest is required';
    if (!formData.source) newErrors.source = 'Source is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (basic)
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Price validation
    if (formData.estimatedPrice && isNaN(Number(formData.estimatedPrice))) {
      newErrors.estimatedPrice = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert form data to match expected format
      const leadData = {
        firstName: formData.name.split(' ')[0] || '',
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        source: formData.source,
        priority: formData.priority,
        assignedTo: formData.assignedTo || 'Unassigned',
        estimatedValue: formData.estimatedPrice ? parseInt(formData.estimatedPrice) : 0,
        interests: formData.productInterest,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth?.toISOString().split('T')[0],
        marriageDate: formData.marriageDate?.toISOString().split('T')[0],
        netWeight: formData.netWeight,
        estimatedDeliveryDate: formData.estimatedDeliveryDate?.toISOString().split('T')[0],
        notes: formData.notes,
        productImage: formData.productImage
      };
      
      onSubmit(leadData);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
            <Icons.ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Add New Lead</h1>
            <p className="text-gray-600">Create a comprehensive lead profile</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <Icons.User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="name" className="text-base font-medium text-gray-900">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Enter full name"
                  className={cn(
                    "mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200",
                    errors.name && "border-red-500"
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-medium text-gray-900">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="Enter email address"
                  className={cn(
                    "mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200",
                    errors.email && "border-red-500"
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-base font-medium text-gray-900">
                  Phone *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className={cn(
                    "mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200",
                    errors.phone && "border-red-500"
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium text-gray-900">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200",
                        !formData.dateOfBirth && "text-gray-500"
                      )}
                    >
                      📅
                      {formData.dateOfBirth ? formatDate(formData.dateOfBirth) : "Select date of birth"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth}
                      onSelect={(date) => updateFormData('dateOfBirth', date)}
                      initialFocus
                      fromYear={1950}
                      toYear={2010}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-base font-medium text-gray-900">Marriage Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200",
                        !formData.marriageDate && "text-gray-500"
                      )}
                    >
                      📅
                      {formData.marriageDate ? formatDate(formData.marriageDate) : "Select marriage date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.marriageDate}
                      onSelect={(date) => updateFormData('marriageDate', date)}
                      initialFocus
                      fromYear={1980}
                      toYear={new Date().getFullYear()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-base font-medium text-gray-900">
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  placeholder="Enter complete address"
                  className="mt-2 min-h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200 resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <Icons.Package className="w-5 h-5 text-primary" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="productInterest" className="text-base font-medium text-gray-900">
                Product Interest *
              </Label>
              <Input
                id="productInterest"
                value={formData.productInterest}
                onChange={(e) => updateFormData('productInterest', e.target.value)}
                placeholder="e.g., Engagement ring, Wedding set, Custom necklace"
                className={cn(
                  "mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200",
                  errors.productInterest && "border-red-500"
                )}
              />
              {errors.productInterest && (
                <p className="text-sm text-red-500 mt-1">{errors.productInterest}</p>
              )}
            </div>

            {/* Product Image Upload */}
            <div>
              <Label className="text-base font-medium text-gray-900">Product Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <ImageWithFallback
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-[180px] object-cover rounded-[10px] border border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImagePreview('');
                        updateFormData('productImage', null);
                      }}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="productImage"
                    />
                    <div className="h-[180px] rounded-[10px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50/30 hover:bg-gray-50/50 transition-colors cursor-pointer">
                      📤
                      <p className="text-sm text-gray-500 font-medium">Upload Image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="netWeight" className="text-base font-medium text-gray-900">
                  Net Weight of the Product
                </Label>
                <Input
                  id="netWeight"
                  value={formData.netWeight}
                  onChange={(e) => updateFormData('netWeight', e.target.value)}
                  placeholder="e.g., 25.5 grams"
                  className="mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="estimatedPrice" className="text-base font-medium text-gray-900">
                  EST Price
                </Label>
                <Input
                  id="estimatedPrice"
                  type="number"
                  value={formData.estimatedPrice}
                  onChange={(e) => updateFormData('estimatedPrice', e.target.value)}
                  placeholder="Enter estimated price"
                  className={cn(
                    "mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200",
                    errors.estimatedPrice && "border-red-500"
                  )}
                />
                {errors.estimatedPrice && (
                  <p className="text-sm text-red-500 mt-1">{errors.estimatedPrice}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium text-gray-900">EST Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200",
                      !formData.estimatedDeliveryDate && "text-gray-500"
                    )}
                  >
                    📅
                    {formData.estimatedDeliveryDate ? formatDate(formData.estimatedDeliveryDate) : "Select estimated delivery date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.estimatedDeliveryDate}
                    onSelect={(date) => updateFormData('estimatedDeliveryDate', date)}
                    initialFocus
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="source" className="text-base font-medium text-gray-900">
                  Source *
                </Label>
                <Select value={formData.source} onValueChange={(value) => updateFormData('source', value)}>
                  <SelectTrigger className={cn(
                    "mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200",
                    errors.source && "border-red-500"
                  )}>
                    <SelectValue placeholder="Select Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Advertisement">Advertisement</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                  </SelectContent>
                </Select>
                {errors.source && (
                  <p className="text-sm text-red-500 mt-1">{errors.source}</p>
                )}
              </div>

              <div>
                <Label htmlFor="priority" className="text-base font-medium text-gray-900">
                  Priority
                </Label>
                <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value as 'High' | 'Medium' | 'Low')}>
                  <SelectTrigger className="mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200">
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

            <div>
              <Label htmlFor="assignedTo" className="text-base font-medium text-gray-900">
                Assigned To
              </Label>
              <Select value={formData.assignedTo} onValueChange={(value) => updateFormData('assignedTo', value)}>
                <SelectTrigger className="mt-2 h-[60px] rounded-[10px] bg-gray-50/50 border border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                  <SelectItem value="Jeweler Rajesh">Jeweler Rajesh</SelectItem>
                  <SelectItem value="Sales Manager Kavya">Sales Manager Kavya</SelectItem>
                  <SelectItem value="Designer Arjun">Designer Arjun</SelectItem>
                  <SelectItem value="Senior Jeweler Meera">Senior Jeweler Meera</SelectItem>
                  <SelectItem value="Consultant Amit">Consultant Amit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-base font-medium text-gray-900">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder="Any additional notes about the lead"
                className="mt-2 min-h-[100px] rounded-[10px] bg-gray-50/50 border border-gray-200 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full h-[70px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-[10px] text-[22px] font-semibold"
          >
            Add Lead
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full h-[70px] bg-gray-400 hover:bg-gray-500 text-white rounded-[10px] text-[22px] font-semibold border-0"
          >
            Save & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}