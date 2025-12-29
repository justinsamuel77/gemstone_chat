import React, { useState, useEffect } from 'react';
import { DashboardV2 as Dashboard } from './components/DashboardV2';
import { AuthFlowContainer } from './components/AuthFlowContainer';
import { ServerConnectionError } from './components/ServerConnectionError';
import { Button } from './components/ui/button';
import { DataManagerProvider } from './components/DataManager';
import { ToastProvider, ToastListener } from './components/ui/toast';
import { authApi } from './utils/supabase/client';
import { supabase } from './utils/supabase/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TermsPage } from './src/components/auth/TermsPage';
import { PrivacyPage } from './src/components/auth/PrivacyPage';
import NotFound from './components/NotFound';

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

  // Check for existing authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Update auth view when initial flow changes
  useEffect(() => {
    if (appState === 'unauthenticated') {
      // This can be used for deep linking to specific auth flows
    }
  }, [appState]);

  const checkAuthStatus = async () => {
    console.log('🔍 Checking authentication status...');

    try {
      // Check if user has existing session with Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.log('❌ Session check error:', sessionError);
        setAppState('unauthenticated');
        return;
      }

      if (session?.access_token && session?.user) {
        console.log('✅ Valid Supabase session found');

        // Create user object from session data
        const authenticatedUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!,
          profile: {
            firstName: session.user.user_metadata?.firstName || '',
            lastName: session.user.user_metadata?.lastName || '',
            company: session.user.user_metadata?.company || '',
            jobTitle: session.user.user_metadata?.jobTitle || ''
          }
        };

        // Store authentication data
        localStorage.setItem('accessToken', session.access_token);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));

        setUser(authenticatedUser);
        setAppState('authenticated');

        console.log('🎉 User authenticated successfully:', authenticatedUser.email);
      } else {
        // Check localStorage as fallback
        const accessToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        console.log('🔑 Stored access token found:', !!accessToken);
        console.log('👤 Stored user found:', !!storedUser);

        if (accessToken && storedUser) {
          console.log('✅ Stored auth data found, validating...');
          try {
            // Verify token is still valid
            console.log('📡 Validating token with Supabase...');
            const profileData = await authApi.getProfile(accessToken);
            const userData = JSON.parse(storedUser);

            console.log('✅ Token validation successful');
            const authenticatedUser = {
              ...userData,
              profile: profileData.profile
            };

            setUser(authenticatedUser);
            setAppState('authenticated');

            console.log('🎉 User authenticated successfully:', authenticatedUser.email);
          } catch (error) {
            console.log('❌ Token validation failed:', error);
            // Clear invalid tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setAppState('unauthenticated');
            console.log('🧹 Cleared invalid authentication data');
          }
        } else {
          console.log('⚠️ No authentication data found, setting unauthenticated');
          setAppState('unauthenticated');
        }
      }
    } catch (error) {
      console.error('💥 Auth check error:', error);
      setAppState('unauthenticated');
    }
  };

  const handleLoginSuccess = (userData: User, accessToken: string) => {
    console.log('🎉 Login successful, storing authentication data');
    console.log('👤 User data:', userData);
    console.log('🔑 Access token present:', !!accessToken);

    // Store authentication data
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));

    // Update app state
    setUser(userData);
    setAppState('authenticated');

    console.log('✅ Authentication data stored successfully');
    console.log('🚀 Redirecting to dashboard...');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setAppState('unauthenticated');
    setAuthView('signin');
  };

  const handleUserUpdate = (updatedUser: User) => {
    console.log('Updating user data:', updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };



  return (
    <Router>
      <ToastProvider>
        <ToastListener />
        <Routes>
          <Route
            path="/"
            element={
              <AppContent
                appState={appState}
                authView={authView}
                setAuthView={setAuthView}
                user={user}
                handleLoginSuccess={handleLoginSuccess}
                handleLogout={handleLogout}
                handleUserUpdate={handleUserUpdate}
              />
            }
          />

          {/* Public pages for Meta verification */}
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          {/* Fallback 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </Router>
  );
}

function AppContent({
  appState,
  authView,
  setAuthView,
  user,
  handleLoginSuccess,
  handleLogout,
  handleUserUpdate
}: {
  appState: AppState;
  authView: AuthView;
  setAuthView: (view: AuthView) => void;
  user: User | null;
  handleLoginSuccess: (userData: User, accessToken: string) => void;
  handleLogout: () => void;
  handleUserUpdate: (updatedUser: User) => void;
}) {
  // Loading state
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

  // Authenticated state - show dashboard
  if (appState === 'authenticated' && user) {
    return (
      <DataManagerProvider user={user}>
        <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      </DataManagerProvider>
    );
  }

  // Unauthenticated state - show auth forms
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
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
              {/* Logo */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary-foreground/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                  {/* <span className="text-white font-bold text-xl">💎</span> */}
                  <img src="/whatsapp_images/madahvan_logo_1.jpg" alt="Logo" className="rounded-lg" />
                </div>
                <div className="text-left">
                  <h1 className="text-white text-2xl font-bold">MADHAVAN JEWELLERS</h1>
                  {/* <p className="text-white/80 text-sm">Fine Jewelry</p> */}
                </div>
              </div>

              <h2 className="text-white text-3xl font-semibold mb-4">
                {authView === 'signin' ? 'Welcome Back to Your Dashboard' : 'Join Our Jewelry Family'}
              </h2>
              <p className="text-white/90 text-lg">
                {authView === 'signin'
                  ? 'Sign in to access your jewelry store management dashboard and continue managing your precious collections.'
                  : 'Create an account to access our premium jewelry management platform and exclusive features.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        {/* Mobile toggle button */}
        <div className="absolute top-4 right-4 lg:hidden">
          <Button
            variant="outline"
            onClick={() => setAuthView(authView === 'signin' ? 'signup' : 'signin')}
          >
            {authView === 'signin' ? 'Sign Up' : 'Sign In'}
          </Button>
        </div>

        <div className="w-full max-w-md">
          <AuthFlowContainer
            initialFlow={authView}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </div>
    </div>
  );
}