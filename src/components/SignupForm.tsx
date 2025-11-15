import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { SocialSigninButtons } from './SocialSigninButtons';
import { Icons } from './ui/icons';
import { authApi } from '../utils/supabase/client';

export type AuthFlow = 'signin' | 'signup' | 'forgot-password';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
}

interface SignupFormProps {
  onFlowChange?: (flow: AuthFlow, email?: string) => void;
}

export function SignupForm({ onFlowChange }: SignupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not on the last step, just move to next step
    if (currentStep < totalSteps) {
      nextStep();
      return;
    }

    // Only process signup on the last step
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authApi.signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        jobTitle: formData.jobTitle,
      });

      console.log('Signup successful:', result);
      setIsSuccess(true);
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during signup';

      if (error instanceof Error) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password is too weak. Please choose a stronger password.';
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.password && formData.confirmPassword;
      case 2:
        return formData.firstName && formData.lastName && isTermsAccepted;
      case 3:
        return true; // optional fields
      default:
        return false;
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Icons.Check className="w-8 h-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Account Created Successfully!</h2>
          <p className="text-muted-foreground">
            Welcome to our platform, {formData.firstName}! You can now sign in with your credentials.
          </p>
        </div>
        <Button
          onClick={() => onFlowChange?.('signin')}
          className="w-full"
        >
          Continue to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Create Your Account</h2>
        <p className="text-muted-foreground">
          Join us in just a few simple steps
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <Icons.AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Social Signin - Only show on first step */}
      {currentStep === 1 && (
        <>
          <SocialSigninButtons />

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
        </>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Email & Password */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                checked={isTermsAccepted}
                onChange={(e) => setIsTermsAccepted(e.target.checked)}
              />
              <div>
                By signing up, you have read and agreed to our
                <a href='/privacy-policy' className="text-primary ml-1">Privacy Policy.</a>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Professional Information */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                placeholder="Your company name"
                value={formData.company}
                onChange={(e) => updateFormData('company', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title (Optional)</Label>
              <Input
                id="jobTitle"
                placeholder="Your job title"
                value={formData.jobTitle}
                onChange={(e) => updateFormData('jobTitle', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex items-center gap-2"
            >
              Next
              <Icons.ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!isStepValid() || isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Icons.Check className="w-4 h-4" />
              )}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          )}
        </div>
      </form>

      {/* Sign in link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => onFlowChange?.('signin')}
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
