import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService } from '../utils/supabase/api';

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

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  type: string;
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  orderDate: string;
  expectedDelivery: string;
  assignedTo: string;
  priority: string;
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

interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  status: 'active' | 'inactive';
  address?: string;
  notes?: string;
  created_at: string;
}

interface Inventory {
  id: string;
  item_type: string;
  quantity: number;
  unit: string;
  description?: string;
  location?: string;
  notes?: string;
  created_at: string;
}

interface InventoryTransaction {
  id: string;
  inventory_id: string;
  transaction_type: 'deposit' | 'withdraw' | 'transfer';
  quantity: number;
  dealer_id?: string;
  employee_id?: string;
  description?: string;
  notes?: string;
  transaction_date: string;
  inventory?: Inventory;
  dealer?: Dealer;
  employee?: Employee;
}

interface message_history {
  time: string;
  type: string;
  message: string;
}

interface Whatsapp {
  id: string;
  recipient_name: string;
  recipient_number:number;
  message_history:message_history [],
  created_at: string;
}

interface Message {
  phone_no:number;
  message:string;
}


interface DataManagerContextType {
  leads: Lead[];
  orders: Order[];
  dealers: Dealer[];
  employees: Employee[];
  inventory: Inventory[];
  whatappmessage : Whatsapp[];
  inventoryTransactions: InventoryTransaction[];
  isLoading: boolean;
  error: string | null;
  
  // Data operations
  loadAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Lead operations
  createLead: (leadData: any) => Promise<Lead | null>;
  updateLead: (leadId: string, leadData: any) => Promise<Lead | null>;
  deleteLead: (leadId: string) => Promise<boolean>;
  
  // Order operations
  createOrder: (orderData: any) => Promise<Order | null>;
  updateOrder: (orderId: string, orderData: any) => Promise<Order | null>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  
  // Dealer operations
  createDealer: (dealerData: any) => Promise<Dealer | null>;
  updateDealer: (dealerId: string, dealerData: any) => Promise<Dealer | null>;
  deleteDealer: (dealerId: string) => Promise<boolean>;
  
  // Employee operations
  createEmployee: (employeeData: any) => Promise<Employee | null>;
  updateEmployee: (employeeId: string, employeeData: any) => Promise<Employee | null>;
  deleteEmployee: (employeeId: string) => Promise<boolean>;
  
  // Inventory operations
  createInventory: (inventoryData: any) => Promise<Inventory | null>;
  updateInventory: (inventoryId: string, inventoryData: any) => Promise<Inventory | null>;
  createInventoryTransaction: (transactionData: any) => Promise<InventoryTransaction | null>;

  //Whatsapp opeartions
  sendWhatsappMessage: (message: any) => Promise<Message | boolean| null>;
}

const DataManagerContext = createContext<DataManagerContextType | null>(null);

export function useDataManager() {
  const context = useContext(DataManagerContext);
  if (!context) {
    throw new Error('useDataManager must be used within a DataManagerProvider');
  }
  return context;
}

interface DataManagerProviderProps {
  children: React.ReactNode;
  user?: { id: string };
}

