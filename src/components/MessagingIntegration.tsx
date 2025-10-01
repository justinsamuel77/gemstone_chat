import React, { useEffect } from 'react';

export interface IncomingMessage {
  id: string;
  platform: 'whatsapp' | 'instagram';
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  phoneNumber?: string; // for WhatsApp
  instagramUsername?: string; // for Instagram
}

interface MessagingIntegrationProps {
  onNewMessage: (message: IncomingMessage) => void;
}

// Simulated incoming messages for demo
const simulatedMessages: IncomingMessage[] = [
  {
    id: 'wa_001',
    platform: 'whatsapp',
    senderId: '+91 98765 11111',
    senderName: 'Kavita Sharma',
    phoneNumber: '+91 98765 11111',
    message: 'Hi! I saw your jewelry collection on your website. I\'m interested in gold earrings for my wedding. Can you help me?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 'ig_001',
    platform: 'instagram',
    senderId: '@arun_designs',
    senderName: 'Arun Kumar',
    instagramUsername: '@arun_designs',
    message: 'Your diamond rings are stunning! Do you do custom engagement ring designs? I need something special for my proposal.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
  },
  {
    id: 'wa_002',
    platform: 'whatsapp',
    senderId: '+91 87654 22222',
    senderName: 'Priya Gupta',
    phoneNumber: '+91 87654 22222',
    message: 'Hello, I need a jewelry set for my daughter\'s wedding. What options do you have in traditional designs?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
  },
  {
    id: 'ig_002',
    platform: 'instagram',
    senderId: '@bride_to_be_2024',
    senderName: 'Meera Reddy',
    instagramUsername: '@bride_to_be_2024',
    message: 'I love your bridal collection! Can we schedule a consultation for next week? I\'m looking for a complete bridal set.',
    timestamp: new Date(Date.now() - 1000 * 60 * 90) // 1.5 hours ago
  }
];

export function MessagingIntegration({ onNewMessage }: MessagingIntegrationProps) {
  useEffect(() => {
    // Simulate receiving messages over time
    const messageIntervals: NodeJS.Timeout[] = [];

    // Send existing messages with delays
    simulatedMessages.forEach((message, index) => {
      const timeout = setTimeout(() => {
        onNewMessage(message);
      }, (index + 1) * 2000); // 2 seconds apart
      messageIntervals.push(timeout);
    });

    // Simulate new incoming messages periodically
    const newMessageInterval = setInterval(() => {
      const platforms: ('whatsapp' | 'instagram')[] = ['whatsapp', 'instagram'];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      
      const whatsappMessages = [
        'Hi, I need help selecting a necklace for my anniversary.',
        'Do you have any offers on gold jewelry this month?',
        'Can you show me some designs for wedding rings?',
        'I\'m interested in your diamond collection. Are you available for a call?'
      ];

      const instagramMessages = [
        'Your jewelry pieces are gorgeous! Do you ship nationwide?',
        'I saw your story about custom designs. Can we discuss a project?',
        'Love your work! Do you have any pieces under ₹50,000?',
        'Beautiful collection! I\'m interested in silver jewelry. Any recommendations?'
      ];

      const phoneNumbers = ['+91 98765 33333', '+91 87654 44444', '+91 76543 55555'];
      const instagramUsers = ['@jewelry_lover_2024', '@elegant_bride', '@fashion_enthusiast'];
      const names = ['Deepika Patel', 'Rajesh Kumar', 'Sneha Agarwal', 'Vikram Singh'];

      const randomMessage: IncomingMessage = {
        id: `${platform}_${Date.now()}`,
        platform,
        senderId: platform === 'whatsapp' 
          ? phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)]
          : instagramUsers[Math.floor(Math.random() * instagramUsers.length)],
        senderName: names[Math.floor(Math.random() * names.length)],
        message: platform === 'whatsapp' 
          ? whatsappMessages[Math.floor(Math.random() * whatsappMessages.length)]
          : instagramMessages[Math.floor(Math.random() * instagramMessages.length)],
        timestamp: new Date(),
        phoneNumber: platform === 'whatsapp' 
          ? phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)] 
          : undefined,
        instagramUsername: platform === 'instagram' 
          ? instagramUsers[Math.floor(Math.random() * instagramUsers.length)] 
          : undefined
      };

      onNewMessage(randomMessage);
    }, 60000); // Every minute

    return () => {
      messageIntervals.forEach(clearTimeout);
      clearInterval(newMessageInterval);
    };
  }, [onNewMessage]);

  return null; // This component doesn't render anything
}

// Utility functions for messaging integration
export const openWhatsAppChat = (phoneNumber: string) => {
  const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
  const whatsappUrl = `https://wa.me/${cleanNumber}`;
  window.open(whatsappUrl, '_blank');
};

export const openInstagramChat = (username: string) => {
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
  const instagramUrl = `https://instagram.com/direct/new/?username=${cleanUsername}`;
  window.open(instagramUrl, '_blank');
};