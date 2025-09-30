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
import { EmployeeList } from './EmployeeList';
import { NotificationSystem } from './NotificationSystem';
import { ProfileManagement } from './ProfileManagement';
import { WhatsAppChat } from './WhatsAppChat';
import { InstagramChat } from './InstagramChat';
import { ServerDiagnostic } from './ServerDiagnostic';
import { DataSyncHelper } from './DataSyncHelper';
import { DatabaseSetup } from './DatabaseSetup';
import { NotificationScreen } from './NotificationScreen';
import { useDataManager } from './DataManager';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Icons } from './ui/icons';

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

interface DashboardV2Props {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

export function DashboardV2({ user, onLogout, onUserUpdate }: DashboardV2Props) {
  const {
    leads,
    orders,
    dealers,
    employees,
    inventory,
    inventoryTransactions,
    isLoading,
    error,
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
    createInventoryTransaction
  } = useDataManager();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [selectedChatContact, setSelectedChatContact] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
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

  const handleAddDealer = () => {
    setCurrentView('add-dealer');
  };

  const handleAddLeadSubmit = async (leadData: any) => {
    console.log('🔄 Processing lead submission:', leadData);
    
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
      dateOfBirth: leadData.dateOfBirth,
      marriageDate: leadData.marriageDate,
      address: leadData.address,
      netWeight: leadData.netWeight,
      estimatedDeliveryDate: leadData.estimatedDeliveryDate,
      notes: leadData.notes,
      instagramUsername: leadData.instagramUsername
    };

    console.log('📤 Creating lead with data:', leadToCreate);
    const result = await createLead(leadToCreate);
    
    if (result) {
      console.log('✅ Lead created successfully:', result);
      showSuccessMessage(`Lead "${result.name}" created successfully!`);
      
      // Navigate to leads view and refresh data
      setCurrentView('leads');
      
      // Force refresh after a short delay to ensure server sync
      setTimeout(async () => {
        console.log('🔄 Force refreshing data after lead creation...');
        await refreshData();
      }, 1000);
    } else {
      console.error('❌ Failed to create lead');
      showSuccessMessage('Failed to create lead. Please check the server diagnostics.');
    }
  };

  const handleAddOrderSubmit = async (orderData: any) => {
    console.log('🔄 Processing order submission:', orderData);
    
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
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedTo: orderData.assignedTo,
      priority: orderData.priority,
      notes: orderData.notes || orderData.specialInstructions || ''
    };

    console.log('📤 Creating order with data:', orderToCreate);
    const result = await createOrder(orderToCreate);
    
