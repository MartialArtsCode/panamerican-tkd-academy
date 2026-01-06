import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin, Megaphone, Trash2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CommentSection from './CommentSection';

const beltColors = {
  white: 'bg-gray-100 text-gray-800 border-gray-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  orange: 'bg-orange-100 text-orange-800 border-orange-400',
  orange_green_stripe: 'bg-gradient-to-r from-orange-100 to-green-100 text-orange-800 border-orange-400',
  green: 'bg-green-100 text-green-800 border-green-500',
  green_blue_stripe: 'bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-500',
  blue: 'bg-blue-100 text-blue-800 border-blue-500',
  blue_red_stripe: 'bg-gradient-to-r from-blue-100 to-red-100 text-blue-800 border-blue-500',
  black: 'bg-gray-900 text-white border-gray-700',
};

const tierIcons = {
  student: '🥋',
  instructor: '👊',
  master: '🏆',
};

export default function PostCard({ post, currentUser, onLike, onDelete, onPin }) {
  const [showComments, setShowComments] = useState(false);
  const isLiked = post.likes?.includes(currentUser?.email);
  const likesCount = post.likes?.length || 0;
  const canDelete = currentUser?.email === post.author_email || 
                    currentUser?.tier === 'master' || 
                    (currentUser?.tier === 'instructor' && post.author_tier === 'student');
  const canPin = currentUser?.tier === 'master' || currentUser?.tier === 'instructor';

  const formatBelt = (belt) => {
    if (!belt) return '';
    return belt.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className={`overflow-hidden ${post.is_pinned ? 'ring-2 ring-red-500' : ''} ${post.is_announcement ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-white'}`}>
        {(post.is_pinned || post.is_announcement) && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-1.5 flex items-center gap-2 text-white text-sm font-medium">
            {post.is_pinned && <Pin className="w-3.5 h-3.5" />}
            {post.is_announcement && <Megaphone className="w-3.5 h-3.5" />}
            {post.is_announcement ? 'Announcement' : 'Pinned Post'}
          </div>
        )}
        
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to={`${createPageUrl('Profile')}?email=${post.author_email}`}>
                <Avatar className="h-11 w-11 ring-2 ring-offset-2 ring-red-100 cursor-pointer hover:ring-red-200 transition-all">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author_name}`} />
                  <AvatarFallback>{post.author_name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link 
                    to={`${createPageUrl('Profile')}?email=${post.author_email}`}
                    className="font-semibold text-gray-900 hover:text-red-600 transition-colors"
                  >
                    {post.author_name}
                  </Link>
                  <span className="text-lg">{tierIcons[post.author_tier]}</span>
                  {post.author_belt && (
                    <Badge variant="outline" className={`text-xs border ${beltColors[post.author_belt]}`}>
                      {formatBelt(post.author_belt)}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {format(new Date(post.created_date), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
            </div>
            
            {(canDelete || canPin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canPin && (
                    <DropdownMenuItem onClick={() => onPin(post.id, !post.is_pinned)}>
                      <Pin className="w-4 h-4 mr-2" />
                      {post.is_pinned ? 'Unpin' : 'Pin'} Post
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Content */}
          <div className="mt-4">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            
            {post.image_url && (
              <div className="mt-4 rounded-xl overflow-hidden">
                <img 
                  src={post.image_url} 
                  alt="Post" 
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
            <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="hover:underline"
            >
              {post.comments_count || 0} comments
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
            <Button 
              variant="ghost" 
              className={`flex-1 gap-2 ${isLiked ? 'text-red-600 hover:text-red-700' : 'text-gray-600'}`}
              onClick={() => onLike(post)}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Like</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 gap-2 text-gray-600"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Comment</span>
            </Button>
            <Button variant="ghost" className="flex-1 gap-2 text-gray-600">
              <Share2 className="w-5 h-5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

          {/* Comments */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CommentSection postId={post.id} currentUser={currentUser} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
