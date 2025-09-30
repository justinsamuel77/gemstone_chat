import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to verify authorization
const verifyAuth = async (request: Request) => {
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
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (accessToken === anonKey) {
    console.log('⚠️ Using anon key - no user authentication');
    return null;
  }

  try {
    // Use the client with service role key for user verification
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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

// Check database setup
app.get('/make-server-2ed58025/setup-database', async (c) => {
  try {
    console.log('🔄 Checking database table status...');

    // Test if tables already exist by trying to query them
    const tableChecks = await Promise.allSettled([
      supabase.from('leads').select('id').limit(1),
      supabase.from('orders').select('id').limit(1),
      supabase.from('dealers').select('id').limit(1),
      supabase.from('employees').select('id').limit(1),
      supabase.from('inventory').select('id').limit(1),
      supabase.from('inventory_transactions').select('id').limit(1)
    ]);

    const tableStatus = {
      leads: tableChecks[0].status === 'fulfilled' ? 'exists' : 'needs_creation',
      orders: tableChecks[1].status === 'fulfilled' ? 'exists' : 'needs_creation',
      dealers: tableChecks[2].status === 'fulfilled' ? 'exists' : 'needs_creation',
      employees: tableChecks[3].status === 'fulfilled' ? 'exists' : 'needs_creation',
      inventory: tableChecks[4].status === 'fulfilled' ? 'exists' : 'needs_creation',
      inventory_transactions: tableChecks[5].status === 'fulfilled' ? 'exists' : 'needs_creation'
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

// Create database tables
app.post('/make-server-2ed58025/setup-database', async (c) => {
  try {
    console.log('🛠️ Creating database tables...');

    // Create leads table
    const createLeadsTable = `
      CREATE TABLE IF NOT EXISTS public.leads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        status TEXT DEFAULT 'New',
        source TEXT,
        assigned_to TEXT,
        assigned_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
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
    `;

    // Create orders table
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
        assigned_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
        priority TEXT DEFAULT 'Medium',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create dealers table
    const createDealersTable = `
      CREATE TABLE IF NOT EXISTS public.dealers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    `;

    // Create employees table
    const createEmployeesTable = `
      CREATE TABLE IF NOT EXISTS public.employees (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    `;

    // Create inventory table
    const createInventoryTable = `
      CREATE TABLE IF NOT EXISTS public.inventory (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        item_type TEXT NOT NULL DEFAULT 'gold',
        quantity NUMERIC NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'grams',
        description TEXT,
        location TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create inventory transactions table for tracking gold movements
    const createInventoryTransactionsTable = `
      CREATE TABLE IF NOT EXISTS public.inventory_transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
        transaction_type TEXT NOT NULL, -- 'deposit', 'withdraw', 'transfer'
        quantity NUMERIC NOT NULL,
        dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
        employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
        description TEXT,
        notes TEXT,
        transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Enable RLS and create policies
    const setupRLS = `
      ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

      CREATE POLICY IF NOT EXISTS "Users can view their own leads" ON public.leads
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own leads" ON public.leads
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own leads" ON public.leads
        FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete their own leads" ON public.leads
        FOR DELETE USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can view their own orders" ON public.orders
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own orders" ON public.orders
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own orders" ON public.orders
        FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete their own orders" ON public.orders
        FOR DELETE USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can view their own dealers" ON public.dealers
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own dealers" ON public.dealers
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own dealers" ON public.dealers
        FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete their own dealers" ON public.dealers
        FOR DELETE USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can view their own employees" ON public.employees
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own employees" ON public.employees
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own employees" ON public.employees
        FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete their own employees" ON public.employees
        FOR DELETE USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can view their own inventory" ON public.inventory
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own inventory" ON public.inventory
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own inventory" ON public.inventory
        FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete their own inventory" ON public.inventory
        FOR DELETE USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can view their own inventory transactions" ON public.inventory_transactions
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own inventory transactions" ON public.inventory_transactions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own inventory transactions" ON public.inventory_transactions
        FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete their own inventory transactions" ON public.inventory_transactions
        FOR DELETE USING (auth.uid() = user_id);
    `;

    // Execute table creation queries
    const results = await Promise.allSettled([
      supabase.rpc('exec', { sql: createLeadsTable }),
      supabase.rpc('exec', { sql: createOrdersTable }),
      supabase.rpc('exec', { sql: createDealersTable }),
      supabase.rpc('exec', { sql: createEmployeesTable }),
      supabase.rpc('exec', { sql: createInventoryTable }),
      supabase.rpc('exec', { sql: createInventoryTransactionsTable }),
      supabase.rpc('exec', { sql: setupRLS })
    ]);

    console.log('📝 Table creation results:', results);

    // Verify tables were created
    const verification = await Promise.allSettled([
      supabase.from('leads').select('id').limit(1),
      supabase.from('orders').select('id').limit(1),
      supabase.from('dealers').select('id').limit(1),
      supabase.from('employees').select('id').limit(1),
      supabase.from('inventory').select('id').limit(1)
    ]);

    const finalStatus = {
      leads: verification[0].status === 'fulfilled' ? 'created' : 'failed',
      orders: verification[1].status === 'fulfilled' ? 'created' : 'failed',
      dealers: verification[2].status === 'fulfilled' ? 'created' : 'failed',
      employees: verification[3].status === 'fulfilled' ? 'created' : 'failed',
      inventory: verification[4].status === 'fulfilled' ? 'created' : 'failed'
    };

    return c.json({
      message: 'Database tables setup completed',
      tables: finalStatus,
      success: true
    });

  } catch (error) {
    console.error('💥 Database creation error:', error);
    return c.json({
      error: 'Failed to create database tables',
      details: error,
      success: false
    }, 500);
  }
});

// Authentication endpoints
app.post('/make-server-2ed58025/signup', async (c) => {
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
      // Automatically confirm the user's email since an email server hasn't been configured.
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
        email: data.user.email!,
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

app.post('/make-server-2ed58025/signin', async (c) => {
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
      email: data.user.email!,
      name: data.user.user_metadata?.name || data.user.email!,
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

app.post('/make-server-2ed58025/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error('Password reset error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Forgot password endpoint error:', error);
    return c.json({ error: 'Internal server error during password reset' }, 500);
  }
});

app.get('/make-server-2ed58025/profile', async (c) => {
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
app.get('/make-server-2ed58025/leads', async (c) => {
  try {
    console.log('📥 Leads endpoint hit');
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      console.log('❌ User not authenticated for leads endpoint');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`🔍 Fetching leads for user: ${user.id}`);

    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching leads:', error);

      // Check if table doesn't exist
      if (error.code === '42P01') {
        console.log('🏗️ Leads table does not exist - returning empty array');
        return c.json({
          leads: [],
          warning: 'Database tables not set up. Please run database setup.',
          tableExists: false
        });
      }

      return c.json({ error: 'Failed to fetch leads' }, 500);
    }

    console.log(`✅ Successfully fetched ${leads?.length || 0} leads`);
    return c.json({ leads: leads || [] });
  } catch (error) {
    console.error('💥 Exception in leads endpoint:', error);
    return c.json({ error: 'Failed to fetch leads' }, 500);
  }
});

app.post('/make-server-2ed58025/leads', async (c) => {
  try {
    console.log('📝 Creating new lead');
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      console.log('❌ Unauthorized - no valid user token');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const leadData = await c.req.json();
    console.log('📋 Lead data received:', leadData);

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

      // Check if table doesn't exist
      if (error.code === '42P01') {
        return c.json({
          error: 'Database tables not set up. Please run database setup first.',
          tableExists: false
        }, 400);
      }

      return c.json({ error: 'Failed to create lead' }, 500);
    }

    console.log('✅ Lead created successfully:', lead.id);
    return c.json({ lead });
  } catch (error) {
    console.error('💥 Exception creating lead:', error);
    return c.json({ error: 'Failed to create lead' }, 500);
  }
});

app.put('/make-server-2ed58025/leads/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const leadId = c.req.param('id');
    const leadData = await c.req.json();

    const { data: lead, error } = await supabase
      .from('leads')
      .update({
        ...leadData,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating lead:', error);
      return c.json({ error: 'Failed to update lead' }, 500);
    }

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404);
    }

    return c.json({ lead });
  } catch (error) {
    console.error('Exception updating lead:', error);
    return c.json({ error: 'Failed to update lead' }, 500);
  }
});

app.delete('/make-server-2ed58025/leads/:id', async (c) => {
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
      console.error('Database error deleting lead:', error);
      return c.json({ error: 'Failed to delete lead' }, 500);
    }

    return c.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Exception deleting lead:', error);
    return c.json({ error: 'Failed to delete lead' }, 500);
  }
});

// Orders endpoints
app.get('/make-server-2ed58025/orders', async (c) => {
  try {
    console.log('📥 Orders endpoint hit');
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      console.log('❌ User not authenticated for orders endpoint');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`🔍 Fetching orders for user: ${user.id}`);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching orders:', error);

      // Check if table doesn't exist
      if (error.code === '42P01') {
        console.log('🏗️ Orders table does not exist - returning empty array');
        return c.json({
          orders: [],
          warning: 'Database tables not set up. Please run database setup.',
          tableExists: false
        });
      }

      return c.json({ error: 'Failed to fetch orders' }, 500);
    }

    console.log(`✅ Successfully fetched ${orders?.length || 0} orders`);
    return c.json({ orders: orders || [] });
  } catch (error) {
    console.error('💥 Exception in orders endpoint:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

app.post('/make-server-2ed58025/orders', async (c) => {
  try {
    console.log('📝 Creating new order');
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      console.log('❌ Unauthorized - no valid user token');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderData = await c.req.json();
    console.log('📋 Order data received:', orderData);

    // Generate order number if not provided
    const orderNumber = orderData.orderNumber || `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const orderToInsert = {
      ...orderData,
      order_number: orderNumber,
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

      // Check if table doesn't exist
      if (error.code === '42P01') {
        return c.json({
          error: 'Database tables not set up. Please run database setup first.',
          tableExists: false
        }, 400);
      }

      return c.json({ error: 'Failed to create order' }, 500);
    }

    console.log('✅ Order created successfully:', order.id);

    // Convert snake_case to camelCase for compatibility with frontend
    const formattedOrder = {
      ...order,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      totalAmount: order.total_amount,
      paidAmount: order.paid_amount,
      paymentStatus: order.payment_status,
      orderDate: order.order_date,
      expectedDelivery: order.expected_delivery,
      assignedTo: order.assigned_to,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };

    return c.json({ order: formattedOrder });
  } catch (error) {
    console.error('💥 Exception creating order:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

app.put('/make-server-2ed58025/orders/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderId = c.req.param('id');
    const orderData = await c.req.json();

    // Convert camelCase to snake_case for database
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
      notes: orderData.notes,
      updated_at: new Date().toISOString()
    };

    const { data: order, error } = await supabase
      .from('orders')
      .update(dbOrderData)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating order:', error);
      return c.json({ error: 'Failed to update order' }, 500);
    }

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Convert back to camelCase
    const formattedOrder = {
      ...order,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      totalAmount: order.total_amount,
      paidAmount: order.paid_amount,
      paymentStatus: order.payment_status,
      orderDate: order.order_date,
      expectedDelivery: order.expected_delivery,
      assignedTo: order.assigned_to,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };

    return c.json({ order: formattedOrder });
  } catch (error) {
    console.error('Exception updating order:', error);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

app.delete('/make-server-2ed58025/orders/:id', async (c) => {
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
      console.error('Database error deleting order:', error);
      return c.json({ error: 'Failed to delete order' }, 500);
    }

    return c.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Exception deleting order:', error);
    return c.json({ error: 'Failed to delete order' }, 500);
  }
});

// Dealers endpoints (keeping with database pattern)
app.get('/make-server-2ed58025/dealers', async (c) => {
  try {
    console.log('📥 Dealers endpoint hit');
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      console.log('❌ User not authenticated for dealers endpoint');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`🔍 Fetching dealers for user: ${user.id}`);

    const { data: dealers, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching dealers:', error);
      return c.json({ error: 'Failed to fetch dealers' }, 500);
    }

    console.log(`✅ Successfully fetched ${dealers?.length || 0} dealers`);
    return c.json({ dealers: dealers || [] });
  } catch (error) {
    console.error('💥 Exception in dealers endpoint:', error);
    return c.json({ error: 'Failed to fetch dealers' }, 500);
  }
});

app.post('/make-server-2ed58025/dealers', async (c) => {
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
      console.error('Database error creating dealer:', error);
      return c.json({ error: 'Failed to create dealer' }, 500);
    }

    return c.json({ dealer });
  } catch (error) {
    console.error('Exception creating dealer:', error);
    return c.json({ error: 'Failed to create dealer' }, 500);
  }
});

app.put('/make-server-2ed58025/dealers/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dealerId = c.req.param('id');
    const dealerData = await c.req.json();

    const { data: dealer, error } = await supabase
      .from('dealers')
      .update({
        ...dealerData,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealerId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating dealer:', error);
      return c.json({ error: 'Failed to update dealer' }, 500);
    }

    if (!dealer) {
      return c.json({ error: 'Dealer not found' }, 404);
    }

    return c.json({ dealer });
  } catch (error) {
    console.error('Exception updating dealer:', error);
    return c.json({ error: 'Failed to update dealer' }, 500);
  }
});

app.delete('/make-server-2ed58025/dealers/:id', async (c) => {
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
      console.error('Database error deleting dealer:', error);
      return c.json({ error: 'Failed to delete dealer' }, 500);
    }

    return c.json({ message: 'Dealer deleted successfully' });
  } catch (error) {
    console.error('Exception deleting dealer:', error);
    return c.json({ error: 'Failed to delete dealer' }, 500);
  }
});

// Employees endpoints
app.get('/make-server-2ed58025/employees', async (c) => {
  try {
    console.log('📥 Employees endpoint hit');
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      console.log('❌ User not authenticated for employees endpoint');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`🔍 Fetching employees for user: ${user.id}`);

    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching employees:', error);
      return c.json({ error: 'Failed to fetch employeessssss' }, 500);
    }

    console.log(`✅ Successfully fetched ${employees?.length || 0} employees`);
    return c.json({ employees: employees || [] });
  } catch (error) {
    console.error('💥 Exception in employees endpoint:', error);
    return c.json({ error: 'Failed to fetch employees' }, 500);
  }
});

app.post('/make-server-2ed58025/employees', async (c) => {
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
      console.error('Database error creating employee:', error);
      return c.json({ error: 'Failed to create employee' }, 500);
    }

    return c.json({ employee });
  } catch (error) {
    console.error('Exception creating employee:', error);
    return c.json({ error: 'Failed to create employee' }, 500);
  }
});

app.put('/make-server-2ed58025/employees/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employeeId = c.req.param('id');
    const employeeData = await c.req.json();

    const { data: employee, error } = await supabase
      .from('employees')
      .update({
        ...employeeData,
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating employee:', error);
      return c.json({ error: 'Failed to update employee' }, 500);
    }

    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    return c.json({ employee });
  } catch (error) {
    console.error('Exception updating employee:', error);
    return c.json({ error: 'Failed to update employee' }, 500);
  }
});

app.delete('/make-server-2ed58025/employees/:id', async (c) => {
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
      console.error('Database error deleting employee:', error);
      return c.json({ error: 'Failed to delete employee' }, 500);
    }

    return c.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Exception deleting employee:', error);
    return c.json({ error: 'Failed to delete employee' }, 500);
  }
});

// Inventory endpoints
app.get('/make-server-2ed58025/inventory', async (c) => {
  try {
    console.log('📥 Inventory endpoint hit');
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      console.log('❌ User not authenticated for inventory endpoint');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`🔍 Fetching inventory for user: ${user.id}`);

    const { data: inventory, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching inventory:', error);
      return c.json({ error: 'Failed to fetch inventory' }, 500);
    }

    console.log(`✅ Successfully fetched ${inventory?.length || 0} inventory items`);
    return c.json({ inventory: inventory || [] });
  } catch (error) {
    console.error('💥 Exception in inventory endpoint:', error);
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

app.post('/make-server-2ed58025/inventory', async (c) => {
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
      console.error('Database error creating inventory:', error);
      return c.json({ error: 'Failed to create inventory' }, 500);
    }

    return c.json({ inventory });
  } catch (error) {
    console.error('Exception creating inventory:', error);
    return c.json({ error: 'Failed to create inventory' }, 500);
  }
});

app.put('/make-server-2ed58025/inventory/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const inventoryId = c.req.param('id');
    const inventoryData = await c.req.json();

    const { data: inventory, error } = await supabase
      .from('inventory')
      .update({
        ...inventoryData,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventoryId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating inventory:', error);
      return c.json({ error: 'Failed to update inventory' }, 500);
    }

    if (!inventory) {
      return c.json({ error: 'Inventory not found' }, 404);
    }

    return c.json({ inventory });
  } catch (error) {
    console.error('Exception updating inventory:', error);
    return c.json({ error: 'Failed to update inventory' }, 500);
  }
});

// Inventory transactions endpoint
app.post('/make-server-2ed58025/inventory/transactions', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const transactionData = await c.req.json();
    const { inventory_id, transaction_type, quantity, dealer_id, employee_id, description, notes } = transactionData;

    // Start a transaction
    const { data: currentInventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', inventory_id)
      .eq('user_id', user.id)
      .single();

    if (inventoryError || !currentInventory) {
      return c.json({ error: 'Inventory item not found' }, 404);
    }

    // Calculate new quantity based on transaction type
    let newQuantity = currentInventory.quantity;
    if (transaction_type === 'deposit') {
      newQuantity = parseFloat(currentInventory.quantity) + parseFloat(quantity);
    } else if (transaction_type === 'withdraw' || transaction_type === 'transfer') {
      newQuantity = parseFloat(currentInventory.quantity) - parseFloat(quantity);
      if (newQuantity < 0) {
        return c.json({ error: 'Insufficient inventory quantity' }, 400);
      }
    }

    // Update inventory quantity
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventory_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database error updating inventory quantity:', updateError);
      return c.json({ error: 'Failed to update inventory quantity' }, 500);
    }

    // Create transaction record
    const transactionToInsert = {
      user_id: user.id,
      inventory_id,
      transaction_type,
      quantity: parseFloat(quantity),
      dealer_id: dealer_id || null,
      employee_id: employee_id || null,
      description,
      notes,
      transaction_date: new Date().toISOString().split('T')[0], // Set current date
      created_at: new Date().toISOString()
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert([transactionToInsert])
      .select()
      .single();

    if (transactionError) {
      console.error('Database error creating transaction:', transactionError);
      return c.json({ error: 'Failed to create transaction' }, 500);
    }

    return c.json({
      transaction,
      updatedInventory: { ...currentInventory, quantity: newQuantity }
    });
  } catch (error) {
    console.error('Exception creating inventory transaction:', error);
    return c.json({ error: 'Failed to create inventory transaction' }, 500);
  }
});

app.get('/make-server-2ed58025/inventory/transactions', async (c) => {
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
        inventory:inventory_id (
          id,
          item_type,
          quantity,
          unit,
          description,
          location
        ),
        dealer:dealer_id (
          id,
          name,
          company,
          phone
        ),
        employee:employee_id (
          id,
          name,
          position,
          department
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching transactions:', error);
      return c.json({ error: 'Failed to fetch transactions' }, 500);
    }

    // Format the transactions to match expected frontend format
    const formattedTransactions = (transactions || []).map((transaction: any) => ({
      ...transaction,
      // Ensure proper date format for frontend
      transaction_date: transaction.transaction_date || transaction.created_at?.split('T')[0]
    }));

    return c.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Exception fetching inventory transactions:', error);
    return c.json({ error: 'Failed to fetch inventory transactions' }, 500);
  }
});

// Health check endpoint
app.get('/make-server-2ed58025/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the Deno server
Deno.serve(app.fetch);