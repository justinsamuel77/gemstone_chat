import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Gift, 
  Heart, 
  Package, 
  X, 
  Calendar,
  Check,
  CheckCheck,
  Filter,
  Search,
  RefreshCw,
  MessageSquare,
  Phone
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { useDataManager } from './DataManager';

interface NotificationItem {
  id: string;
  type: 'birthday' | 'anniversary' | 'delivery' | 'general';
  title: string;
  message: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  relatedId?: string;
  relatedType?: 'lead' | 'order';
  phoneNumber?: string;
  customerName?: string;
}

interface NotificationScreenProps {
  onNotificationClick?: (notification: NotificationItem) => void;
}

export function NotificationScreen({ onNotificationClick }: NotificationScreenProps) {
  const { leads, orders } = useDataManager();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Generate notifications when leads or orders change
  useEffect(() => {
    generateNotifications();
  }, [leads, orders]);

  const generateNotifications = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const newNotifications: NotificationItem[] = [];

    // Check for birthdays (today and upcoming week)
    leads.forEach(lead => {
      if (lead.dateOfBirth) {
        const birthDate = new Date(lead.dateOfBirth);
        const todayBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // If birthday already passed this year, check next year
        if (todayBirthday < today) {
          todayBirthday.setFullYear(today.getFullYear() + 1);
        }

        const daysDiff = Math.ceil((todayBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          newNotifications.push({
            id: `birthday-${lead.id}`,
            type: 'birthday',
            title: '🎂 Birthday Today!',
            message: `${lead.name} is celebrating their birthday today. Perfect time to send wishes and showcase special jewelry pieces!`,
            date: today.toISOString(),
            priority: 'high',
            read: false,
            relatedId: lead.id,
            relatedType: 'lead',
            phoneNumber: lead.phone,
            customerName: lead.name
          });
        } else if (daysDiff === 1) {
          newNotifications.push({
            id: `birthday-tomorrow-${lead.id}`,
            type: 'birthday',
            title: '🎂 Birthday Tomorrow',
            message: `${lead.name}'s birthday is tomorrow. Consider reaching out with birthday jewelry recommendations!`,
            date: today.toISOString(),
            priority: 'medium',
            read: false,
            relatedId: lead.id,
            relatedType: 'lead',
            phoneNumber: lead.phone,
            customerName: lead.name
          });
        } else if (daysDiff <= 7) {
          newNotifications.push({
            id: `birthday-upcoming-${lead.id}`,
            type: 'birthday',
            title: '🎂 Upcoming Birthday',
            message: `${lead.name}'s birthday is in ${daysDiff} days. Great opportunity for advance planning!`,
            date: today.toISOString(),
            priority: 'low',
            read: false,
            relatedId: lead.id,
            relatedType: 'lead',
            phoneNumber: lead.phone,
            customerName: lead.name
          });
        }
      }
    });

    // Check for marriage anniversaries
    leads.forEach(lead => {
      if (lead.marriageDate) {
        const marriageDate = new Date(lead.marriageDate);
        const todayAnniversary = new Date(today.getFullYear(), marriageDate.getMonth(), marriageDate.getDate());
        
        // If anniversary already passed this year, check next year
        if (todayAnniversary < today) {
          todayAnniversary.setFullYear(today.getFullYear() + 1);
        }

        const daysDiff = Math.ceil((todayAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const years = today.getFullYear() - marriageDate.getFullYear();
        
        if (daysDiff === 0) {
          newNotifications.push({
            id: `anniversary-${lead.id}`,
            type: 'anniversary',
            title: '💕 Anniversary Today!',
            message: `${lead.name} is celebrating ${years} years of marriage today. Perfect opportunity for jewelry gifts!`,
            date: today.toISOString(),
            priority: 'high',
            read: false,
            relatedId: lead.id,
            relatedType: 'lead',
            phoneNumber: lead.phone,
            customerName: lead.name
          });
        } else if (daysDiff === 1) {
          newNotifications.push({
            id: `anniversary-tomorrow-${lead.id}`,
            type: 'anniversary',
            title: '💕 Anniversary Tomorrow',
            message: `${lead.name}'s ${years} year anniversary is tomorrow. Ideal time for anniversary jewelry!`,
            date: today.toISOString(),
            priority: 'medium',
            read: false,
            relatedId: lead.id,
            relatedType: 'lead',
            phoneNumber: lead.phone,
            customerName: lead.name
          });
        } else if (daysDiff <= 7) {
          newNotifications.push({
            id: `anniversary-upcoming-${lead.id}`,
            type: 'anniversary',
            title: '💕 Upcoming Anniversary',
            message: `${lead.name}'s ${years} year anniversary is in ${daysDiff} days. Start planning special offers!`,
            date: today.toISOString(),
            priority: 'low',
            read: false,
            relatedId: lead.id,
            relatedType: 'lead',
            phoneNumber: lead.phone,
            customerName: lead.name
          });
        }
      }
    });

    // Check for order deliveries
    orders.forEach(order => {
      if (order.expectedDelivery && order.status !== 'Delivered' && order.status !== 'Cancelled') {
        const deliveryDate = new Date(order.expectedDelivery);
        const daysDiff = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) {
          // Overdue
          newNotifications.push({
            id: `overdue-${order.id}`,
            type: 'delivery',
            title: '🚨 Order Overdue!',
            message: `Order ${order.orderNumber} for ${order.customerName} was due ${Math.abs(daysDiff)} days ago.`,
            date: today.toISOString(),
            priority: 'high',
            read: false,
            relatedId: order.id,
            relatedType: 'order',
            phoneNumber: order.customerPhone,
            customerName: order.customerName
          });
        } else if (daysDiff === 0) {
          // Due today
          newNotifications.push({
            id: `delivery-today-${order.id}`,
            type: 'delivery',
            title: '📦 Delivery Due Today!',
            message: `Order ${order.orderNumber} for ${order.customerName} is scheduled for delivery today.`,
            date: today.toISOString(),
            priority: 'high',
            read: false,
            relatedId: order.id,
            relatedType: 'order',
            phoneNumber: order.customerPhone,
            customerName: order.customerName
          });
        } else if (daysDiff === 1) {
          // Due tomorrow
          newNotifications.push({
            id: `delivery-tomorrow-${order.id}`,
            type: 'delivery',
            title: '⏰ Delivery Due Tomorrow',
            message: `Order ${order.orderNumber} for ${order.customerName} is scheduled for delivery tomorrow.`,
            date: today.toISOString(),
            priority: 'medium',
            read: false,
            relatedId: order.id,
            relatedType: 'order',
            phoneNumber: order.customerPhone,
            customerName: order.customerName
          });
        } else if (daysDiff <= 3) {
          // Due soon
          newNotifications.push({
            id: `delivery-soon-${order.id}`,
            type: 'delivery',
            title: '📅 Delivery Due Soon',
            message: `Order ${order.orderNumber} for ${order.customerName} is scheduled for delivery in ${daysDiff} days.`,
            date: today.toISOString(),
            priority: 'low',
            read: false,
            relatedId: order.id,
            relatedType: 'order',
            phoneNumber: order.customerPhone,
            customerName: order.customerName
          });
        }
      }
    });

    setNotifications(newNotifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Gift className="w-5 h-5 text-yellow-600" />;
      case 'anniversary':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'delivery':
        return <Package className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const openWhatsApp = (phoneNumber: string, message: string) => {
    if (!phoneNumber) return;
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const getWhatsAppMessage = (notification: NotificationItem) => {
    switch (notification.type) {
      case 'birthday':
        return `🎂 Happy Birthday ${notification.customerName}! 🎉\n\nWishing you a wonderful day filled with joy and happiness. We have some beautiful jewelry pieces that would be perfect to celebrate this special day!\n\nWould you like to see our latest collection?\n\nBest regards,\nGEMSTONE Fine Jewelry`;
      case 'anniversary':
        return `💕 Happy Anniversary ${notification.customerName}! 💕\n\nCelebrating love and precious moments together! We have exquisite anniversary jewelry pieces that would make this day even more special.\n\nWould you like to explore our anniversary collection?\n\nWith love,\nGEMSTONE Fine Jewelry`;
      case 'delivery':
        return `📦 Hello ${notification.customerName}!\n\nYour jewelry order is ready for delivery. We wanted to confirm the delivery details and ensure everything is perfect for you.\n\nPlease let us know your preferred delivery time.\n\nThank you,\nGEMSTONE Fine Jewelry`;
      default:
        return `Hello ${notification.customerName}!\n\nWe hope you're doing well. We wanted to reach out regarding your jewelry needs.\n\nBest regards,\nGEMSTONE Fine Jewelry`;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'unread' && !notification.read) ||
                      (activeTab === 'read' && notification.read);
    
    return matchesSearch && matchesType && matchesPriority && matchesTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with birthdays, anniversaries, and delivery reminders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={generateNotifications}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-semibold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-semibold">{highPriorityCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">With WhatsApp</p>
                <p className="text-2xl font-semibold">
                  {notifications.filter(n => n.phoneNumber).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {highPriorityCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <Bell className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have {highPriorityCount} high priority notification{highPriorityCount > 1 ? 's' : ''} that need immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="birthday">Birthdays</SelectItem>
                <SelectItem value="anniversary">Anniversaries</SelectItem>
                <SelectItem value="delivery">Deliveries</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read">Read ({notifications.length - unreadCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No notifications found</h3>
              <p className="text-sm">
                {searchTerm || filterType !== 'all' || filterPriority !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : 'You\'re all caught up!'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    getPriorityColor(notification.priority)
                  } ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              notification.priority === 'high' ? 'border-red-500 text-red-700' :
                              notification.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                              'border-green-500 text-green-700'
                            }`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(notification.date).toLocaleDateString()}</span>
                          </div>
                          {notification.phoneNumber && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const phone = `tel:${notification.phoneNumber}`;
                                  window.open(phone);
                                }}
                                className="h-7 px-2 gap-1 text-xs"
                              >
                                <Phone className="w-3 h-3" />
                                Call
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openWhatsApp(notification.phoneNumber!, getWhatsAppMessage(notification));
                                }}
                                className="h-7 px-2 gap-1 text-xs bg-green-600 hover:bg-green-700 text-white"
                              >
                                <MessageSquare className="w-3 h-3" />
                                WhatsApp
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        title="Delete notification"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}