import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2, ArrowLeft, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BroadcastMessage from '../components/messages/BroadcastMessage';

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const startChatEmail = urlParams.get('user');

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_email: currentUser?.email }, '-created_date');
      const received = await base44.entities.Message.filter({ receiver_email: currentUser?.email }, '-created_date');
      return [...sent, ...received];
    },
    enabled: !!currentUser,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('full_name'),
    enabled: !!currentUser,
  });

  // Get unique conversations
  const conversations = React.useMemo(() => {
    const convMap = new Map();
    
    messages.forEach(msg => {
      const otherEmail = msg.sender_email === currentUser?.email 
        ? msg.receiver_email 
        : msg.sender_email;
      
      if (!convMap.has(otherEmail)) {
        const otherUser = allUsers.find(u => u.email === otherEmail);
        convMap.set(otherEmail, {
          email: otherEmail,
          name: otherUser?.full_name || otherEmail,
          avatar: otherUser?.avatar_url,
          lastMessage: msg.content,
          timestamp: msg.created_date,
          unread: msg.receiver_email === currentUser?.email && !msg.read,
        });
      }
    });
    
    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [messages, currentUser, allUsers]);

  // Auto-select conversation if coming from profile
  useEffect(() => {
    if (startChatEmail && allUsers.length > 0 && !selectedConversation) {
      const user = allUsers.find(u => u.email === startChatEmail);
      if (user) {
        setSelectedConversation({
          email: user.email,
          name: user.full_name,
          avatar: user.avatar_url,
        });
      }
    }
  }, [startChatEmail, allUsers, selectedConversation]);

  const conversationMessages = React.useMemo(() => {
    if (!selectedConversation) return [];
    return messages
      .filter(msg => 
        (msg.sender_email === currentUser?.email && msg.receiver_email === selectedConversation.email) ||
        (msg.receiver_email === currentUser?.email && msg.sender_email === selectedConversation.email)
      )
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [messages, selectedConversation, currentUser]);

  const sendMessageMutation = useMutation({
    mutationFn: (content) => base44.entities.Message.create({
      sender_email: currentUser?.email,
      receiver_email: selectedConversation.email,
      content,
      read: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setNewMessage('');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId) => base44.entities.Message.update(messageId, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (selectedConversation && conversationMessages.length > 0) {
      conversationMessages
        .filter(msg => msg.receiver_email === currentUser?.email && !msg.read)
        .forEach(msg => markAsReadMutation.mutate(msg.id));
    }
  }, [selectedConversation, conversationMessages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const canBroadcast = currentUser?.tier === 'instructor' || currentUser?.tier === 'master';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
          <MessageCircle className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">Chat with your dojang members</p>
        </div>
      </div>

      {canBroadcast ? (
        <Tabs defaultValue="messages">
          <TabsList className="bg-white border mb-6">
            <TabsTrigger value="messages" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Direct Messages
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="gap-2">
              <Megaphone className="w-4 h-4" />
              Broadcast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <Card className="overflow-hidden h-[calc(100vh-280px)] flex">
        {/* Conversations List */}
        <div className={`w-full sm:w-80 border-r border-gray-200 ${selectedConversation ? 'hidden sm:block' : ''}`}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Conversations</h3>
          </div>
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">Go to Members to start chatting</p>
              </div>
            ) : (
              <div>
                {conversations.map((conv) => (
                  <button
                    key={conv.email}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedConversation?.email === conv.email ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={conv.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conv.name}`} />
                      <AvatarFallback>{conv.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-gray-900 truncate">{conv.name}</p>
                        {conv.unread && (
                          <Badge className="bg-red-500 h-5 w-5 p-0 flex items-center justify-center rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(conv.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden sm:flex' : ''}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.name}`} />
                  <AvatarFallback>{selectedConversation.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{selectedConversation.name}</p>
                  <p className="text-xs text-gray-500">{selectedConversation.email}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {conversationMessages.map((msg, index) => {
                      const isSent = msg.sender_email === currentUser?.email;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isSent ? 'order-2' : ''}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isSent
                                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>
                            <p className={`text-xs text-gray-400 mt-1 ${isSent ? 'text-right' : ''}`}>
                              {format(new Date(msg.created_date), 'h:mm a')}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {conversationMessages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Start the conversation!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-r from-red-600 to-red-700"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </Card>
          </TabsContent>

          <TabsContent value="broadcast">
            <BroadcastMessage currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="overflow-hidden h-[calc(100vh-220px)] flex">
        {/* Conversations List */}
        <div className={`w-full sm:w-80 border-r border-gray-200 ${selectedConversation ? 'hidden sm:block' : ''}`}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Conversations</h3>
          </div>
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">Go to Members to start chatting</p>
              </div>
            ) : (
              <div>
                {conversations.map((conv) => (
                  <button
                    key={conv.email}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedConversation?.email === conv.email ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={conv.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conv.name}`} />
                      <AvatarFallback>{conv.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-gray-900 truncate">{conv.name}</p>
                        {conv.unread && (
                          <Badge className="bg-red-500 h-5 w-5 p-0 flex items-center justify-center rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(conv.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden sm:flex' : ''}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.name}`} />
                  <AvatarFallback>{selectedConversation.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{selectedConversation.name}</p>
                  <p className="text-xs text-gray-500">{selectedConversation.email}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {conversationMessages.map((msg, index) => {
                      const isSent = msg.sender_email === currentUser?.email;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isSent ? 'order-2' : ''}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isSent
                                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>
                            <p className={`text-xs text-gray-400 mt-1 ${isSent ? 'text-right' : ''}`}>
                              {format(new Date(msg.created_date), 'h:mm a')}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {conversationMessages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Start the conversation!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-r from-red-600 to-red-700"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
        </Card>
      )}
    </div>
  );
}
