import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Icons } from './ui/icons';
import { openWhatsAppChat, openInstagramChat } from './MessagingIntegration';
// Helper function for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
import { cn } from './ui/utils';

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

interface LeadListProps {
  leads: Lead[];
  onSelectLead: (leadId: string) => void;
  onAddLead: () => void;
  onEditLead: (leadId: string) => void;
  onDeleteLead: (leadId: string) => void;
  onAssignLead: (leadId: string, assignee: string) => void;
  onNavigateToChat?: (platform: 'whatsapp' | 'instagram', contactInfo: any) => void;
}

// Mock data for demonstration
const mockLeads: Lead[5] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    status: 'New',
    source: 'Website',
    assignedTo: 'Jeweler Rajesh',
    lastContact: '2024-01-15',
    value: 85000,
    priority: 'High',
    createdAt: '2024-01-10',
    company: 'Looking for engagement ring'
  },
  {
    id: '2',
    name: 'Rohit Mehta',
    email: 'rohit.mehta@email.com',
    phone: '+91 87654 32109',
    status: 'Contacted',
    source: 'Referral',
    assignedTo: 'Sales Manager Kavya',
    lastContact: '2024-01-14',
    value: 125000,
    priority: 'High',
    createdAt: '2024-01-08',
    company: 'Wedding jewelry set'
  },
  {
    id: '3',
    name: 'Anjali Patel',
    email: 'anjali.patel@email.com',
    phone: '+91 76543 21098',
    status: 'Qualified',
    source: 'Social Media',
    assignedTo: 'Designer Arjun',
    lastContact: '2024-01-13',
    value: 45000,
    priority: 'Medium',
    createdAt: '2024-01-05',
    company: 'Custom necklace design'
  },
  {
    id: '4',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    phone: '+91 65432 10987',
    status: 'Proposal',
    source: 'Walk-in',
    assignedTo: 'Senior Jeweler Meera',
    lastContact: '2024-01-12',
    value: 275000,
    priority: 'High',
    createdAt: '2024-01-03',
    company: 'Luxury diamond bracelet'
  },
  {
    id: '5',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@email.com',
    phone: '+91 54321 09876',
    status: 'Negotiation',
    source: 'Instagram',
    assignedTo: 'Consultant Amit',
    lastContact: '2024-01-11',
    value: 65000,
    priority: 'High',
    createdAt: '2024-01-01',
    company: 'Gold earrings collection'
  },
  {
    id: '6',
    name: 'Rahul Gupta',
    email: 'rahul.gupta@email.com',
    phone: '+91 43210 98765',
    status: 'Closed Won',
    source: 'Friend Referral',
    assignedTo: 'Store Manager Priya',
    lastContact: '2024-01-10',
    value: 150000,
    priority: 'Medium',
    createdAt: '2023-12-28',
    company: 'Anniversary gift jewelry'
  }
];

