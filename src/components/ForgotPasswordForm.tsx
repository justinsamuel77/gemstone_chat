import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '../utils/supabase/client';
import type { AuthFlow } from './AuthFlowContainer';

interface ForgotPasswordFormProps {
  onFlowChange: (flow: AuthFlow, email?: string) => void;
}

export function ForgotPasswordForm({ onFlowChange }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await authApi.forgotPassword(email);
      console.log('Password reset email sent to:', email);
      setIsEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while sending reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToVerification = () => {
    onFlowChange('email-verification', email);
  };

  const isFormValid = email && email.includes('@');

  if (isEmailSent) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2>Check Your Email</h2>
            <p className="text-muted-foreground">
              We've sent a password reset link to
            </p>
            <p className="text-primary">{email}</p>
          </div>
        </div>

        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button 
            onClick={handleContinueToVerification}
            className="w-full"
          >
            Enter Verification Code
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEmailSent(false)}
            className="w-full"
          >
            Try Different Email
          </Button>
        </div>

        {/* Back to sign in */}
        <div className="text-center">
          <button
            onClick={() => onFlowChange('signin')}
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2>Reset Your Password</h2>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
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
              <Send className="w-4 h-4" />
              Send Reset Link
            </>
          )}
        </Button>
      </form>

      {/* Back to sign in */}
      <div className="text-center">
        <button
          onClick={() => onFlowChange('signin')}
          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to sign in
        </button>
      </div>
    </div>
  );
}