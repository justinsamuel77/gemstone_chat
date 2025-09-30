import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardContent } from './DashboardContent';
import { LeadList } from './LeadList';
import { LeadDetailView } from './LeadDetailView';
import { AddLeadForm } from './AddLeadForm';
import { OrderList } from './OrderList';
import { OrderDetailView } from './OrderDetailView';
import { AddOrderForm } from './AddOrderForm';
import { InventoryList } from './InventoryList';
import { MessagingIntegration, IncomingMessage } from './MessagingIntegration';
import { EditLeadForm } from './EditLeadForm';
import { EditOrderForm } from './EditOrderForm';
import { DealerList } from './DealerList';
import { AddDealerForm } from './AddDealerForm';
import { EditDealerForm } from './EditDealerForm';
import { NotificationSystem } from './NotificationSystem';
import { ProfileManagement } from './ProfileManagement';
import { WhatsAppChat } from './WhatsAppChat';
import { InstagramChat } from './InstagramChat';
import { ServerDiagnostic } from './ServerDiagnostic';
import { apiService } from '../utils/supabase/api';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, Wifi, WifiOff, RefreshCw, Loader2, CheckCircle } from 'lucide-react';

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
  company: string;
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

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'Pending' | 'Confirmed' | 'In Production' | 'Ready' | 'Delivered' | 'Cancelled';
  type: 'Sale' | 'Custom Order' | 'Repair' | 'Appraisal';
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue' | 'Advance Paid';
  orderDate: string;
  expectedDelivery: string;
  assignedTo: string;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
}

interface Dealer {
  id: string;
  name: string;
  phone: string;
  location: string;
  company: string;
  status: 'active' | 'inactive';
  createdAt: string;
  email?: string;
  specialization?: string;
  address?: string;
  notes?: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

// Initial data
const initialLeads: Lead[] = [
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
    company: 'Looking for engagement ring',
    dateOfBirth: '1995-03-15',
    address: '123 MG Road, Mumbai, Maharashtra',
    netWeight: '25.5 grams',
    notes: 'Interested in diamond solitaire rings'
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
    company: 'Wedding jewelry set',
    marriageDate: '2024-04-15',
    address: '456 Park Street, Kolkata, West Bengal',
    netWeight: '45.2 grams',
    notes: 'Planning complete bridal set'
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
    company: 'Custom necklace design',
    dateOfBirth: '1988-07-22',
    address: '789 Ring Road, Ahmedabad, Gujarat',
    netWeight: '18.7 grams',
    notes: 'Wants traditional Gujarati design'
  }
];

const initialOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2344',
    customerName: 'Priya Mehta',
    customerEmail: 'Priya.Mehta@gmail.com',
    customerPhone: '+91 93849 81389',
    status: 'In Production',
    type: 'Custom Order',
    items: [
      { name: 'Custom Gold Bridal Ring', category: 'Rings', quantity: 1, price: 1100500 }
    ],
    totalAmount: 1100500,
    paidAmount: 1000500,
    paymentStatus: 'Advance Paid',
    orderDate: '2024-01-10',
    expectedDelivery: '2024-02-15',
    assignedTo: 'Rahul',
    priority: 'High',
    notes: 'Customer requested antique finish and adjustable lock'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh.kumar@email.com',
    customerPhone: '+91 98765 43210',
    status: 'Ready',
    type: 'Sale',
    items: [
      { name: 'Gold Tennis Bracelet', category: 'Bracelets', quantity: 1, price: 120000 },
      { name: 'Pearl Earrings', category: 'Earrings', quantity: 1, price: 80000 }
    ],
    totalAmount: 200000,
    paidAmount: 200000,
    paymentStatus: 'Paid',
    orderDate: '2024-01-08',
    expectedDelivery: '2024-01-20',
    assignedTo: 'Sales Associate Maria',
    priority: 'Medium'
  }
];

