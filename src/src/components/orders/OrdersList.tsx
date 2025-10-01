import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';
import { ordersApi } from '../../lib/api';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No access token');

      const response = await ordersApi.getOrders(accessToken);
      setOrders(response.orders || []);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Orders</h2>
          <p className="text-muted-foreground">Track your jewelry orders</p>
        </div>
        <Button>
          Create Order
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No orders found</p>
          <Button>Create your first order</Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Order #</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono">{order.order_number}</td>
                    <td className="p-4">{order.customer_name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">${order.total_amount?.toLocaleString() || '0'}</td>
                    <td className="p-4">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}