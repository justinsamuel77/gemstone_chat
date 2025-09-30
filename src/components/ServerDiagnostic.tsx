import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Server, 
  User, 
  Database,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../utils/supabase/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DataSyncHelper } from './DataSyncHelper';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

interface ServerDiagnosticProps {
  currentLeads?: any[];
  currentOrders?: any[];
  onDataUpdate?: (leads: any[], orders: any[]) => void;
}

export function ServerDiagnostic({ currentLeads = [], currentOrders = [], onDataUpdate }: ServerDiagnosticProps = {}) {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (test: string, status: DiagnosticResult['status'], message: string, details?: any) => {
    setResults(prev => {
      const newResults = [...prev];
      const existingIndex = newResults.findIndex(r => r.test === test);
      const result = { test, status, message, details };
      
      if (existingIndex >= 0) {
        newResults[existingIndex] = result;
      } else {
        newResults.push(result);
      }
      
      return newResults;
    });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Environment Check
    updateResult('Environment', 'pending', 'Checking environment configuration...');
    try {
      const hasProjectId = !!projectId;
      const hasAnonKey = !!publicAnonKey;
      const hasAccessToken = !!localStorage.getItem('accessToken');
      const hasUser = !!localStorage.getItem('user');

      if (hasProjectId && hasAnonKey) {
        updateResult('Environment', 'success', 'Environment configured correctly', {
          projectId: hasProjectId ? 'Present' : 'Missing',
          publicAnonKey: hasAnonKey ? 'Present' : 'Missing',
          accessToken: hasAccessToken ? 'Present' : 'Missing',
          userData: hasUser ? 'Present' : 'Missing'
        });
      } else {
        updateResult('Environment', 'error', 'Missing environment configuration', {
          projectId: hasProjectId ? 'Present' : 'Missing',
          publicAnonKey: hasAnonKey ? 'Present' : 'Missing'
        });
      }
    } catch (error) {
      updateResult('Environment', 'error', 'Environment check failed', error);
    }

    // Test 2: Server Health Check
    updateResult('Server Health', 'pending', 'Testing server connectivity...');
    try {
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-2ed58025/health`;
      console.log('Testing health endpoint:', healthUrl);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        updateResult('Server Health', 'success', 'Server is responding', data);
      } else {
        const errorText = await response.text();
        updateResult('Server Health', 'error', `Server returned ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          response: errorText
        });
      }
    } catch (error) {
      updateResult('Server Health', 'error', 'Failed to connect to server', error);
    }

    // Test 3: Authentication Test
    updateResult('Authentication', 'pending', 'Testing authentication...');
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        updateResult('Authentication', 'error', 'No access token found', {
          suggestion: 'Try signing out and signing back in'
        });
      } else {
        // Test with profile endpoint
        const profileUrl = `https://${projectId}.supabase.co/functions/v1/make-server-2ed58025/profile`;
        const response = await fetch(profileUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          updateResult('Authentication', 'success', 'Authentication working', data);
        } else {
          const errorText = await response.text();
          updateResult('Authentication', 'error', `Auth failed with ${response.status}`, {
            status: response.status,
            response: errorText
          });
        }
      }
    } catch (error) {
      updateResult('Authentication', 'error', 'Authentication test failed', error);
    }

    // Test 4: Leads API
    updateResult('Leads API', 'pending', 'Testing leads endpoint...');
    try {
      const response = await apiService.getLeads();
      if (response.success) {
        updateResult('Leads API', 'success', `Leads API working (${response.data?.leads?.length || 0} leads)`, response.data);
      } else {
        updateResult('Leads API', 'error', 'Leads API failed', response.error);
      }
    } catch (error) {
      updateResult('Leads API', 'error', 'Leads API test failed', error);
    }

    // Test 5: Orders API
    updateResult('Orders API', 'pending', 'Testing orders endpoint...');
    try {
      const response = await apiService.getOrders();
      if (response.success) {
        updateResult('Orders API', 'success', `Orders API working (${response.data?.orders?.length || 0} orders)`, response.data);
      } else {
        updateResult('Orders API', 'error', 'Orders API failed', response.error);
      }
    } catch (error) {
      updateResult('Orders API', 'error', 'Orders API test failed', error);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Server className="w-6 h-6 text-primary" />
            Server Diagnostics
          </h1>
          <p className="text-muted-foreground">Test server connectivity and API endpoints</p>
        </div>
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Diagnostics
            </>
          )}
        </Button>
      </div>

      {results.length === 0 && !isRunning && (
        <Alert>
          <AlertDescription>
            Click "Run Diagnostics" to test your server connection and identify any issues.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {results.map((result) => (
          <Card key={result.test} className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span>{result.test}</span>
                </div>
                {getStatusBadge(result.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">{result.message}</p>
              {result.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-primary hover:underline">
                    View Details
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Sync Helper */}
      {onDataUpdate && (
        <DataSyncHelper 
          currentLeads={currentLeads}
          currentOrders={currentOrders}
          onDataUpdate={onDataUpdate}
        />
      )}

      {results.length > 0 && !isRunning && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Common Solutions:</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• If authentication fails, try signing out and back in</li>
              <li>• Check your internet connection if server health fails</li>
              <li>• If APIs return empty data, try adding some test data</li>
              <li>• Environment errors may require redeployment</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}