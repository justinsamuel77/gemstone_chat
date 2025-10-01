import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  ArrowLeft,
  Send,
  Heart,
  Smile,
  Image as ImageIcon,
  Phone,
  Video,
  Info,
  Search,
  MoreHorizontal,
  MessageCircle,
  Camera,
  Mic,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface InstagramContact {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  isOnline: boolean;
  isVerified?: boolean;
  lastSeen?: string;
  unreadCount: number;
  lastMessage?: {
    text: string;
    timestamp: Date;
    isFromMe: boolean;
    type: 'text' | 'image' | 'story_reply' | 'like';
  };
}

interface InstagramMessage {
  id: string;
  text?: string;
  timestamp: Date;
  isFromMe: boolean;
  type: 'text' | 'image' | 'story_reply' | 'like' | 'voice';
  imageUrl?: string;
  liked?: boolean;
}

interface InstagramChatProps {
  onBack: () => void;
  selectedContactInfo?: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
}

export function InstagramChat({ onBack, selectedContactInfo }: InstagramChatProps) {
  const [selectedContact, setSelectedContact] = useState<InstagramContact | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<InstagramMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Instagram contacts
  const [contacts] = useState<InstagramContact[]>([
    {
      id: '1',
      username: 'priya_sharma_95',
      fullName: 'Priya Sharma',
      avatar: '',
      isOnline: true,
      isVerified: false,
      unreadCount: 3,
      lastMessage: {
        text: 'Love the diamond collection! 😍',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isFromMe: false,
        type: 'text'
      }
    },
    {
      id: '2',
      username: 'rohit.mehta.official',
      fullName: 'Rohit Mehta',
      avatar: '',
      isOnline: false,
      lastSeen: '1h',
      isVerified: true,
      unreadCount: 0,
      lastMessage: {
        text: 'Thanks for the quick response! 🙏',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isFromMe: false,
        type: 'text'
      }
    },
    {
      id: '3',
      username: 'anjali_designs',
      fullName: 'Anjali Patel',
      avatar: '',
      isOnline: true,
      unreadCount: 1,
      lastMessage: {
        text: '❤️',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isFromMe: false,
        type: 'like'
      }
    },
    {
      id: '4',
      username: 'kavya.shah.mumbai',
      fullName: 'Kavya Shah',
      avatar: '',
      isOnline: false,
      lastSeen: '2d',
      unreadCount: 0,
      lastMessage: {
        text: 'Can\'t wait to see the new collection!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isFromMe: false,
        type: 'text'
      }
    }
  ]);

  // Auto-select contact if provided
  useEffect(() => {
    if (selectedContactInfo) {
      // Check if the contact already exists in the list
      const existingContact = contacts.find(c => 
        c.id === selectedContactInfo.id || 
        c.username === selectedContactInfo.username
      );
      
      if (existingContact) {
        setSelectedContact(existingContact);
      } else {
        // Create a new contact from the provided info
        const newContact: InstagramContact = {
          id: selectedContactInfo.id,
          username: selectedContactInfo.username,
          fullName: selectedContactInfo.fullName,
          avatar: selectedContactInfo.avatar,
          isOnline: false,
          unreadCount: 0,
          lastMessage: {
            text: 'Start conversation',
            timestamp: new Date(),
            isFromMe: false,
            type: 'text'
          }
        };
        setSelectedContact(newContact);
      }
    }
  }, [selectedContactInfo, contacts]);

  // Mock Instagram messages
  useEffect(() => {
    if (selectedContact) {
      const mockMessages: InstagramMessage[] = [
        {
          id: '1',
          text: 'Hi! I saw your latest jewelry post on Instagram 💎',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isFromMe: false,
          type: 'text'
        },
        {
          id: '2',
          text: 'Hello! Thank you for reaching out. Which piece caught your eye?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
          isFromMe: true,
          type: 'text'
        },
        {
          id: '3',
          type: 'like',
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          isFromMe: false
        },
        {
          id: '4',
          text: 'The diamond earrings in your story! Are they still available? ✨',
          timestamp: new Date(Date.now() - 85 * 60 * 1000),
          isFromMe: false,
          type: 'text'
        },
        {
          id: '5',
          text: 'Yes, they are! Would you like to schedule a viewing? We\'re open until 8 PM today.',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          isFromMe: true,
          type: 'text'
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedContact]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedContact) return;

    const newMessage: InstagramMessage = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date(),
      isFromMe: true,
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate typing and response
    setTimeout(() => {
      setIsTyping(true);
    }, 2000);

    setTimeout(() => {
      setIsTyping(false);
      const responseMessage: InstagramMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! Let me check that for you. 😊',
        timestamp: new Date(),
        isFromMe: false,
        type: 'text'
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 4000);
  };

  const handleLikeMessage = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, liked: !msg.liked } : msg
      )
    );
  };

  const sendQuickLike = () => {
    if (!selectedContact) return;

    const likeMessage: InstagramMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      isFromMe: true,
      type: 'like'
    };

    setMessages(prev => [...prev, likeMessage]);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const formatLastMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar - Direct Messages */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 h-auto hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold">Direct</h1>
            </div>
            <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-gray-100">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-100 border-0 rounded-lg"
            />
          </div>
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1">
          <div className="space-y-0">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {getInitials(contact.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <h3 className="font-medium text-gray-900 truncate">{contact.username}</h3>
                        {contact.isVerified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {contact.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(contact.lastMessage.timestamp)}
                          </span>
                        )}
                        {contact.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center ml-1">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm truncate mt-1">
                      {contact.lastMessage?.type === 'like' ? '❤️' : contact.lastMessage?.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedContact.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                        {getInitials(selectedContact.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedContact.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-medium text-gray-900">{selectedContact.username}</h3>
                      {selectedContact.isVerified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedContact.isOnline ? 'Active now' : `Active ${selectedContact.lastSeen}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-gray-100">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-gray-100">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-gray-100">
                    <Info className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-white">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isFromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${msg.isFromMe ? 'order-2' : 'order-1'}`}>
                      {msg.type === 'like' ? (
                        <div className="text-6xl">❤️</div>
                      ) : (
                        <div
                          className={`px-4 py-2 rounded-2xl relative group ${
                            msg.isFromMe
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                          onDoubleClick={() => handleLikeMessage(msg.id)}
                        >
                          <p className="text-sm">{msg.text}</p>
                          {msg.liked && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <Heart className="w-2.5 h-2.5 text-white fill-current" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`mt-1 ${msg.isFromMe ? 'text-right' : 'text-left'}`}>
                        <span className="text-xs text-gray-500">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-2xl max-w-xs">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-auto hover:bg-gray-100"
                >
                  <Camera className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-auto hover:bg-gray-100"
                >
                  <Mic className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="rounded-full border-gray-300 pr-12 bg-gray-50"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto hover:bg-gray-200 rounded-full"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                {message.trim() ? (
                  <Button
                    onClick={handleSendMessage}
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 hover:bg-blue-50 p-2 h-auto font-medium"
                  >
                    Send
                  </Button>
                ) : (
                  <Button
                    onClick={sendQuickLike}
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto hover:bg-gray-100"
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h3>
              <p className="text-gray-600">Send private photos and messages to a friend or group</p>
              <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                Send Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}