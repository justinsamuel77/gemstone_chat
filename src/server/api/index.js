import dotenv from 'dotenv';
import axios from 'axios';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

// Load environment variables from ../.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';
import process from 'node:process';

const app = new Hono();
app.use('/whatsapp_images/*', serve({ root: './asset' }));


// Environment variable validation
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Please check your .env file and ensure all required variables are set.');
  console.error('   See .env.example for the required format.');
}

// Log environment status
console.log('🔧 Environment Configuration:');
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '⚠️ Optional'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to verify authorization
const verifyAuth = async (request) => {
  const authHeader = request.headers.get('Authorization');
  console.log('🔐 Auth header received:', authHeader ? 'Present' : 'Missing');

  if (!authHeader) {
    console.log('❌ No authorization header found');
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('❌ Invalid authorization header format');
    return null;
  }

  const accessToken = parts[1];
  console.log('🔑 Extracted token:', accessToken ? 'Present' : 'Missing');

  // Check if token looks like the anon key (fallback for unauthenticated requests)
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (accessToken === anonKey) {
    console.log('⚠️ Using anon key - no user authentication');
    return null;
  }

  try {
    const authClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: { user }, error } = await authClient.auth.getUser(accessToken);

    if (error) {
      console.error('❌ Auth verification error:', error.message);
      return null;
    }

    if (!user?.id) {
      console.log('❌ No user found for token');
      return null;
    }

    console.log('✅ User authenticated:', user.id);
    return user;
  } catch (error) {
    console.error('💥 Auth verification exception:', error);
    return null;
  }
};

