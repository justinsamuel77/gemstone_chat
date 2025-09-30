import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Icons } from './ui/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from './ui/toast';
import { apiService } from '../utils/supabase/api';

interface Dealer {
  id: string;
  name: string;
  phone: string;
  location: string;
  company: string;
  status: 'active' | 'inactive';
  createdAt: string;
  email?: string;
  specialization?: string;
}

interface DealerListProps {
  onAddDealer: () => void;
  onEditDealer: (dealer: Dealer) => void;
}

export function DealerList({ onAddDealer, onEditDealer }: DealerListProps) {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [filteredDealers, setFilteredDealers] = useState<Dealer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealerToDelete, setDealerToDelete] = useState<string | null>(null);

  // Load dealers from API
  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('No access token found for dealers API call');
        setLoading(false);
        return;
      }

      const response = await apiService.getDealers();
      console.log('Dealers response:', response);
      
      if (response.success && response.data && response.data.dealers) {
        console.log(`Loaded ${response.data.dealers.length} dealers from server`);
        setDealers(response.data.dealers);
        setFilteredDealers(response.data.dealers);
      } else {
        console.error('Error loading dealers:', response.error);
        setDealers([]);
        setFilteredDealers([]);
      }
    } catch (error) {
      console.error('Exception loading dealers:', error);
      setDealers([]);
      setFilteredDealers([]);
    }
    setLoading(false);
  };

  // Filter dealers based on search term and status
  useEffect(() => {
    let filtered = dealers;

    if (searchTerm) {
      filtered = filtered.filter(
        dealer =>
          dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dealer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dealer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dealer.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(dealer => dealer.status === statusFilter);
    }

    setFilteredDealers(filtered);
  }, [dealers, searchTerm, statusFilter]);

  const handleWhatsAppChat = (dealer: Dealer) => {
    // Remove non-numeric characters from phone number
    const cleanPhone = dealer.phone.replace(/[^\d]/g, '');
    const message = encodeURIComponent(`Hello ${dealer.name}, I hope you're doing well. I'd like to discuss some business opportunities with ${dealer.company}.`);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleStatusToggle = async (dealerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await apiService.updateDealer(dealerId, { status: newStatus });
      
      if (response.success && response.data) {
        // Update local state
        setDealers(prevDealers =>
          prevDealers.map(dealer =>
            dealer.id === dealerId ? response.data.dealer : dealer
          )
        );
        
        toast.success(`Dealer status updated to ${newStatus}`);
      } else {
        console.error('Error updating dealer status:', response.error);
        toast.error('Failed to update dealer status');
      }
    } catch (error) {
      console.error('Error updating dealer status:', error);
      toast.error('Failed to update dealer status');
    }
  };

  const handleDeleteDealer = async () => {
    if (!dealerToDelete) return;

    try {
      const response = await apiService.deleteDealer(dealerToDelete);
      
      if (response.success) {
        // Remove from local state
        setDealers(prevDealers => prevDealers.filter(dealer => dealer.id !== dealerToDelete));
        toast.success('Dealer deleted successfully');
      } else {
        console.error('Error deleting dealer:', response.error);
        toast.error('Failed to delete dealer');
      }
    } catch (error) {
      console.error('Error deleting dealer:', error);
      toast.error('Failed to delete dealer');
    } finally {
      setDeleteDialogOpen(false);
      setDealerToDelete(null);
    }
  };

  const openDeleteDialog = (dealerId: string) => {
    setDealerToDelete(dealerId);
    setDeleteDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dealers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dealer Management</h1>
          <p className="text-gray-600 mt-1">Manage your jewelry suppliers and dealer network</p>
        </div>
        <Button 
          onClick={onAddDealer}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Icons.Plus className="w-4 h-4 mr-2" />
          Add New Dealer
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Icons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search dealers by name, company, location, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}
              >
                All ({dealers.length})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}  
                size="sm"
                onClick={() => setStatusFilter('active')}
                className={statusFilter === 'active' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}
              >
                Active ({dealers.filter(d => d.status === 'active').length})
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => setStatusFilter('inactive')}
                className={statusFilter === 'inactive' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}
              >
                Inactive ({dealers.filter(d => d.status === 'inactive').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dealers Grid */}
      {filteredDealers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icons.Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No dealers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first dealer'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={onAddDealer}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add First Dealer
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDealers.map((dealer) => (
            <Card key={dealer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Header with Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icons.User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{dealer.name}</h3>
                      <Badge className={`${getStatusColor(dealer.status)} text-xs border`}>
                        {dealer.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* WhatsApp Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWhatsAppChat(dealer)}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Icons.MessageCircle className="w-4 h-4" />
                    </Button>
                    
                    {/* 3-dot Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Icons.MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditDealer(dealer)}>
                          <Icons.Edit className="w-4 h-4 mr-2" />
                          Edit Dealer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusToggle(dealer.id, dealer.status)}
                        >
                          <Icons.Power className="w-4 h-4 mr-2" />
                          {dealer.status === 'active' ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(dealer.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Icons.Trash2 className="w-4 h-4 mr-2" />
                          Delete Dealer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Dealer Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icons.Building className="w-4 h-4" />
                    <span className="font-medium">{dealer.company}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icons.Phone className="w-4 h-4" />
                    <span>{dealer.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icons.MapPin className="w-4 h-4" />
                    <span>{dealer.location}</span>
                  </div>

                  {dealer.specialization && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Specialization:</span>
                      <p className="text-sm font-medium text-gray-900">{dealer.specialization}</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Added on {new Date(dealer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the dealer
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDealer}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Dealer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}