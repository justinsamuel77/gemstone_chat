import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Icons } from "./ui/icons";
import { NotificationSystem } from "./NotificationSystem";

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

interface SidebarProps {
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  leads?: any[];
  orders?: any[];
  onNotificationClick?: (notification: any) => void;
}

export function Sidebar({
  user,
  onLogout,
  currentView,
  onNavigate,
  leads = [],
  orders = [],
  onNotificationClick,
}: SidebarProps) {
  const navigationItems = [
    { name: "Dashboard", icon: Icons.BarChart3, view: "dashboard" },
    {
      name: "Customer Leads",
      icon: Icons.Users,
      view: "leads",
      hasSubmenu: true,
      submenuItems: [
        { name: "All Leads", view: "leads" },
        { name: "Add Lead", view: "add-lead" },
      ],
    },
    {
      name: "Order Management",
      icon: Icons.ShoppingCart,
      view: "orders",
      hasSubmenu: true,
      submenuItems: [
        { name: "All Orders", view: "orders" },
        { name: "Add Order", view: "add-order" },
      ],
    },
    {
      name: "Inventory",
      icon: Icons.Gem,
      view: "inventory",
      hasSubmenu: true,
      submenuItems: [
        { name: "Gold Inventory", view: "inventory" },
        { name: "Add Gold", view: "add-inventory" },
        { name: "Transactions", view: "inventory-transactions" },
        { name: "Transfer to Dealer", view: "transfer-gold" },
      ],
    },
    {
      name: "Dealers",
      icon: Icons.Store,
      view: "dealers",
      hasSubmenu: true,
      submenuItems: [
        { name: "All Dealers", view: "dealers" },
        { name: "Add Dealer", view: "add-dealer" },
      ],
    },
    {
      name: "Employees",
      icon: Icons.Users,
      view: "employees",
      hasSubmenu: true,
      submenuItems: [
        { name: "All Employees", view: "employees" },
        { name: "Add Employee", view: "add-employee" },
      ],
    },
    { name: "Notification", icon: Icons.Bell, view: "notifications" },
    {
      name: "Chat",
      icon: Icons.MessageSquare,
      hasSubmenu: true,
      submenuItems: [
        { name: "WhatsApp", view: "whatsapp-chat" },
        { name: "Instagram", view: "instagram-chat" },
      ],
    },
    { name: "Profile", icon: Icons.User, view: "profile" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <img src="/whatsapp_images/madahvan_logo_1.jpg" alt="Logo" className="rounded-md" />
          </div>
          <span className="text-md font-semibold">
            MADHAVAN JEWELLERS
          </span>
        </div>
        {/* <p className="text-xs text-gray-400 mt-1">
          Fine Jewelry
        </p> */}
      </div>

      {/* User Greeting */}
      <div className="p-6 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback className="bg-gray-700 text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-medium truncate">
                Hello {user.profile?.firstName || user.name}!
              </h3>
              <p className="text-sm text-gray-400">
                Good Morning!
              </p>
            </div>
          </div>
          <div className="flex items-center flex-shrink-0">
            <NotificationSystem
              leads={leads}
              orders={orders}
              onNotificationClick={onNotificationClick}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navigationItems.map((item) => (
          <div key={item.name}>
            <button
              onClick={() =>
                item.view ? onNavigate(item.view) : undefined
              }
              className={`w-full flex items-center justify-between px-6 py-3 text-left hover:bg-gray-800 transition-colors ${currentView === item.view
                ? "border-r-4 border-[#C6E543] bg-gray-800/80"
                : ""
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm truncate">{item.name}</span>
              </div>
              {item.hasSubmenu && (
                <Icons.ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </button>
            {item.hasSubmenu &&
              item.submenuItems &&
              (currentView.startsWith(item.view || "") ||
                (item.view === "leads" &&
                  currentView.startsWith("leads")) ||
                (item.view === "orders" &&
                  currentView.startsWith("orders")) ||
                (item.view === "inventory" &&
                  (currentView.startsWith("inventory") ||
                    currentView.includes("stock") ||
                    currentView === "categories")) ||
                (item.view === "dealers" &&
                  currentView.startsWith("dealers")) ||
                (item.name === "Chat" &&
                  (currentView.includes("chat")))) && (
                <div className="bg-gray-800/50">
                  {item.submenuItems.map((subItem) => (
                    <button
                      key={subItem.name}
                      onClick={() => onNavigate(subItem.view)}
                      className={`w-full flex items-center px-12 py-2 text-left text-sm hover:bg-gray-700 transition-colors ${currentView === subItem.view
                        ? "text-[#C6E543] bg-gray-700 border-r-2 border-[#C6E543]"
                        : "text-gray-300"
                        }`}
                    >
                      <span className="truncate">{subItem.name}</span>
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800 flex-shrink-0">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Icons.LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="truncate">Logout</span>
        </Button>
      </div>
    </div>
  );
}