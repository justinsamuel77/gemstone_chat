import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';
import { leadsApi } from '../../lib/api';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  source?: string;
  created_at: string;
}

export function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No access token');

      const response = await leadsApi.getLeads(accessToken);
      setLeads(response.leads || []);
    } catch (error: any) {
      console.error('Failed to load leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Leads</h2>
          <p className="text-muted-foreground">Manage your potential customers</p>
        </div>
        <Button>
          Add Lead
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No leads found</p>
          <Button>Create your first lead</Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Phone</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Source</th>
                  <th className="text-left p-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">{lead.name}</td>
                    <td className="p-4">{lead.email || '-'}</td>
                    <td className="p-4">{lead.phone || '-'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">{lead.source || '-'}</td>
                    <td className="p-4">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}