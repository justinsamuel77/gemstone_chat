import React, { useState, useEffect } from 'react';
import { Icons } from './ui/icons';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
}

interface NotificationSystemProps {
  leads: any[];
  orders: any[];
  onNotificationClick?: (notification: NotificationItem) => void;
}

export function NotificationSystem({ leads, orders, onNotificationClick }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Check for notifications when leads or orders change
  useEffect(() => {
    generateNotifications();
  }, [leads, orders]);

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const generateNotifications = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const newNotifications: NotificationItem[] = [];

    // Check for birthdays today
    leads.forEach(lead => {
      if (lead.dateOfBirth) {
        const birthDate = new Date(lead.dateOfBirth);
        const todayBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        if (isSameDay(todayBirthday, today)) {
          newNotifications.push({
            id: `birthday-${lead.id}`,
            type: 'birthday',
            title: '🎂 Birthday Today!',
            message: `${lead.name} is celebrating their birthday today. Consider sending wishes!`,
            date: today.toISOString(),
            priority: 'medium',
            read: false,
            relatedId: lead.id,
            relatedType: 'lead'
          });
        }
      }
    });

    // Check for marriage anniversaries today
    leads.forEach(lead => {
      if (lead.marriageDate) {
        const marriageDate = new Date(lead.marriageDate);
        const todayAnniversary = new Date(today.getFullYear(), marriageDate.getMonth(), marriageDate.getDate());
        
        if (isSameDay(todayAnniversary, today)) {
          const years = today.getFullYear() - marriageDate.getFullYear();
          newNotifications.push({
            id: `anniversary-${lead.id}`,
            type: 'anniversary',
            title: '💕 Anniversary Today!',
            message: `${lead.name} is celebrating ${years} years of marriage today. Perfect opportunity for jewelry gifts!`,
            date: today.toISOString(),
            priority: 'high',
            read: false,
            relatedId: lead.id,
            relatedType: 'lead'
          });
        }
      }
    });

    // Check for orders to be delivered in next 2 days
    orders.forEach(order => {
      if (order.expectedDelivery && (order.status === 'Ready' || order.status === 'In Production')) {
        const deliveryDate = new Date(order.expectedDelivery);
        
        if (isSameDay(deliveryDate, today)) {
          newNotifications.push({
            id: `delivery-today-${order.id}`,
            type: 'delivery',
            title: '📦 Delivery Due Today!',
            message: `Order ${order.orderNumber} for ${order.customerName} is scheduled for delivery today.`,
            date: today.toISOString(),
            priority: 'high',
            read: false,
            relatedId: order.id,
            relatedType: 'order'
          });
        } else if (isSameDay(deliveryDate, tomorrow)) {
          newNotifications.push({
            id: `delivery-tomorrow-${order.id}`,
            type: 'delivery',
            title: '⏰ Delivery Due Tomorrow',
            message: `Order ${order.orderNumber} for ${order.customerName} is scheduled for delivery tomorrow.`,
            date: today.toISOString(),
            priority: 'medium',
            read: false,
            relatedId: order.id,
            relatedType: 'order'
          });
        } else if (isSameDay(deliveryDate, dayAfterTomorrow)) {
          newNotifications.push({
            id: `delivery-soon-${order.id}`,
            type: 'delivery',
            title: '📅 Delivery Due Soon',
            message: `Order ${order.orderNumber} for ${order.customerName} is scheduled for delivery in 2 days.`,
            date: today.toISOString(),
            priority: 'low',
            read: false,
            relatedId: order.id,
            relatedType: 'order'
          });
        }
      }
    });

    // Check for overdue orders
    orders.forEach(order => {
      if (order.expectedDelivery && order.status !== 'Delivered' && order.status !== 'Cancelled') {
        const deliveryDate = new Date(order.expectedDelivery);
        
        if (deliveryDate < today) {
          newNotifications.push({
            id: `overdue-${order.id}`,
            type: 'delivery',
            title: '🚨 Order Overdue!',
            message: `Order ${order.orderNumber} for ${order.customerName} was due on ${deliveryDate.toLocaleDateString()}.`,
            date: today.toISOString(),
            priority: 'high',
            read: false,
            relatedId: order.id,
            relatedType: 'order'
          });
        }
      }
    });

    setNotifications(newNotifications);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
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
        return <span className="text-yellow-600">🎁</span>;
      case 'anniversary':
        return <span className="text-red-600">💝</span>;
      case 'delivery':
        return <Icons.Package className="w-4 h-4 text-blue-600" />;
      default:
        return <Icons.Bell className="w-4 h-4 text-gray-600" />;
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
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Icons.Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:bg-primary/10"
                  >
                    Mark all read
                  </Button>
                )}
                <Badge variant="secondary" className="text-xs">
                  {notifications.length} total
                </Badge>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Icons.Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
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
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">📅</span>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="ml-2 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Icons.X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}