    if (result) {
      console.log('✅ Order created successfully:', result);
      showSuccessMessage(`Order "${result.orderNumber}" created successfully!`);
      
      // Navigate to orders view and refresh data
      setCurrentView('orders');
      
      // Force refresh after a short delay to ensure server sync
      setTimeout(async () => {
        console.log('🔄 Force refreshing data after order creation...');
        await refreshData();
      }, 1000);
    } else {
      console.error('❌ Failed to create order');
      showSuccessMessage('Failed to create order. Please check the server diagnostics.');
    }
  };

  const handleAddDealerSubmit = async (dealerData: any) => {
    const result = await createDealer(dealerData);
    if (result) {
      showSuccessMessage(`Dealer "${result.name}" created successfully!`);
      setCurrentView('dealers');
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

      const result = await createLead(leadToCreate);
      if (result) {
        console.log(`New ${message.platform} lead created: ${message.senderName}`);
      }
    } else {
      // Update existing lead's last contact
      const updatedNotes = existingLead.notes + `\n\nNew message (${message.timestamp.toLocaleDateString()}): "${message.message}"`;
      await updateLead(existingLead.id, {
        lastContact: message.timestamp.toISOString().split('T')[0],
        notes: updatedNotes
      });
    }
  };

  const handleNotificationClick = (notification: any) => {
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

  const handleConvertToOrder = (lead: any) => {
    const orderData = {
      customerName: lead.name,
      customerEmail: lead.email,
      customerPhone: lead.phone,
      productName: lead.company || 'Custom Jewelry',
      estimatedValue: lead.value,
      priority: lead.priority,
      notes: `Converted from lead: ${lead.notes || 'No additional notes'}`
    };
    
    localStorage.setItem('orderFormData', JSON.stringify(orderData));
    setCurrentView('add-order');
  };

  const handleNavigateToChat = (platform: 'whatsapp' | 'instagram', contactInfo: any) => {
    setSelectedChatContact(contactInfo);
    if (platform === 'whatsapp') {
      setCurrentView('whatsapp-chat');
    } else {
      setCurrentView('instagram-chat');
    }
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="relative">
            {/* Quick refresh button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={refreshData}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="bg-background/80 backdrop-blur-sm"
              >
                {isLoading ? (
                  <>
                    <Icons.RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Icons.RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-6">
              {/* Data Status Summary */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Data Overview</h3>
                  <div className="flex items-center gap-2">
                    {error ? (
                      <>
                        <Icons.WifiOff className="w-4 h-4 text-red-600" />
                        <Badge variant="destructive">Data Issues</Badge>
                      </>
                    ) : (
                      <>
                        <Icons.Wifi className="w-4 h-4 text-green-600" />
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Synced</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">{leads.length}</div>
                    <div className="text-sm text-muted-foreground">Active Leads</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">{orders.length}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">{dealers.length}</div>
                    <div className="text-sm text-muted-foreground">Dealers</div>
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-800">Data Synchronization Issue</p>
                        <p className="text-xs text-red-600">{error}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setCurrentView('server-diagnostic')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Fix Issues
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <DashboardContent user={user} />
            </div>
          </div>
        );
      
      case 'leads':
        return (
          <div className="relative">
            {isLoading && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-primary/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-primary/20">
                  <Icons.RefreshCw className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm text-primary">Loading...</span>
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
                  const success = await deleteLead(leadId);
                  if (success) {
                    showSuccessMessage('Lead deleted successfully');
                  }
                }
              }}
              onAssignLead={async (leadId, assignee) => {
                const result = await updateLead(leadId, { assignedTo: assignee });
                if (result) {
                  showSuccessMessage('Lead assigned successfully');
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
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Lead Not Found</h1>
            <Button onClick={() => setCurrentView('leads')} variant="outline">
              ← Back to Leads
            </Button>
          </div>
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
              const result = await updateLead(selectedLeadId!, leadData);
              if (result) {
                showSuccessMessage('Lead updated successfully');
                setCurrentView('leads');
              }
            }}
          />
        ) : (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Lead Not Found</h1>
            <Button onClick={() => setCurrentView('leads')} variant="outline">
              ← Back to Leads
            </Button>
          </div>
        );

      case 'orders':
      case 'custom-orders':
      case 'repairs':
        return (
          <div className="relative">
            {isLoading && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-primary/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-primary/20">
                  <Icons.RefreshCw className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm text-primary">Loading...</span>
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
                  const success = await deleteOrder(orderId);
                  if (success) {
                    showSuccessMessage('Order deleted successfully');
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
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Order Not Found</h1>
            <Button onClick={() => setCurrentView('orders')} variant="outline">
              ← Back to Orders
            </Button>
          </div>
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
              const result = await updateOrder(selectedOrderId!, orderData);
              if (result) {
                showSuccessMessage('Order updated successfully');
                setCurrentView('orders');
              }
            }}
          />
        ) : (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Order Not Found</h1>
            <Button onClick={() => setCurrentView('orders')} variant="outline">
              ← Back to Orders
            </Button>
          </div>
        );

      // Other views remain the same...
      case 'inventory':
        return (
          <InventoryList 
            onSelectItem={handleSelectItem}
            onAddItem={() => setCurrentView('add-inventory')}
          />
        );

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
            onDealerAdded={async () => {
              await refreshData();
              setCurrentView('dealers');
            }}
          />
        );

      case 'employees':
        return (
          <EmployeeList />
        );

      case 'add-employee':
        return (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => setCurrentView('employees')}
                className="p-2"
              >
                <Icons.ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-semibold">Add Employee</h1>
            </div>
            {/* This will be handled by EmployeeList internally */}
            <EmployeeList />
          </div>
        );

      case 'inventory':
        return (
          <InventoryList />
        );

      case 'add-inventory':
        return (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => setCurrentView('inventory')}
                className="p-2"
              >
                <Icons.ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-semibold">Add Inventory</h1>
            </div>
            {/* This will be handled by InventoryList internally */}
            <InventoryList />
          </div>
        );

      case 'inventory-transactions':
        return (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => setCurrentView('inventory')}
                className="p-2"
              >
                <Icons.ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-semibold">Inventory Transactions</h1>
            </div>
            {/* This will be handled by InventoryList internally */}
            <InventoryList />
          </div>
        );

      case 'transfer-gold':
        return (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => setCurrentView('inventory')}
                className="p-2"
              >
                <Icons.ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-semibold">Transfer Gold to Dealer</h1>
            </div>
            {/* This will be handled by InventoryList internally */}
            <InventoryList />
          </div>
        );

      case 'notifications':
        return (
          <div className="p-6">
            <NotificationScreen 
              onNotificationClick={handleNotificationClick}
            />
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
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Server Diagnostics</h1>
              <Button onClick={() => setCurrentView('dashboard')} variant="outline">
                ← Back to Dashboard
              </Button>
            </div>

            {/* Important Notice */}
            {error && error.includes('Database tables need to be set up') && (
              <Alert className="border-orange-200 bg-orange-50">
                <Icons.AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Database Setup Required:</strong> Your database tables are not set up yet. 
                  This system now uses proper Supabase database tables for better data persistence.
                  <br />
                  <div className="mt-2 flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setCurrentView('server-diagnostic')}
                      className="hover:bg-orange-700 text-white bg-black"
                    >
                      Set Up Database Now
                    </Button>
                    <span className="text-xs text-orange-600 self-center">
                      This will create the required tables automatically.
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Data Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Database className="w-5 h-5 text-primary" />
                  Current Data Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{leads.length}</div>
                    <div className="text-sm text-muted-foreground">Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{orders.length}</div>
                    <div className="text-sm text-muted-foreground">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{dealers.length}</div>
                    <div className="text-sm text-muted-foreground">Dealers</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {error ? (
                      <>
                        <Icons.WifiOff className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Connection Issues</span>
                      </>
                    ) : (
                      <>
                        <Icons.Wifi className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Connected</span>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={refreshData}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Icons.RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <Icons.RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Data
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <DatabaseSetup />
            
            <DataSyncHelper 
              currentLeads={leads}
              currentOrders={orders}
              onDataUpdate={(newLeads, newOrders) => {
                // Data will be updated through the context
                refreshData();
              }}
            />
            
            <ServerDiagnostic />
          </div>
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
      <div className="flex-1 overflow-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Icons.CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          </div>
        )}
        
        {/* Messaging Integration - Hidden but active */}
        <MessagingIntegration onIncomingMessage={handleIncomingMessage} />
        
        {/* Main Content */}
        {renderMainContent()}
      </div>
    </div>
  );
}