import React, { useState } from 'react';
import { useDataManager } from './DataManager';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Icons } from './ui/icons';

interface InventoryTransactionFormProps {
  inventoryId: string | null;
  onBack: () => void;
  onSuccess: () => void;
}

export function InventoryTransactionForm({ inventoryId, onBack, onSuccess }: InventoryTransactionFormProps) {
  const { inventory, dealers, employees, createInventoryTransaction } = useDataManager();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    transaction_type: 'deposit' as 'deposit' | 'withdraw' | 'transfer',
    quantity: '',
    dealer_id: '',
    employee_id: '',
    description: '',
    notes: ''
  });

  const selectedInventory = inventoryId ? inventory.find(item => item.id === inventoryId) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inventoryId) {
      alert('Please select an inventory item');
      return;
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    // Check if trying to withdraw more than available
    if (formData.transaction_type === 'withdraw' || formData.transaction_type === 'transfer') {
      const availableQuantity = selectedInventory?.quantity || 0;
      if (parseFloat(formData.quantity) > availableQuantity) {
        alert(`Cannot withdraw ${formData.quantity}${selectedInventory?.unit}. Only ${availableQuantity}${selectedInventory?.unit} available.`);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const transactionData = {
        inventory_id: inventoryId,
        transaction_type: formData.transaction_type,
        quantity: parseFloat(formData.quantity),
        dealer_id: formData.dealer_id || null,
        employee_id: formData.employee_id || null,
        description: formData.description,
        notes: formData.notes
      };

      const result = await createInventoryTransaction(transactionData);
      
      if (result) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!inventoryId || !selectedInventory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="p-2">
            <Icons.ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-medium text-foreground">Create Transaction</h1>
            <p className="text-muted-foreground">Select an inventory item first</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Icons.AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No inventory item selected</h3>
            <p className="text-muted-foreground mb-4">Please go back and select an inventory item to create a transaction.</p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="p-2"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-medium text-foreground">Create Transaction</h1>
          <p className="text-muted-foreground">Transfer gold to dealers or make adjustments</p>
        </div>
      </div>

      {/* Inventory Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Icons.Gem className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="font-medium">{selectedInventory.item_type.charAt(0).toUpperCase() + selectedInventory.item_type.slice(1)}</h3>
              <p className="text-sm text-muted-foreground">
                Available: {selectedInventory.quantity}{selectedInventory.unit}
              </p>
              {selectedInventory.description && (
                <p className="text-sm text-muted-foreground">{selectedInventory.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Transaction Type <span className="text-destructive">*</span>
              </label>
              <select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="deposit">Deposit (Add to inventory)</option>
                <option value="withdraw">Withdraw (Remove from inventory)</option>
                <option value="transfer">Transfer (Send to dealer)</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Quantity ({selectedInventory.unit}) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={`Enter quantity in ${selectedInventory.unit}`}
                step="0.01"
                min="0"
                max={formData.transaction_type === 'deposit' ? undefined : selectedInventory.quantity}
                required
              />
              {(formData.transaction_type === 'withdraw' || formData.transaction_type === 'transfer') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum available: {selectedInventory.quantity}{selectedInventory.unit}
                </p>
              )}
            </div>

            {/* Dealer Selection (for transfers) */}
            {formData.transaction_type === 'transfer' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Dealer <span className="text-destructive">*</span>
                </label>
                <select
                  name="dealer_id"
                  value={formData.dealer_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required={formData.transaction_type === 'transfer'}
                >
                  <option value="">Select a dealer</option>
                  {dealers.filter(dealer => dealer.status === 'active').map((dealer) => (
                    <option key={dealer.id} value={dealer.id}>
                      {dealer.name} - {dealer.location}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Employee Assignment */}
            <div>
              <label className="block text-sm font-medium mb-2">Assign to Employee</label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select an employee (optional)</option>
                {employees.filter(employee => employee.status === 'active').map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position || 'Employee'}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Brief description of the transaction"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Additional notes about the transaction..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icons.ArrowUpDown className="w-4 h-4 mr-2" />
                    Create Transaction
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}