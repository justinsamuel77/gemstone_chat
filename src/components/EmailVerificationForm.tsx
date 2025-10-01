import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { Alert, AlertDescription } from './ui/alert';
import { Icons } from './ui/icons';
import type { AuthFlow } from './AuthFlowContainer';

interface EmailVerificationFormProps {
  email: string;
  onFlowChange: (flow: AuthFlow) => void;
}

export function EmailVerificationForm({ email, onFlowChange }: EmailVerificationFormProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      if (code === '123456') {
        console.log('Verification successful');
        onFlowChange('signin');
      } else {
        setError('Invalid verification code. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      console.log('Verification code resent to:', email);
      setIsResending(false);
      setCanResend(false);
      setCountdown(60);
    }, 1000);
  };

  const isFormValid = code.length === 6;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2>Verify Your Email</h2>
        <p className="text-muted-foreground">
          Enter the 6-digit code we sent to
        </p>
        <p className="text-primary">{email}</p>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-center">
            <InputOTP
              value={code}
              onChange={(value) => {
                setCode(value);
                setError('');
              }}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Enter the verification code
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <Icons.AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Icons.CheckCircle className="w-4 h-4" />
              Verify Code
            </>
          )}
        </Button>
      </form>

      {/* Resend Code */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResendCode}
          disabled={!canResend || isResending}
          className="flex items-center gap-2"
        >
          {isResending ? (
            <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <Icons.RefreshCw className="w-3 h-3" />
          )}
          {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
        </Button>
      </div>

      {/* Back to forgot password */}
      <div className="text-center">
        <button
          onClick={() => onFlowChange('forgot-password')}
          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <Icons.ArrowLeft className="w-3 h-3" />
          Try different email
        </button>
      </div>
    </div>
  );
}