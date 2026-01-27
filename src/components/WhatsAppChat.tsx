import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Search,
  X,
  Loader2,
  Play
} from 'lucide-react';
import { useDataManager } from './DataManager';

interface MediaPreview {
  url: string;
  type: 'image' | 'video';
  base64: string;
}

interface Contact {
  id: string;
  recipient_name: string;
  recipient_number: number;
  message_history: {
    time: string;
    type: 'Sent' | 'Received';
    message: string;
    images?: string[];
  }[];
}

interface WhatsAppChatProps {
  onBack: () => void;
}

export function WhatsAppChat({ onBack }: WhatsAppChatProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { whatappmessage, sendWhatsappMessage } = useDataManager();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [media, setMedia] = useState<MediaPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [activePreview, setActivePreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [selectedContact?.message_history, media]);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const formatLastMessageTime = (iso: string) => {
    if (!iso) return '';

    const date = new Date(iso);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (isYesterday) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-IN'); // dd/mm/yyyy
  };
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isVideo = (source: string) => source.includes('video') || source.startsWith('data:video');

  const filteredContacts = whatappmessage.filter(contact => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      contact.recipient_name.toLowerCase().includes(term) ||
      String(contact.recipient_number).includes(term) ||
      contact.message_history.some(m =>
        m.message?.toLowerCase().includes(term)
      )
    );
  });

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedContact) return;

    const files = Array.from(e.target.files);

    const previews: MediaPreview[] = await Promise.all(
      files.map(
        file =>
          new Promise<MediaPreview>(resolve => {
            const reader = new FileReader();
            reader.onloadend = () =>
              resolve({
                url: URL.createObjectURL(file),
                base64: reader.result as string,
                type: file.type.startsWith('video') ? 'video' : 'image'
              });
            reader.readAsDataURL(file);
          })
      )
    );

    setMedia(prev => [...prev, ...previews]);
  };

  const removeMedia = (index: number) => {
    setMedia(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSendMessage = async () => {
    if (!selectedContact) return;
    if (!replyMessage.trim() && media.length === 0) return;

    setLoading(true);

    try {
      const imagesPayload = media.map(m => m.base64);

      await sendWhatsappMessage({
        phone_no: String(selectedContact.recipient_number),
        message: replyMessage || '',
        images: imagesPayload
      });

      setSelectedContact(prev =>
        prev
          ? {
            ...prev,
            message_history: [
              ...prev.message_history,
              {
                type: 'Sent',
                message: replyMessage || '',
                images: imagesPayload,
                time: new Date().toISOString()
              }
            ]
          }
          : prev
      );

      setReplyMessage('');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#f0f2f5] relative overflow-hidden">

      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 bg-[#00a884] text-white flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-medium">WhatsApp Business</h1>
        </div>

        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search name, number or message"
              className="pl-10 bg-gray-100 border-0"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-3 cursor-pointer border-b hover:bg-gray-50 ${selectedContact?.id === contact.id && 'bg-gray-100'
                }`}
            >
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback className="bg-[#00a884] text-white">
                    {getInitials(contact.recipient_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium truncate">
                      {contact.recipient_name || contact.recipient_number}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatLastMessageTime(contact.message_history.at(-1)?.time || '')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {contact.message_history.at(-1)?.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 border-b bg-[#f0f2f5]">
              <h3 className="font-medium">{selectedContact.recipient_name}</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-[#efeae2]">
              {selectedContact.message_history.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.type === 'Received'
                    ? 'justify-start'
                    : 'justify-end'
                    } mb-2`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg max-w-sm shadow-sm ${msg.type === 'Received'
                      ? 'bg-white'
                      : 'bg-[#d9fdd3]'
                      }`}
                  >
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {msg.images.map((m, idx) => {
                          const videoType = isVideo(m);
                          return (
                            <div
                              key={idx}
                              className="relative cursor-pointer group overflow-hidden rounded-md border"
                              onClick={() => setActivePreview({ url: m, type: videoType ? 'video' : 'image' })}
                            >
                              {videoType ? (
                                <div className="relative w-32 h-32 flex items-center justify-center bg-black/5">
                                  <video src={m} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                    <Play className="fill-white text-white w-8 h-8 opacity-80" />
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={m}
                                  alt="Chat media"
                                  className="w-32 h-32 object-cover group-hover:scale-105 transition-transform"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {msg.message && <p className="text-sm mb-1">{msg.message}</p>}

                    <div className="flex justify-end">
                      <span className="text-[10px] text-gray-500 uppercase">
                        {formatTime(msg.time)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {media.length > 0 && (
              <div className="flex gap-3 p-3 bg-white border-t overflow-x-auto">
                {media.map((item, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        className="w-20 h-20 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="relative w-20 h-20 bg-gray-100 rounded-md border flex items-center justify-center">
                        <video src={item.url} className="w-full h-full object-cover rounded-md" />
                        <Play className="absolute w-6 h-6 text-white fill-white/50" />
                      </div>
                    )}

                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full text-white p-0.5 shadow-md hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border-t bg-[#f0f2f5] flex items-center gap-2">
              <input
                type="file"
                hidden
                multiple
                accept="image/*,video/*"
                ref={fileInputRef}
                onChange={handleFileInputChange}
              />

              <Button variant="ghost" size="icon" onClick={handleFileClick} disabled={loading}>
                <Paperclip className="w-5 h-5" />
              </Button>

              <Input
                placeholder="Type a message"
                className="bg-white border-none focus-visible:ring-[#00a884]"
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && handleSendMessage()}
              />

              <Button
                onClick={handleSendMessage}
                disabled={loading || (!replyMessage.trim() && media.length === 0)}
                className="bg-[#00a884] hover:bg-[#008f72] text-white"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] text-gray-500">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Send className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg">Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {activePreview && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 animate-in fade-in duration-200"
          onClick={() => setActivePreview(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setActivePreview(null)}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full h-full flex items-center justify-center p-4 md:p-12" onClick={e => e.stopPropagation()}>
            {activePreview.type === 'video' ? (
              <video
                src={activePreview.url}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg shadow-2xl"
              />
            ) : (
              <img
                src={activePreview.url}
                alt="Full size preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
