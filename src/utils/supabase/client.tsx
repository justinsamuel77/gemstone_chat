import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a singleton Supabase client instance
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// API utility functions - Always use Supabase Edge Functions
const getApiBaseUrl = () => {
  return `https://${projectId}.supabase.co/functions/v1/make-server-2ed58025`;
};

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const API_BASE_URL = getApiBaseUrl();
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`);
  console.log(`🔧 Environment: ${import.meta.env?.MODE || 'development'}`);
  console.log(`🎯 API Base URL: ${API_BASE_URL}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    // Check if response is ok first
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, try to read as text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error('Failed to read error response:', textError);
        }
      }
      
      throw new Error(errorMessage);
    }

    // Try to parse response as JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Invalid JSON response from server');
      }
    } else {
      // If not JSON, read as text and try to handle
      const text = await response.text();
      if (text.trim() === '') {
        return { success: true }; // Empty successful response
      }
      
      // Try to parse as JSON anyway (in case content-type is wrong)
      try {
        return JSON.parse(text);
      } catch (jsonError) {
        console.error('Non-JSON response received:', text);
        throw new Error('Server returned non-JSON response');
      }
    }
  } catch (error) {
    console.error(`❌ Network error for ${url}:`, error);
    
    // Enhanced error messages for common issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to Supabase Edge Function. Please check your internet connection and Supabase project status.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

// Health check function to test connectivity - Now using Supabase auth instead
export const healthCheck = async () => {
  try {
    console.log('🏥 Health check: Testing Supabase connection...');
    
    // Test Supabase connection by making a simple auth request
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message !== 'Auth session missing!') {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    
    console.log('✅ Health check successful: Supabase connection active');
    return { status: 'healthy', service: 'supabase' };
  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw error;
  }
};

// Auth-specific API calls - Using Supabase Edge Functions
export const authApi = {
  signup: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    jobTitle?: string;
  }) => {
    try {
      return await apiCall('/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  signin: async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      return await apiCall('/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      return await apiCall('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  getProfile: async (accessToken: string) => {
    try {
      return await apiCall('/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
};