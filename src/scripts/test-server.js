#!/usr/bin/env node

// Simple server connectivity test using native fetch (Node.js 18+)
const TEST_URL = 'http://localhost:3001/api/health';

console.log('🏥 Testing server connectivity...');
console.log(`📡 Checking: ${TEST_URL}`);

try {
  // Use AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  const response = await fetch(TEST_URL, {
    method: 'GET',
    signal: controller.signal,
  });
  
  clearTimeout(timeoutId);

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Server is running and responding correctly!');
    console.log('📊 Response:', JSON.stringify(data, null, 2));
    console.log('🎉 Your server is working properly!');
  } else {
    console.log(`❌ Server responded with status: ${response.status}`);
    console.log('💡 The server is running but returning an error.');
  }
} catch (error) {
  console.log('❌ Server connectivity test failed!');
  
  if (error.code === 'ECONNREFUSED') {
    console.log('');
    console.log('🚨 CONNECTION REFUSED - Server is not running!');
    console.log('');
    console.log('📋 To fix this:');
    console.log('1. Open a new terminal');
    console.log('2. Run: npm run server:dev');
    console.log('3. Wait for: "✅ Server running successfully on port 3001"');
    console.log('4. Then test again: npm run test-server');
    console.log('');
    console.log('💡 Or start both servers at once: npm run start:all');
  } else if (error.code === 'FETCH_ERROR') {
    console.log('');
    console.log('🌐 Network error - check if port 3001 is accessible');
    console.log('💡 Try: lsof -i :3001');
  } else {
    console.log('');
    console.log('🔍 Error details:', error.message);
  }
  
  process.exit(1);
}