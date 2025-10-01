#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 GEMSTONE CRM Setup Verification\n');

// Check if .env file exists
const envPath = join(projectRoot, '.env');
const envExamplePath = join(projectRoot, '.env.example');

console.log('1. Environment Configuration:');
if (existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
    
    for (const variable of requiredVars) {
      if (envContent.includes(`${variable}=`) && !envContent.includes(`${variable}=your_`)) {
        console.log(`   ✅ ${variable} is configured`);
      } else {
        console.log(`   ⚠️  ${variable} needs to be set`);
      }
    }
  } catch (error) {
    console.log('   ❌ Could not read .env file');
  }
} else {
  console.log('   ❌ .env file missing');
  if (existsSync(envExamplePath)) {
    console.log('   📝 Copy .env.example to .env and configure your Supabase credentials');
  }
}

// Check if node_modules exists
console.log('\n2. Dependencies:');
if (existsSync(join(projectRoot, 'node_modules'))) {
  console.log('   ✅ node_modules exists');
} else {
  console.log('   ❌ node_modules missing - run: npm install');
}

// Check package.json scripts
console.log('\n3. Available Scripts:');
try {
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  const scripts = packageJson.scripts;
  
  if (scripts['start:all']) {
    console.log('   ✅ start:all script available');
  }
  if (scripts['server:dev']) {
    console.log('   ✅ server:dev script available');
  }
  if (scripts['dev']) {
    console.log('   ✅ dev script available');
  }
} catch (error) {
  console.log('   ❌ Could not read package.json');
}

// Check server files
console.log('\n4. Server Files:');
if (existsSync(join(projectRoot, 'server', 'index.js'))) {
  console.log('   ✅ server/index.js exists');
} else {
  console.log('   ❌ server/index.js missing');
}

if (existsSync(join(projectRoot, 'server', 'api', 'index.js'))) {
  console.log('   ✅ server/api/index.js exists');
} else {
  console.log('   ❌ server/api/index.js missing');
}

console.log('\n📋 Next Steps:');
console.log('1. Make sure .env is configured with your Supabase credentials');
console.log('2. Run: npm install (if dependencies are missing)');
console.log('3. Start the application: npm run start:all');
console.log('4. Or start servers separately:');
console.log('   - Terminal 1: npm run server:dev');
console.log('   - Terminal 2: npm run dev');
console.log('\n🌐 Expected URLs:');
console.log('   - Frontend: http://localhost:5173');
console.log('   - Backend:  http://localhost:3001');
console.log('   - Health:   http://localhost:3001/api/health');