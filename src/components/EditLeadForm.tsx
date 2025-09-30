import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from './ui/utils';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  assignedTo: string;
  lastContact: string;
  value: number;
  priority: string;
  createdAt: string;
  company: string;
  dateOfBirth?: string;
  marriageDate?: string;
  address?: string;
  netWeight?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  productImage?: File | null;
  instagramUsername?: string;
}

interface EditLeadFormProps {
  lead: Lead;
  onBack: () => void;
  onSubmit: (leadData: any) => void;
}

export function EditLeadForm({ lead, onBack, onSubmit }: EditLeadFormProps) {
  // Parse the name into first and last name
  const nameParts = lead.name.split(' ');
  const initialFirstName = nameParts[0] || '';
  const initialLastName = nameParts.slice(1).join(' ') || '';

  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    source: lead.source,
    assignedTo: lead.assignedTo,
    priority: lead.priority,
    interests: lead.company,
    estimatedValue: lead.value.toString(),
    dateOfBirth: lead.dateOfBirth || '',
    marriageDate: lead.marriageDate || '',
    address: lead.address || '',
    netWeight: lead.netWeight || '',
    estimatedDeliveryDate: lead.estimatedDeliveryDate || '',
    notes: lead.notes || '',
    instagramUsername: lead.instagramUsername || ''
  });

  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dobDate, setDobDate] = useState<Date | undefined>(
    formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined
  );
  const [marriageCalendarDate, setMarriageDate] = useState<Date | undefined>(
    formData.marriageDate ? new Date(formData.marriageDate) : undefined
  );
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    formData.estimatedDeliveryDate ? new Date(formData.estimatedDeliveryDate) : undefined
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, productImage: 'Image size should be less than 5MB' }));
        return;
      }
      
      setProductImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      
      if (errors.productImage) {
        setErrors(prev => ({ ...prev, productImage: '' }));
      }
    }
  };

  const removeImage = () => {
    setProductImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('productImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.source) newErrors.source = 'Source is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Please assign to someone';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.interests.trim()) newErrors.interests = 'Interests/Requirements are required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const submitData = {
      ...formData,
      dateOfBirth: dobDate ? dobDate.toISOString().split('T')[0] : '',
      marriageDate: marriageCalendarDate ? marriageCalendarDate.toISOString().split('T')[0] : '',
      estimatedDeliveryDate: deliveryDate ? deliveryDate.toISOString().split('T')[0] : '',
      productImage,
      estimatedValue: parseInt(formData.estimatedValue) || 0
    };

    await onSubmit(submitData);
    setIsSubmitting(false);
  };

  useEffect(() => {
    // Update date states when form data changes
    setDobDate(formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined);
    setMarriageDate(formData.marriageDate ? new Date(formData.marriageDate) : undefined);
    setDeliveryDate(formData.estimatedDeliveryDate ? new Date(formData.estimatedDeliveryDate) : undefined);
  }, [formData.dateOfBirth, formData.marriageDate, formData.estimatedDeliveryDate]);

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
          Back to Leads
        </Button>
        <div>
          <h1 className="text-2xl font-medium">Edit Lead</h1>
          <p className="text-muted-foreground">Update lead information and details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>
            </div>

            {formData.source === 'Instagram' && (
              <div className="space-y-2">
                <Label htmlFor="instagramUsername">Instagram Username</Label>
                <Input
                  id="instagramUsername"
                  value={formData.instagramUsername}
                  onChange={(e) => handleInputChange('instagramUsername', e.target.value)}
                  placeholder="@username"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dobDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dobDate ? formatDate(dobDate) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dobDate}
                      onSelect={setDobDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Marriage Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !marriageCalendarDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {marriageCalendarDate ? formatDate(marriageCalendarDate) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={marriageCalendarDate}
                      onSelect={setMarriageDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Complete address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interests">Interests/Requirements *</Label>
                <Textarea
                  id="interests"
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  placeholder="What type of jewelry is the customer interested in?"
                  className={errors.interests ? 'border-red-500' : ''}
                  rows={3}
                />
                {errors.interests && <p className="text-sm text-red-600">{errors.interests}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="netWeight">Net Weight (grams)</Label>
                <Input
                  id="netWeight"
                  value={formData.netWeight}
                  onChange={(e) => handleInputChange('netWeight', e.target.value)}
                  placeholder="25.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? formatDate(deliveryDate) : "Select delivery date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productImage">Product Image</Label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    id="productImage"
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Label
                    htmlFor="productImage"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload product image</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                    </div>
                  </Label>
                  {errors.productImage && <p className="text-sm text-red-600 mt-1">{errors.productImage}</p>}
                </div>
                
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Management */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Closed Won">Closed Won</SelectItem>
                    <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source *</Label>
                <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                  <SelectTrigger className={errors.source ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Advertisement">Advertisement</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                  </SelectContent>
                </Select>
                {errors.source && <p className="text-sm text-red-600">{errors.source}</p>}
              </div>
            </div>

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
              <Label htmlFor="estimatedValue">Estimated Value (₹)</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                placeholder="50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information about the customer or requirements..."
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
              'Update Lead'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}