export function Dashboard({ user, onLogout, onUserUpdate }: DashboardProps) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [selectedChatContact, setSelectedChatContact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [isConnectedToServer, setIsConnectedToServer] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Dynamic state for leads, orders, and dealers
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);

  // Load data from Supabase on component mount
  useEffect(() => {
    const initializeData = async () => {
      // Only load data if we have a valid user and access token
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && user?.id) {
        console.log('🚀 User authenticated, attempting to load data from server...');
        setDataLoadError(null);
        
        try {
          // Load all data concurrently
          await Promise.all([
            loadLeads(),
            loadOrders(), 
            loadDealers()
          ]);
          console.log('🎉 All data loading attempts completed');
        } catch (error) {
          console.error('💥 Error during data initialization:', error);
          setDataLoadError('Failed to load data from server. Using local data.');
        }
      } else {
        console.warn('⚠️ No access token or user found, using initial data');
        // Use initial data as fallback
        setLeads(initialLeads);
        setOrders(initialOrders);
        setDealers([]);
        setDataLoadError('Not authenticated - using demo data');
      }
    };

    initializeData();
  }, [user?.id]); // Re-run when user changes

  // Additional effect to handle manual refresh and view changes
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && user?.id) {
      // Add a small delay to ensure any previous operations have completed
      const refreshData = async () => {
        if (currentView === 'leads') {
          console.log('🔄 View changed to leads, refreshing data...');
          await loadLeads();
        } else if (currentView === 'orders') {
          console.log('🔄 View changed to orders, refreshing data...');
          await loadOrders();
        } else if (currentView === 'dealers') {
          console.log('🔄 View changed to dealers, refreshing data...');
          await loadDealers();
        }
      };
      
      const timeoutId = setTimeout(refreshData, 100); // Small delay to allow state updates
      return () => clearTimeout(timeoutId);
    }
  }, [currentView]);

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

  const loadDealers = async () => {
    console.log('🔄 Starting to load dealers...');
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      console.log('🔑 Access token exists:', !!accessToken);
      console.log('👤 User data exists:', !!user);
      
      if (!accessToken) {
        console.warn('⚠️ No access token found - using empty dealers array');
        setDealers([]);
        return;
      }

      console.log('📡 Making API call to get dealers...');
      const response = await apiService.getDealers();
      console.log('📥 Dealers API response:', {
        success: response.success,
        hasData: !!response.data,
        hasDealers: !!(response.data?.dealers),
        dealerCount: response.data?.dealers?.length || 0,
        error: response.error
      });
      
      if (response.success && response.data && response.data.dealers) {
        console.log(`✅ Successfully loaded ${response.data.dealers.length} dealers from server`);
        setDealers(response.data.dealers);
      } else {
        console.error('❌ Failed to load dealers from server:', response.error);
        console.log('🔄 Using empty dealers array');
        setDealers([]);
        
        // Show user-friendly error
        if (response.error) {
          console.warn('API Error Details:', response.error);
        }
      }
    } catch (error) {
      console.error('💥 Exception while loading dealers:', error);
      console.log('🔄 Using empty dealers array due to exception');
      setDealers([]);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      console.log('✨ Dealers loading process completed');
    }
  };

  const loadOrders = async () => {
    console.log('🔄 Starting to load orders...');
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      console.log('🔑 Access token exists:', !!accessToken);
      console.log('👤 User data exists:', !!user);
      
      if (!accessToken) {
        console.warn('⚠️ No access token found - using initial orders data');
        setOrders(initialOrders);
        return;
      }

      console.log('📡 Making API call to get orders...');
      const response = await apiService.getOrders();
      console.log('📥 Orders API response:', {
        success: response.success,
        hasData: !!response.data,
        hasOrders: !!(response.data?.orders),
        orderCount: response.data?.orders?.length || 0,
        error: response.error
      });
      
      if (response.success && response.data && response.data.orders) {
        console.log(`✅ Successfully loaded ${response.data.orders.length} orders from server`);
        console.log('🔍 Order data sample:', response.data.orders[0]);
        
        // Validate and filter orders data
        const validOrders = response.data.orders.filter((order: any) => {
          const isValid = order && order.id && order.customerName;
          if (!isValid) {
            console.warn('⚠️ Invalid order data found:', order);
          }
          return isValid;
        });
        
        console.log(`📊 Setting ${validOrders.length} valid orders`);
        setOrders(validOrders);
      } else {
        console.error('❌ Failed to load orders from server:', response.error);
        console.log('🔄 Falling back to initial orders data');
        setOrders(initialOrders);
        
        // Show user-friendly error
        if (response.error) {
          console.warn('API Error Details:', response.error);
        }
      }
    } catch (error) {
      console.error('💥 Exception while loading orders:', error);
      console.log('🔄 Using initial orders data due to exception');
      setOrders(initialOrders);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      console.log('✨ Orders loading process completed');
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    // Clear selections when navigating to different sections
    if (!view.includes('lead')) {
      setSelectedLeadId(null);
    }
    if (!view.includes('order')) {
      setSelectedOrderId(null);
    }
    if (!view.includes('inventory')) {
      setSelectedItemId(null);
    }
    if (!view.includes('dealer')) {
      setSelectedDealerId(null);
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentView('lead-detail');
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order-detail');
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentView('inventory-detail');
  };

  const handleAddLead = () => {
    setCurrentView('add-lead');
  };

  const handleAddOrder = () => {
    setCurrentView('add-order');
  };

  const handleAddItem = () => {
    setCurrentView('add-inventory');
  };

  const handleAddDealer = () => {
    setCurrentView('add-dealer');
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${year}${month}${day}-${random}`;
  };

  const handleAddLeadSubmit = async (leadData: any) => {
    console.log('🔄 Starting lead creation process...');
    setIsLoading(true);
    
    try {
      const leadToCreate = {
        name: leadData.firstName + ' ' + leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        status: 'New',
        source: leadData.source || 'Direct',
        assignedTo: leadData.assignedTo || 'Unassigned',
        lastContact: new Date().toISOString().split('T')[0],
        value: leadData.estimatedValue || 0,
        priority: leadData.priority || 'Medium',
        company: leadData.interests || 'General inquiry',
        // Additional fields from the enhanced form
        dateOfBirth: leadData.dateOfBirth,
        marriageDate: leadData.marriageDate,
        address: leadData.address,
        netWeight: leadData.netWeight,
        estimatedDeliveryDate: leadData.estimatedDeliveryDate,
        notes: leadData.notes,
        instagramUsername: leadData.instagramUsername
      };

      console.log('📤 Sending lead data to server:', leadToCreate);
      const response = await apiService.createLead(leadToCreate);
      
      console.log('📥 Server response:', response);
      
      if (response.success && response.data?.lead) {
        console.log('✅ Lead created successfully:', response.data.lead);
        
        // Update local state with the new lead immediately
        const newLead = response.data.lead;
        setLeads(prevLeads => {
          // Make sure we don't duplicate leads
          const filteredLeads = prevLeads.filter(lead => lead.id !== newLead.id);
          const newLeads = [newLead, ...filteredLeads];
          console.log(`📊 Updated leads list: ${newLeads.length} total leads`);
          console.log('🔍 New lead details:', newLead);
          return newLeads;
        });
        
        // Set connection status to true since we successfully communicated with server
        setIsConnectedToServer(true);
        setDataLoadError(null);
        
        // Show success message
        setSuccessMessage(`Lead "${response.data.lead.name}" created successfully!`);
        setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds
        
        // Navigate back to leads view first
        setCurrentView('leads');
        
        // Force refresh leads data to ensure it shows the new lead
        console.log('🔄 Refreshing leads list to show new lead...');
        setTimeout(async () => {
          await loadLeads();
          console.log('✅ Leads refreshed after navigation');
        }, 200);
        
        console.log('🎉 Lead creation completed successfully');
      } else {
        console.error('❌ Failed to create lead:', response.error);
        setIsConnectedToServer(false);
        setDataLoadError(response.error || 'Failed to create lead');
        alert(`Failed to create lead: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Exception during lead creation:', error);
      setIsConnectedToServer(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDataLoadError(`Lead creation failed: ${errorMessage}`);
      alert(`Failed to create lead: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      console.log('✨ Lead creation process completed');
    }
  };

  const handleIncomingMessage = async (message: IncomingMessage) => {
    // Check if lead already exists based on sender
    const existingLead = leads.find(lead => {
      if (message.platform === 'whatsapp') {
        return lead.phone === message.phoneNumber;
      } else {
        return lead.instagramUsername === message.instagramUsername;
      }
    });

    if (!existingLead) {
      try {
        // Create new lead from incoming message
        const leadToCreate = {
          name: message.senderName,
          email: message.platform === 'whatsapp' ? '' : `${message.instagramUsername}@instagram.com`,
          phone: message.phoneNumber || '',
          status: 'New',
          source: message.platform === 'whatsapp' ? 'WhatsApp' : 'Instagram',
          assignedTo: 'Unassigned',
          lastContact: message.timestamp.toISOString().split('T')[0],
          value: 0,
          priority: 'Medium',
          company: message.message.substring(0, 100) + (message.message.length > 100 ? '...' : ''),
          notes: `First message: "${message.message}"`,
          instagramUsername: message.instagramUsername
        };

        const response = await apiService.createLead(leadToCreate);
        if (response.success && response.data) {
          setLeads(prevLeads => [response.data.lead, ...prevLeads]);
          console.log(`New ${message.platform} lead created: ${message.senderName}`);
        }
      } catch (error) {
        console.error('Error creating lead from message:', error);
      }
    } else {
      try {
        // Update existing lead's last contact
        const updatedNotes = existingLead.notes + `\n\nNew message (${message.timestamp.toLocaleDateString()}): "${message.message}"`;
        const response = await apiService.updateLead(existingLead.id, {
          lastContact: message.timestamp.toISOString().split('T')[0],
          notes: updatedNotes
        });
        
        if (response.success && response.data) {
          setLeads(prevLeads => prevLeads.map(lead => 
            lead.id === existingLead.id ? response.data.lead : lead
          ));
        }
      } catch (error) {
        console.error('Error updating lead from message:', error);
      }
    }
  };

  const handleAddOrderSubmit = async (orderData: any) => {
    console.log('🔄 Starting order creation process...');
    setIsLoading(true);
    
    try {
      const orderToCreate = {
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        status: 'Pending',
        type: orderData.orderType,
        items: [{
          name: orderData.productName,
          category: orderData.category,
          quantity: 1,
          price: parseInt(orderData.totalAmount) || 0
        }],
        totalAmount: parseInt(orderData.totalAmount) || 0,
        paidAmount: parseInt(orderData.advanceAmount) || 0,
        paymentStatus: parseInt(orderData.advanceAmount) > 0 ? 'Advance Paid' : 'Pending',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: orderData.expectedDelivery ? 
          new Date(orderData.expectedDelivery).toISOString().split('T')[0] : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        assignedTo: orderData.assignedTo,
        priority: orderData.priority,
        notes: orderData.notes || orderData.specialInstructions || ''
      };

      console.log('📤 Sending order data to server:', orderToCreate);
      const response = await apiService.createOrder(orderToCreate);
      
      console.log('📥 Server response:', response);
      
      if (response.success && response.data?.order) {
        console.log('✅ Order created successfully:', response.data.order);
        
        // Update local state with the new order immediately
        const newOrder = response.data.order;
        setOrders(prevOrders => {
          // Make sure we don't duplicate orders
          const filteredOrders = prevOrders.filter(order => order.id !== newOrder.id);
          const newOrders = [newOrder, ...filteredOrders];
          console.log(`📊 Updated orders list: ${newOrders.length} total orders`);
          console.log('🔍 New order details:', newOrder);
          return newOrders;
        });
        
        // Set connection status to true since we successfully communicated with server
        setIsConnectedToServer(true);
        setDataLoadError(null);
        
        // Show success message
        setSuccessMessage(`Order "${response.data.order.orderNumber}" created successfully!`);
        setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds
        
        // Navigate back to orders view first
        setCurrentView('orders');
        
        // Force refresh orders data to ensure it shows the new order
        console.log('🔄 Refreshing orders list to show new order...');
        setTimeout(async () => {
          await loadOrders();
          console.log('✅ Orders refreshed after navigation');
        }, 200);
        
        console.log('🎉 Order creation completed successfully');
      } else {
        console.error('❌ Failed to create order:', response.error);
        setIsConnectedToServer(false);
        setDataLoadError(response.error || 'Failed to create order');
        alert(`Failed to create order: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Exception during order creation:', error);
      setIsConnectedToServer(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDataLoadError(`Order creation failed: ${errorMessage}`);
      alert(`Failed to create order: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      console.log('✨ Order creation process completed');
    }
  };

  const handleAddItemSubmit = (itemData: any) => {
    console.log('New inventory item data:', itemData);
    // Here you would typically save the inventory data to your backend
    setCurrentView('inventory');
  };

  const handleAddDealerSubmit = async (dealerData: any) => {
    try {
      const response = await apiService.createDealer(dealerData);
      if (response.success && response.data) {
        setDealers(prevDealers => [response.data.dealer, ...prevDealers]);
        setCurrentView('dealers');
      } else {
        console.error('Error creating dealer:', response.error);
        alert('Failed to create dealer. Please try again.');
      }
    } catch (error) {
      console.error('Error creating dealer:', error);
      alert('Failed to create dealer. Please try again.');
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Navigate to the related item when notification is clicked
    if (notification.relatedType === 'lead' && notification.relatedId) {
      setSelectedLeadId(notification.relatedId);
      setCurrentView('lead-detail');
    } else if (notification.relatedType === 'order' && notification.relatedId) {
      setSelectedOrderId(notification.relatedId);
      setCurrentView('order-detail');
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  // Lead conversion to order
  const handleConvertToOrder = (lead: Lead) => {
    // Pre-populate order form with lead data
    const orderData = {
      customerName: lead.name,
      customerEmail: lead.email,
      customerPhone: lead.phone,
      productName: lead.company || 'Custom Jewelry',
      estimatedValue: lead.value,
      priority: lead.priority,
      notes: `Converted from lead: ${lead.notes || 'No additional notes'}`
    };
    
    // Store the pre-populated data temporarily
    localStorage.setItem('orderFormData', JSON.stringify(orderData));
    setCurrentView('add-order');
  };

  // Navigate to chat with specific contact
  const handleNavigateToChat = (platform: 'whatsapp' | 'instagram', contactInfo: any) => {
    setSelectedChatContact(contactInfo);
    if (platform === 'whatsapp') {
      setCurrentView('whatsapp-chat');
    } else {
      setCurrentView('instagram-chat');
    }
  };

  // Force refresh all data from server
  const handleForceRefresh = async () => {
    console.log('🔄 Force refreshing all data from server...');
    setIsLoading(true);
    setDataLoadError(null);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && user?.id) {
        // Load all data concurrently
        await Promise.all([
          loadLeads(),
          loadOrders(),
          loadDealers()
        ]);
        console.log('✅ Force refresh completed successfully');
        
        // Log current state for debugging
        console.log('📊 Current data state after refresh:');
        console.log('- Leads count:', leads.length);
        console.log('- Orders count:', orders.length);
        console.log('- Dealers count:', dealers.length);
      } else {
        console.warn('⚠️ No authentication found during force refresh');
        setDataLoadError('Not authenticated - please sign in again');
      }
    } catch (error) {
      console.error('💥 Error during force refresh:', error);
      setDataLoadError('Failed to refresh data from server');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to check current state
  const debugCurrentState = () => {
    console.log('🔍 CURRENT APP STATE DEBUG:');
    console.log('- Current view:', currentView);
    console.log('- User ID:', user?.id);
    console.log('- Access token exists:', !!localStorage.getItem('accessToken'));
    console.log('- Is loading:', isLoading);
    console.log('- Is connected to server:', isConnectedToServer);
    console.log('- Data load error:', dataLoadError);
    console.log('- Leads count:', leads.length);
    console.log('- Orders count:', orders.length);
    console.log('- Dealers count:', dealers.length);
    console.log('- Leads data:', leads);
    console.log('- Orders data:', orders);
  };

  // Add debug function to window for easy access
  useEffect(() => {
    (window as any).debugDashboard = debugCurrentState;
    return () => {
      delete (window as any).debugDashboard;
    };
  }, [currentView, leads, orders, dealers, isLoading, isConnectedToServer, dataLoadError]);

  // Check for data inconsistencies after operations
  useEffect(() => {
    if (isConnectedToServer && (leads.length > 0 || orders.length > 0)) {
      // Add a small indicator that data might need verification
      const hasRecentActivity = successMessage !== null;
      if (hasRecentActivity) {
        console.log('🔍 Recent activity detected - consider running data consistency check if needed');
      }
    }
  }, [leads.length, orders.length, successMessage, isConnectedToServer]);

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardContent user={user} />;
      
      // Lead Management
      case 'leads':
        if (isLoading) {
          return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="text-muted-foreground">Loading leads from server...</p>
                  <p className="text-xs text-muted-foreground">
                    {isConnectedToServer ? 'Connected to server' : 'Checking connection...'}
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="relative">
            {/* Subtle loading overlay for background refreshes */}
            {isLoading && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-primary/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-primary/20">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm text-primary">Syncing...</span>
                </div>
              </div>
            )}
            <LeadList 
              leads={leads}
              onSelectLead={handleSelectLead}
              onAddLead={handleAddLead}
              onEditLead={(leadId) => {
                setSelectedLeadId(leadId);
                setCurrentView('edit-lead');
              }}
              onDeleteLead={async (leadId) => {
                if (confirm('Are you sure you want to delete this lead?')) {
                  try {
                    const response = await apiService.deleteLead(leadId);
                    if (response.success) {
                      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
                      console.log('✅ Lead deleted successfully');
                    } else {
                      alert('Failed to delete lead. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error deleting lead:', error);
                    alert('Failed to delete lead. Please try again.');
                  }
                }
              }}
              onAssignLead={async (leadId, assignee) => {
                try {
                  const response = await apiService.updateLead(leadId, { assignedTo: assignee });
                  if (response.success && response.data) {
                    setLeads(prevLeads => prevLeads.map(lead => 
                      lead.id === leadId ? response.data.lead : lead
                    ));
                    console.log('✅ Lead assigned successfully');
                  } else {
                    alert('Failed to assign lead. Please try again.');
                  }
                } catch (error) {
                  console.error('Error assigning lead:', error);
                  alert('Failed to assign lead. Please try again.');
                }
              }}
              onNavigateToChat={handleNavigateToChat}
            />
          </div>
        );
      case 'lead-detail':
        return selectedLeadId ? (
          <LeadDetailView 
            leadId={selectedLeadId}
            leads={leads}
            onBack={() => setCurrentView('leads')}
            onEditLead={(leadId) => {
              setSelectedLeadId(leadId);
              setCurrentView('edit-lead');
            }}
            onConvertToOrder={handleConvertToOrder}
          />
        ) : (
          <LeadList 
            leads={leads}
            onSelectLead={handleSelectLead}
            onAddLead={handleAddLead}
            onEditLead={(leadId) => {
              setSelectedLeadId(leadId);
              setCurrentView('edit-lead');
            }}
            onDeleteLead={async (leadId) => {
              if (confirm('Are you sure you want to delete this lead?')) {
                try {
                  const response = await apiService.deleteLead(leadId);
                  if (response.success) {
                    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
                  } else {
                    alert('Failed to delete lead. Please try again.');
                  }
                } catch (error) {
                  console.error('Error deleting lead:', error);
                  alert('Failed to delete lead. Please try again.');
                }
              }
            }}
            onAssignLead={async (leadId, assignee) => {
              try {
                const response = await apiService.updateLead(leadId, { assignedTo: assignee });
                if (response.success && response.data) {
                  setLeads(prevLeads => prevLeads.map(lead => 
                    lead.id === leadId ? response.data.lead : lead
                  ));
                } else {
                  alert('Failed to assign lead. Please try again.');
                }
              } catch (error) {
                console.error('Error assigning lead:', error);
                alert('Failed to assign lead. Please try again.');
              }
            }}
            onNavigateToChat={handleNavigateToChat}
          />
        );
      case 'add-lead':
        return (
          <AddLeadForm 
            onBack={() => setCurrentView('leads')}
            onSubmit={handleAddLeadSubmit}
          />
        );
      case 'edit-lead':
        const leadToEdit = selectedLeadId ? leads.find(lead => lead.id === selectedLeadId) : null;
        return leadToEdit ? (
          <EditLeadForm 
            lead={leadToEdit}
            onBack={() => setCurrentView('leads')}
            onSubmit={async (leadData) => {
              try {
                const response = await apiService.updateLead(selectedLeadId!, leadData);
                if (response.success && response.data) {
                  setLeads(prevLeads => prevLeads.map(lead => 
                    lead.id === selectedLeadId ? response.data.lead : lead
                  ));
                  setCurrentView('leads');
                } else {
                  alert('Failed to update lead. Please try again.');
                }
              } catch (error) {
                console.error('Error updating lead:', error);
                alert('Failed to update lead. Please try again.');
              }
            }}
          />
        ) : (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Lead Not Found</h1>
            <button onClick={() => setCurrentView('leads')} className="text-primary hover:underline">
              ← Back to Leads
            </button>
          </div>
        );

      // Order Management
      case 'orders':
      case 'custom-orders':
      case 'repairs':
        return (
          <div className="relative">
            {/* Subtle loading overlay for background refreshes */}
            {isLoading && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-primary/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-primary/20">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm text-primary">Syncing...</span>
                </div>
              </div>
            )}
            <OrderList 
              orders={orders}
              onSelectOrder={handleSelectOrder}
              onAddOrder={handleAddOrder}
              onEditOrder={(orderId) => {
                setSelectedOrderId(orderId);
                setCurrentView('edit-order');
              }}
              onDeleteOrder={async (orderId) => {
                if (confirm('Are you sure you want to delete this order?')) {
                  try {
                    const response = await apiService.deleteOrder(orderId);
                    if (response.success) {
                      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
                      console.log('✅ Order deleted successfully');
                    } else {
                      alert('Failed to delete order. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error deleting order:', error);
                    alert('Failed to delete order. Please try again.');
                  }
                }
              }}
            />
          </div>
        );
      case 'order-detail':
        return selectedOrderId ? (
          <OrderDetailView 
            orderId={selectedOrderId}
            orders={orders}
            onBack={() => setCurrentView('orders')}
          />
        ) : (
          <OrderList 
            orders={orders}
            onSelectOrder={handleSelectOrder}
            onAddOrder={handleAddOrder}
            onEditOrder={(orderId) => {
              setSelectedOrderId(orderId);
              setCurrentView('edit-order');
            }}
            onDeleteOrder={async (orderId) => {
              if (confirm('Are you sure you want to delete this order?')) {
                try {
                  const response = await apiService.deleteOrder(orderId);
                  if (response.success) {
                    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
                  } else {
                    alert('Failed to delete order. Please try again.');
                  }
                } catch (error) {
                  console.error('Error deleting order:', error);
                  alert('Failed to delete order. Please try again.');
                }
              }
            }}
          />
        );
      case 'add-order':
        return (
          <AddOrderForm 
            onBack={() => setCurrentView('orders')}
            onSubmit={handleAddOrderSubmit}
          />
        );
      case 'edit-order':
        const orderToEdit = selectedOrderId ? orders.find(order => order.id === selectedOrderId) : null;
        return orderToEdit ? (
          <EditOrderForm 
            order={orderToEdit}
            onBack={() => setCurrentView('orders')}
            onSubmit={async (orderData) => {
              try {
                const response = await apiService.updateOrder(selectedOrderId!, orderData);
                if (response.success && response.data) {
                  setOrders(prevOrders => prevOrders.map(order => 
                    order.id === selectedOrderId ? response.data.order : order
                  ));
                  setCurrentView('orders');
                } else {
                  alert('Failed to update order. Please try again.');
                }
              } catch (error) {
                console.error('Error updating order:', error);
                alert('Failed to update order. Please try again.');
              }
            }}
          />
        ) : (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Order Not Found</h1>
            <button onClick={() => setCurrentView('orders')} className="text-primary hover:underline">
              ← Back to Orders
            </button>
          </div>
        );

      // Inventory Management
      case 'inventory':
        return (
          <InventoryList 
            onSelectItem={handleSelectItem}
            onAddItem={handleAddItem}
          />
        );
      case 'inventory-detail':
        return selectedItemId ? (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Inventory Item Details</h1>
            <p>Item ID: {selectedItemId}</p>
            <button onClick={() => setCurrentView('inventory')} className="mt-4 text-primary hover:underline">
              ← Back to Inventory
            </button>
          </div>
        ) : (
          <InventoryList 
            onSelectItem={handleSelectItem}
            onAddItem={handleAddItem}
          />
        );
      case 'add-inventory':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Add New Inventory Item</h1>
            <p>Inventory item creation form will be implemented here.</p>
            <button onClick={() => setCurrentView('inventory')} className="mt-4 text-primary hover:underline">
              ← Back to Inventory
            </button>
          </div>
        );
      case 'low-stock':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Low Stock Alert</h1>
            <p>Items that need restocking will be shown here.</p>
            <button onClick={() => setCurrentView('inventory')} className="mt-4 text-primary hover:underline">
              ← Back to Inventory
            </button>
          </div>
        );
      case 'categories':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Jewelry Categories</h1>
            <p>Category management interface will be implemented here.</p>
            <button onClick={() => setCurrentView('inventory')} className="mt-4 text-primary hover:underline">
              ← Back to Inventory
            </button>
          </div>
        );

      // Dealer Management
      case 'dealers':
        return (
          <DealerList
            onAddDealer={handleAddDealer}
            onEditDealer={(dealer) => {
              setSelectedDealerId(dealer.id);
              setCurrentView('edit-dealer');
            }}
          />
        );
      case 'add-dealer':
        return (
          <AddDealerForm
            onBack={() => setCurrentView('dealers')}
            onDealerAdded={() => {
              loadDealers();
              setCurrentView('dealers');
            }}
          />
        );
      case 'edit-dealer':
        const dealerToEdit = selectedDealerId ? dealers.find(dealer => dealer.id === selectedDealerId) : null;
        return dealerToEdit ? (
          <EditDealerForm
            dealer={dealerToEdit}
            onBack={() => setCurrentView('dealers')}
            onDealerUpdated={() => {
              loadDealers();
              setCurrentView('dealers');
            }}
          />
        ) : (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Dealer Not Found</h1>
            <button onClick={() => setCurrentView('dealers')} className="text-primary hover:underline">
              ← Back to Dealers
            </button>
          </div>
        );

      // Other sections (placeholders)
      case 'reports':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Business Reports</h1>
            <p>Comprehensive business reporting will be implemented here.</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Notification Center</h1>
            <p>View all your notifications in one place.</p>
            <div className="mt-6">
              <NotificationSystem 
                leads={leads} 
                orders={orders} 
                onNotificationClick={handleNotificationClick}
              />
            </div>
          </div>
        );
      case 'profile':
        return (
          <ProfileManagement 
            user={user}
            onUserUpdate={handleUserUpdate}
          />
        );
      case 'whatsapp-chat':
        return (
          <WhatsAppChat 
            onBack={() => {
              setCurrentView('dashboard');
              setSelectedChatContact(null);
            }} 
            selectedContactInfo={selectedChatContact}
          />
        );
      case 'instagram-chat':
        return (
          <InstagramChat 
            onBack={() => {
              setCurrentView('dashboard');
              setSelectedChatContact(null);
            }} 
            selectedContactInfo={selectedChatContact}
          />
        );
      case 'server-diagnostic':
        return (
          <ServerDiagnostic 
            currentLeads={leads}
            currentOrders={orders}
            onDataUpdate={(newLeads, newOrders) => {
              setLeads(newLeads);
              setOrders(newOrders);
              console.log('✅ Data updated from sync helper');
            }}
          />
        );

      default:
        return <DashboardContent user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sticky Sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar 
          user={user} 
          onLogout={onLogout}
          currentView={currentView}
          onNavigate={handleNavigate}
          leads={leads}
          orders={orders}
          onNotificationClick={handleNotificationClick}
        />
      </div>
      
      {/* Main Content Area - Responsive */}
      <div className="flex-1 overflow-auto min-w-0">
        {/* Success Message Banner */}
        {successMessage && (
          <div className="bg-green-50 border-b border-green-200 px-4 py-3">
            <Alert className="border-green-200 bg-transparent">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex items-center justify-between">
                  <span>{successMessage}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSuccessMessage(null)}
                    className="text-green-600 hover:bg-green-100 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Connection Status Banner */}
        {dataLoadError && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <Alert className="border-yellow-200 bg-transparent">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isConnectedToServer ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-600" />
                    )}
                    <span>
                      {isConnectedToServer 
                        ? 'Connected to server - Some data may be cached'
                        : 'Working offline - Using local demo data'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentView('server-diagnostic')}
                      className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                    >
                      Diagnose Issue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleForceRefresh}
                      disabled={isLoading}
                      className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Refreshing
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Refresh Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="min-h-full">
          {renderMainContent()}
        </div>
        
        {/* Messaging Integration - Hidden component that handles incoming messages */}
        <MessagingIntegration onNewMessage={handleIncomingMessage} />
      </div>
    </div>
  );
}