import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';

export default function Messages() {
  const queryClient = useQueryClient();
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const targetUserEmail = urlParams.get('user');

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-updated_date', 50),
  });

  const myConversations = conversations.filter(c => c.participant_emails?.includes(currentUser?.email));

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConv?.id],
    queryFn: () => base44.entities.Message.filter({ conversation_id: selectedConv.id }, 'created_date', 200),
    enabled: !!selectedConv,
    refetchInterval: 5000,
  });

  // Auto-create conversation if coming from network page
  useEffect(() => {
    if (targetUserEmail && currentUser?.email && conversations.length >= 0) {
      const existing = myConversations.find(c =>
        c.participant_emails?.includes(targetUserEmail)
      );
      if (existing) {
        setSelectedConv(existing);
      }
    }
  }, [targetUserEmail, currentUser?.email, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      let conv = selectedConv;
      if (!conv && targetUserEmail) {
        conv = await base44.entities.Conversation.create({
          participant_emails: [currentUser.email, targetUserEmail],
          participant_names: [currentUser.full_name, targetUserEmail],
          last_message: content,
          last_message_at: new Date().toISOString(),
        });
        setSelectedConv(conv);
      }
      await base44.entities.Message.create({
        conversation_id: conv.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        content,
      });
      await base44.entities.Conversation.update(conv.id, {
        last_message: content,
        last_message_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConv?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
  });

  const getOtherName = (conv) => {
    if (!conv?.participant_emails || !currentUser) return 'Unknown';
    const idx = conv.participant_emails.indexOf(currentUser.email);
    return conv.participant_names?.[idx === 0 ? 1 : 0] || conv.participant_emails[idx === 0 ? 1 : 0] || 'Unknown';
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className={`w-full sm:w-80 border-r border-border flex flex-col ${selectedConv ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {myConversations.length === 0 ? (
            <div className="p-4">
              <p className="text-sm text-muted-foreground text-center">No conversations yet. Connect with someone first!</p>
            </div>
          ) : (
            myConversations.map(conv => {
              const otherName = getOtherName(conv);
              const isSelected = selectedConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${isSelected ? 'bg-muted' : ''}`}
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(otherName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{otherName}</p>
                    {conv.last_message && <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!selectedConv && !targetUserEmail ? 'hidden sm:flex' : 'flex'}`}>
        {!selectedConv && !targetUserEmail ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation or connect with someone to start messaging." />
          </div>
        ) : (
          <>
            <div className="p-3 border-b border-border flex items-center gap-3">
              <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setSelectedConv(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(selectedConv ? getOtherName(selectedConv) : targetUserEmail)}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium text-sm">{selectedConv ? getOtherName(selectedConv) : targetUserEmail}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => {
                const isMe = msg.sender_email === currentUser?.email;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {msg.created_date && format(new Date(msg.created_date), 'HH:mm')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-border">
              <form
                onSubmit={(e) => { e.preventDefault(); if (newMessage.trim()) sendMutation.mutate(newMessage.trim()); }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || sendMutation.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}