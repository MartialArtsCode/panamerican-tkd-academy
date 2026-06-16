import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Image, Video, Send, Loader2, X, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreatePost({ currentUser, onPostCreated }) {
  const [content, setContent] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem('post_draft');
    if (draft) {
      const parsed = JSON.parse(draft);
      setContent(parsed.content || '');
      setImageUrl(parsed.imageUrl || '');
      setIsAnnouncement(parsed.isAnnouncement || false);
      setHasDraft(true);
      setExpanded(true);
    }
  }, []);

  const canAnnounce = currentUser?.tier === 'master' || currentUser?.tier === 'instructor';

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setIsUploading(false);
  };

  const saveDraft = () => {
    localStorage.setItem('post_draft', JSON.stringify({
      content,
      imageUrl,
      isAnnouncement,
    }));
    setHasDraft(true);
  };

  const clearDraft = () => {
    localStorage.removeItem('post_draft');
    setHasDraft(false);
    setContent('');
    setImageUrl('');
    setIsAnnouncement(false);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    await base44.entities.Post.create({
      content,
      image_url: imageUrl || undefined,
      author_name: currentUser?.full_name,
      author_email: currentUser?.email,
      author_tier: currentUser?.tier || 'student',
      author_belt: currentUser?.belt,
      is_announcement: isAnnouncement,
      likes: [],
      comments_count: 0,
    });
    
    // Check for automatic achievements
    const userPosts = await base44.entities.Post.filter({ author_email: currentUser?.email });
    const postCount = userPosts.length;
    const existingAchievements = await base44.entities.Achievement.filter({ user_email: currentUser?.email });
    const achievementNames = existingAchievements.map(a => a.name);
    
    // Award milestones
    if (postCount === 1 && !achievementNames.includes('First Post')) {
      await base44.entities.Achievement.create({
        name: 'First Post',
        description: 'Shared your first post with the dojang',
        icon: '🎉',
        category: 'community',
        user_email: currentUser?.email,
        awarded_date: new Date().toISOString().split('T')[0],
      });
    } else if (postCount === 5 && !achievementNames.includes('Active Member')) {
      await base44.entities.Achievement.create({
        name: 'Active Member',
        description: 'Shared 5 posts with the community',
        icon: '⭐',
        category: 'community',
        user_email: currentUser?.email,
        awarded_date: new Date().toISOString().split('T')[0],
      });
    } else if (postCount === 10 && !achievementNames.includes('Community Leader')) {
      await base44.entities.Achievement.create({
        name: 'Community Leader',
        description: 'Shared 10 posts with the community',
        icon: '🏆',
        category: 'community',
        user_email: currentUser?.email,
        awarded_date: new Date().toISOString().split('T')[0],
      });
    }
    
    localStorage.removeItem('post_draft');
    setContent('');
    setImageUrl('');
    setIsAnnouncement(false);
    setExpanded(false);
    setIsSubmitting(false);
    setHasDraft(false);
    onPostCreated?.();
  };

  return (
    <Card className="p-4 sm:p-5 bg-white shadow-sm">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-offset-1 ring-red-100 flex-shrink-0">
          <AvatarImage src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.full_name}`} />
          <AvatarFallback>{currentUser?.full_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="Share something with your dojang..."
            className={`resize-none border-gray-200 bg-gray-50 focus:bg-white transition-all ${expanded ? 'min-h-[100px]' : 'min-h-[50px]'}`}
          />
          
          <AnimatePresence>
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative mt-3 inline-block"
              >
                <img 
                  src={imageUrl} 
                  alt="Upload preview" 
                  className="h-24 w-24 object-cover rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-800 hover:bg-gray-700"
                  onClick={() => setImageUrl('')}
                >
                  <X className="w-3 h-3 text-white" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                    <Button variant="ghost" size="sm" className="gap-2 text-gray-600" asChild>
                      <span>
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Image className="w-4 h-4" />
                        )}
                        Photo
                      </span>
                    </Button>
                  </label>
                  
                  {canAnnounce && (
                    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                      <Switch
                        id="announcement"
                        checked={isAnnouncement}
                        onCheckedChange={setIsAnnouncement}
                      />
                      <Label htmlFor="announcement" className="text-sm text-gray-600 cursor-pointer">
                        Announcement
                      </Label>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={saveDraft}
                    disabled={!content.trim()}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save Draft</span>
                  </Button>

                  {hasDraft && (
                    <Button
                      onClick={clearDraft}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isSubmitting}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Post
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}
