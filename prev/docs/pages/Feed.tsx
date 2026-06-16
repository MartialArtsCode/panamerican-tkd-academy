import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PostCard from '../components/feed/PostCard';
import CreatePost from '../components/feed/CreatePost';
import RequestForm from '../components/requests/RequestForm';
import EventCard from '../components/events/EventCard';
import { Loader2, Sparkles, Calendar } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function Feed() {
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('date'),
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }).slice(0, 3);

  // Sort posts: pinned first, then by date
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      if (!currentUser) return;
      const isLiked = post.likes?.includes(currentUser.email);
      const newLikes = isLiked 
        ? post.likes.filter(email => email !== currentUser.email)
        : [...(post.likes || []), currentUser.email];
      
      await base44.entities.Post.update(post.id, { likes: newLikes });
      
      // Create notification if it's a new like and not own post
      if (!isLiked && post.author_email !== currentUser.email) {
        await base44.entities.Notification.create({
          user_email: post.author_email,
          type: 'like',
          actor_email: currentUser.email,
          actor_name: currentUser.full_name,
          post_id: post.id,
          content: 'liked your post',
          read: false,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (postId) => base44.entities.Post.delete(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  const pinMutation = useMutation({
    mutationFn: ({ postId, isPinned }) => 
      base44.entities.Post.update(postId, { is_pinned: isPinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ event, attending }) => {
      const newAttendees = attending
        ? [...(event.attendees || []), currentUser?.email]
        : (event.attendees || []).filter(email => email !== currentUser?.email);
      return base44.entities.Event.update(event.id, { attendees: newAttendees });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Black Belt Background */}
      <div className="fixed inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800" 
          alt="Black Belt"
          className="w-full max-w-4xl object-contain"
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 pb-20 lg:pb-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dojang Feed</h1>
            <p className="text-xs sm:text-sm text-gray-500">Share with your Taekwondo family</p>
          </div>
          <RequestForm currentUser={currentUser} />
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  currentUser={currentUser}
                  onRSVP={(event, attending) => rsvpMutation.mutate({ event, attending })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Create Post */}
        <div className="mb-4 sm:mb-6">
          <CreatePost 
            currentUser={currentUser} 
            onPostCreated={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
          />
        </div>

        {/* Posts Feed */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-red-600 mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Loading posts...</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-5">
            <AnimatePresence>
              {sortedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={(post) => likeMutation.mutate(post)}
                  onDelete={(postId) => deleteMutation.mutate(postId)}
                  onPin={(postId, isPinned) => pinMutation.mutate({ postId, isPinned })}
                />
              ))}
            </AnimatePresence>
            
            {sortedPosts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🥋</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No posts yet</h3>
                <p className="text-gray-500">Be the first to share something with your dojang!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
