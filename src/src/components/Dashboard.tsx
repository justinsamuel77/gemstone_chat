import React, { useState } from 'react';
import { Button } from './ui/button';
import { LeadsList } from './leads/LeadsList';
import { OrdersList } from './orders/OrdersList';

interface User {
  id: string;
  email: string;
  name: string;
  profile?: {
    firstName: string;
    lastName: string;
    company?: string;
    jobTitle?: string;
  };
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

type DashboardView = 'overview' | 'leads' | 'orders' | 'dealers' | 'settings';

export function Dashboard({ user, onLogout, onUserUpdate }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');

  const renderContent = () => {
    switch (currentView) {
      case 'leads':
        return <LeadsList />;
      case 'orders':
        return <OrdersList />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-4">Welcome back, {user.profile?.firstName || user.name}!</h2>
              <p className="text-muted-foreground">
                Here's what's happening with your jewelry business today.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg mb-2">Total Leads</h3>
                <p className="text-3xl text-primary">24</p>
                <p className="text-sm text-muted-foreground">+2 this week</p>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg mb-2">Active Orders</h3>
                <p className="text-3xl text-primary">12</p>
                <p className="text-sm text-muted-foreground">+3 this week</p>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg mb-2">Revenue</h3>
                <p className="text-3xl text-primary">$45,280</p>
                <p className="text-sm text-muted-foreground">+12% this month</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-sm">💎</span>
            </div>
            <div>
              <h1 className="text-lg">GEMSTONE</h1>
              <p className="text-xs text-muted-foreground">Fine Jewelry CRM</p>
            </div>
          </div>
          
          <div className="ml-auto">
            <Button variant="outline" onClick={onLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 min-h-screen border-r bg-card p-4">
          <div className="space-y-2">
            <NavButton
              active={currentView === 'overview'}
              onClick={() => setCurrentView('overview')}
            >
              📊 Overview
            </NavButton>
            <NavButton
              active={currentView === 'leads'}
              onClick={() => setCurrentView('leads')}
            >
              👥 Leads
            </NavButton>
            <NavButton
              active={currentView === 'orders'}
              onClick={() => setCurrentView('orders')}
            >
              📦 Orders
            </NavButton>
            <NavButton
              active={currentView === 'dealers'}
              onClick={() => setCurrentView('dealers')}
            >
              🏪 Dealers
            </NavButton>
            <NavButton
              active={currentView === 'settings'}
              onClick={() => setCurrentView('settings')}
            >
              ⚙️ Settings
            </NavButton>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function NavButton({ active, onClick, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      {children}
    </button>
  );
}