import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '../utils/supabase/api';

interface DataSyncHelperProps {
  currentLeads: any[];
  currentOrders: any[];
  onDataUpdate: (leads: any[], orders: any[]) => void;
}

export function DataSyncHelper({ currentLeads, currentOrders, onDataUpdate }: DataSyncHelperProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [serverData, setServerData] = useState<{
    leads: any[];
    orders: any[];
  } | null>(null);
  const [syncResults, setSyncResults] = useState<{
    leadsDiff: {
      serverOnly: any[];
      clientOnly: any[];
      different: any[];
    };
    ordersDiff: {
      serverOnly: any[];
      clientOnly: any[];
      different: any[];
    };
  } | null>(null);

  const checkDataConsistency = async () => {
    setIsChecking(true);
    setSyncResults(null);
    
    try {
      console.log('🔍 Checking data consistency with server...');
      
      // Fetch fresh data from server
      const [leadsResponse, ordersResponse] = await Promise.all([
        apiService.getLeads(),
        apiService.getOrders()
      ]);

      if (leadsResponse.success && ordersResponse.success) {
        const serverLeads = leadsResponse.data?.leads || [];
        const serverOrders = ordersResponse.data?.orders || [];
        
        setServerData({
          leads: serverLeads,
          orders: serverOrders
        });

        // Compare data
        const leadsDiff = compareArrays(currentLeads, serverLeads, 'id');
        const ordersDiff = compareArrays(currentOrders, serverOrders, 'id');

        setSyncResults({
          leadsDiff,
          ordersDiff
        });

        console.log('📊 Data comparison results:');
        console.log('Leads - Server only:', leadsDiff.serverOnly.length);
        console.log('Leads - Client only:', leadsDiff.clientOnly.length);
        console.log('Leads - Different:', leadsDiff.different.length);
        console.log('Orders - Server only:', ordersDiff.serverOnly.length);
        console.log('Orders - Client only:', ordersDiff.clientOnly.length);
        console.log('Orders - Different:', ordersDiff.different.length);
      } else {
        console.error('Failed to fetch server data');
        alert('Failed to fetch server data for comparison');
      }
    } catch (error) {
      console.error('Error checking data consistency:', error);
      alert('Error checking data consistency');
    } finally {
      setIsChecking(false);
    }
  };

  const compareArrays = (clientArray: any[], serverArray: any[], idField: string) => {
    const serverOnly = serverArray.filter(serverItem => 
      !clientArray.find(clientItem => clientItem[idField] === serverItem[idField])
    );
    
    const clientOnly = clientArray.filter(clientItem => 
      !serverArray.find(serverItem => serverItem[idField] === clientItem[idField])
    );
    
    const different = [];
    for (const serverItem of serverArray) {
      const clientItem = clientArray.find(item => item[idField] === serverItem[idField]);
      if (clientItem) {
        // Simple comparison - in a real app you might want more sophisticated comparison
        if (JSON.stringify(clientItem) !== JSON.stringify(serverItem)) {
          different.push({
            client: clientItem,
            server: serverItem
          });
        }
      }
    }

    return { serverOnly, clientOnly, different };
  };

  const syncWithServer = async () => {
    if (!serverData) return;
    
    try {
      console.log('🔄 Syncing data with server...');
      onDataUpdate(serverData.leads, serverData.orders);
      setSyncResults(null);
      setServerData(null);
      console.log('✅ Data synced successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      alert('Error syncing data');
    }
  };

  const getDataStatus = () => {
    if (!syncResults) return null;
    
    const { leadsDiff, ordersDiff } = syncResults;
    const hasLeadsDiff = leadsDiff.serverOnly.length > 0 || leadsDiff.clientOnly.length > 0 || leadsDiff.different.length > 0;
    const hasOrdersDiff = ordersDiff.serverOnly.length > 0 || ordersDiff.clientOnly.length > 0 || ordersDiff.different.length > 0;
    
    if (!hasLeadsDiff && !hasOrdersDiff) {
      return {
        status: 'synced',
        message: 'Data is in sync with server',
        color: 'green'
      };
    } else {
      return {
        status: 'out-of-sync',
        message: 'Data is out of sync with server',
        color: 'red'
      };
    }
  };

  const dataStatus = getDataStatus();

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Data Synchronization Helper
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Check if your local data matches the server data
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Local Leads: {currentLeads.length}</span>
              <span>Local Orders: {currentOrders.length}</span>
            </div>
          </div>
          <Button
            onClick={checkDataConsistency}
            disabled={isChecking}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Check Consistency
              </>
            )}
          </Button>
        </div>

        {dataStatus && (
          <Alert className={`border-${dataStatus.color}-200 bg-${dataStatus.color}-50`}>
            {dataStatus.status === 'synced' ? (
              <CheckCircle className={`h-4 w-4 text-${dataStatus.color}-600`} />
            ) : (
              <AlertTriangle className={`h-4 w-4 text-${dataStatus.color}-600`} />
            )}
            <AlertDescription className={`text-${dataStatus.color}-800`}>
              {dataStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {syncResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Leads Differences */}
              <div className="space-y-2">
                <h4 className="font-medium">Leads Differences</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Server only:</span>
                    <Badge variant={syncResults.leadsDiff.serverOnly.length > 0 ? "destructive" : "secondary"}>
                      {syncResults.leadsDiff.serverOnly.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Client only:</span>
                    <Badge variant={syncResults.leadsDiff.clientOnly.length > 0 ? "destructive" : "secondary"}>
                      {syncResults.leadsDiff.clientOnly.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Different:</span>
                    <Badge variant={syncResults.leadsDiff.different.length > 0 ? "destructive" : "secondary"}>
                      {syncResults.leadsDiff.different.length}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Orders Differences */}
              <div className="space-y-2">
                <h4 className="font-medium">Orders Differences</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Server only:</span>
                    <Badge variant={syncResults.ordersDiff.serverOnly.length > 0 ? "destructive" : "secondary"}>
                      {syncResults.ordersDiff.serverOnly.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Client only:</span>
                    <Badge variant={syncResults.ordersDiff.clientOnly.length > 0 ? "destructive" : "secondary"}>
                      {syncResults.ordersDiff.clientOnly.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Different:</span>
                    <Badge variant={syncResults.ordersDiff.different.length > 0 ? "destructive" : "secondary"}>
                      {syncResults.ordersDiff.different.length}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {dataStatus?.status === 'out-of-sync' && (
              <div className="pt-4 border-t">
                <Button
                  onClick={syncWithServer}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync with Server Data
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This will replace your local data with server data
                </p>
              </div>
            )}
          </div>
        )}

        {syncResults && (
          <details className="text-sm">
            <summary className="cursor-pointer text-primary hover:underline">
              View Detailed Differences
            </summary>
            <div className="mt-2 space-y-2 p-3 bg-gray-50 rounded">
              {syncResults.leadsDiff.serverOnly.length > 0 && (
                <div>
                  <p className="font-medium">Leads only on server:</p>
                  <pre className="text-xs overflow-auto max-h-32">
                    {JSON.stringify(syncResults.leadsDiff.serverOnly.map(l => ({ id: l.id, name: l.name })), null, 2)}
                  </pre>
                </div>
              )}
              {syncResults.ordersDiff.serverOnly.length > 0 && (
                <div>
                  <p className="font-medium">Orders only on server:</p>
                  <pre className="text-xs overflow-auto max-h-32">
                    {JSON.stringify(syncResults.ordersDiff.serverOnly.map(o => ({ id: o.id, orderNumber: o.orderNumber })), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}