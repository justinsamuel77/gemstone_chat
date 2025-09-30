// Node.js server runner for the converted Supabase Edge Function
import { serve } from '@hono/node-server';
import app from './supabase/functions/server/index.tsx';

const port = process.env.PORT || 3001;

console.log(`🚀 Starting GEMSTONE CRM Server on port ${port}`);
console.log(`📍 Server URL: http://localhost:${port}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

// Start the server
serve({
  fetch: app.fetch,
  port: port,
});

console.log(`✅ Server running successfully on port ${port}`);