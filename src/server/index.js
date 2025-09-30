import { serve } from '@hono/node-server';
import app from './api/index.js';
import { createServer } from 'http';

const port = process.env.PORT || 3001;

console.log(`🚀 Starting GEMSTONE CRM Server on port ${port}`);
console.log(`📍 Server URL: http://localhost:${port}`);

// Check if port is available
const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const server = createServer();
    
    server.listen(port, (err) => {
      if (err) {
        reject(err);
      } else {
        server.close(() => {
          resolve(true);
        });
      }
    });
    
    server.on('error', (err) => {
      reject(err);
    });
  });
};

try {
  await checkPort(port);
  console.log(`✅ Port ${port} is available`);
  
  serve({
    fetch: app.fetch,
    port: port,
  });

  console.log(`✅ Server running successfully!`);
  console.log(`🌐 Health check: http://localhost:${port}/api/health`);
  console.log(`📱 Frontend should connect to: http://localhost:${port}`);
  console.log(`🛑 Press Ctrl+C to stop the server`);
  
} catch (error) {
  console.error(`❌ Failed to start server on port ${port}:`);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`   Port ${port} is already in use`);
    console.error(`   Try one of these solutions:`);
    console.error(`   1. Kill the process using port ${port}:`);
    console.error(`      lsof -ti:${port} | xargs kill -9`);
    console.error(`   2. Use a different port:`);
    console.error(`      PORT=3002 npm run server:dev`);
    console.error(`   3. Check what's using the port:`);
    console.error(`      lsof -i :${port}`);
  } else {
    console.error(`   ${error.message}`);
  }
  
  process.exit(1);
}