// Database setup endpoints
app.get('/api/setup-database', async (c) => {
  try {
    console.log('🔄 Checking database table status...');

    const tableChecks = await Promise.allSettled([
      supabase.from('leads').select('id').limit(1),
      supabase.from('orders').select('id').limit(1),
      supabase.from('dealers').select('id').limit(1),
      supabase.from('employees').select('id').limit(1),
      supabase.from('inventory').select('id').limit(1),
      supabase.from('inventory_transactions').select('id').limit(1),
      supabase.from('user_profiles').select('id').limit(1),
      supabase.from('whatsapp').select('id').limit(1),
    ]);

    const tableStatus = {
      leads: tableChecks[0].status === 'fulfilled' ? 'exists' : 'needs_creation',
      orders: tableChecks[1].status === 'fulfilled' ? 'exists' : 'needs_creation',
      dealers: tableChecks[2].status === 'fulfilled' ? 'exists' : 'needs_creation',
      employees: tableChecks[3].status === 'fulfilled' ? 'exists' : 'needs_creation',
      inventory: tableChecks[4].status === 'fulfilled' ? 'exists' : 'needs_creation',
      inventory_transactions: tableChecks[5].status === 'fulfilled' ? 'exists' : 'needs_creation',
      user_profiles: tableChecks[6].status === 'fulfilled' ? 'exists' : 'needs_creation',
      whatsapp: verificationChecks[7].status === 'fulfilled' ? 'created' : 'failed'
    };

    console.log('📊 Table status:', tableStatus);

    return c.json({
      message: 'Database setup check completed',
      tables: tableStatus
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return c.json({ error: 'Database setup failed', details: error }, 500);
  }
});

app.post('/api/setup-database', async (c) => {
  try {
    console.log('🔄 Creating database tables...');

    // SQL script for creating all necessary tables
    const createTablesSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles enum
DO $ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'sub_admin', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- Create user profiles table
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

-- Create leads table
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

-- Create orders table
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

-- Create orders table
CREATE TABLE IF NOT EXISTS public.whatsapp (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_name TEXT NOT NULL,
    recipient_number NUMERIC UNIQUE NOT NULL,
    message_history JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $ BEGIN
    -- Policies for leads
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can view their own leads') THEN
        CREATE POLICY "Users can view their own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can insert their own leads') THEN
        CREATE POLICY "Users can insert their own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can update their own leads') THEN
        CREATE POLICY "Users can update their own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can delete their own leads') THEN
        CREATE POLICY "Users can delete their own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Policies for orders
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can view their own orders') THEN
        CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can insert their own orders') THEN
        CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can update their own orders') THEN
        CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can delete their own orders') THEN
        CREATE POLICY "Users can delete their own orders" ON public.orders FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Policies for other tables... (similar pattern)
END $;
`;

    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', { sql_script: createTablesSQL });

    if (error) {
      console.error('❌ Database table creation error:', error);

      // Try alternative approach - create tables one by one
      console.log('🔄 Attempting to create tables individually...');

      const tables = [
        {
          name: 'user_profiles',
          sql: `CREATE TABLE IF NOT EXISTS public.user_profiles (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
            role TEXT DEFAULT 'employee',
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            address TEXT,
            hire_date DATE,
            department TEXT,
            position TEXT,
            status TEXT DEFAULT 'active',
            created_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          ); ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;`
        },
        {
          name: 'employees',
          sql: `CREATE TABLE IF NOT EXISTS public.employees (
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
          ); ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;`
        },
        {
          name: 'inventory',
          sql: `CREATE TABLE IF NOT EXISTS public.inventory (
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
          ); ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;`
        }
      ];

      const createResults = {};

      for (const table of tables) {
        try {
          const { error: tableError } = await supabase.rpc('exec_sql', { sql_script: table.sql });
          createResults[table.name] = tableError ? 'failed' : 'created';
          if (tableError) {
            console.error(`❌ Failed to create ${table.name}:`, tableError);
          } else {
            console.log(`✅ Created table: ${table.name}`);
          }
        } catch (e) {
          console.error(`💥 Exception creating ${table.name}:`, e);
          createResults[table.name] = 'failed';
        }
      }

      return c.json({
        success: false,
        error: 'Some tables could not be created automatically',
        tables: createResults,
        message: 'Please use the manual SQL script in Supabase SQL Editor'
      }, 500);
    }

    // Verify tables were created
    const verificationChecks = await Promise.allSettled([
      supabase.from('leads').select('id').limit(1),
      supabase.from('orders').select('id').limit(1),
      supabase.from('dealers').select('id').limit(1),
      supabase.from('employees').select('id').limit(1),
      supabase.from('inventory').select('id').limit(1),
      supabase.from('inventory_transactions').select('id').limit(1),
      supabase.from('user_profiles').select('id').limit(1),
      supabase.from('whatsapp').select('id').limit(1)
    ]);

    const finalStatus = {
      leads: verificationChecks[0].status === 'fulfilled' ? 'created' : 'failed',
      orders: verificationChecks[1].status === 'fulfilled' ? 'created' : 'failed',
      dealers: verificationChecks[2].status === 'fulfilled' ? 'created' : 'failed',
      employees: verificationChecks[3].status === 'fulfilled' ? 'created' : 'failed',
      inventory: verificationChecks[4].status === 'fulfilled' ? 'created' : 'failed',
      inventory_transactions: verificationChecks[5].status === 'fulfilled' ? 'created' : 'failed',
      user_profiles: verificationChecks[6].status === 'fulfilled' ? 'created' : 'failed',
      whatsapp: verificationChecks[7].status === 'fulfilled' ? 'created' : 'failed'
    };

    console.log('✅ Database tables created successfully');
    console.log('📊 Final table status:', finalStatus);

    return c.json({
      success: true,
      message: 'Database tables created successfully',
      tables: finalStatus
    });
  } catch (error) {
    console.error('💥 Database setup creation error:', error);
    return c.json({
      success: false,
      error: 'Failed to create database tables',
      details: error.message
    }, 500);
  }
});

// Authentication endpoints
app.post('/api/signup', async (c) => {
  try {
    const { email, password, firstName, lastName, company, jobTitle } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        firstName,
        lastName,
        company: company || '',
        jobTitle: jobTitle || '',
        name: `${firstName} ${lastName}`
      },
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'Failed to create user' }, 400);
    }

    // Sign in the user to get an access token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError || !signInData.session) {
      console.error('Auto sign-in error:', signInError);
      return c.json({ error: 'User created but failed to sign in' }, 500);
    }

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: `${firstName} ${lastName}`,
        profile: {
          firstName,
          lastName,
          company: company || '',
          jobTitle: jobTitle || ''
        }
      },
      access_token: signInData.session.access_token
    });
  } catch (error) {
    console.error('Signup endpoint error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

app.post('/api/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Signin error:', error);
      return c.json({ error: error.message }, 401);
    }

    if (!data.session || !data.user) {
      return c.json({ error: 'Failed to create session' }, 401);
    }

    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email,
      profile: {
        firstName: data.user.user_metadata?.firstName || '',
        lastName: data.user.user_metadata?.lastName || '',
        company: data.user.user_metadata?.company || '',
        jobTitle: data.user.user_metadata?.jobTitle || ''
      }
    };

    return c.json({
      user: userData,
      access_token: data.session.access_token
    });
  } catch (error) {
    console.error('Signin endpoint error:', error);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

app.get('/api/profile', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({
      profile: {
        firstName: user.user_metadata?.firstName || '',
        lastName: user.user_metadata?.lastName || '',
        company: user.user_metadata?.company || '',
        jobTitle: user.user_metadata?.jobTitle || ''
      }
    });
  } catch (error) {
    console.error('Profile endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Leads endpoints
app.get('/api/leads', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      // .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching leads:', error);
      if (error.code === '42P01') {
        return c.json({
          leads: [],
          warning: 'Database tables not set up. Please run database setup.',
          tableExists: false
        });
      }
      return c.json({ error: 'Failed to fetch leads' }, 500);
    }

    // Normalize DB fields (snake_case) into frontend-friendly camelCase
    const normalizedLeads = (leads || []).map((l) => {
      // Safeguard required fields
      const name = l.name || l.instagram_username || l.email || 'Unknown';

      return {
        id: l.id,
        name,
        email: l.email || '',
        phone: l.phone || '',
        status: l.status || 'New',
        source: l.source || '',
        assignedTo: l.assigned_to || l.assignedTo || '',
        assigned_employee_id: l.assigned_employee_id || null,
        lastContact: l.last_contact || l.lastContact || null,
        value: l.value != null ? l.value : 0,
        priority: l.priority || 'Medium',
        createdAt: l.created_at || l.createdAt || null,
        updatedAt: l.updated_at || l.updatedAt || null,
        company: l.company || '',
        dateOfBirth: l.date_of_birth || l.dateOfBirth || null,
        marriageDate: l.marriage_date || l.marriageDate || null,
        address: l.address || '',
        netWeight: l.net_weight || l.netWeight || null,
        estimatedDeliveryDate: l.estimated_delivery_date || l.estimatedDeliveryDate || null,
        notes: l.notes || '',
        instagramUsername: l.instagram_username || l.instagramUsername || null,
        avatar: l.avatar || null
      };
    });

    return c.json({ leads: normalizedLeads });
  } catch (error) {
    console.error('💥 Exception in leads endpoint:', error);
    return c.json({ error: 'Failed to fetch leads' }, 500);
  }
});

app.post('/api/leads', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const leadData = await c.req.json();

    const leadToInsert = {
      ...leadData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: lead, error } = await supabase
      .from('leads')
      .insert([leadToInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating lead:', error);
      if (error.code === '42P01') {
        return c.json({
          error: 'Database tables not set up. Please run database setup first.',
          tableExists: false
        }, 400);
      }
      return c.json({ error: 'Failed to create lead' }, 500);
    }

    return c.json({ lead });
  } catch (error) {
    console.error('💥 Exception creating lead:', error);
    return c.json({ error: 'Failed to create lead' }, 500);
  }
});

// Orders endpoints  
app.get('/api/orders', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching orders:', error);
      if (error.code === '42P01') {
        return c.json({
          orders: [],
          warning: 'Database tables not set up. Please run database setup.',
          tableExists: false
        });
      }
      return c.json({ error: 'Failed to fetch orders' }, 500);
    }

    return c.json({ orders: orders || [] });
  } catch (error) {
    console.error('💥 Exception in orders endpoint:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Dealers endpoints
app.get('/api/dealers', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: dealers, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching dealers:', error);
      if (error.code === '42P01') {
        return c.json({
          dealers: [],
          warning: 'Database tables not set up. Please run database setup.',
          tableExists: false
        });
      }
      return c.json({ error: 'Failed to fetch dealers' }, 500);
    }

    return c.json({ dealers: dealers || [] });
  } catch (error) {
    console.error('💥 Exception in dealers endpoint:', error);
    return c.json({ error: 'Failed to fetch dealers' }, 500);
  }
});

app.post('/api/dealers', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealerData = await c.req.json();

    const dealerToInsert = {
      ...dealerData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: dealer, error } = await supabase
      .from('dealers')
      .insert([dealerToInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating dealer:', error);
      if (error.code === '42P01') {
        return c.json({
          error: 'Database tables not set up. Please run database setup first.',
          tableExists: false
        }, 400);
      }
      return c.json({ error: 'Failed to create dealer' }, 500);
    }

    return c.json({ dealer });
  } catch (error) {
    console.error('💥 Exception creating dealer:', error);
    return c.json({ error: 'Failed to create dealer' }, 500);
  }
});

app.put('/api/dealers/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealerId = c.req.param('id');
    const dealerData = await c.req.json();

    const dealerToUpdate = {
      ...dealerData,
      updated_at: new Date().toISOString()
    };

    const { data: dealer, error } = await supabase
      .from('dealers')
      .update(dealerToUpdate)
      .eq('id', dealerId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error updating dealer:', error);
      return c.json({ error: 'Failed to update dealer' }, 500);
    }

    return c.json({ dealer });
  } catch (error) {
    console.error('💥 Exception updating dealer:', error);
    return c.json({ error: 'Failed to update dealer' }, 500);
  }
});

app.delete('/api/dealers/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealerId = c.req.param('id');

    const { error } = await supabase
      .from('dealers')
      .delete()
      .eq('id', dealerId)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Database error deleting dealer:', error);
      return c.json({ error: 'Failed to delete dealer' }, 500);
    }

    return c.json({ message: 'Dealer deleted successfully' });
  } catch (error) {
    console.error('💥 Exception deleting dealer:', error);
    return c.json({ error: 'Failed to delete dealer' }, 500);
  }
});

// Employees endpoints
app.get('/api/employees', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching employees:', error);
      if (error.code === '42P01') {
        return c.json({
          employees: [],
          warning: 'Database tables not set up. Please run database setup.',
          tableExists: false
        });
      }
      return c.json({ error: 'Failed to fetch employees' }, 500);
    }

    return c.json({ employees: employees || [] });
  } catch (error) {
    console.error('💥 Exception in employees endpoint:', error);
    return c.json({ error: 'Failed to fetch employees' }, 500);
  }
});

app.post('/api/employees', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employeeData = await c.req.json();

    const employeeToInsert = {
      ...employeeData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: employee, error } = await supabase
      .from('employees')
      .insert([employeeToInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating employee:', error);
      if (error.code === '42P01') {
        return c.json({
          error: 'Database tables not set up. Please run database setup first.',
          tableExists: false
        }, 400);
      }
      return c.json({ error: 'Failed to create employee' }, 500);
    }

    return c.json({ employee });
  } catch (error) {
    console.error('💥 Exception creating employee:', error);
    return c.json({ error: 'Failed to create employee' }, 500);
  }
});

app.put('/api/employees/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employeeId = c.req.param('id');
    const employeeData = await c.req.json();

    const employeeToUpdate = {
      ...employeeData,
      updated_at: new Date().toISOString()
    };

    const { data: employee, error } = await supabase
      .from('employees')
      .update(employeeToUpdate)
      .eq('id', employeeId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error updating employee:', error);
      return c.json({ error: 'Failed to update employee' }, 500);
    }

    return c.json({ employee });
  } catch (error) {
    console.error('💥 Exception updating employee:', error);
    return c.json({ error: 'Failed to update employee' }, 500);
  }
});

app.delete('/api/employees/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employeeId = c.req.param('id');

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Database error deleting employee:', error);
      return c.json({ error: 'Failed to delete employee' }, 500);
    }

    return c.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('💥 Exception deleting employee:', error);
    return c.json({ error: 'Failed to delete employee' }, 500);
  }
});

// Inventory endpoints
app.get('/api/inventory', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: inventory, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching inventory:', error);
      if (error.code === '42P01') {
        return c.json({
          inventory: [],
          warning: 'Database tables not set up. Please run database setup.',
          tableExists: false
        });
      }
      return c.json({ error: 'Failed to fetch inventory' }, 500);
    }

    return c.json({ inventory: inventory || [] });
  } catch (error) {
    console.error('💥 Exception in inventory endpoint:', error);
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

app.post('/api/inventory', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const inventoryData = await c.req.json();

    const inventoryToInsert = {
      ...inventoryData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: inventory, error } = await supabase
      .from('inventory')
      .insert([inventoryToInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating inventory:', error);
      if (error.code === '42P01') {
        return c.json({
          error: 'Database tables not set up. Please run database setup first.',
          tableExists: false
        }, 400);
      }
      return c.json({ error: 'Failed to create inventory' }, 500);
    }

    return c.json({ inventory });
  } catch (error) {
    console.error('💥 Exception creating inventory:', error);
    return c.json({ error: 'Failed to create inventory' }, 500);
  }
});

app.put('/api/inventory/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const inventoryId = c.req.param('id');
    const inventoryData = await c.req.json();

    const inventoryToUpdate = {
      ...inventoryData,
      updated_at: new Date().toISOString()
    };

    const { data: inventory, error } = await supabase
      .from('inventory')
      .update(inventoryToUpdate)
      .eq('id', inventoryId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error updating inventory:', error);
      return c.json({ error: 'Failed to update inventory' }, 500);
    }

    return c.json({ inventory });
  } catch (error) {
    console.error('💥 Exception updating inventory:', error);
    return c.json({ error: 'Failed to update inventory' }, 500);
  }
});

// Inventory transactions endpoints
app.get('/api/inventory/transactions', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Fetch transactions with related inventory, dealer, and employee data
    const { data: transactions, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        inventory:inventory_id(*),
        dealer:dealer_id(*),
        employee:employee_id(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching inventory transactions:', error);
      if (error.code === '42P01') {
        return c.json({
          transactions: [],
          warning: 'Database tables not set up. Please run database setup.',
          tableExists: false
        });
      }
      return c.json({ error: 'Failed to fetch inventory transactions' }, 500);
    }

    return c.json({ transactions: transactions || [] });
  } catch (error) {
    console.error('💥 Exception in inventory transactions endpoint:', error);
    return c.json({ error: 'Failed to fetch inventory transactions' }, 500);
  }
});

app.post('/api/inventory/transactions', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const transactionData = await c.req.json();

    // Start a transaction to update inventory and create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert([{
        ...transactionData,
        user_id: user.id,
        transaction_date: transactionData.transaction_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        inventory:inventory_id(*),
        dealer:dealer_id(*),
        employee:employee_id(*)
      `)
      .single();

    if (transactionError) {
      console.error('❌ Database error creating inventory transaction:', transactionError);
      return c.json({ error: 'Failed to create inventory transaction' }, 500);
    }

    // Update inventory quantity based on transaction type
    const { data: currentInventory, error: inventoryFetchError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('id', transactionData.inventory_id)
      .eq('user_id', user.id)
      .single();

    if (inventoryFetchError) {
      console.error('❌ Database error fetching current inventory:', inventoryFetchError);
      return c.json({ error: 'Failed to fetch current inventory' }, 500);
    }

    let newQuantity = parseFloat(currentInventory.quantity || 0);
    const transactionQuantity = parseFloat(transactionData.quantity || 0);

    // Apply transaction to inventory quantity
    if (transactionData.transaction_type === 'deposit') {
      newQuantity += transactionQuantity;
    } else if (transactionData.transaction_type === 'withdraw') {
      newQuantity -= transactionQuantity;
    }
    // For transfers, we maintain the same quantity (moving between locations/dealers)

    const { data: updatedInventory, error: inventoryUpdateError } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionData.inventory_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (inventoryUpdateError) {
      console.error('❌ Database error updating inventory quantity:', inventoryUpdateError);
      return c.json({ error: 'Failed to update inventory quantity' }, 500);
    }

    return c.json({
      transaction,
      updatedInventory
    });
  } catch (error) {
    console.error('💥 Exception creating inventory transaction:', error);
    return c.json({ error: 'Failed to create inventory transaction' }, 500);
  }
});

// Update leads and orders to include assigned_employee_id
app.put('/api/leads/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const leadId = c.req.param('id');
    const leadData = await c.req.json();

    const leadToUpdate = {
      ...leadData,
      updated_at: new Date().toISOString()
    };

    const { data: lead, error } = await supabase
      .from('leads')
      .update(leadToUpdate)
      .eq('id', leadId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error updating lead:', error);
      return c.json({ error: 'Failed to update lead' }, 500);
    }

    return c.json({ lead });
  } catch (error) {
    console.error('💥 Exception updating lead:', error);
    return c.json({ error: 'Failed to update lead' }, 500);
  }
});

app.delete('/api/leads/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const leadId = c.req.param('id');

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Database error deleting lead:', error);
      return c.json({ error: 'Failed to delete lead' }, 500);
    }

    return c.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('💥 Exception deleting lead:', error);
    return c.json({ error: 'Failed to delete lead' }, 500);
  }
});

