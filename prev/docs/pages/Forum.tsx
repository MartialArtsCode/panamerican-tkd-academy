import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, Plus, Pin, Eye, Loader2, Send
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function Forum() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [replyContent, setReplyContent] = useState('');
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'general',
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['forumThreads', selectedCategory],
    queryFn: () => {
      if (selectedCategory === 'all') {
        return base44.entities.ForumThread.list('-is_pinned', 50);
      }
      return base44.entities.ForumThread.filter({ category: selectedCategory }, '-is_pinned', 50);
    },
    enabled: !!currentUser,
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forumReplies', selectedThread?.id],
    queryFn: () => base44.entities.ForumReply.filter({ thread_id: selectedThread.id }, 'created_date'),
    enabled: !!selectedThread,
  });

  const createThreadMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumThread.create({
      ...data,
      author_email: currentUser.email,
      author_name: currentUser.full_name,
      author_tier: currentUser.tier,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumThreads'] });
      setShowNewThread(false);
      setNewThread({ title: '', content: '', category: 'general' });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async (content) => {
      const reply = await base44.entities.ForumReply.create({
        thread_id: selectedThread.id,
        content,
        author_email: currentUser.email,
        author_name: currentUser.full_name,
        author_tier: currentUser.tier,
      });
      await base44.entities.ForumThread.update(selectedThread.id, {
        replies_count: (selectedThread.replies_count || 0) + 1,
      });
      return reply;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumReplies'] });
      queryClient.invalidateQueries({ queryKey: ['forumThreads'] });
      setReplyContent('');
    },
  });

  const incrementViewsMutation = useMutation({
    mutationFn: (thread) => base44.entities.ForumThread.update(thread.id, {
      views_count: (thread.views_count || 0) + 1,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumThreads'] });
    },
  });

  const handleThreadClick = (thread) => {
    setSelectedThread(thread);
    incrementViewsMutation.mutate(thread);
  };

  const categoryLabels = {
    all: 'All Topics',
    general: 'General',
    techniques: 'Techniques',
    training: 'Training',
    events: 'Events',
    belt_tests: 'Belt Tests',
    questions: 'Questions',
  };

  const tierIcons = {
    student: '🥋',
    instructor: '👊',
    master: '🏆',
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
            <p className="text-sm text-gray-500">Discuss, share, and learn together</p>
          </div>
        </div>
        <Dialog open={showNewThread} onOpenChange={setShowNewThread}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Topic</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Topic</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  placeholder="What's on your mind?"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={newThread.category}
                  onValueChange={(value) => setNewThread({ ...newThread, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="techniques">Techniques</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="belt_tests">Belt Tests</SelectItem>
                    <SelectItem value="questions">Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content *</Label>
                <Textarea
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={6}
                />
              </div>
              <Button
                onClick={() => createThreadMutation.mutate(newThread)}
                disabled={!newThread.title || !newThread.content || createThreadMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-green-700"
              >
                {createThreadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Topic'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedThread ? (
        /* Thread View */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button
            variant="ghost"
            onClick={() => setSelectedThread(null)}
            className="mb-4"
          >
            ← Back to Forum
          </Button>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedThread.is_pinned && <Pin className="w-4 h-4 text-red-600" />}
                    <h2 className="text-2xl font-bold text-gray-900">{selectedThread.title}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{tierIcons[selectedThread.author_tier]} {selectedThread.author_name}</span>
                    <span>•</span>
                    <span>{format(new Date(selectedThread.created_date), 'MMM d, yyyy h:mm a')}</span>
                    <Badge variant="outline">{categoryLabels[selectedThread.category]}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {selectedThread.views_count || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {selectedThread.replies_count || 0}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedThread.content}</p>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-4 mb-6">
            {replies.map((reply) => (
              <Card key={reply.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{reply.author_name}</span>
                    <span>{tierIcons[reply.author_tier]}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(reply.created_date), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Form */}
          <Card>
            <CardContent className="p-4">
              <Label className="mb-2 block">Reply to this topic</Label>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="mb-3"
              />
              <Button
                onClick={() => createReplyMutation.mutate(replyContent)}
                disabled={!replyContent || createReplyMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-green-700"
              >
                {createReplyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Reply
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Threads List */
        <>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="techniques">Techniques</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="belt_tests">Belt Tests</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : threads.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No topics yet. Start a conversation!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {threads.map((thread, index) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleThreadClick(thread)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {thread.is_pinned && <Pin className="w-4 h-4 text-red-600" />}
                              <h3 className="font-semibold text-gray-900 hover:text-green-600">
                                {thread.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {categoryLabels[thread.category]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{tierIcons[thread.author_tier]} {thread.author_name}</span>
                              <span>•</span>
                              <span>{format(new Date(thread.created_date), 'MMM d')}</span>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {thread.replies_count || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {thread.views_count || 0}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
