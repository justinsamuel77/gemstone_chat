import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AuthContainer } from './components/auth/AuthContainer';
import { Button } from './components/ui/button';
import { DataProvider } from './context/DataProvider';
import { ToastProvider } from './components/ui/toast';
import { authApi } from './lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  profile?: {
    firstName: string;
    lastName: string;
    company?: string;
    jobTitle?: string;
  };
}

type AppState = 'loading' | 'authenticated' | 'unauthenticated';
type AuthView = 'signin' | 'signup';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔍 Checking authentication status...');
    try {
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (accessToken && storedUser) {
        try {
          const profileData = await authApi.getProfile(accessToken);
          const userData = JSON.parse(storedUser);
          
          const authenticatedUser = {
            ...userData,
            profile: profileData.profile
          };
          
          setUser(authenticatedUser);
          setAppState('authenticated');
          
          console.log('🎉 User authenticated successfully:', authenticatedUser.email);
        } catch (error) {
          console.log('❌ Token validation failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setAppState('unauthenticated');
        }
      } else {
        setAppState('unauthenticated');
      }
    } catch (error) {
      console.error('💥 Auth check error:', error);
      setAppState('unauthenticated');
    }
  };

  const handleLoginSuccess = (userData: User, accessToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setAppState('authenticated');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setAppState('unauthenticated');
    setAuthView('signin');
  };

  const handleUserUpdate = (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <ToastProvider>
      <AppContent 
        appState={appState}
        authView={authView}
        setAuthView={setAuthView}
        user={user}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
        handleUserUpdate={handleUserUpdate}
      />
    </ToastProvider>
  );
}

interface AppContentProps {
  appState: AppState;
  authView: AuthView;
  setAuthView: (view: AuthView) => void;
  user: User | null;
  handleLoginSuccess: (userData: User, accessToken: string) => void;
  handleLogout: () => void;
  handleUserUpdate: (updatedUser: User) => void;
}

function AppContent({ 
  appState, 
  authView, 
  setAuthView, 
  user, 
  handleLoginSuccess, 
  handleLogout, 
  handleUserUpdate 
}: AppContentProps) {
  if (appState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (appState === 'authenticated' && user) {
    return (
      <DataProvider user={user}>
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onUserUpdate={handleUserUpdate} 
        />
      </DataProvider>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="outline" 
            onClick={() => setAuthView(authView === 'signin' ? 'signup' : 'signin')}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            {authView === 'signin' ? 'Sign Up' : 'Sign In'}
          </Button>
        </div>
        
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
          <div className="relative z-10 text-center px-8 max-w-lg">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary-foreground/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                  <span className="text-white text-xl">💎</span>
                </div>
                <div className="text-left">
                  <h1 className="text-white text-2xl">MADHAVAN JEWELLERS</h1>
                  {/* <p className="text-white/80 text-sm">Fine Jewelry</p> */}
                </div>
              </div>
              
              <h2 className="text-white text-3xl mb-4">
                {authView === 'signin' ? 'Welcome Back' : 'Join Our Family'}
              </h2>
              <p className="text-white/90 text-lg">
                {authView === 'signin' 
                  ? 'Sign in to access your jewelry store management dashboard.'
                  : 'Create an account to access our premium jewelry management platform.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute top-4 right-4 lg:hidden">
          <Button 
            variant="outline" 
            onClick={() => setAuthView(authView === 'signin' ? 'signup' : 'signin')}
          >
            {authView === 'signin' ? 'Sign Up' : 'Sign In'}
          </Button>
        </div>
        
        <div className="w-full max-w-md">
          <AuthContainer 
            initialView={authView} 
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </div>
    </div>
  );
}