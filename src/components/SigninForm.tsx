import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { SocialSigninButtons } from './SocialSigninButtons';
import { Icons } from './ui/icons';
import { authApi } from '../utils/supabase/client';
import type { AuthFlow } from './AuthFlowContainer';

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

interface SigninFormProps {
  onFlowChange: (flow: AuthFlow, email?: string) => void;
  onLoginSuccess?: (user: User, accessToken: string) => void;
}

export function SigninForm({ onFlowChange, onLoginSuccess }: SigninFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await authApi.signin({
        email: formData.email,
        password: formData.password,
      });

      console.log('Sign in successful:', result);
      
      // Call the login success callback if provided
      if (onLoginSuccess && result.user && result.access_token) {
        onLoginSuccess(result.user, result.access_token);
      } else if (result.user && result.access_token) {
        // Fallback: store auth info locally
        localStorage.setItem('accessToken', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Signin error:', error);
      let errorMessage = 'An error occurred during sign in';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2>Welcome Back</h2>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <Icons.AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Social Signin */}
      {/* <SocialSigninButtons /> */}
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Sign in Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email Address</Label>
          <div className="relative">
            <Icons.Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="signin-email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="signin-password">Password</Label>
            <button
              type="button"
              onClick={() => onFlowChange('forgot-password')}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Icons.Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="signin-password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <Icons.ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {/* Sign up link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button 
            onClick={() => onFlowChange('signup')}
            className="text-primary hover:underline"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
}