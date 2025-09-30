import React, { useState } from 'react';
import { useDataManager } from './DataManager';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Icons } from './ui/icons';
import { AddInventoryForm } from './AddInventoryForm';
import { InventoryTransactionForm } from './InventoryTransactionForm';
import { showToast } from './ui/toast';

interface Inventory {
  id: string;
  item_type: string;
  quantity: number;
  unit: string;
  description?: string;
  location?: string;
  notes?: string;
  created_at: string;
}

interface InventoryTransaction {
  id: string;
  inventory_id: string;
  transaction_type: 'deposit' | 'withdraw' | 'transfer';
  quantity: number;
  dealer_id?: string;
  employee_id?: string;
  description?: string;
  notes?: string;
  transaction_date: string;
  inventory?: Inventory;
  dealer?: any;
  employee?: any;
}

interface InventoryListProps {
  view?: string;
  onNavigate?: (view: string) => void;
}

export function InventoryList({ view, onNavigate }: InventoryListProps = {}) {
  const { inventory, inventoryTransactions, dealers, employees, isLoading } = useDataManager();
  const [currentView, setCurrentView] = useState<'inventory' | 'add-inventory' | 'transactions' | 'add-transaction'>('inventory');
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  
  // Use external view if provided
  const activeView = view || currentView;
  const navigate = onNavigate || setCurrentView;

  const getTotalGold = () => {
    return inventory
      .filter(item => item.item_type === 'gold')
      .reduce((total, item) => total + parseFloat(item.quantity.toString()), 0);
  };

  const getStatusBadge = (quantity: number) => {
    if (quantity <= 0) {
      return <Badge variant="destructive">Empty</Badge>;
    } else if (quantity < 100) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  const renderAddInventoryForm = () => (
    <AddInventoryForm
      onBack={() => navigate('inventory')}
      onSuccess={() => {
        navigate('inventory');
        showToast('Inventory item added successfully!', 'success');
      }}
    />
  );

  const renderTransactionForm = () => (
    <InventoryTransactionForm
      inventoryId={selectedInventoryId}
      onBack={() => {
        navigate('inventory');
        setSelectedInventoryId(null);
      }}
      onSuccess={() => {
        navigate('inventory');
        setSelectedInventoryId(null);
        showToast('Transaction completed successfully!', 'success');
      }}
    />
  );

  const renderTransactionsList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('inventory')}
            className="p-2"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-medium text-foreground">Inventory Transactions</h1>
            <p className="text-muted-foreground">Track all gold movements and transfers</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {inventoryTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Icons.BarChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-muted-foreground">Start by making your first inventory transaction.</p>
            </CardContent>
          </Card>
        ) : (
          inventoryTransactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        transaction.transaction_type === 'deposit' ? 'bg-green-100 text-green-800' :
                        transaction.transaction_type === 'withdraw' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{transaction.quantity}g</span>
                      {transaction.description && (
                        <span className="text-sm text-muted-foreground">{transaction.description}</span>
                      )}
                    </div>
                    {transaction.dealer && (
                      <div className="text-sm text-muted-foreground">
                        Dealer: {transaction.dealer.name}
                      </div>
                    )}
                    {transaction.employee && (
                      <div className="text-sm text-muted-foreground">
                        Employee: {transaction.employee.name}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Icons.ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  if (activeView === 'add-inventory') {
    return renderAddInventoryForm();
  }

  if (activeView === 'add-transaction' || activeView === 'transfer-gold') {
    return renderTransactionForm();
  }

  if (activeView === 'transactions' || activeView === 'inventory-transactions') {
    return renderTransactionsList();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Gold Inventory</h1>
          <p className="text-muted-foreground">Manage your gold stock and track movements</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => navigate('inventory-transactions')}
          >
            <Icons.BarChart className="w-4 h-4 mr-2" />
            View Transactions
          </Button>
          <Button 
            onClick={() => navigate('add-inventory')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Add Gold
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icons.Gem className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Gold</p>
                <p className="text-xl font-semibold">{getTotalGold().toFixed(2)}g</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icons.Package className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Storage Items</p>
                <p className="text-xl font-semibold">{inventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icons.BarChart className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-xl font-semibold">{inventoryTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </div>
      ) : inventory.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icons.Gem className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No inventory items found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first gold inventory item.
            </p>
            <Button 
              onClick={() => setCurrentView('add-inventory')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Gold
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inventory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Icons.Gem className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium">{item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}</span>
                      {getStatusBadge(item.quantity)}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold">{item.quantity}{item.unit}</span>
                      {item.description && (
                        <span className="text-sm text-muted-foreground">{item.description}</span>
                      )}
                    </div>
                    {item.location && (
                      <div className="flex items-center space-x-2">
                        <Icons.MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{item.location}</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Added: {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInventoryId(item.id);
                        setCurrentView('add-transaction');
                      }}
                    >
                      <Icons.ArrowUpDown className="w-4 h-4 mr-1" />
                      Transfer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}