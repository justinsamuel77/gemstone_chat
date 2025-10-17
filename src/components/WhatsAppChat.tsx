import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Search,
  Star,
  Archive,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useDataManager } from './DataManager';

interface Contact {
  id: string;
  recipient_name: string;
  recipient_number: number;
  message_history: {
    time: string;
    type: string;
    message: string;
    images: string[] | undefined;
  }[]
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isFromMe: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'document' | 'audio';
}
interface WhatsAppChatProps {
  onBack: () => void;
  selectedContactInfo?: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
}

export function WhatsAppChat({ onBack, selectedContactInfo }: WhatsAppChatProps) {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const BASE_URL = 'https://gemstone-chat1.vercel.app'
  const [images, set_images] = useState<string[]>([]);
  const { whatappmessage, sendWhatsappMessage, isLoading } = useDataManager();
  console.log('Whatsapp messages', whatappmessage)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [reply_message, setreplyMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, selectedContact?.message_history]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSendMessage = async ({
    phone_no,
    imagesOverride,
  }: {
    phone_no: string;
    imagesOverride?: string[]; // optional image data if passed directly
  }) => {
    if ((!reply_message.trim() && !imagesOverride?.length) || !selectedContact) return;
      setLoading(true);

    const imagesToSend = imagesOverride
      ? imagesOverride
      : await Promise.all(
        images.map(async (url) => {
          const blob = await fetch(url).then((res) => res.blob());
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          return base64;
        })
      );

    try {
      const Message = {
        phone_no,
        message: reply_message || "", // handle empty message
        images: imagesToSend,
      };

      const result = await sendWhatsappMessage(Message);

      if (result.success) {
        setSelectedContact((preVal) => {
          if (!preVal) return preVal;

          const updatedHistory = Array.isArray(preVal.message_history)
            ? [...preVal.message_history]
            : [];

          updatedHistory.push({
            type: "Sent",
            message: reply_message || "", // may be empty for image-only
            images: result.data.savedPaths,
            time: new Date().toISOString(),
          });

          return {
            ...preVal,
            message_history: updatedHistory,
          };
        });

        // Reset states
        setreplyMessage("");
        set_images([]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (isoString: string): string => {
    const timestamp = new Date(isoString);
    const now = new Date();

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    const isYesterday = (d: Date, reference: Date) => {
      const yesterday = new Date(reference);
      yesterday.setDate(reference.getDate() - 1);
      return isSameDay(d, yesterday);
    };

    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (isSameDay(timestamp, now)) {
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      return `${hours}h ago`;
    }

    if (isYesterday(timestamp, now)) {
      return 'Yesterday';
    }

    const day = timestamp.getDate().toString().padStart(2, '0');
    const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files) {
  //     const newImages = Array.from(e.target.files).map((file) =>
  //       URL.createObjectURL(file)
  //     );
  //     set_images((prevImages) => [...prevImages, ...newImages]);
  //   }
  // };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && selectedContact) {
      const newImages = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file)
      );

      // 1. Update the preview
      set_images((prevImages) => [...prevImages, ...newImages]);

      // 2. Wait for state update before sending
      setTimeout(async () => {
        try {
          // Convert images to Base64 for sending
          const imagesBase64 = await Promise.all(
            newImages.map(async (url) => {
              const blob = await fetch(url).then((res) => res.blob());
              const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
              return base64;
            })
          );
          console.log(imagesBase64, 'imagesBase64imagesBase64')

          // 3. Send message using the existing send function
          await handleSendMessage({
            phone_no: String(selectedContact.recipient_number),
            imagesOverride: imagesBase64, // 👈 we’ll handle this param in handleSendMessage
          });
        } catch (error) {
          console.error("Error auto-sending image:", error);
        }
      }, 100); // slight delay ensures state is ready
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    set_images((prevImages) =>
      prevImages.filter((image) => image !== imageUrl)
    );
    URL.revokeObjectURL(imageUrl);
  };

  console.log('images are', `${BASE_URL}`)

  return (
    <div className="h-screen flex bg-[#f0f2f5]">
      {/* Sidebar - Contacts List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#00a884] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/10 p-2 h-auto"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-medium">WhatsApp Business</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2 h-auto">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>New Group</DropdownMenuItem>
                <DropdownMenuItem>New Broadcast</DropdownMenuItem>
                <DropdownMenuItem>Starred Messages</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-100 border-0 rounded-lg"
            />
          </div>
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1">
          <div className="space-y-0">
            {whatappmessage.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedContact?.id === contact.id ? 'bg-[#f0f2f5]' : ''
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      {/* <AvatarImage src={contact.avatar} /> */}
                      <AvatarFallback className="bg-[#00a884] text-white">
                        {getInitials(contact.recipient_name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* {contact.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00a884] rounded-full border-2 border-white" />
                    )} */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{contact.recipient_number}</h3>
                      <span className="text-xs text-gray-500">
                        {formatLastSeen(contact.message_history[contact.message_history.length - 1].time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-600 text-sm truncate">
                        {contact.message_history[contact.message_history.length - 1].message}
                      </p>
                      {/* {contact.unreadCount > 0 && (
                        <Badge className="bg-[#00a884] text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                          {contact.unreadCount}
                        </Badge>
                      )} */}
                    </div>
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
            <div className="p-4 bg-[#f0f2f5] border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedContact?.avatar} />
                      <AvatarFallback className="bg-[#00a884] text-white">
                        {getInitials(selectedContact.recipient_name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* {selectedContact.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00a884] rounded-full border-2 border-white" />
                    )} */}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedContact.recipient_name}</h3>
                    {/* <p className="text-sm text-gray-600">
                      {selectedContact.isOnline ? 'Online' : `Last seen ${selectedContact.lastSeen}`}
                    </p> */}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-200 p-2 h-auto">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-200 p-2 h-auto">
                    <Phone className="w-5 h-5" />
                  </Button> */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-200 p-2 h-auto">
                        {/* <MoreVertical className="w-5 h-5" /> */}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="w-4 h-4 mr-2" />
                        Star Contact
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive Chat
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 p-4 overflow-y-auto"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#efeae2'
              }}
            >
              <div className="space-y-4">
                {selectedContact?.message_history?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === "Received" ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${msg.type === "Received"
                        ? 'bg-white text-gray-900'
                        : 'bg-[#d9fdd3] text-gray-900'
                        }`}
                    >
                      {msg.images && msg.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {msg.images.map((img, i) => (
                            <img
                              key={i}
                              src={`${BASE_URL}${img}`}
                              alt={`attachment-${i}`}
                              className="w-24 h-24 object-cover rounded-md border"
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <span className="text-xs text-gray-500">
                          {formatLastSeen(msg.time)}
                        </span>
                        {/* {msg.type=== "Received" && getMessageStatusIcon(msg.status)} */}
                      </div>
                    </div>
                  </div>
                ))}

                {(images && images.length > 0) && (
                  <div className="flex overflow-x-auto space-x-4 p-4 scrollbar-thin scrollbar-thumb-gray-400 h-32 border border-black">
                    {images.map((image, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        <img
                          src={image}
                          alt={`Uploaded ${index}`}
                          className="w-24 h-24 object-center rounded-md border p-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image)}
                          className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full text-sm w-6 h-6 flex justify-center items-center shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {loading && (
                          <div className="absolute inset-0 bg-black/40 flex justify-center items-center rounded-md">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm max-w-xs">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">typing...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-[#f0f2f5] border-t border-gray-200">
              <div className="flex items-center gap-2">
                {/* <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-gray-200 p-2 h-auto"
                >
                  <Smile className="w-5 h-5" />
                </Button> */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".png,.jpg"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFileClick}
                  className="text-gray-600 hover:bg-gray-200 p-2 h-auto"
                  style={{ cursor: "pointer" }}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message"
                    value={reply_message}
                    onChange={(e) => setreplyMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage({ phone_no: String(selectedContact.recipient_number) })}
                    className="pr-12 rounded-full border-gray-300 bg-white"
                  />
                </div>
                {reply_message.trim() &&
                  <Button
                    disabled={loading}
                    onClick={() => handleSendMessage({ phone_no: String(selectedContact.recipient_number) })}
                    className="disabled:opacity-45 disabled:cursor-not-allowed bg-[#00a884] hover:bg-[#008f72] text-white rounded-full p-2 h-auto w-auto border border-black"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                  // <Button
                  //   variant="ghost"
                  //   size="sm"
                  //   className="text-gray-600 hover:bg-gray-200 p-2 h-auto"
                  // >
                  //   <Mic className="w-5 h-5" />
                  // </Button>
                }
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
            <div className="text-center">
              <div className="w-24 h-24 bg-[#00a884] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">WhatsApp Business</h3>
              <p className="text-gray-600">Select a conversation to start messaging your customers</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}