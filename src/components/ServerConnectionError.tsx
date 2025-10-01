import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface ServerConnectionErrorProps {
  onRetry: () => void;
}

export function ServerConnectionError({ onRetry }: ServerConnectionErrorProps) {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive text-2xl">⚠️</span>
          </div>
          <CardTitle className="text-xl">Server Connection Failed</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Cannot connect to the local server on port 3001. The backend server needs to be running for the application to work.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div className="text-sm">
              <h4 className="font-medium mb-2">To fix this issue:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Open a terminal in your project folder</li>
                <li>Run: <code className="bg-muted px-1 rounded">npm run server:dev</code></li>
                <li>Wait for: "✅ Server running successfully on port 3001"</li>
                <li>Click "Retry Connection" below</li>
              </ol>
            </div>
            
            <div className="text-sm">
              <h4 className="font-medium mb-2">Or start both servers at once:</h4>
              <p className="text-muted-foreground">
                Run: <code className="bg-muted px-1 rounded">npm run start:all</code>
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onRetry} className="flex-1">
              Retry Connection
            </Button>
            <Button variant="outline" onClick={refreshPage} className="flex-1">
              Refresh Page
            </Button>
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            <p>Need more help? Check <code>STARTUP_CHECKLIST.md</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}