app.post('/api/orders', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderData = await c.req.json();

    const orderToInsert = {
      ...orderData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert([orderToInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating order:', error);
      if (error.code === '42P01') {
        return c.json({
          error: 'Database tables not set up. Please run database setup first.',
          tableExists: false
        }, 400);
      }
      return c.json({ error: 'Failed to create order' }, 500);
    }

    return c.json({ order });
  } catch (error) {
    console.error('💥 Exception creating order:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

app.put('/api/orders/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderId = c.req.param('id');
    const orderData = await c.req.json();

    const orderToUpdate = {
      ...orderData,
      updated_at: new Date().toISOString()
    };

    const { data: order, error } = await supabase
      .from('orders')
      .update(orderToUpdate)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error updating order:', error);
      return c.json({ error: 'Failed to update order' }, 500);
    }

    return c.json({ order });
  } catch (error) {
    console.error('💥 Exception updating order:', error);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

app.delete('/api/orders/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderId = c.req.param('id');

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Database error deleting order:', error);
      return c.json({ error: 'Failed to delete order' }, 500);
    }

    return c.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('💥 Exception deleting order:', error);
    return c.json({ error: 'Failed to delete order' }, 500);
  }
});


const MY_token = "verification12898039238";

app.get('/webhook', (c) => {
  const url = new URL(c.req.url);
  const mode = url.searchParams.get('hub.mode');
  const challenge = url.searchParams.get('hub.challenge');
  const token = url.searchParams.get('hub.verify_token');

  console.log('mode:', mode);
  console.log('challenge:', challenge);
  console.log('token:', token);

  if (mode && token === MY_token) {
    return c.text(challenge, 200);
  } else {
    return c.body(null, 403);
  }
});

app.get('/api/whatsapp', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: whatsappmessages, error } = await supabase
      .from('whatsapp')
      .select('*')
      // .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching leads:', error);
      if (error.code === '42P01') {
        return c.json({
          whatsappmessages: [],
          warning: 'Database tables not set up. Please run database setup.',
          tableExists: false
        });
      }
      return c.json({ error: 'Failed to fetch whatsapp messages' }, 500);
    }

    return c.json({ whatsappmessages: whatsappmessages || [] });
  } catch (error) {
    console.error('💥 Exception in leads endpoint:', error);
    return c.json({ error: 'Failed to fetch whatsapp messages' }, 500);
  }
});

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: "danf5ml6w",
  api_key: "159151341741153",
  api_secret: "E27p0Fe8IH96yjkxWz2Ua-DHJVg",
});

