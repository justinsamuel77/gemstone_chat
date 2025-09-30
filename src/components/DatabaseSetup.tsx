import React, { useState } from 'react';
import { Button } from './ui/button';
import { projectId } from '../utils/supabase/info';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Icons } from './ui/icons';

const { 
  Database, 
  Loader2, 
  Check, 
  X, 
  AlertTriangle, 
  Copy, 
  ExternalLink 
} = Icons;

export function DatabaseSetup() {
  const [isChecking, setIsChecking] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{
    tables: {
      leads: string;
      orders: string;
      dealers: string;
      employees: string;
      inventory: string;
      inventory_transactions: string;
      user_profiles: string;
    };
    message: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDatabaseSetup = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-2ed58025`;
      
      const response = await fetch(
        `${baseUrl}/setup-database`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSetupStatus(data);
      
      console.log('Database setup status:', data);
    } catch (error) {
      console.error('Database setup check failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to check database setup');
    } finally {
      setIsChecking(false);
    }
  };

  const createDatabaseTables = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-2ed58025`;
      
      const response = await fetch(
        `${baseUrl}/setup-database`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSetupStatus(data);
        console.log('✅ Database tables created successfully:', data);
      } else {
        throw new Error(data.error || 'Failed to create tables');
      }
      
    } catch (error) {
      console.error('Database table creation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to create database tables');
    } finally {
      setIsCreating(false);
    }
  };

  const sqlScript = `-- Run this SQL in your Supabase SQL Editor
-- GEMSTONE Fine Jewelry CRM Database Setup
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('super_admin', 'sub_admin', 'employee');

-- Create user profiles table for role-based access
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role user_role DEFAULT 'employee',
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address TEXT,
    hire_date DATE,
    department TEXT,
    position TEXT,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    position TEXT,
    department TEXT,
    hire_date DATE,
    salary NUMERIC,
    status TEXT DEFAULT 'active',
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'g',
    description TEXT,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory transactions table
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw', 'transfer')),
    quantity NUMERIC NOT NULL,
    dealer_id UUID REFERENCES public.dealers(id),
    employee_id UUID REFERENCES public.employees(id),
    description TEXT,
    notes TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table with assigned_employee_id
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'New',
    source TEXT,
    assigned_to TEXT,
    assigned_employee_id UUID REFERENCES public.employees(id),
    last_contact DATE,
    value NUMERIC DEFAULT 0,
    priority TEXT DEFAULT 'Medium',
    company TEXT,
    date_of_birth DATE,
    marriage_date DATE,
    address TEXT,
    net_weight TEXT,
    estimated_delivery_date DATE,
    notes TEXT,
    instagram_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table with assigned_employee_id
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    status TEXT DEFAULT 'Pending',
    type TEXT,
    items JSONB,
    total_amount NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    payment_status TEXT DEFAULT 'Pending',
    order_date DATE,
    expected_delivery DATE,
    assigned_to TEXT,
    assigned_employee_id UUID REFERENCES public.employees(id),
    priority TEXT DEFAULT 'Medium',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dealers table
CREATE TABLE IF NOT EXISTS public.dealers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    company TEXT,
    status TEXT DEFAULT 'active',
    email TEXT,
    specialization TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_employee_id ON public.leads(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_employee_id ON public.orders(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_dealers_user_id ON public.dealers(user_id);
CREATE INDEX IF NOT EXISTS idx_dealers_created_at ON public.dealers(created_at);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON public.employees(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON public.inventory(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_user_id ON public.inventory_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON public.inventory_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Users can view their own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own leads" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own leads" ON public.leads
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own orders" ON public.orders
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for dealers
CREATE POLICY "Users can view their own dealers" ON public.dealers
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dealers" ON public.dealers
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dealers" ON public.dealers
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dealers" ON public.dealers
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for employees
CREATE POLICY "Users can view their own employees" ON public.employees
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own employees" ON public.employees
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own employees" ON public.employees
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employees" ON public.employees
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for inventory
CREATE POLICY "Users can view their own inventory" ON public.inventory
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inventory" ON public.inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory" ON public.inventory
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inventory" ON public.inventory
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for inventory transactions
CREATE POLICY "Users can view their own inventory transactions" ON public.inventory_transactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inventory transactions" ON public.inventory_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory transactions" ON public.inventory_transactions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inventory transactions" ON public.inventory_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles p 
            WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
        )
    );

-- Super admins can create profiles for sub admins and employees
CREATE POLICY "Super admins can create profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles p 
            WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
        )
    );

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_dealers_updated_at
    BEFORE UPDATE ON public.dealers
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_inventory_transactions_updated_at
    BEFORE UPDATE ON public.inventory_transactions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to automatically create user profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
    INSERT INTO public.user_profiles (user_id, role, first_name, last_name)
    VALUES (
        NEW.id,
        'super_admin', -- First user becomes super admin, subsequent users will be set by super admin
        COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
        COALESCE(NEW.raw_user_meta_data->>'lastName', '')
    );
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
  };

  const getTableStatus = (status: string) => {
    switch (status) {
      case 'exists':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Check className="w-3 h-3 mr-1" />
          Ready
        </Badge>;
      case 'created':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Check className="w-3 h-3 mr-1" />
          Created
        </Badge>;
      case 'needs_creation':
        return <Badge variant="destructive">
          <X className="w-3 h-3 mr-1" />
          Needs Setup
        </Badge>;
      case 'failed':
        return <Badge variant="destructive">
          <X className="w-3 h-3 mr-1" />
          Failed
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const needsSetup = setupStatus && Object.values(setupStatus.tables).some(status => 
    status === 'needs_creation' || status === 'failed'
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Database Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This system requires database tables for leads, orders, dealers, employees, and inventory management. 
            Click the button below to check if your database is properly set up.
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={checkDatabaseSetup}
              disabled={isChecking || isCreating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking Database...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Check Database Setup
                </>
              )}
            </Button>

            {needsSetup && (
              <Button
                onClick={createDatabaseTables}
                disabled={isChecking || isCreating}
                variant="secondary"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Tables...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Create Tables Automatically
                  </>
                )}
              </Button>
            )}
          </div>

          {setupStatus && (
            <div className="space-y-3">
              <h4 className="font-medium">Table Status:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Leads</span>
                  {getTableStatus(setupStatus.tables.leads)}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Orders</span>
                  {getTableStatus(setupStatus.tables.orders)}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Dealers</span>
                  {getTableStatus(setupStatus.tables.dealers)}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Employees</span>
                  {getTableStatus(setupStatus.tables.employees || 'needs_creation')}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Inventory</span>
                  {getTableStatus(setupStatus.tables.inventory || 'needs_creation')}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Transactions</span>
                  {getTableStatus(setupStatus.tables.inventory_transactions || 'needs_creation')}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">User Profiles</span>
                  {getTableStatus(setupStatus.tables.user_profiles || 'needs_creation')}
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Database Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              If the automatic creation fails, run this SQL script in your Supabase SQL Editor:
            </p>
            {needsSetup && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                Manual Setup Available
              </Badge>
            )}
          </div>
          
          <div className="relative">
            <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-60 border">
              {sqlScript}
            </pre>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="absolute top-2 right-2"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Supabase Dashboard
            </Button>
            <span className="text-xs text-muted-foreground">
              → Go to SQL Editor → Paste and run the script above
            </span>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> After running the SQL script, click "Check Database Setup" again to verify the tables were created successfully.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}