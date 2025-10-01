import React from 'react';
import { ImageCarousel } from './ImageCarousel';
import { AuthFlowContainer } from './AuthFlowContainer';

export function SigninPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <ImageCarousel />
      </div>
      
      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <AuthFlowContainer />
        </div>
      </div>
    </div>
  );
}