app.post('/webhook', async (c) => {
  console.log('Webhook called');
  try {
    const body = await c.req.json();

    if (body.object) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;
      const contact = value?.contacts?.[0];
      const sender_name = contact?.profile?.name;

      console.log('Sender name:', sender_name);

      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from;
        const messageType = message.type;

        const newMessage = {
          type: 'Received',
          message: '',
          images: [],
          time: new Date().toISOString()
        };

        // ✅ Handle text messages
        if (messageType === 'text') {
          newMessage.message = message.text?.body || '';
        }

        // ✅ Handle image messages
        if (messageType === 'image') {
          const mediaId = message.image?.id;
          if (mediaId) {
            try {
              // 1. Get media URL from WhatsApp
              const mediaRes = await axios.get(
                `https://graph.facebook.com/v22.0/${mediaId}`,
                {
                  headers: { Authorization: `Bearer ${process.env.META_TOKEN}` },
                }
              );

              const mediaUrl = mediaRes.data.url;

              // 2. Download image as buffer
              const imageResp = await axios.get(mediaUrl, {
                headers: { Authorization: `Bearer ${process.env.META_TOKEN}` },
                responseType: 'arraybuffer',
              });

              // 3. Upload buffer to Cloudinary
              const uploadRes = await cloudinary.uploader.upload_stream(
                {
                  folder: 'whatsapp_images',
                  resource_type: 'image',
                },
                (error, result) => {
                  if (error) throw error;
                  newMessage.images.push(result.secure_url);
                }
              );

              // Important: end stream
              uploadRes.end(Buffer.from(imageResp.data));
            } catch (imgErr) {
              console.error('❌ Failed to download/upload image:', imgErr);
            }
          }
        }

        // Step 1: Fetch existing record
        const { data: existing, error: fetchError } = await supabase
          .from('whatsapp')
          .select('id, message_history')
          .eq('recipient_number', from)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('❌ Fetch error:', fetchError);
          return c.json({ success: false, error: 'Failed to fetch existing record' }, 500);
        }

        if (existing) {
          // Append to message history
          const updatedMessages = [...existing.message_history, newMessage];
          const { error: updateError } = await supabase
            .from('whatsapp')
            .update({ message_history: updatedMessages })
            .eq('id', existing.id);

          if (updateError) {
            console.error('❌ Update error:', updateError);
            return c.json({ success: false, error: 'Failed to update message history' }, 500);
          }
        } else {
          // Insert new record
          const insertPayload = {
            recipient_name: sender_name,
            recipient_number: from,
            message_history: [newMessage]
          };

          const { error: insertError } = await supabase
            .from('whatsapp')
            .insert([insertPayload]);

          if (insertError) {
            console.error('❌ Insert error:', insertError);
            return c.json({ success: false, error: 'Failed to insert new message record' }, 500);
          }
        }

        // --- Create entry in leads table only if not present ---
        let shouldInsertLead = true;
        try {
          const { data: existingLead, error: leadFetchError } = await supabase
            .from('leads')
            .select('id')
            .eq('phone', from)
            .maybeSingle();
          if (leadFetchError) {
            console.error('❌ Lead fetch error:', leadFetchError);
            // If error is not 'no rows', skip insert for safety
            if (leadFetchError.code !== 'PGRST116') shouldInsertLead = false;
          }
          if (existingLead && existingLead.id) {
            shouldInsertLead = false;
          }
        } catch (e) {
          console.error('❌ Lead fetch exception:', e);
          shouldInsertLead = false;
        }

        // If not present, insert; otherwise, skip
        if (shouldInsertLead) {
          const leadPayload = {
            name: sender_name || `WhatsApp User ${from}`,
            status: 'New',
            source: 'WhatsApp',
            phone: from,
            notes: newMessage.message || null,
          };
          const { error: leadInsertError } = await supabase
            .from('leads')
            .insert([leadPayload]);
          if (leadInsertError) {
            console.error('❌ Lead insert error:', leadInsertError);
            // Do not fail the webhook, just log
          }
        } else {
          // If not inserted, set a flag (could be in-memory or DB, here just log)
          console.log('Lead already exists or will try again on next API call.');
        }

        return c.json({ success: true, savedImages: newMessage.images });
      }
    }

    return c.json({ success: false, error: 'Invalid webhook payload' }, 400);
  } catch (err) {
    console.error('Webhook POST error:', err);
    return c.json({ success: false, error: 'Webhook handler error' }, 500);
  }
});

