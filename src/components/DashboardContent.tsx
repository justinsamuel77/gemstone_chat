import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Icons } from './ui/icons';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LeadList } from './LeadList';
import { apiService } from '../utils/supabase/api';

interface User {
  id: string;
  email: string;
  name: string;
  profile?: {
    firstName: string;
    lastName: string;
    company?: string;
    jobTitle?: string;
  };
}

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
  dateOfBirth?: string;
  marriageDate?: string;
  address?: string;
  netWeight?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  productImage?: File | null;
  instagramUsername?: string;
}

interface DashboardContentProps {
  user: User;
}

export function DashboardContent({ user }: DashboardContentProps) {
  // State management for leads
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectedToServer, setIsConnectedToServer] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  // Initial fallback leads data
  const initialLeads: Lead[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 9876543210',
      status: 'Qualified',
      source: 'Website',
      assignedTo: 'Rajesh Kumar',
      lastContact: '2024-01-25',
      value: 85000,
      priority: 'High',
      createdAt: '2024-01-15',
      company: 'Tech Solutions Inc',
      avatar: 'PS',
      notes: 'Interested in custom engagement ring'
    },
    {
      id: '2',
      name: 'Rohit Mehta',
      email: 'rohit.mehta@email.com',
      phone: '+91 9876543211',
      status: 'Proposal',
      source: 'Referral',
      assignedTo: 'Vikram Singh',
      lastContact: '2024-01-24',
      value: 125000,
      priority: 'High',
      createdAt: '2024-01-10',
      company: 'Finance Corp',
      avatar: 'RM',
      notes: 'Wedding jewelry set inquiry'
    },
    {
      id: '3',
      name: 'Anjali Patel',
      email: 'anjali.patel@email.com',
      phone: '+91 9876543212',
      status: 'Contacted',
      source: 'Social Media',
      assignedTo: 'Rajesh Kumar',
      lastContact: '2024-01-23',
      value: 15000,
      priority: 'Medium',
      createdAt: '2024-01-20',
      company: 'Design Studio',
      avatar: 'AP',
      notes: 'Diamond necklace repair'
    },
    {
      id: '4',
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      phone: '+91 9876543213',
      status: 'New',
      source: 'Walk-in',
      assignedTo: 'Vikram Singh',
      lastContact: '2024-01-25',
      value: 45000,
      priority: 'Medium',
      createdAt: '2024-01-25',
      company: 'Consulting Group',
      avatar: 'VS',
      notes: 'Gold chain purchase'
    },
    {
      id: '5',
      name: 'Neha Gupta',
      email: 'neha.gupta@email.com',
      phone: '+91 9876543214',
      status: 'Negotiation',
      source: 'Instagram',
      assignedTo: 'Rajesh Kumar',
      lastContact: '2024-01-24',
      value: 95000,
      priority: 'High',
      createdAt: '2024-01-12',
      company: 'Fashion Brand',
      avatar: 'NG',
      instagramUsername: 'neha.gupta.fashion',
      notes: 'Custom bracelet design'
    },
    {
      id: '6',
      name: 'Arjun Desai',
      email: 'arjun.desai@email.com',
      phone: '+91 9876543215',
      status: 'Closed Won',
      source: 'Advertisement',
      assignedTo: 'Vikram Singh',
      lastContact: '2024-01-22',
      value: 150000,
      priority: 'High',
      createdAt: '2023-12-15',
      company: 'Real Estate Dev',
      avatar: 'AD',
      notes: 'Wedding collection purchased'
    },
    {
      id: '7',
      name: 'Divya Nair',
      email: 'divya.nair@email.com',
      phone: '+91 9876543216',
      status: 'Contacted',
      source: 'WhatsApp',
      assignedTo: 'Rajesh Kumar',
      lastContact: '2024-01-25',
      value: 35000,
      priority: 'Low',
      createdAt: '2024-01-23',
      company: 'Healthcare',
      avatar: 'DN',
      notes: 'Earring inquiry'
    },
    {
      id: '8',
      name: 'Sanjay Reddy',
      email: 'sanjay.reddy@email.com',
      phone: '+91 9876543217',
      status: 'Closed Lost',
      source: 'Cold Call',
      assignedTo: 'Vikram Singh',
      lastContact: '2024-01-20',
      value: 25000,
      priority: 'Low',
      createdAt: '2024-01-05',
      company: 'Retail',
      avatar: 'SR',
      notes: 'Budget constraints - not interested'
    }
  ];

  // Import apiService - adjust the import path based on your project structure
  // apiService is already imported at the top

  const loadLeads = async () => {
    console.log('🔄 Starting to load leads...');
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');

      console.log('🔑 Access token exists:', !!accessToken);
      console.log('👤 User data exists:', !!user);

      if (!accessToken) {
        console.warn('⚠️ No access token found - using initial leads data');
        setLeads(initialLeads);
        setIsLoading(false);
        return;
      }

      console.log('📡 Making API call to get leads...');
      const response = await apiService.getLeads();
      console.log('📥 Leads API response:', {
        success: response.success,
        hasData: !!response.data,
        hasLeads: !!(response.data?.leads),
        leadCount: response.data?.leads?.length || 0,
        error: response.error
      });

      if (response.success && response.data && response.data.leads) {
        console.log(`✅ Successfully loaded ${response.data.leads.length} leads from server`);
        console.log('🔍 Lead data sample:', response.data.leads[0]);

        // Validate and filter leads data
        const validLeads = response.data.leads.filter((lead: any) => {
          const isValid = lead && lead.id && lead.name;
          if (!isValid) {
            console.warn('⚠️ Invalid lead data found:', lead);
          }
          return isValid;
        });

        console.log(`📊 Setting ${validLeads.length} valid leads`);
        setLeads(validLeads);
        setIsConnectedToServer(true);
      } else {
        console.error('❌ Failed to load leads from server:', response.error);
        console.log('🔄 Falling back to initial leads data');
        setLeads(initialLeads);
        setIsConnectedToServer(false);

        // Show user-friendly error
        if (response.error) {
          console.warn('API Error Details:', response.error);
          setDataLoadError(`Failed to load leads: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('💥 Exception while loading leads:', error);
      console.log('🔄 Using initial leads data due to exception');
      setLeads(initialLeads);
      setIsConnectedToServer(false);

      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        setDataLoadError(`Connection error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
      console.log('✨ Leads loading process completed');
    }
  };

  // Load leads on component mount
  useEffect(() => {
    loadLeads();
  }, []);
  const metricCards = [
    {
      title: 'New Customers Today',
      value: '12',
      change: '+18%',
      period: 'from Yesterday',
      color: 'primary',
      isPositive: true,
      icon: <Icons.Circle className="w-5 h-5" />
    },
    {
      title: 'Daily Sales Revenue',
      value: '₹45,000',
      change: '+25%',
      period: 'from Yesterday',
      color: 'yellow',
      isPositive: true,
      icon: <Icons.ShoppingCart className="w-5 h-5" />
    },
    {
      title: 'Orders Processed',
      value: '8',
      change: '+12%',
      period: 'from Yesterday',
      color: 'green',
      isPositive: true,
      icon: <Icons.Package className="w-5 h-5" />
    },
    {
      title: 'Custom Orders Pending',
      value: '15',
      change: '+5%',
      period: 'from Yesterday',
      color: 'pink',
      isPositive: true,
      icon: <Icons.Gem className="w-5 h-5" />
    }
  ];

  const overallMetrics = [
    {
      title: 'Total Active Leads',
      value: '156',
      change: '+23%',
      period: 'from Last Month',
      color: 'primary',
      icon: <Icons.Circle className="w-5 h-5" />
    },
    {
      title: 'Pending Payments',
      value: '₹2,85,000',
      change: '+15%',
      period: 'from Last Month',
      color: 'yellow',
      icon: <Icons.Circle className="w-5 h-5" />
    },
    {
      title: 'Completed Orders',
      value: '89',
      change: '+31%',
      period: 'from Last Month',
      color: 'green',
      icon: <Icons.CheckCircle className="w-5 h-5" />
    },
    {
      title: 'Low Stock Items',
      value: '24',
      change: '-8%',
      period: 'from Last Month',
      color: 'red',
      icon: <Icons.AlertTriangle className="w-5 h-5" />
    }
  ];

  const recentCustomers = [
    {
      name: 'Priya Sharma',
      service: 'Custom Engagement Ring',
      avatar: 'PS',
      status: 'active',
      value: '₹85,000',
      type: 'Custom Order'
    },
    {
      name: 'Rohit Mehta',
      service: 'Wedding Jewelry Set',
      avatar: 'RM',
      status: 'selected',
      value: '₹1,25,000',
      type: 'Bulk Order'
    },
    {
      name: 'Anjali Patel',
      service: 'Diamond Necklace Repair',
      avatar: 'AP',
      status: 'active',
      value: '₹15,000',
      type: 'Repair'
    },
    {
      name: 'Vikram Singh',
      service: 'Gold Chain Purchase',
      avatar: 'VS',
      status: 'active',
      value: '₹45,000',
      type: 'Sale'
    }
  ];

  const salesData = [
    { day: 'Mon', rings: 15, necklaces: 8, earrings: 12, bracelets: 5 },
    { day: 'Tue', rings: 22, necklaces: 12, earrings: 15, bracelets: 8 },
    { day: 'Wed', rings: 18, necklaces: 15, earrings: 18, bracelets: 10 },
    { day: 'Thu', rings: 28, necklaces: 10, earrings: 20, bracelets: 12 },
    { day: 'Fri', rings: 25, necklaces: 18, earrings: 25, bracelets: 15 },
    { day: 'Sat', rings: 35, necklaces: 22, earrings: 30, bracelets: 18 },
    { day: 'Sun', rings: 20, necklaces: 14, earrings: 16, bracelets: 8 }
  ];

  const categoryData = [
    { name: 'Rings', value: 35, color: '#1E5128' },
    { name: 'Necklaces', value: 25, color: '#2D7A3E' },
    { name: 'Earrings', value: 20, color: '#4A9960' },
    { name: 'Bracelets', value: 12, color: '#66B77C' },
    { name: 'Watches', value: 8, color: '#82D598' }
  ];

  const getIndicatorColor = (color: string) => {
    const colors = {
      primary: 'bg-primary',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      pink: 'bg-pink-500',
      red: 'bg-red-500'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Icons.Circle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search jewelry, customers, orders..."
                className="pl-10 bg-gray-50 border-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
            <Button variant="ghost" size="icon">
              <Icons.Bell className="w-5 h-5" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-200 text-gray-700">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Today's Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {metricCards.map((metric, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-2 h-2 rounded-full ${getIndicatorColor(metric.color)}`} />
                  <Icons.MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getIndicatorColor(metric.color)}/10`}>
                      {metric.icon}
                    </div>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-semibold">{metric.value}</span>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary text-sm">
                        <Icons.ArrowRight className="w-3 h-3" />
                        {metric.change}
                      </div>
                      <p className="text-xs text-gray-500">{metric.period}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Overall Business Metrics:</h2>
          <div className="grid grid-cols-4 gap-6">
            {overallMetrics.map((metric, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-2 h-2 rounded-full ${getIndicatorColor(metric.color)}`} />
                    <Icons.MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getIndicatorColor(metric.color)}/10`}>
                        {metric.icon}
                      </div>
                      <p className="text-sm text-gray-600">{metric.title}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-semibold">{metric.value}</span>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-primary text-sm">
                          <Icons.ArrowRight className="w-3 h-3" />
                          {metric.change}
                        </div>
                        <p className="text-xs text-gray-500">{metric.period}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-8">
          {dataLoadError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <Icons.AlertTriangle className="w-4 h-4" />
                  <p>{dataLoadError}</p>
                </div>
              </CardContent>
            </Card>
          )}
          <LeadList
            leads={leads}
            onSelectLead={(leadId) => console.log('Selected lead:', leadId)}
            onAddLead={() => console.log('Add lead clicked')}
            onEditLead={(leadId) => console.log('Edit lead:', leadId)}
            onDeleteLead={(leadId) => console.log('Delete lead:', leadId)}
            onAssignLead={(leadId, assignee) => console.log('Assign lead:', leadId, 'to', assignee)}
            onNavigateToChat={(platform, contactInfo) => console.log('Navigate to chat:', platform, contactInfo)}
            from={"dashboard"}
          />
          {/* Recent Customers */}
          {/* <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Recent Customers</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  Sort by Latest
                  <Icons.ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-4">
                {recentCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      customer.status === 'selected' 
                        ? 'bg-gray-900 text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={customer.status === 'selected' ? 'bg-gray-700' : 'bg-gray-200'}>
                        {customer.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{customer.name}</p>
                      <p className={`text-sm ${customer.status === 'selected' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {customer.service}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {customer.type}
                        </Badge>
                        <span className="text-xs font-medium text-primary">{customer.value}</span>
                      </div>
                    </div>
                    {customer.status === 'selected' && (
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="text-white hover:bg-gray-700 w-8 h-8">
                          <Icons.MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-gray-700 w-8 h-8">
                          <Icons.Circle className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-gray-700 w-8 h-8">
                          <Icons.ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-gray-700 w-8 h-8">
                          <Icons.MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button className="text-sm text-primary hover:text-primary/80 mt-4">
                View all customers →
              </button>
            </CardContent>
          </Card> */}

          {/* Weekly Sales Chart */}
          {/* <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6">Weekly Sales by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis hide />
                    <Bar dataKey="rings" stackId="a" fill="var(--color-primary)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="necklaces" stackId="a" fill="#2D7A3E" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="earrings" stackId="a" fill="#4A9960" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="bracelets" stackId="a" fill="#66B77C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card> */}

          {/* Category Distribution */}
          {/* <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6">Sales Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{category.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}