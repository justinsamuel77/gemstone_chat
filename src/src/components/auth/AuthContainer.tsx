import React, { useState } from 'react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

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

interface AuthContainerProps {
  initialView: 'signin' | 'signup';
  onLoginSuccess: (userData: User, accessToken: string) => void;
}

export function AuthContainer({ initialView, onLoginSuccess }: AuthContainerProps) {
  const [currentView, setCurrentView] = useState(initialView);

  if (currentView === 'signup') {
    return (
      <SignUpForm 
        onSuccess={onLoginSuccess}
        onSwitchToSignIn={() => setCurrentView('signin')}
      />
    );
  }

  return (
    <SignInForm 
      onSuccess={onLoginSuccess}
      onSwitchToSignUp={() => setCurrentView('signup')}
    />
  );
}