import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  User,
  Package,
  Heart,
  MessageSquare,
  Edit,
  MoreHorizontal,
  Plus,
  Download,
  Eye,
  Weight,
  Gem,
  Instagram,
  Send
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  source: string;
  assignedTo: string;
  lastContact: string;
  value: number;
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
  company?: string;
  avatar?: string;
  // Additional fields from enhanced form
  dateOfBirth?: string;
  marriageDate?: string;
  address?: string;
  netWeight?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  productImage?: File | null;
  instagramUsername?: string;
}

interface LeadDetailViewProps {
  leadId: string;
  leads: Lead[];
  onBack: () => void;
  onEditLead?: (leadId: string) => void;
  onConvertToOrder?: (lead: Lead) => void;
}

// Helper function for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export function LeadDetailView({ leadId, leads, onBack, onEditLead, onConvertToOrder }: LeadDetailViewProps) {
  // Find the lead from the leads array
  const lead = leads.find(l => l.id === leadId);

  if (!lead) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">Lead Not Found</h1>
        <p className="text-muted-foreground mb-4">The requested lead could not be found.</p>
        <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
      </div>
    );
  }

  const [status, setStatus] = useState(lead.status);
  const [priority, setPriority] = useState(lead.priority);
  const [notes, setNotes] = useState(lead.notes || '');

  // Calculate estimated probability based on status
  const getStatusProbability = (status: string) => {
    const probabilities = {
      'New': 10,
      'Contacted': 25,
      'Qualified': 50,
      'Proposal': 75,
      'Negotiation': 85,
      'Closed Won': 100,
      'Closed Lost': 0
    };
    return probabilities[status as keyof typeof probabilities] || 0;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Qualified': 'bg-purple-100 text-purple-800',
      'Proposal': 'bg-orange-100 text-orange-800',
      'Negotiation': 'bg-indigo-100 text-indigo-800',
      'Closed Won': 'bg-green-100 text-green-800',
      'Closed Lost': 'bg-red-100 text-red-800'
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

  const openWhatsApp = (phoneNumber: string, message: string) => {
    if (!phoneNumber) return;
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const getWhatsAppMessage = (lead: Lead, type: 'birthday' | 'anniversary' | 'general' | 'follow-up') => {
    const name = lead.name;
    
    switch (type) {
      case 'birthday':
        return `🎂 Happy Birthday ${name}! 🎉\n\nWishing you a wonderful day filled with joy and happiness. We have some beautiful jewelry pieces that would be perfect to celebrate this special day!\n\nWould you like to see our latest collection?\n\nBest regards,\nGEMSTONE Fine Jewelry`;
      case 'anniversary':
        return `💕 Happy Anniversary ${name}! 💕\n\nCelebrating love and precious moments together! We have exquisite anniversary jewelry pieces that would make this day even more special.\n\nWould you like to explore our anniversary collection?\n\nWith love,\nGEMSTONE Fine Jewelry`;
      case 'follow-up':
        return `Hello ${name}! 👋\n\nI hope you're doing well. I wanted to follow up regarding your interest in ${lead.company}.\n\nWe have some exciting updates and would love to share them with you. When would be a good time to discuss your jewelry needs?\n\nLooking forward to hearing from you!\n\nBest regards,\nGEMSTONE Fine Jewelry`;
      default:
        return `Hello ${name}! 👋\n\nThank you for your interest in MADHAVAN JEWELLERS. We're here to help you find the perfect piece.\n\nHow can we assist you today?\n\nBest regards,\nGEMSTONE Fine Jewelry`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lead Details</h1>
            <p className="text-gray-600">Complete lead information and management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
            onClick={() => onEditLead?.(leadId)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Lead
          </Button>
          <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Lead Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-4 ring-primary/10">
                    <AvatarImage src={lead.avatar} />
                    <AvatarFallback className="text-lg font-medium bg-primary text-primary-foreground">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{lead.name}</h3>
                  <p className="text-gray-600">{lead.company}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge className={`${getStatusColor(status)} border`}>
                      {status}
                    </Badge>
                    <Badge className={`${getPriorityColor(priority)} border`}>
                      {priority} Priority
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 flex-1">{lead.phone}</span>
                    {lead.phone && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${lead.phone}`)}
                          className="h-6 px-2 text-xs border-gray-300 hover:bg-gray-100"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openWhatsApp(lead.phone, getWhatsAppMessage(lead, 'general'))}
                          className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                    )}
                  </div>
                  {lead.instagramUsername && (
                    <div className="flex items-center gap-3">
                      <Instagram className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-700">{lead.instagramUsername}</span>
                    </div>
                  )}
                  {lead.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-700">{lead.address}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {lead.dateOfBirth && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Date of Birth</span>
                      <p className="text-gray-700 mt-1">{formatDate(lead.dateOfBirth)}</p>
                    </div>
                  )}
                  {lead.marriageDate && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Marriage Date</span>
                      <p className="text-gray-700 mt-1">{formatDate(lead.marriageDate)}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Lead Source</span>
                    <p className="text-gray-700 mt-1">{lead.source}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Interest */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <Gem className="w-5 h-5 text-primary" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Product Interest</span>
                  <p className="text-gray-900 mt-1 font-medium">{lead.company}</p>
                </div>
                {lead.netWeight && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Net Weight</span>
                    <p className="text-gray-900 mt-1 font-medium">{lead.netWeight}</p>
                  </div>
                )}
              </div>
              
              {lead.estimatedDeliveryDate && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Expected Delivery</span>
                  <p className="text-gray-700 mt-1">{formatDate(lead.estimatedDeliveryDate)}</p>
                </div>
              )}

              {lead.productImage && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2 block">Product Image</span>
                  <div className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">Notes & Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this lead..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] rounded-lg border-gray-200 resize-none"
              />
              <Button className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">Lead Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="rounded-lg border-gray-200">
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

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Deal Probability</span>
                  <span className="text-sm text-gray-500">{getStatusProbability(status)}%</span>
                </div>
                <Progress value={getStatusProbability(status)} className="h-2" />
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Deal Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <DollarSign className="w-5 h-5 text-primary" />
                Deal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Estimated Value</span>
                <p className="text-2xl font-bold text-primary mt-1">₹{lead.value.toLocaleString()}</p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assigned To:</span>
                  <span className="text-sm font-medium text-gray-900">{lead.assignedTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(lead.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Contact:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(lead.lastContact)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.phone && (
                <Button 
                  onClick={() => openWhatsApp(lead.phone, getWhatsAppMessage(lead, 'follow-up'))}
                  className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Follow Up via WhatsApp
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => lead.phone && window.open(`tel:${lead.phone}`)}
                disabled={!lead.phone}
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Phone className="w-4 h-4 mr-2 text-primary" />
                Schedule Call
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                Schedule Meeting
              </Button>
              {lead.dateOfBirth && (
                <Button 
                  onClick={() => openWhatsApp(lead.phone, getWhatsAppMessage(lead, 'birthday'))}
                  disabled={!lead.phone}
                  variant="outline" 
                  className="w-full justify-start border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-800"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Send Birthday Wishes
                </Button>
              )}
              {lead.marriageDate && (
                <Button 
                  onClick={() => openWhatsApp(lead.phone, getWhatsAppMessage(lead, 'anniversary'))}
                  disabled={!lead.phone}
                  variant="outline" 
                  className="w-full justify-start border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-800"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Send Anniversary Wishes
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                <Plus className="w-4 h-4 mr-2 text-primary" />
                Add Note
              </Button>
            </CardContent>
          </Card>

          {/* Convert to Order */}
          <Card className="border-0 shadow-lg border-l-4 border-l-primary">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">Convert Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Ready to convert this lead to an order?</p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onConvertToOrder?.(lead)}
              >
                <Package className="w-4 h-4 mr-2" />
                Convert to Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}