import React, { useState } from 'react';
import { SigninForm } from './SigninForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { EmailVerificationForm } from './EmailVerificationForm';
import { SignupForm } from './SignupForm';

export type AuthFlow = 'signin' | 'forgot-password' | 'email-verification' | 'signup';

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

interface AuthFlowContainerProps {
  initialFlow?: AuthFlow;
  onLoginSuccess?: (user: User, accessToken: string) => void;
}

export function AuthFlowContainer({ initialFlow = 'signin', onLoginSuccess }: AuthFlowContainerProps) {
  const [currentFlow, setCurrentFlow] = useState<AuthFlow>(initialFlow);
  const [userEmail, setUserEmail] = useState('');

  const handleFlowChange = (flow: AuthFlow, email?: string) => {
    setCurrentFlow(flow);
    if (email) {
      setUserEmail(email);
    }
  };

  switch (currentFlow) {
    case 'signin':
      return <SigninForm onFlowChange={handleFlowChange} onLoginSuccess={onLoginSuccess} />;
    case 'signup':
      return <SignupForm onFlowChange={handleFlowChange} />;
    case 'forgot-password':
      return <ForgotPasswordForm onFlowChange={handleFlowChange} />;
    case 'email-verification':
      return <EmailVerificationForm email={userEmail} onFlowChange={handleFlowChange} />;
    default:
      return <SigninForm onFlowChange={handleFlowChange} onLoginSuccess={onLoginSuccess} />;
  }
}