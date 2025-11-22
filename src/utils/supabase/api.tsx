import { projectId, publicAnonKey } from './info';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private getBaseUrl(): string {
    // Always use Supabase Edge Functions
    // return `https://${projectId}.supabase.co/functions/v1/make-server-2ed58025`;
    return `https://gemstone-chat.onrender.com/api`;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    console.log('Using auth token:', token ? 'Token present' : 'No token found');
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    console.log(`Making API request to: ${url}`);
    
    try {
      const headers = this.getAuthHeaders();
      console.log('Request headers:', headers);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      console.log(`API Response status: ${response.status}`);

      // Check if response is ok first
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.error('API Error response:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error JSON:', jsonError);
          try {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Failed to read error response:', textError);
          }
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Try to parse response as JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await response.json();
          console.log('API Response data:', data);
          return {
            success: true,
            data: data,
          };
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          return {
            success: false,
            error: 'Invalid JSON response from server',
          };
        }
      } else {
        // If not JSON, read as text and try to handle
        const text = await response.text();
        console.log('Non-JSON response received:', text);
        
        if (text.trim() === '') {
          return { success: true, data: { success: true } as T };
        }
        
        // Try to parse as JSON anyway (in case content-type is wrong)
        try {
          const data = JSON.parse(text);
          return {
            success: true,
            data: data,
          };
        } catch (jsonError) {
          console.error('Non-JSON response that cannot be parsed:', text);
          return {
            success: false,
            error: 'Server returned non-JSON response',
          };
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Leads API
  async getLeads() {
    console.log('Fetching leads...');
    return this.request<{ leads: any[] }>('/leads');
  }

  async createLead(leadData: any) {
    console.log('Creating lead with data:', leadData);
    return this.request<{ lead: any }>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(leadId: string, leadData: any) {
    console.log(`Updating lead ${leadId} with data:`, leadData);
    return this.request<{ lead: any }>(`/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  }

  async deleteLead(leadId: string) {
    console.log(`Deleting lead ${leadId}`);
    return this.request<{ message: string }>(`/leads/${leadId}`, {
      method: 'DELETE',
    });
  }

  // Orders API
  async getOrders() {
    console.log('Fetching orders...');
    return this.request<{ orders: any[] }>('/orders');
  }

  async createOrder(orderData: any) {
    console.log('Creating order with data:', orderData);
    return this.request<{ order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(orderId: string, orderData: any) {
    console.log(`Updating order ${orderId} with data:`, orderData);
    return this.request<{ order: any }>(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(orderId: string) {
    console.log(`Deleting order ${orderId}`);
    return this.request<{ message: string }>(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Dealers API
  async getDealers() {
    console.log('Fetching dealers...');
    return this.request<{ dealers: any[] }>('/dealers');
  }

  async createDealer(dealerData: any) {
    console.log('Creating dealer with data:', dealerData);
    return this.request<{ dealer: any }>('/dealers', {
      method: 'POST',
      body: JSON.stringify(dealerData),
    });
  }

  async updateDealer(dealerId: string, dealerData: any) {
    console.log(`Updating dealer ${dealerId} with data:`, dealerData);
    return this.request<{ dealer: any }>(`/dealers/${dealerId}`, {
      method: 'PUT',
      body: JSON.stringify(dealerData),
    });
  }

  async deleteDealer(dealerId: string) {
    console.log(`Deleting dealer ${dealerId}`);
    return this.request<{ message: string }>(`/dealers/${dealerId}`, {
      method: 'DELETE',
    });
  }

  // Employees API
  async getEmployees() {
    console.log('Fetching employees...');
    return this.request<{ employees: any[] }>('/employees'); // APi call
  }

  async createEmployee(employeeData: any) {
    console.log('Creating employee with data:', employeeData);
    return this.request<{ employee: any }>('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(employeeId: string, employeeData: any) {
    console.log(`Updating employee ${employeeId} with data:`, employeeData);
    return this.request<{ employee: any }>(`/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(employeeId: string) {
    console.log(`Deleting employee ${employeeId}`);
    return this.request<{ message: string }>(`/employees/${employeeId}`, {
      method: 'DELETE',
    });
  }

  // Inventory API
  async getInventory() {
    console.log('Fetching inventory...');
    return this.request<{ inventory: any[] }>('/inventory');
  }

  async createInventory(inventoryData: any) {
    console.log('Creating inventory with data:', inventoryData);
    return this.request<{ inventory: any }>('/inventory', {
      method: 'POST',
      body: JSON.stringify(inventoryData),
    });
  }

  async updateInventory(inventoryId: string, inventoryData: any) {
    console.log(`Updating inventory ${inventoryId} with data:`, inventoryData);
    return this.request<{ inventory: any }>(`/inventory/${inventoryId}`, {
      method: 'PUT',
      body: JSON.stringify(inventoryData),
    });
  }

  async createInventoryTransaction(transactionData: any) {
    console.log('Creating inventory transaction with data:', transactionData);
    return this.request<{ transaction: any; updatedInventory: any }>('/inventory/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getInventoryTransactions() {
    console.log('Fetching inventory transactions...');
    return this.request<{ transactions: any[] }>('/inventory/transactions');
  }
  
  async getWhatsappMessages() {
    console.log('Fetching whatsapp messages...');
    return this.request<{ whatsappmessages: any[] }>('/whatsapp');
  }

  async getInstagramMessages() {
    console.log('Fetching instagram messages...');
    return this.request<{ instagrammessages: any[] }>('/instagram');
  }

  async sentWhatsappMessages(message:any) {
    // return this.request<{ whatsappmessage: any[] }>('/sendwhatsappMessage');
    console.log('APi message is',message)
     return this.request<{  whatsappmessage: any }>('/sendwhatsappMessage', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async sentInstagramMessages(message:any) {
    // return this.request<{ whatsappmessage: any[] }>('/sendinstagramMessage');
    console.log('Instagram APi message is',message)
     return this.request<{  instagrammessage: any }>('/sendinstagramMessage', {
      method: 'POST',
      body: JSON.stringify(message),
    });
    
  }
  
}

export const apiService = new ApiService();