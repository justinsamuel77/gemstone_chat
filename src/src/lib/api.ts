const API_BASE = 'https://gemstone-chat.onrender.com/api';

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company?: string;
  jobTitle?: string;
}

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

interface AuthResponse {
  user: User;
  access_token: string;
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'An error occurred', response.status);
  }

  return data;
}

export const authApi = {
  async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    return apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(signUpData),
    });
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return apiRequest('/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getProfile(accessToken: string) {
    return apiRequest('/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};

export const leadsApi = {
  async getLeads(accessToken: string) {
    return apiRequest('/leads', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async createLead(accessToken: string, leadData: any) {
    return apiRequest('/leads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(leadData),
    });
  },
};

export const ordersApi = {
  async getOrders(accessToken: string) {
    return apiRequest('/orders', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};

export const systemApi = {
  async checkHealth() {
    return apiRequest('/health');
  },

  async setupDatabase() {
    return apiRequest('/setup-database');
  },
};