import fs from "fs";
import path from "path";
import FormData from "form-data";

app.post("/api/sendwhatsappMessage", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();
    const { name, phone_no, message, images = [] } = body;

    console.log("Phone no:", phone_no);
    console.log("Images:", images.length);

    if (message && message.trim() !== "") {
      const textRes = await axios.post(
        "https://graph.facebook.com/v22.0/891880160681645/messages",
        {
          messaging_product: "whatsapp",
          to: phone_no,
          type: "text",
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.META_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const savedPaths = [];
    const uploadedImages = [];
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const base64Data = images[i];
        try {
          const uploadRes = await cloudinary.uploader.upload(base64Data, {
            folder: 'whatsapp_images',
            resource_type: 'image',
          });

          uploadedImages.push(uploadRes.secure_url);

          // Then upload to WhatsApp Media
          const formData = new FormData();
          formData.append('file', uploadRes.secure_url);
          formData.append('type', 'image/png');
          formData.append('messaging_product', 'whatsapp');

          const uploadResFB = await axios.post(
            'https://graph.facebook.com/v22.0/891880160681645/media',
            formData,
            {
              headers: {
                Authorization: `Bearer ${process.env.META_TOKEN}`,
                ...formData.getHeaders(),
              },
            }
          );

          const mediaId = uploadResFB.data.id;

          await axios.post(
            'https://graph.facebook.com/v22.0/891880160681645/messages',
            {
              messaging_product: 'whatsapp',
              to: phone_no,
              type: 'image',
              image: {
                id: mediaId,
                caption: message && message.trim() !== '' ? message : undefined,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.META_TOKEN}`,
                'Content-Type': 'application/json',
              },
            }
          );

          console.log('✅ Sent image:', mediaId);
        } catch (err) {
          console.error('❌ Cloudinary upload/send error:', err);
        }
      }
    }

    // ✅ 3. Save to Supabase
    const newMessage = {
      type: "Sent",
      message,
      time: new Date().toISOString(),
      images: uploadedImages,
    };

    const { data: existing, error: fetchError } = await supabase
      .from("whatsapp")
      .select("id, message_history")
      .eq("recipient_number", phone_no)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("❌ Fetch error:", fetchError);
      return c.json({ error: "Failed to fetch existing record" }, 500);
    }

    if (existing) {
      const updatedMessages = [...existing.message_history, newMessage];
      const { error: updateError } = await supabase
        .from("whatsapp")
        .update({ message_history: updatedMessages })
        .eq("id", existing.id);

      if (updateError) {
        console.error("❌ Update error:", updateError);
        return c.json({ error: "Failed to update message history" }, 500);
      }
    } else {
      const insertPayload = {
        recipient_name: name,
        recipient_number: phone_no,
        message_history: [newMessage],
      };

      const { error: insertError } = await supabase
        .from("whatsapp")
        .insert([insertPayload]);

      if (insertError) {
        console.error("❌ Insert error:", insertError);
        return c.json({ error: "Failed to insert new message record" }, 500);
      }
    }

    return c.json({ success: true, uploadedImages }, 200);
  } catch (err) {
    console.error("❌ Error sending message:", err?.response?.data || err.message);
    return c.json({ success: false, error: "Failed to send message" }, 500);
  }
});

app.get('/api/instagram', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: instagrammessages, error } = await supabase
      .from('instagram')
      .select('*')
      // .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching leads:', error);
      if (error.code === '42P01') {
        return c.json({
          instagrammessages: [],
          warning: 'Database tables not set up. Please run database setup.',
          tableExists: false
        });
      }
      return c.json({ error: 'Failed to fetch instagram messages' }, 500);
    }

    // Deduplicate records by `psid` by merging message_history when duplicates exist
    const merged = {};
    (instagrammessages || []).forEach((rec) => {
      const key = rec.psid != null ? String(rec.psid) : String(rec.id);
      if (!merged[key]) {
        // clone to avoid mutating original
        merged[key] = {
          ...rec,
          message_history: Array.isArray(rec.message_history) ? [...rec.message_history] : []
        };
      } else {
        // merge histories (keep chronological order by created_at later)
        const existing = merged[key];
        existing.message_history = existing.message_history.concat(Array.isArray(rec.message_history) ? rec.message_history : []);
        // keep the most recent created_at and id
        if (new Date(rec.created_at) > new Date(existing.created_at)) {
          existing.created_at = rec.created_at;
          existing.id = rec.id;
        }
      }
    });

    // Convert merged map to array and sort by created_at desc
    const dedupedArray = Object.values(merged).map((r) => {
      // sort each message_history oldest -> newest
      r.message_history = (r.message_history || []).slice().sort((a, b) => new Date(a.time) - new Date(b.time));
      return r;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return c.json({ instagrammessages: dedupedArray });
  } catch (error) {
    console.error('💥 Exception in leads endpoint:', error);
    return c.json({ error: 'Failed to fetch instagram messages' }, 500);
  }
});

// ✅ Webhook verification endpoint (GET)
app.get('/instawebhook', (c) => {
  console.log('insta webhook called');

  const url = new URL(c.req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode && token === MY_token) {
    console.log("insta Webhook verified!");
    return c.text(challenge, 200);
  } else {
    return c.body(null, 403);
  }
});

app.post("/instawebhook", async (c) => {
  console.log("Incoming Instagram Webhook");

  const body = await c.req.json();
  console.log("Webhook Body:", JSON.stringify(body, null, 2));

  // Challenge (optional)
  const url = new URL(c.req.url);
  const challenge = url.searchParams.get("hub.challenge");
  if (challenge) return c.text(challenge);

  try {
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];

    if (!messaging) {
      console.log("No messaging event found");
      return c.json({ status: "no-event" });
    }

    const timestamp = messaging?.timestamp;
    const TWO_MINUTES = 1 * 60 * 1000;

    if (timestamp) {
      const now = Date.now();
      const diff = now - timestamp;
      if (diff > TWO_MINUTES) {
        const istTime = timestamp + (5.5 * 60 * 60 * 1000);
        return c.json({ status: "invalid-event", time: istTime });
      }
    }

    const senderId = messaging.sender?.id;

    let text =
      messaging.message?.text ??
      messaging.message?.message ??
      null;

    const newMessage = {
      type: "Received",
      message: text,
      images: [],
      time: new Date().toISOString(),
    };

    if (messaging.message?.attachments?.length) {
      for (const att of messaging.message.attachments) {
        if (att.type === "image" && att.payload?.url) {
          try {
            console.log("Image recieved");

            const imgBuffer = await axios.get(att.payload.url, {
              responseType: "arraybuffer",
              headers: {
                Authorization: `Bearer ${process.env.META_TOKEN}`,
              }
            });

            const uploadPromise = new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                {
                  folder: "instagram_images",
                  resource_type: "image",
                },
                (err, result) => {
                  if (err) return reject(err);
                  resolve(result.secure_url);
                }
              );

              stream.end(Buffer.from(imgBuffer.data));
            });

            const imageUrl = await uploadPromise;
            newMessage.images.push(imageUrl);
            console.log("Uploaded to Cloudinary:", imageUrl);

          } catch (imgErr) {
            console.error("Image Upload Failed:", imgErr);
          }
        }
      }
    }

    console.log("Sender:", senderId);
    console.log("Text:", text);
    console.log("Images:", newMessage.images);

    const { data: existingRows, error: fetchError } = await supabase
      .from("instagram")
      .select("id, psid, message_history, created_at")
      .eq("psid", senderId)
      .order("created_at", { ascending: false });

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("❌ Fetch error:", fetchError);
      return c.json({ success: false, error: "Failed to fetch" }, 500);
    }

    const existing =
      Array.isArray(existingRows) && existingRows.length > 0
        ? existingRows[0]
        : null;

    if (existing) {
      const mergedHistory = [];

      const rowsAsc = existingRows
        ?.slice()
        ?.sort(
          (a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

      for (const r of rowsAsc) {
        if (Array.isArray(r.message_history))
          mergedHistory.push(...r.message_history);
      }

      mergedHistory.push(newMessage);

      const { error: updateError } = await supabase
        .from("instagram")
        .update({ message_history: mergedHistory })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Update error:", updateError);
        return c.json(
          { success: false, error: "Failed to update" },
          500
        );
      }

      if (existingRows.length > 1) {
        const idsToDelete = existingRows
          .slice(1)
          .map((r) => r.id)
          .filter(Boolean);

        if (idsToDelete.length > 0) {
          await supabase
            .from("instagram")
            .delete()
            .in("id", idsToDelete);
        }
      }
    } else {
      await supabase.from("instagram").insert([
        {
          psid: senderId,
          message_history: [newMessage],
        },
      ]);
    }

    // --- Create entry in leads table only if not present ---
    let shouldInsertLead = true;
    try {
      const { data: existingLead, error: leadFetchError } = await supabase
        .from('leads')
        .select('id')
        .eq('instagram_username', senderId)
        .maybeSingle();
      if (leadFetchError) {
        console.error('❌ Lead fetch error:', leadFetchError);
        // If error is not 'no rows', skip insert for safety
        if (leadFetchError.code !== 'PGRST116') shouldInsertLead = false;
      }
      if (existingLead && existingLead.id) {
        shouldInsertLead = false;
      }
    } catch (e) {
      console.error('❌ Lead fetch exception:', e);
      shouldInsertLead = false;
    }

    // If not present, insert; otherwise, skip
    if (shouldInsertLead) {
      const leadPayload = {
        name: senderId ? `Instagram User ${senderId}` : 'Instagram User',
        status: 'New',
        source: 'Instagram',
        instagram_username: senderId,
        notes: text || null,
      };
      const { error: leadInsertError } = await supabase
        .from('leads')
        .insert([leadPayload]);
      if (leadInsertError) {
        console.error('❌ Lead insert error:', leadInsertError);
        // Do not fail the webhook, just log
      }
    } else {
      // If not inserted, set a flag (could be in-memory or DB, here just log)
      console.log('Lead already exists or will try again on next API call.');
    }

    // Save senderId + message to DB if needed
    // await saveIncomingMessage(senderId, text);

    return c.json({ status: "received", senderId, text });
  } catch (err) {
    console.error("Webhook Error:", err);
    return c.json({ error: "webhook error" }, 500);
  }
});

app.post("/api/sendinstagramMessage", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();
    const { psid, message, images = [] } = body;

    console.log("Psid :", psid);
    console.log("Images:", images.length);

    const textRes = await axios.post(
      "https://graph.instagram.com/v21.0/17841418132574829/messages",
      {
        message: JSON.stringify({
          text: message,
        }),
        recipient: JSON.stringify({
          id: psid
        }),
      },
      {
        headers: {
          Authorization: `Bearer IGAAUCHwkjhZChBZAGJ0TWhwNzNlMDFLU1BObC03YTN3NjFwNy16clpvSk1ZAanF0QjB1SGlVdnpoR1drOS15RGVNNjlQQzZArMHdfRlRoLUYtRUwtQTNudXMyOW44ZAVp3Q1lMNVB4M1VKR2tMQVJDMHRlaGN6NlVHRnhvNDZADcGVPWQZDZD`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Text message sent:", textRes.data);

    const uploadDir = path.join(process.cwd(), "..", "public", "instagram_images");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const savedPaths = [];
    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i].split(",")[1];
      const fileName = `img_${Date.now()}_${i}.png`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      savedPaths.push(`/instagram_images/${fileName}`);
    }

    for (const imgPath of savedPaths) {
      const filePath = path.join(process.cwd(), "..", "public", imgPath);
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));
      formData.append("type", "image/png");
      formData.append("messaging_product", "instagran");

      const uploadRes = await axios.post(
        "https://graph.facebook.com/v22.0/891880160681645/media",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.META_TOKEN}`,
            ...formData.getHeaders(),
          },
        }
      );

      const mediaId = uploadRes.data.id;

      // Send image message using the uploaded media ID
      await axios.post(
        "https://graph.facebook.com/v22.0/891880160681645/messages",
        {
          messaging_product: "whatsapp",
          to: phone_no,
          type: "image",
          image: { id: mediaId },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.META_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Image message sent:", mediaId);
    }

    const newMessage = {
      type: "Sent",
      message,
      time: new Date().toISOString(),
      images: savedPaths,
    };

    const { data: existing, error: fetchError } = await supabase
      .from("instagram")
      .select("psid, message_history")
      .eq("psid", psid)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("❌ Fetch error:", fetchError);
      return c.json({ error: "Failed to fetch existing record" }, 500);
    }

    if (existing) {
      const updatedMessages = [...existing.message_history, newMessage];
      const { error: updateError } = await supabase
        .from("instagram")
        .update({ message_history: updatedMessages })
        .eq("psid", existing.psid);

      if (updateError) {
        console.error("❌ Update error:", updateError);
        return c.json({ error: "Failed to update message history" }, 500);
      }
    } else {
      const insertPayload = {
        psid: psid,
        message_history: [newMessage],
      };

      const { error: insertError } = await supabase
        .from("instagram")
        .insert([insertPayload]);

      if (insertError) {
        console.error("❌ Insert error:", insertError);
        return c.json({ error: "Failed to insert new message record" }, 500);
      }
    }

    return c.json({ success: true, savedPaths }, 200);
  } catch (err) {
    console.error("❌ Error sending message:", err?.response?.data || err.message);
    return c.json({ success: false, error: err?.response?.data || err.message }, 500);
  }
});

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default app;