export function DataManagerProvider({ children, user }: DataManagerProviderProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [whatappmessage, setWhatsapp] = useState<Whatsapp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial data loading
  const loadAllData = useCallback(async () => {
    if (!user?.id || !localStorage.getItem('accessToken')) {
      console.warn('⚠️ No authentication found, skipping data load');
      return;
    }

    console.log('🔄 Loading all data from server...');
    setIsLoading(true);
    setError(null);

    try {
      const [leadsResponse, ordersResponse, dealersResponse, employeesResponse, inventoryResponse, transactionsResponse,whatsappResponse] = await Promise.all([
        apiService.getLeads(),
        apiService.getOrders(),
        apiService.getDealers(),
        apiService.getEmployees(), // APi calls
        apiService.getInventory(),
        apiService.getInventoryTransactions(),
        apiService.getWhatsappMessages()
      ]);

      console.log('📥 API Responses:', {
        leads: { success: leadsResponse.success, count: leadsResponse.data?.leads?.length },
        orders: { success: ordersResponse.success, count: ordersResponse.data?.orders?.length },
        dealers: { success: dealersResponse.success, count: dealersResponse.data?.dealers?.length },
        employees: { success: employeesResponse.success, count: employeesResponse.data?.employees?.length },
        inventory: { success: inventoryResponse.success, count: inventoryResponse.data?.inventory?.length },
        transactions: { success: transactionsResponse.success, count: transactionsResponse.data?.transactions?.length },
        whatsapp: { success: whatsappResponse.success, count: whatsappResponse.data?.whatsapp?.length }
      });

      // Update leads - convert from database format to frontend format
      if (leadsResponse.success && leadsResponse.data?.leads) {
        const formattedLeads = leadsResponse.data.leads.map((dbLead: any): Lead => ({
          id: dbLead.id,
          name: dbLead.name,
          email: dbLead.email || '',
          phone: dbLead.phone || '',
          status: dbLead.status,
          source: dbLead.source || '',
          assignedTo: dbLead.assigned_to || '',
          lastContact: dbLead.last_contact || '',
          value: dbLead.value || 0,
          priority: dbLead.priority || 'Medium',
          createdAt: dbLead.created_at,
          company: dbLead.company || '',
          dateOfBirth: dbLead.date_of_birth,
          marriageDate: dbLead.marriage_date,
          address: dbLead.address,
          netWeight: dbLead.net_weight,
          estimatedDeliveryDate: dbLead.estimated_delivery_date,
          notes: dbLead.notes,
          instagramUsername: dbLead.instagram_username
        }));
        setLeads(formattedLeads);
        console.log(`✅ Loaded ${formattedLeads.length} leads`);
        
        // Check for table setup warning
        if (leadsResponse.data.warning) {
          console.warn('⚠️ Database setup warning:', leadsResponse.data.warning);
          setError('Database tables need to be set up. Please go to Server Diagnostics to create tables.');
        }
      } else {
        console.error('❌ Failed to load leads:', leadsResponse.error);
        if (leadsResponse.error?.includes('Unauthorized')) {
          setError('Authentication failed. Please sign in again.');
        } else if (leadsResponse.error?.includes('Database tables not set up')) {
          setError('Database tables need to be set up. Please go to Server Diagnostics to create tables.');
        } else {
          setError(leadsResponse.error || 'Failed to load leads');
        }
      }

      // Update orders - convert from database format to frontend format
      if (ordersResponse.success && ordersResponse.data?.orders) {
        const formattedOrders = ordersResponse.data.orders.map((dbOrder: any): Order => ({
          id: dbOrder.id,
          orderNumber: dbOrder.order_number,
          customerName: dbOrder.customer_name,
          customerEmail: dbOrder.customer_email,
          customerPhone: dbOrder.customer_phone,
          status: dbOrder.status,
          type: dbOrder.type,
          items: dbOrder.items || [],
          totalAmount: dbOrder.total_amount || 0,
          paidAmount: dbOrder.paid_amount || 0,
          paymentStatus: dbOrder.payment_status,
          orderDate: dbOrder.order_date,
          expectedDelivery: dbOrder.expected_delivery,
          assignedTo: dbOrder.assigned_to,
          priority: dbOrder.priority || 'Medium',
          notes: dbOrder.notes
        }));
        setOrders(formattedOrders);
        console.log(`✅ Loaded ${formattedOrders.length} orders`);
        
        // Check for table setup warning
        if (ordersResponse.data.warning) {
          console.warn('⚠️ Database setup warning:', ordersResponse.data.warning);
          if (!error) { // Don't overwrite existing error
            setError('Database tables need to be set up. Please go to Server Diagnostics to create tables.');
          }
        }
      } else {
        console.error('❌ Failed to load orders:', ordersResponse.error);
        if (ordersResponse.error?.includes('Unauthorized')) {
          setError('Authentication failed. Please sign in again.');
        } else if (ordersResponse.error?.includes('Database tables not set up')) {
          setError('Database tables need to be set up. Please go to Server Diagnostics to create tables.');
        } else if (!error) { // Don't overwrite existing error
          setError(ordersResponse.error || 'Failed to load orders');
        }
      }

      // Update dealers - already in correct format from database
      if (dealersResponse.success && dealersResponse.data?.dealers) {
        setDealers(dealersResponse.data.dealers);
        console.log(`✅ Loaded ${dealersResponse.data.dealers.length} dealers`);
      } else {
        console.error('❌ Failed to load dealers:', dealersResponse.error);
      }

      // Update employees - already in correct format from database
      if (employeesResponse.success && employeesResponse.data?.employees) {
        setEmployees(employeesResponse.data.employees);
        console.log(`✅ Loaded ${employeesResponse.data.employees.length} employees`);
      } else {
        console.error('❌ Failed to load employees:', employeesResponse.error);
      }

      // Update inventory - already in correct format from database
      if (inventoryResponse.success && inventoryResponse.data?.inventory) {
        setInventory(inventoryResponse.data.inventory);
        console.log(`✅ Loaded ${inventoryResponse.data.inventory.length} inventory items`);
      } else {
        console.error('❌ Failed to load inventory:', inventoryResponse.error);
      }

      // Update inventory transactions - already in correct format from database
      if (transactionsResponse.success && transactionsResponse.data?.transactions) {
        setInventoryTransactions(transactionsResponse.data.transactions);
        console.log(`✅ Loaded ${transactionsResponse.data.transactions.length} inventory transactions`);
      } else {
        console.error('❌ Failed to load inventory transactions:', transactionsResponse.error);
      }
  
      if (whatsappResponse.success && whatsappResponse.data?.whatsappmessages) {
        setWhatsapp(whatsappResponse.data.whatsappmessages);
        console.log(`✅ Loaded ${whatsappResponse.data.whatsappmessages.length} whatapp messages`);
      } else {
        console.error('❌ Failed to load whatsappmessage:', whatsappResponse.error);
      }
      

    } catch (error) {
      console.error('💥 Exception during data loading:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    console.log('🔄 Refreshing all data...');
    await loadAllData();
  }, [loadAllData]);

  // Load data when user changes
  useEffect(() => {
    if (user?.id) {
      loadAllData();
    }
  }, [user?.id, loadAllData]);

  // Lead operations
  const createLead = useCallback(async (leadData: any): Promise<Lead | null> => {
    console.log('🔄 Creating lead:', leadData);
    setIsLoading(true);
    
    try {
      // Convert camelCase frontend data to snake_case for database
      const dbLeadData = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        status: leadData.status,
        source: leadData.source,
        assigned_to: leadData.assignedTo,
        last_contact: leadData.lastContact,
        value: leadData.value,
        priority: leadData.priority,
        company: leadData.company,
        date_of_birth: leadData.dateOfBirth,
        marriage_date: leadData.marriageDate,
        address: leadData.address,
        net_weight: leadData.netWeight,
        estimated_delivery_date: leadData.estimatedDeliveryDate,
        notes: leadData.notes,
        instagram_username: leadData.instagramUsername
      };

      const response = await apiService.createLead(dbLeadData);
      
      if (response.success && response.data?.lead) {
        const dbLead = response.data.lead;
        console.log('✅ Lead created successfully:', dbLead);
        
        // Convert database response to frontend format
        const newLead: Lead = {
          id: dbLead.id,
          name: dbLead.name,
          email: dbLead.email || '',
          phone: dbLead.phone || '',
          status: dbLead.status,
          source: dbLead.source || '',
          assignedTo: dbLead.assigned_to || '',
          lastContact: dbLead.last_contact || '',
          value: dbLead.value || 0,
          priority: dbLead.priority || 'Medium',
          createdAt: dbLead.created_at,
          company: dbLead.company || '',
          dateOfBirth: dbLead.date_of_birth,
          marriageDate: dbLead.marriage_date,
          address: dbLead.address,
          netWeight: dbLead.net_weight,
          estimatedDeliveryDate: dbLead.estimated_delivery_date,
          notes: dbLead.notes,
          instagramUsername: dbLead.instagram_username
        };
        
        // Update local state immediately
        setLeads(prevLeads => {
          const filteredLeads = prevLeads.filter(lead => lead.id !== newLead.id);
          const updatedLeads = [newLead, ...filteredLeads];
          console.log(`📊 Updated leads count: ${updatedLeads.length}`);
          return updatedLeads;
        });
        
        setError(null); // Clear any previous errors
        return newLead;
      } else {
        console.error('❌ Failed to create lead:', response.error);
        if (response.error?.includes('Unauthorized')) {
          setError('Authentication failed. Please sign in again.');
        } else if (response.error?.includes('Database tables not set up')) {
          setError('Database tables need to be set up. Please go to Server Diagnostics to create tables.');
        } else {
          setError(response.error || 'Failed to create lead');
        }
        return null;
      }
    } catch (error) {
      console.error('💥 Exception creating lead:', error);
      setError(error instanceof Error ? error.message : 'Failed to create lead');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  const updateLead = useCallback(async (leadId: string, leadData: any): Promise<Lead | null> => {
    console.log('🔄 Updating lead:', leadId, leadData);
    
    try {
      // Convert camelCase to snake_case for database
      const dbLeadData = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        status: leadData.status,
        source: leadData.source,
        assigned_to: leadData.assignedTo,
        last_contact: leadData.lastContact,
        value: leadData.value,
        priority: leadData.priority,
        company: leadData.company,
        date_of_birth: leadData.dateOfBirth,
        marriage_date: leadData.marriageDate,
        address: leadData.address,
        net_weight: leadData.netWeight,
        estimated_delivery_date: leadData.estimatedDeliveryDate,
        notes: leadData.notes,
        instagram_username: leadData.instagramUsername
      };

      const response = await apiService.updateLead(leadId, dbLeadData);
      
      if (response.success && response.data?.lead) {
        const dbLead = response.data.lead;
        console.log('✅ Lead updated successfully:', dbLead);
        
        // Convert database response to frontend format
        const updatedLead: Lead = {
          id: dbLead.id,
          name: dbLead.name,
          email: dbLead.email || '',
          phone: dbLead.phone || '',
          status: dbLead.status,
          source: dbLead.source || '',
          assignedTo: dbLead.assigned_to || '',
          lastContact: dbLead.last_contact || '',
          value: dbLead.value || 0,
          priority: dbLead.priority || 'Medium',
          createdAt: dbLead.created_at,
          company: dbLead.company || '',
          dateOfBirth: dbLead.date_of_birth,
          marriageDate: dbLead.marriage_date,
          address: dbLead.address,
          netWeight: dbLead.net_weight,
          estimatedDeliveryDate: dbLead.estimated_delivery_date,
          notes: dbLead.notes,
          instagramUsername: dbLead.instagram_username
        };
        
        setLeads(prevLeads => 
          prevLeads.map(lead => lead.id === leadId ? updatedLead : lead)
        );
        
        return updatedLead;
      } else {
        console.error('❌ Failed to update lead:', response.error);
        setError(response.error || 'Failed to update lead');
        return null;
      }
    } catch (error) {
      console.error('💥 Exception updating lead:', error);
      setError(error instanceof Error ? error.message : 'Failed to update lead');
      return null;
    }
  }, []);

  const deleteLead = useCallback(async (leadId: string): Promise<boolean> => {
    console.log('🔄 Deleting lead:', leadId);
    
    try {
      const response = await apiService.deleteLead(leadId);
      
      if (response.success) {
        console.log('✅ Lead deleted successfully');
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
        return true;
      } else {
        console.error('❌ Failed to delete lead:', response.error);
        setError(response.error || 'Failed to delete lead');
        return false;
      }
    } catch (error) {
      console.error('💥 Exception deleting lead:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete lead');
      return false;
    }
  }, []);

  // Order operations
  const createOrder = useCallback(async (orderData: any): Promise<Order | null> => {
    console.log('🔄 Creating order:', orderData);
    setIsLoading(true);
    
    try {
      // Convert camelCase frontend data to snake_case for database
      const dbOrderData = {
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        status: orderData.status,
        type: orderData.type,
        items: orderData.items,
        total_amount: orderData.totalAmount,
        paid_amount: orderData.paidAmount,
        payment_status: orderData.paymentStatus,
        order_date: orderData.orderDate,
        expected_delivery: orderData.expectedDelivery,
        assigned_to: orderData.assignedTo,
        priority: orderData.priority,
        notes: orderData.notes
      };

      const response = await apiService.createOrder(dbOrderData);
      
      if (response.success && response.data?.order) {
        const dbOrder = response.data.order;
        console.log('✅ Order created successfully:', dbOrder);
        
        // The server already returns camelCase format, so we can use it directly
        const newOrder: Order = {
          id: dbOrder.id,
          orderNumber: dbOrder.orderNumber || dbOrder.order_number,
          customerName: dbOrder.customerName || dbOrder.customer_name,
          customerEmail: dbOrder.customerEmail || dbOrder.customer_email,
          customerPhone: dbOrder.customerPhone || dbOrder.customer_phone,
          status: dbOrder.status,
          type: dbOrder.type,
          items: dbOrder.items || [],
          totalAmount: dbOrder.totalAmount || dbOrder.total_amount || 0,
          paidAmount: dbOrder.paidAmount || dbOrder.paid_amount || 0,
          paymentStatus: dbOrder.paymentStatus || dbOrder.payment_status,
          orderDate: dbOrder.orderDate || dbOrder.order_date,
          expectedDelivery: dbOrder.expectedDelivery || dbOrder.expected_delivery,
          assignedTo: dbOrder.assignedTo || dbOrder.assigned_to,
          priority: dbOrder.priority || 'Medium',
          notes: dbOrder.notes
        };
        
        // Update local state immediately
        setOrders(prevOrders => {
          const filteredOrders = prevOrders.filter(order => order.id !== newOrder.id);
          const updatedOrders = [newOrder, ...filteredOrders];
          console.log(`📊 Updated orders count: ${updatedOrders.length}`);
          return updatedOrders;
        });
        
        setError(null); // Clear any previous errors
        return newOrder;
      } else {
        console.error('❌ Failed to create order:', response.error);
        if (response.error?.includes('Unauthorized')) {
          setError('Authentication failed. Please sign in again.');
        } else if (response.error?.includes('Database tables not set up')) {
          setError('Database tables need to be set up. Please go to Server Diagnostics to create tables.');
        } else {
          setError(response.error || 'Failed to create order');
        }
        return null;
      }
    } catch (error) {
      console.error('💥 Exception creating order:', error);
      setError(error instanceof Error ? error.message : 'Failed to create order');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  const updateOrder = useCallback(async (orderId: string, orderData: any): Promise<Order | null> => {
    console.log('🔄 Updating order:', orderId, orderData);
    
    try {
      const response = await apiService.updateOrder(orderId, orderData);
      
      if (response.success && response.data?.order) {
        const dbOrder = response.data.order;
        console.log('✅ Order updated successfully:', dbOrder);
        
        // Convert database response to frontend format if needed
        const updatedOrder: Order = {
          id: dbOrder.id,
          orderNumber: dbOrder.orderNumber || dbOrder.order_number,
          customerName: dbOrder.customerName || dbOrder.customer_name,
          customerEmail: dbOrder.customerEmail || dbOrder.customer_email,
          customerPhone: dbOrder.customerPhone || dbOrder.customer_phone,
          status: dbOrder.status,
          type: dbOrder.type,
          items: dbOrder.items || [],
          totalAmount: dbOrder.totalAmount || dbOrder.total_amount || 0,
          paidAmount: dbOrder.paidAmount || dbOrder.paid_amount || 0,
          paymentStatus: dbOrder.paymentStatus || dbOrder.payment_status,
          orderDate: dbOrder.orderDate || dbOrder.order_date,
          expectedDelivery: dbOrder.expectedDelivery || dbOrder.expected_delivery,
          assignedTo: dbOrder.assignedTo || dbOrder.assigned_to,
          priority: dbOrder.priority || 'Medium',
          notes: dbOrder.notes
        };
        
        setOrders(prevOrders => 
          prevOrders.map(order => order.id === orderId ? updatedOrder : order)
        );
        
        return updatedOrder;
      } else {
        console.error('❌ Failed to update order:', response.error);
        setError(response.error || 'Failed to update order');
        return null;
      }
    } catch (error) {
      console.error('💥 Exception updating order:', error);
      setError(error instanceof Error ? error.message : 'Failed to update order');
      return null;
    }
  }, []);

  const deleteOrder = useCallback(async (orderId: string): Promise<boolean> => {
    console.log('🔄 Deleting order:', orderId);
    
    try {
      const response = await apiService.deleteOrder(orderId);
      
      if (response.success) {
        console.log('✅ Order deleted successfully');
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        return true;
      } else {
        console.error('❌ Failed to delete order:', response.error);
        setError(response.error || 'Failed to delete order');
        return false;
      }
    } catch (error) {
      console.error('💥 Exception deleting order:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete order');
      return false;
    }
  }, []);

  // Dealer operations
  const createDealer = useCallback(async (dealerData: any): Promise<Dealer | null> => {
    console.log('🔄 Creating dealer:', dealerData);
    
    try {
      const response = await apiService.createDealer(dealerData);
      
      if (response.success && response.data?.dealer) {
        const newDealer = response.data.dealer;
        console.log('✅ Dealer created successfully:', newDealer);
        
        setDealers(prevDealers => [newDealer, ...prevDealers]);
        return newDealer;
      } else {
        console.error('❌ Failed to create dealer:', response.error);
        setError(response.error || 'Failed to create dealer');
        return null;
      }
    } catch (error) {
      console.error('💥 Exception creating dealer:', error);
      setError(error instanceof Error ? error.message : 'Failed to create dealer');
      return null;
    }
  }, []);

  const updateDealer = useCallback(async (dealerId: string, dealerData: any): Promise<Dealer | null> => {
    console.log('🔄 Updating dealer:', dealerId, dealerData);
    
    try {
      const response = await apiService.updateDealer(dealerId, dealerData);
      
      if (response.success && response.data?.dealer) {
        const updatedDealer = response.data.dealer;
        console.log('✅ Dealer updated successfully:', updatedDealer);
        
        setDealers(prevDealers => 
          prevDealers.map(dealer => dealer.id === dealerId ? updatedDealer : dealer)
        );
        
        return updatedDealer;
      } else {
        console.error('❌ Failed to update dealer:', response.error);
        setError(response.error || 'Failed to update dealer');
        return null;
      }
    } catch (error) {
      console.error('💥 Exception updating dealer:', error);
      setError(error instanceof Error ? error.message : 'Failed to update dealer');
      return null;
    }
  }, []);

  const deleteDealer = useCallback(async (dealerId: string): Promise<boolean> => {
    console.log('🔄 Deleting dealer:', dealerId);
    
    try {
      const response = await apiService.deleteDealer(dealerId);
      
      if (response.success) {
        console.log('✅ Dealer deleted successfully');
        setDealers(prevDealers => prevDealers.filter(dealer => dealer.id !== dealerId));
        return true;
      } else {
        console.error('❌ Failed to delete dealer:', response.error);
        setError(response.error || 'Failed to delete dealer');
        return false;
      }
    } catch (error) {
      console.error('💥 Exception deleting dealer:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete dealer');
      return false;
    }
  }, []);

  // Employee operations
  const createEmployee = useCallback(async (employeeData: any): Promise<Employee | null> => {
    console.log('🔄 Creating employee:', employeeData);
    
    try {
      const response = await apiService.createEmployee(employeeData);
      
      if (response.success && response.data?.employee) {
        const newEmployee = response.data.employee;
        console.log('✅ Employee created successfully:', newEmployee);
        setEmployees(prevEmployees => [newEmployee, ...prevEmployees]);
        return newEmployee;
      } else {
        console.error('❌ Failed to create employee:', response.error);
        setError(response.error || 'Failed to create employee');
        return null;
      }
    } catch (error) {
      console.error('💥 Exception creating employee:', error);
      setError(error instanceof Error ? error.message : 'Failed to create employee');
      return null;
    }
  }, []);

  const updateEmployee = useCallback(async (employeeId: string, employeeData: any): Promise<Employee | null> => {
    console.log('🔄 Updating employee:', employeeId, employeeData);
    
    try {
      const response = await apiService.updateEmployee(employeeId, employeeData);
      
      if (response.success && response.data?.employee) {
        const updatedEmployee = response.data.employee;
        console.log('✅ Employee updated successfully:', updatedEmployee);
        
        setEmployees(prevEmployees => 
          prevEmployees.map(employee => employee.id === employeeId ? updatedEmployee : employee)
        );
        
        return updatedEmployee;
      } else {
        console.error('❌ Failed to update employee:', response.error);
        setError(response.error || 'Failed to update employee');
        return null;
      }
    } catch (error) {
      console.error('💥 Exception updating employee:', error);
      setError(error instanceof Error ? error.message : 'Failed to update employee');
      return null;
    }
  }, []);

  const deleteEmployee = useCallback(async (employeeId: string): Promise<boolean> => {
    console.log('🔄 Deleting employee:', employeeId);
    
    try {
      const response = await apiService.deleteEmployee(employeeId);
      
      if (response.success) {
        console.log('✅ Employee deleted successfully');
        setEmployees(prevEmployees => prevEmployees.filter(employee => employee.id !== employeeId));
        return true;
      } else {
        console.error('❌ Failed to delete employee:', response.error);
        setError(response.error || 'Failed to delete employee');
        return false;
      }
    } catch (error) {
      console.error('💥 Exception deleting employee:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete employee');
      return false;
    }
  }, []);

  // Inventory operations
  const createInventory = useCallback(async (inventoryData: any): Promise<Inventory | null> => {
    console.log('🔄 Creating inventory:', inventoryData);
    
    try {
      const response = await apiService.createInventory(inventoryData);
      
      if (response.success && response.data?.inventory) {
        const newInventory = response.data.inventory;
        console.log('✅ Inventory created successfully:', newInventory);
        setInventory(prevInventory => [newInventory, ...prevInventory]);
        return newInventory;
      } else {
        console.error('❌ Failed to create inventory:', response.error);
        setError(response.error || 'Failed to create inventory');
        return null;
      }
    } catch (error) {
      console.error('💥 Exception creating inventory:', error);
      setError(error instanceof Error ? error.message : 'Failed to create inventory');
      return null;
    }
  }, []);

  const updateInventory = useCallback(async (inventoryId: string, inventoryData: any): Promise<Inventory | null> => {
    console.log('🔄 Updating inventory:', inventoryId, inventoryData);
    
    try {
      const response = await apiService.updateInventory(inventoryId, inventoryData);
      
      if (response.success && response.data?.inventory) {
        const updatedInventory = response.data.inventory;
        console.log('✅ Inventory updated successfully:', updatedInventory);
        
        setInventory(prevInventory => 
          prevInventory.map(item => item.id === inventoryId ? updatedInventory : item)
        );
        
        return updatedInventory;
      } else {
        console.error('❌ Failed to update inventory:', response.error);
        setError(response.error || 'Failed to update inventory');
        return null;
      }
    } catch (error) {
      console.error('💥 Exception updating inventory:', error);
      setError(error instanceof Error ? error.message : 'Failed to update inventory');
      return null;
    }
  }, []);

  const createInventoryTransaction = useCallback(async (transactionData: any): Promise<InventoryTransaction | null> => {
    console.log('🔄 Creating inventory transaction:', transactionData);
    
    try {
      const response = await apiService.createInventoryTransaction(transactionData);
      
      if (response.success && response.data?.transaction) {
        const newTransaction = response.data.transaction;
        const updatedInventory = response.data.updatedInventory;
        
        console.log('✅ Inventory transaction created successfully:', newTransaction);
        
        // Update both transactions and inventory
        setInventoryTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
        if (updatedInventory) {
          setInventory(prevInventory => 
            prevInventory.map(item => item.id === updatedInventory.id ? updatedInventory : item)
          );
        }
        
        return newTransaction;
      } else {
        console.error('❌ Failed to create inventory transaction:', response.error);
        setError(response.error || 'Failed to create inventory transaction');
        return null;
      }
    } catch (error) {
      console.error('💥 Exception creating inventory transaction:', error);
      setError(error instanceof Error ? error.message : 'Failed to create inventory transaction');
      return null;
    }
  }, []);

  const sendWhatsappMessage = useCallback(async (message: any): Promise<boolean | null> => {
    console.log('🔄 Sending messagfe:', message);
    
    try {
      const response = await apiService.sentWhatsappMessages(message);
      
      if (response.success ) {   
        return true;
      } else {
        console.error('❌ Failed to Send message:', response.error);
        setError(response.error || 'Failed to Send message');
        return false;
      }
    } catch (error) {
      console.error('💥 Exception Sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to Send message');
      return false;
    }
  }, []);

  const contextValue: DataManagerContextType = {
    leads,
    orders,
    dealers,
    employees,
    inventory,
    inventoryTransactions,
    isLoading,
    error,
    whatappmessage,
    loadAllData,
    refreshData,
    createLead,
    updateLead,
    deleteLead,
    createOrder,
    updateOrder,
    deleteOrder,
    createDealer,
    updateDealer,
    deleteDealer,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createInventory,
    updateInventory,
    createInventoryTransaction,
    sendWhatsappMessage,
  };

  return (
    <DataManagerContext.Provider value={contextValue}>
      {children}
    </DataManagerContext.Provider>
  );
}