export function LeadList({ leads, onSelectLead, onAddLead, onEditLead, onDeleteLead, onAssignLead, onNavigateToChat }: LeadListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const openWhatsApp = (phoneNumber: string, message: string) => {
    if (!phoneNumber) return;
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const getWhatsAppMessage = (lead: Lead) => {
    return `Hello ${lead.name}! 👋\n\nThank you for your interest in MADHAVAN JEWELLERS. We're here to help you find the perfect piece.\n\nHow can we assist you today?\n\nBest regards,\nGEMSTONE Fine Jewelry`;
  };
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || lead.assignedTo === assigneeFilter;
      
      const leadDate = new Date(lead.createdAt);
      const matchesDateFrom = !dateFrom || leadDate >= dateFrom;
      const matchesDateTo = !dateTo || leadDate <= dateTo;

      return matchesSearch && matchesStatus && matchesSource && 
             matchesPriority && matchesAssignee && matchesDateFrom && matchesDateTo;
    });
  }, [leads, searchTerm, statusFilter, sourceFilter, priorityFilter, assigneeFilter, dateFrom, dateTo]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLeads.slice(startIndex, startIndex + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize);

  // Filter out falsy/empty assignees to avoid Select.Item with empty value
  const uniqueAssignees = [...new Set(leads.map(lead => lead.assignedTo).filter(Boolean))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Lead Management</h1>
          <p className="text-muted-foreground">Manage and track your leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Icons.Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={onAddLead} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Icons.Plus className="w-4 h-4 mr-2" />
            Add Lead
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
                <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
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
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Closed Won">Closed Won</SelectItem>
                <SelectItem value="Closed Lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
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

            {/* Assignee Filter */}
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {uniqueAssignees.map(assignee => (
                  <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                ))}
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
                  <Icons.Calendar className="mr-2 h-4 w-4" />
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
          {(searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || dateFrom || dateTo) && (
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
              {sourceFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Source: {sourceFilter}
                  <button onClick={() => setSourceFilter('all')} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSourceFilter('all');
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
          Showing {paginatedLeads.length} of {filteredLeads.length} leads
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <Icons.ChevronLeft className="w-4 h-4" />
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
            <Icons.ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Lead</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Source</th>
                  <th className="text-left p-4 font-medium">Priority</th>
                  <th className="text-left p-4 font-medium">Assigned To</th>
                  <th className="text-left p-4 font-medium">Value</th>
                  <th className="text-left p-4 font-medium">Last Contact</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={lead.avatar} />
                          <AvatarFallback>
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {lead.source === 'Instagram' 
                              ? lead.instagramUsername 
                              : lead.email
                            }
                          </div>
                          {lead.company && (
                            <div className="text-xs text-muted-foreground">{lead.company}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{lead.source}</span>
                    </td>
                    <td className="p-4">
                      <Badge className={getPriorityColor(lead.priority)}>
                        {lead.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{lead.assignedTo}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">${lead.value.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{formatDate(lead.lastContact)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* WhatsApp button for any lead with phone number */}
                        {lead.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Prefer internal app chat navigation when available (keeps user inside platform)
                              if (onNavigateToChat) {
                                onNavigateToChat('whatsapp', {
                                  id: lead.id,
                                  name: lead.name,
                                  phone: lead.phone,
                                  avatar: lead.avatar,
                                });
                                return;
                              }

                              // Fallback to opening external WhatsApp if no internal handler provided
                              openWhatsApp(lead.phone, getWhatsAppMessage(lead));
                            }}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Open WhatsApp Chat"
                          >
                            <Icons.MessageSquare className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Call button for any lead with phone number */}
                        {lead.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`tel:${lead.phone}`)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Call Lead"
                          >
                            <Icons.Phone className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {/* Instagram button for Instagram leads */}
                        {lead.source === 'Instagram' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigateToChat?.('instagram', {
                              id: lead.id,
                              username: lead.instagramUsername,
                              fullName: lead.name,
                              avatar: lead.avatar
                            })}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            title="Open Instagram Chat"
                          >
                            <Icons.Instagram className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Built-in WhatsApp chat for WhatsApp leads */}
                        {lead.source === 'WhatsApp' && lead.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigateToChat?.('whatsapp', {
                              id: lead.id,
                              name: lead.name,
                              phone: lead.phone,
                              avatar: lead.avatar
                            })}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            title="Open Internal WhatsApp Chat"
                          >
                            <Icons.MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectLead(lead.id)}
                          title="View Lead Details"
                        >
                          <Icons.Eye className="w-4 h-4" />
                        </Button>
                        
                        {/* 3-dot menu with edit, delete, assign options */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Icons.MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onEditLead(lead.id)}>
                              <Icons.Edit className="w-4 h-4 mr-2" />
                              Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDeleteLead(lead.id)}>
                              <Icons.Trash2 className="w-4 h-4 mr-2 text-red-600" />
                              <span className="text-red-600">Delete Lead</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onAssignLead(lead.id, 'Jeweler Rajesh')}
                            >
                              <Icons.UserPlus className="w-4 h-4 mr-2" />
                              Assign to Rajesh
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onAssignLead(lead.id, 'Sales Manager Kavya')}
                            >
                              <Icons.UserPlus className="w-4 h-4 mr-2" />
                              Assign to Kavya
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onAssignLead(lead.id, 'Designer Arjun')}
                            >
                              <Icons.UserPlus className="w-4 h-4 mr-2" />
                              Assign to Arjun
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