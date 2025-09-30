import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Icons } from './ui/icons';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

interface DashboardContentProps {
  user: User;
}

export function DashboardContent({ user }: DashboardContentProps) {
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
        <div className="grid grid-cols-3 gap-8">
          {/* Recent Customers */}
          <Card className="border-0 shadow-sm">
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
          </Card>

          {/* Weekly Sales Chart */}
          <Card className="border-0 shadow-sm">
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
          </Card>

          {/* Category Distribution */}
          <Card className="border-0 shadow-sm">
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
          </Card>
        </div>
      </div>
    </div>
  );
}