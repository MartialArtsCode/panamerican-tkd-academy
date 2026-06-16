import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Edit3, Clock, Award, Calendar, Mail, Phone, 
  Loader2, Camera, Save, Trophy, Target, MessageCircle, X
} from 'lucide-react';
import { format } from 'date-fns';
import BeltProgress from '../components/ui/BeltProgress';
import PostCard from '../components/feed/PostCard';

const tierStyles = {
  student: { label: 'Student', icon: '🥋' },
  instructor: { label: 'Instructor', icon: '👊' },
  master: { label: 'Master', icon: '🏆' },
};

const beltLabels = {
  white: 'White Belt',
  yellow: 'Yellow Belt',
  orange: 'Orange Belt',
  orange_green_stripe: 'Orange Green Stripe',
  green: 'Green Belt',
  green_blue_stripe: 'Green Blue Stripe',
  blue: 'Blue Belt',
  blue_red_stripe: 'Blue Red Stripe',
  red: 'Red Belt',
  red_black_stripe: 'Red Black Stripe',
  black: 'Black Belt',
};

const getBeltBackgroundImage = (belt, tier, danLevel) => {
  if (!belt) belt = 'white';
  
  // Belt rank meanings and corresponding martial arts images
  const beltImages = {
    // White Belt - Beginning, Innocence, Birth of a seed, Purity of sunrise
    white: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1200&fit=crop',
    
    // Yellow Belt - Earth, First rays of sunlight, Growth begins, Seed about to be put on earth
    yellow: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&fit=crop',
    
    // Orange Belt - Fire, Spreading sunlight, Expanding knowledge
    orange: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&fit=crop',
    
    // Orange-Green Stripe - Transition, Balance between fire and growth
    orange_green_stripe: 'https://images.unsplash.com/photo-1555597408-26bc8e548a46?w=1200&fit=crop',
    
    // Green Belt - Growth, Plant growing strong, Technical foundation
    green: 'https://images.unsplash.com/photo-1562771242-a02d9090ebbf?w=1200&fit=crop',
    
    // Green-Blue Stripe - Progress, Reaching toward the sky
    green_blue_stripe: 'https://images.unsplash.com/photo-1562771242-a02d9090ebbf?w=1200&fit=crop',
    
    // Blue Belt - Sky, Plant reaching toward heaven, Refinement
    blue: 'https://images.unsplash.com/photo-1563199249-f0b1c5d5ee2c?w=1200&fit=crop',
    
    // Blue-Red Stripe - Rising power, Approaching mastery
    blue_red_stripe: 'https://images.unsplash.com/photo-1563199249-f0b1c5d5ee2c?w=1200&fit=crop',
    
    // Red Belt - Danger, Power, Caution and control
    red: 'https://images.unsplash.com/photo-1555597408-26bc8e548a46?w=1200&fit=crop&blend=DC2626&blend-mode=multiply',
    
    // Red-Black Stripe - Transition to mastery
    red_black_stripe: 'https://images.unsplash.com/photo-1555597408-26bc8e548a46?w=1200&fit=crop&blend=DC2626&blend-mode=multiply',
    
    // Black Belt - Mastery, Opposite of white, Full circle
    black: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&fit=crop',
  };
  
  // For higher Dan levels, use advanced martial arts imagery
  if (belt === 'black' && danLevel) {
    if (danLevel >= 7) {
      // 7th-9th Dan: Grand Master - Philosophy and wisdom
      return 'https://images.unsplash.com/photo-1510415842985-5d6f0f307f61?w=1200&fit=crop';
    } else if (danLevel >= 4) {
      // 4th-6th Dan: Master - Advanced technique and teaching
      return 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?w=1200&fit=crop';
    } else {
      // 1st-3rd Dan: Expert - Technical excellence
      return 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&fit=crop';
    }
  }
  
  return beltImages[belt] || beltImages.white;
};

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({});
  const [editingChild, setEditingChild] = useState(null);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const profileEmail = urlParams.get('email');

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: profileUsers = [], isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', profileEmail],
    queryFn: () => profileEmail 
      ? base44.entities.User.filter({ email: profileEmail })
      : base44.entities.User.filter({ email: currentUser?.email }),
    enabled: !!currentUser,
  });

  const profileUser = profileUsers[0] || (profileEmail ? null : currentUser);
  const isOwnProfile = !profileEmail || profileEmail === currentUser?.email;
  const canEditTier = currentUser?.tier === 'master';
  const canEditBelt = currentUser?.tier === 'master' || currentUser?.tier === 'instructor';

  const { data: userPosts = [] } = useQuery({
    queryKey: ['userPosts', profileUser?.email],
    queryFn: () => base44.entities.Post.filter(
      { author_email: profileUser?.email }, 
      '-created_date', 
      10
    ),
    enabled: !!profileUser?.email,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', profileUser?.email],
    queryFn: () => base44.entities.Achievement.filter(
      { user_email: profileUser?.email },
      '-awarded_date'
    ),
    enabled: !!profileUser?.email,
  });

  const { data: children = [] } = useQuery({
    queryKey: ['children', profileUser?.email],
    queryFn: () => base44.entities.FamilyRelationship.filter(
      { parent_email: profileUser?.email }
    ),
    enabled: !!profileUser?.email,
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (isOwnProfile) {
        return base44.auth.updateMe(data);
      } else {
        return base44.entities.User.update(profileUser.id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowEditDialog(false);
    },
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateMutation.mutate({ avatar_url: file_url });
  };

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      const isLiked = post.likes?.includes(currentUser?.email);
      const newLikes = isLiked 
        ? post.likes.filter(email => email !== currentUser?.email)
        : [...(post.likes || []), currentUser?.email];
      return base44.entities.Post.update(post.id, { likes: newLikes });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userPosts'] }),
  });

  const updateChildBeltMutation = useMutation({
    mutationFn: ({ childId, belt }) => base44.entities.FamilyRelationship.update(childId, { student_belt: belt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      setEditingChild(null);
    },
  });

  if (!currentUser || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
      </div>
    );
  }

  const tierStyle = tierStyles[profileUser.tier] || tierStyles.student;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 pb-20 lg:pb-8">
      {/* Profile Header */}
      <Card className="overflow-hidden mb-4 sm:mb-6">
        <div className="h-32 sm:h-40 relative overflow-hidden">
          <img 
            src={profileUser.banner_image_url || getBeltBackgroundImage(profileUser.belt, profileUser.tier, profileUser.dan_level)}
            alt="Belt Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20" />
          {isOwnProfile && (
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <label className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg cursor-pointer hover:bg-white transition-all hover:scale-105">
                <Camera className="w-5 h-5 text-gray-700" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    updateMutation.mutate({ banner_image_url: file_url });
                  }}
                />
              </label>
              {profileUser.banner_image_url && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full shadow-lg bg-white/95 backdrop-blur-sm hover:bg-white hover:scale-105 transition-all"
                  onClick={() => updateMutation.mutate({ banner_image_url: '' })}
                >
                  <X className="w-5 h-5 text-gray-700" />
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-12">
            <div className="relative">
              <Avatar className="h-28 w-28 ring-4 ring-white shadow-xl">
                <AvatarImage src={profileUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profileUser.full_name}`} />
                <AvatarFallback className="text-3xl bg-gray-100">
                  {profileUser.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              )}
            </div>
            
            <div className="flex-1 sm:pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{profileUser.full_name}</h1>
                <span className="text-2xl">{tierStyle.icon}</span>
              </div>
              <p className="text-gray-600">{tierStyle.label}</p>
            </div>

            <div className="flex gap-2">
              {!isOwnProfile && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.location.href = createPageUrl('Messages') + `?user=${profileUser.email}`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
              )}
              
              {(isOwnProfile || canEditTier || canEditBelt) && (
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => setEditData({
                        bio: profileUser.bio || '',
                        phone: profileUser.phone || '',
                        tier: profileUser.tier || 'student',
                        belt: profileUser.belt || 'white',
                        training_hours: profileUser.training_hours || 0,
                        banner_image_url: profileUser.banner_image_url || '',
                        show_contact_info: profileUser.show_contact_info || false,
                      })}
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        placeholder="Your phone number"
                      />
                    </div>
                    {isOwnProfile && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <Label className="font-medium">Show Contact Info</Label>
                          <p className="text-xs text-gray-500">Make your email and phone visible to others</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={editData.show_contact_info}
                          onChange={(e) => setEditData({ ...editData, show_contact_info: e.target.checked })}
                          className="h-4 w-4 text-red-600 rounded"
                        />
                      </div>
                    )}
                    {canEditTier && (
                      <div>
                        <Label>Tier</Label>
                        <Select
                          value={editData.tier}
                          onValueChange={(value) => setEditData({ ...editData, tier: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">🥋 Student</SelectItem>
                            <SelectItem value="instructor">👊 Instructor</SelectItem>
                            <SelectItem value="master">🏆 Master</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {canEditBelt && (
                      <div>
                        <Label>Belt</Label>
                        <Select
                          value={editData.belt}
                          onValueChange={(value) => setEditData({ ...editData, belt: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="white">White Belt</SelectItem>
                            <SelectItem value="yellow">Yellow Belt</SelectItem>
                            <SelectItem value="orange">Orange Belt</SelectItem>
                            <SelectItem value="orange_green_stripe">Orange Green Stripe</SelectItem>
                            <SelectItem value="green">Green Belt</SelectItem>
                            <SelectItem value="green_blue_stripe">Green Blue Stripe</SelectItem>
                            <SelectItem value="blue">Blue Belt</SelectItem>
                            <SelectItem value="blue_red_stripe">Blue Red Stripe</SelectItem>
                            <SelectItem value="red">Red Belt</SelectItem>
                            <SelectItem value="red_black_stripe">Red Black Stripe</SelectItem>
                            <SelectItem value="black">Black Belt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {canEditBelt && (
                      <div>
                        <Label>Training Hours</Label>
                        <Input
                          type="number"
                          value={editData.training_hours}
                          onChange={(e) => setEditData({ ...editData, training_hours: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                    <div>
                      <Label>Banner Image (Martial Artist Photo)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const { file_url } = await base44.integrations.Core.UploadFile({ file });
                            setEditData({ ...editData, banner_image_url: file_url });
                          }
                        }}
                      />
                      {editData.banner_image_url && (
                        <img src={editData.banner_image_url} alt="Banner preview" className="mt-2 w-full h-24 object-cover rounded-lg" />
                      )}
                    </div>
                    <Button
                      onClick={() => updateMutation.mutate(editData)}
                      disabled={updateMutation.isPending}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 gap-2"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Children Cards */}
      {children.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 px-1">Students</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {children.map((child) => {
              const beltColorMap = {
                white: 'bg-gray-200 text-gray-900',
                yellow: 'bg-yellow-400 text-gray-900',
                orange: 'bg-orange-600 text-white',
                orange_green_stripe: 'bg-gradient-to-r from-orange-600 to-green-600 text-white',
                green: 'bg-green-600 text-white',
                green_blue_stripe: 'bg-gradient-to-r from-green-600 to-blue-600 text-white',
                blue: 'bg-blue-600 text-white',
                blue_red_stripe: 'bg-gradient-to-r from-blue-600 to-red-600 text-white',
                red: 'bg-red-600 text-white',
                red_black_stripe: 'bg-gradient-to-r from-red-600 to-gray-900 text-white',
                black: 'bg-gray-900 text-white',
              };
              return (
                <Card key={child.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-blue-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${child.student_name || child.student_email}`} />
                        <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
                          {(child.student_name || child.student_email)?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {child.student_name || child.student_email}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {child.relationship}
                          </Badge>
                          <Badge className={`text-xs border-0 ${beltColorMap[child.student_belt] || 'bg-gray-200 text-gray-900'}`}>
                            {beltLabels[child.student_belt] || 'White'} Belt
                          </Badge>
                        </div>
                      </div>
                      {currentUser?.tier === 'master' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingChild(child)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card className="p-3 sm:p-4 text-center">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-blue-500 mb-1 sm:mb-2" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{profileUser.training_hours || 0}</p>
          <p className="text-xs sm:text-sm text-gray-500">Hours</p>
          </Card>
          <Card className="p-3 sm:p-4 text-center">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-yellow-500 mb-1 sm:mb-2" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{achievements.length}</p>
          <p className="text-xs sm:text-sm text-gray-500">Awards</p>
          </Card>
          <Card className="p-3 sm:p-4 text-center">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-green-500 mb-1 sm:mb-2" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{userPosts.length}</p>
          <p className="text-xs sm:text-sm text-gray-500">Posts</p>
          </Card>
          <Card className="p-3 sm:p-4 text-center">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-red-500 mb-1 sm:mb-2" />
          <p className="text-base sm:text-lg font-bold text-gray-900">{beltLabels[profileUser.belt]?.split(' ')[0] || 'White'}</p>
          <p className="text-xs sm:text-sm text-gray-500">Belt</p>
        </Card>
      </div>

      {/* Belt Progress */}
      <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
        <BeltProgress currentBelt={profileUser.belt || 'white'} danLevel={profileUser.dan_level} />
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="about">
        <TabsList className="w-full justify-start bg-white border mb-4 sm:mb-6">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileUser.bio && (
                <p className="text-gray-700">{profileUser.bio}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                {(profileUser.show_contact_info || isOwnProfile || currentUser?.tier === 'master') && (
                  <>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{profileUser.email}</span>
                    </div>
                    {profileUser.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{profileUser.phone}</span>
                      </div>
                    )}
                  </>
                )}
                {!profileUser.show_contact_info && !isOwnProfile && currentUser?.tier !== 'master' && (
                  <div className="flex items-center gap-3 text-gray-500">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm italic">Contact info hidden</span>
                  </div>
                )}
                {profileUser.join_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      Joined {format(new Date(profileUser.join_date), 'MMMM yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <div className="space-y-3 sm:space-y-5">
            {userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLike={(post) => likeMutation.mutate(post)}
                onDelete={() => {}}
                onPin={() => {}}
              />
            ))}
            {userPosts.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-500">No posts yet</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{achievement.icon || '🏅'}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                    {achievement.awarded_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(achievement.awarded_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {achievements.length === 0 && (
              <Card className="col-span-full p-12 text-center">
                <Award className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No achievements yet</p>
              </Card>
            )}
          </div>
        </TabsContent>
        </Tabs>

        {/* Edit Child Belt Dialog */}
        <Dialog open={!!editingChild} onOpenChange={() => setEditingChild(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student Belt Rank</DialogTitle>
          </DialogHeader>
          {editingChild && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${editingChild.student_name || editingChild.student_email}`} />
                  <AvatarFallback>
                    {(editingChild.student_name || editingChild.student_email)?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{editingChild.student_name || editingChild.student_email}</p>
                  <p className="text-sm text-gray-500">Current: {beltLabels[editingChild.student_belt] || 'White'} Belt</p>
                </div>
              </div>
              <div>
                <Label>Belt Rank</Label>
                <Select
                  value={editingChild.student_belt}
                  onValueChange={(value) => setEditingChild({ ...editingChild, student_belt: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White Belt</SelectItem>
                    <SelectItem value="yellow">Yellow Belt</SelectItem>
                    <SelectItem value="orange">Orange Belt</SelectItem>
                    <SelectItem value="orange_green_stripe">Orange Green Stripe</SelectItem>
                    <SelectItem value="green">Green Belt</SelectItem>
                    <SelectItem value="green_blue_stripe">Green Blue Stripe</SelectItem>
                    <SelectItem value="blue">Blue Belt</SelectItem>
                    <SelectItem value="blue_red_stripe">Blue Red Stripe</SelectItem>
                    <SelectItem value="red">Red Belt</SelectItem>
                    <SelectItem value="red_black_stripe">Red Black Stripe</SelectItem>
                    <SelectItem value="black">Black Belt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => updateChildBeltMutation.mutate({
                  childId: editingChild.id,
                  belt: editingChild.student_belt
                })}
                disabled={updateChildBeltMutation.isPending}
                className="w-full bg-gradient-to-r from-red-600 to-red-700"
              >
                {updateChildBeltMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
        </Dialog>
        </div>
        );
        }
