import React from 'react';
import { ImageCarousel } from './ImageCarousel';
import { SignupForm } from './SignupForm';

export function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <ImageCarousel />
      </div>
      
      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}