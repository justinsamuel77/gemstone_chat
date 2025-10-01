# 💎 GEMSTONE Fine Jewelry CRM

A comprehensive, modern jewelry shop CRM system for lead management, order tracking, and customer relationship management.

![Node.js](https://img.shields.io/badge/node.js-18+-green) ![React](https://img.shields.io/badge/react-18-blue) ![TypeScript](https://img.shields.io/badge/typescript-5-blue) ![Tailwind](https://img.shields.io/badge/tailwind-4-cyan)

## ✨ Features

### 🎯 **Core CRM Features**
- **Lead Management** - Track and nurture potential customers
- **Order Management** - Complete order lifecycle from creation to delivery  
- **Dealer Management** - Manage jewelry dealers and suppliers
- **Customer Database** - Comprehensive customer relationship tracking

### 🔐 **Authentication & Security**
- Secure user authentication with Supabase
- User profiles and session management
- Role-based access control

### 🎨 **Modern UI/UX**
- Clean, responsive design built with Tailwind CSS v4
- Custom design system with #1E5128 brand colors
- Mobile-first responsive interface
- Dark/light mode support

### 🛠️ **Technical Features**
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js server with Hono framework
- **Database**: Supabase PostgreSQL with Row Level Security
- **Styling**: Tailwind CSS v4 + Custom Design System
- **State Management**: React Context + Custom hooks

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **Supabase account** (free tier works fine)

### 1. Installation

```bash
# Clone repository
git clone <your-repository-url>
cd gemstone-crm

# Install dependencies
npm install

# Verify setup
npm run check-setup
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
# Get these from your Supabase dashboard → Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

PORT=3001
NODE_ENV=development
VITE_API_URL=http://localhost:3001/api
```

### 3. Start Development Servers

**Option A: Start both servers with one command**
```bash
npm run start:all
```

**Option B: Start servers separately**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run server:dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### ⚠️ If You Get "Failed to fetch" Errors

This means the backend server isn't running. **The server MUST be started manually before the frontend will work.**

**🚨 CRITICAL: You need to run TWO commands in separate terminals:**

**Terminal 1 (Backend Server):**
```bash
npm run server:dev
```
Wait for: `✅ Server running successfully on port 3001`

**Terminal 2 (Frontend):**
```bash
npm run dev
```

**OR use one command to start both:**
```bash
npm run start:all
```

**Verify the server is working:**
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"...","version":"1.0.0"}
```

**If the server won't start:**
1. Check if port 3001 is in use: `lsof -i :3001`
2. Kill any process using it: `lsof -ti:3001 | xargs kill -9`
3. Check your `.env` file has Supabase credentials
4. Run: `npm run check-setup`

## 📁 Project Structure

```
gemstone-crm/
├── 📱 Frontend
│   ├── App.tsx                 # Main React app
│   ├── main.tsx               # App entry point
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── auth/             # Authentication forms
│   │   ├── leads/            # Lead management
│   │   ├── orders/           # Order management
│   │   └── ...
│   ├── utils/                # Utilities & API clients
│   └── styles/               # Global styles & design system
│
├── 🖥️ Backend
│   └── server/
│       ├── index.js          # Server entry point
│       └── api/
│           └── index.js      # API routes & logic
│
├── 🗄️ Database
│   └── supabase/
│       └── functions/server/
│           ├── index.tsx     # Original Supabase Edge Function
│           ├── kv_store.tsx  # Key-value storage utilities
│           └── database-setup.sql
│
└── 📋 Configuration
    ├── package.json          # Dependencies & scripts
    ├── vite.config.ts        # Vite configuration
    ├── tailwind.config.ts    # Tailwind configuration
    └── tsconfig.json         # TypeScript configuration
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start frontend development server
npm run server:dev   # Start backend development server  
npm run start:all    # Start both servers concurrently
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### 🎨 Design System

The project uses a custom design system with:
- **Primary Color**: `#1E5128` (Forest Green)
- **Active Color**: `#C6E543` (Lime Green)
- **Typography**: Inter font family, 14px base size
- **Components**: Custom UI components built with Tailwind CSS
- **Responsive**: Mobile-first design approach

### 🔗 API Endpoints

All API endpoints are available at `/api/`:

**Authentication:**
- `POST /api/signup` - User registration
- `POST /api/signin` - User login  
- `GET /api/profile` - Get user profile

**CRM Features:**
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- Similar endpoints for `/orders` and `/dealers`

**System:**
- `GET /api/health` - Health check
- `GET /api/setup-database` - Check database status

## 🚀 Deployment

### Quick Deploy to Supabase Edge Functions (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your_project_id

# Deploy backend as Edge Function
supabase functions deploy server
```

### Alternative Deployment Options

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- **Supabase Edge Functions** (serverless, auto-scaling)
- **Railway/Heroku** (traditional hosting)
- **Vercel/Netlify** (frontend + serverless functions)

**Environment Variables:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NODE_ENV=production
```

## 🗄️ Database Setup

The application uses Supabase PostgreSQL with automatic table creation:

1. **Automatic Setup**: Use the "Database Setup" component in the app
2. **Manual Setup**: Run SQL from `/supabase/functions/server/database-setup.sql`

### Database Tables:
- `leads` - Customer leads and prospects
- `orders` - Order management and tracking
- `dealers` - Dealer and supplier information
- `auth.users` - User authentication (Supabase managed)

## 🛠️ VS Code Setup

### Recommended Extensions:
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Workspace Settings:
The project includes proper TypeScript configuration for:
- IntelliSense and auto-completion
- Error checking and linting
- Import organization
- Code formatting

## 🔍 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

**2. Missing Environment Variables**
- Ensure all variables in `.env.example` are set in your `.env` file
- Double-check Supabase credentials from your dashboard

**3. Database Connection Issues**
- Verify Supabase URL and service role key
- Check if your Supabase project is active
- Use the Database Setup component to create tables

**4. API Errors**
- Check server logs for detailed error messages
- Verify authentication tokens are valid
- Test with the health endpoint: `http://localhost:3001/api/health`

### Debug Mode
Set `NODE_ENV=development` for detailed logging:
- 🔐 Authentication attempts
- 📥 API endpoint requests  
- ❌ Detailed error messages
- ✅ Success confirmations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines:
- Follow TypeScript best practices
- Use the existing component patterns
- Maintain responsive design principles
- Add proper error handling
- Include console logging for debugging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For help and support:

1. Check this README's troubleshooting section
2. Review the [NODE_SERVER_SETUP.md](NODE_SERVER_SETUP.md) for server details
3. Verify environment variables are correctly configured
4. Check server logs for error details
5. Test API endpoints individually

## 🎯 Roadmap

### Current Features ✅
- User authentication and profiles
- Lead management (CRUD operations)
- Order management (CRUD operations)
- Dealer management (CRUD operations)
- Responsive design and modern UI

### Planned Features 🚧
- WhatsApp Business API integration
- Instagram Direct Message integration
- PDF invoice generation
- Advanced search and filtering
- Analytics and reporting dashboard
- Email notifications
- Calendar integration
- Mobile app (React Native)

---

**Built with ❤️ for the jewelry industry**

*This project provides a solid foundation for jewelry store management with modern web technologies and scalable architecture.*