import React from 'react';
import { Button } from './ui/button';
import { Icons } from './ui/icons';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-6xl font-extrabold mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Oops — the page you are looking for does not exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            Go Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            {/* <Icons.RefreshCcw className="w-4 h-4" /> */}
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
