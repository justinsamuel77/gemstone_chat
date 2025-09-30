# 🛠️ Development Guide

This guide will help you set up and run the GEMSTONE Fine Jewelry CRM system on your local machine.

## 🚀 Quick Setup

### For All Operating Systems

1. **Prerequisites Check**
   ```bash
   node --version    # Should be 18+
   npm --version     # Should be 9+
   ```

2. **Quick Start (Recommended)**
   
   **On Windows:**
   ```cmd
   .\start.bat
   ```
   
   **On macOS/Linux:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   
   **Or use npm directly:**
   ```bash
   npm run start:all
   ```

### Manual Setup

If you prefer to set up manually:

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd gemstone-crm
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start Development**
   ```bash
   # Start both frontend and backend
   npm run start:all
   
   # OR start them separately:
   # Terminal 1: npm run dev
   # Terminal 2: npm run server:dev
   ```

## 🔧 Development Workflow

### Project Structure Overview

```
gemstone-crm/
├── 📱 Frontend (React + TypeScript + Vite)
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # React entry point
│   ├── components/                 # All React components
│   │   ├── ui/                    # Base UI components (buttons, inputs, etc.)
│   │   ├── auth/                  # Authentication components
│   │   ├── leads/                 # Lead management components
│   │   ├── orders/                # Order management components
│   │   └── ...                    # Other feature components
│   ├── utils/                     # Utilities and API clients
│   │   └── supabase/             # Supabase client and API functions
│   └── styles/                    # Global styles and Tailwind config
│
├── 🖥️ Backend (Node.js + Hono)
│   └── server/
│       ├── index.js              # Server entry point
│       └── api/
│           └── index.js          # All API routes and business logic
│
└── 📋 Configuration Files
    ├── package.json              # Dependencies and npm scripts
    ├── vite.config.ts           # Vite bundler configuration
    ├── tailwind.config.ts       # Tailwind CSS configuration
    └── tsconfig.json            # TypeScript configuration
```

### Key Development Files

#### Frontend Entry Points
- **`App.tsx`** - Main React application with routing and auth logic
- **`main.tsx`** - React DOM rendering and global providers
- **`components/`** - All React components, organized by feature

#### Backend Entry Points  
- **`server/index.js`** - Node.js server startup
- **`server/api/index.js`** - All API endpoints and business logic

#### Configuration
- **`package.json`** - All dependencies and npm scripts
- **`vite.config.ts`** - Frontend build configuration
- **`.env`** - Environment variables (create from `.env.example`)

## 🎯 Understanding the Architecture

### Frontend (React SPA)
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling with custom design system
- **Custom hooks** for state management and API calls

### Backend (Node.js API)
- **Hono** web framework for fast, lightweight API
- **Supabase** for authentication and database
- **RESTful API** design with proper error handling
- **CORS enabled** for development

### Database (Supabase PostgreSQL)
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** capability
- **Automatic table creation** via API endpoints

## 📝 Common Development Tasks

### Adding a New Component

1. **Create the component file:**
   ```typescript
   // components/MyNewComponent.tsx
   import React from 'react';

   interface MyNewComponentProps {
     title: string;
   }

   export function MyNewComponent({ title }: MyNewComponentProps) {
     return (
       <div className="p-4 bg-card rounded-lg border">
         <h2>{title}</h2>
       </div>
     );
   }
   ```

2. **Use the component:**
   ```typescript
   import { MyNewComponent } from './components/MyNewComponent';
   
   function App() {
     return <MyNewComponent title="Hello World" />;
   }
   ```

### Adding a New API Endpoint

1. **Add to backend API:**
   ```javascript
   // server/api/index.js
   app.get('/api/my-endpoint', async (c) => {
     try {
       // Your logic here
       return c.json({ message: 'Success' });
     } catch (error) {
       return c.json({ error: error.message }, 500);
     }
   });
   ```

2. **Call from frontend:**
   ```typescript
   // utils/supabase/api.tsx
   async getMyData() {
     return this.request<{ data: any }>('/my-endpoint');
   }
   ```

### Styling Guidelines

Follow the established design system:

```typescript
// ✅ Good - Uses design system colors
<Button className="bg-primary text-primary-foreground">
  Click me
</Button>

// ❌ Avoid - Hardcoded colors
<Button className="bg-green-700 text-white">
  Click me  
</Button>

// ✅ Good - Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## 🧪 Testing and Debugging

### Frontend Debugging
- Open browser dev tools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for API call issues
- Use React Developer Tools extension

### Backend Debugging
- Server logs appear in the terminal running `npm run server:dev`
- API endpoints can be tested with:
  - Browser: `http://localhost:3001/api/health`
  - Postman or similar tools
  - curl commands

### Common Debug Commands
```bash
# Check if servers are running
curl http://localhost:5173        # Frontend
curl http://localhost:3001/api/health  # Backend

# View server logs
npm run server:dev  # Watch backend logs

# Type checking
npm run type-check  # Check TypeScript errors

# Linting
npm run lint        # Check code style issues
```

## 🔄 Hot Reload and Development Experience

Both frontend and backend support hot reload:

- **Frontend**: Vite provides instant hot module replacement (HMR)
- **Backend**: Nodemon automatically restarts the server on file changes
- **Types**: TypeScript provides real-time type checking in VS Code

Changes you make will be immediately reflected without manual restarts.

## 🚀 Building for Production

```bash
# Build frontend
npm run build

# Preview production build locally
npm run preview

# The built files will be in the `dist/` directory
```

For backend deployment, the Node.js server can be deployed to platforms like:
- Railway (recommended)
- Heroku
- DigitalOcean App Platform
- Vercel (for API routes)

## 🛠️ IDE Setup

### VS Code (Recommended)

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",        // Tailwind CSS IntelliSense
    "esbenp.prettier-vscode",           // Code formatting
    "ms-vscode.vscode-typescript-next", // Enhanced TypeScript support
    "formulahendry.auto-rename-tag",    // Auto rename paired HTML tags
    "christian-kohler.path-intellisense" // File path auto-completion
  ]
}
```

### Useful VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 📚 Learning Resources

### Project-Specific
- **Design System**: Check `/styles/globals.css` for color tokens and typography
- **API Documentation**: Review `/server/api/index.js` for all available endpoints
- **Component Examples**: Browse `/components/` for implementation patterns

### Technology Stack
- [React Documentation](https://react.dev/) - Learn React hooks and patterns
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript basics
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Hono Documentation](https://hono.dev/) - Web framework for the backend
- [Supabase Docs](https://supabase.com/docs) - Database and authentication

## 🆘 Getting Help

If you run into issues:

1. **Check this guide** and the main README.md
2. **Look at the console logs** in both browser and terminal
3. **Verify environment variables** are correctly set
4. **Test API endpoints** individually
5. **Check Supabase dashboard** for database issues

### Quick Health Checks
```bash
# 1. Check if servers are responding
curl http://localhost:5173        # Should return HTML
curl http://localhost:3001/api/health  # Should return JSON

# 2. Check environment variables
echo $SUPABASE_URL               # Should show your Supabase URL

# 3. Check database connection
# Use the "Database Setup" component in the app

# 4. Check authentication
# Try signing up/in through the app interface
```

Happy coding! 🎉