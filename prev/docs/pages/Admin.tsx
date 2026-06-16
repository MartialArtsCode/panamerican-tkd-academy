import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Users, Award, Edit3, Trash2, Plus, 
  Loader2, Save, Search, AlertTriangle, Link2, Check, CalendarIcon
} from 'lucide-react';
import ClassScheduleManager from '../components/admin/ClassScheduleManager';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

const beltLabels = {
  white: 'White',
  yellow: 'Yellow',
  orange: 'Orange',
  orange_green_stripe: 'Orange-Green',
  green: 'Green',
  green_blue_stripe: 'Green-Blue',
  blue: 'Blue',
  blue_red_stripe: 'Blue-Red',
  red: 'Red',
  red_black_stripe: 'Red-Black',
  black: 'Black',
};

const tierLabels = {
  student: '🥋 Student',
  instructor: '👊 Instructor',
  master: '🏆 Master',
};

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [selectedUserForAchievement, setSelectedUserForAchievement] = useState(null);
  const [newAchievement, setNewAchievement] = useState({
    name: '',
    description: '',
    icon: '🏅',
    category: 'training',
  });
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [selectedMemberBadges, setSelectedMemberBadges] = useState(null);
  const [activeSection, setActiveSection] = useState('requests');
  const audioRef = React.useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
    
    // Initialize audio
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/impacts/karate_chop.ogg');
    audioRef.current.volume = 0.5;
  }, []);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['adminMembers'],
    queryFn: () => base44.entities.User.list('full_name'),
  });

  const { data: allAchievements = [] } = useQuery({
    queryKey: ['allAchievements'],
    queryFn: () => base44.entities.Achievement.list('-awarded_date'),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: () => base44.entities.Request.list('-created_date'),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: () => base44.entities.Event.list('-date'),
  });

  const { data: familyRelationships = [] } = useQuery({
    queryKey: ['familyRelationships'],
    queryFn: () => base44.entities.FamilyRelationship.list('-created_date'),
  });

  const [editingEvent, setEditingEvent] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showFamilyDialog, setShowFamilyDialog] = useState(false);
  const [newFamily, setNewFamily] = useState({
    parent_email: '',
    student_email: '',
    relationship: 'parent',
    student_belt: 'white',
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const canAccess = currentUser?.email === 'panamericantkd22@gmail.com';
  const isMaster = currentUser?.email === 'panamericantkd22@gmail.com';

  const filteredMembers = members.filter(member =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
      setEditingUser(null);
    },
  });

  const createAchievementMutation = useMutation({
    mutationFn: (data) => base44.entities.Achievement.create({
      ...data,
      user_email: selectedUserForAchievement.email,
      awarded_date: new Date().toISOString().split('T')[0],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAchievements'] });
      setShowAchievementDialog(false);
      setNewAchievement({ name: '', description: '', icon: '🏅', category: 'training' });
      setSelectedUserForAchievement(null);
    },
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: (id) => base44.entities.Achievement.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allAchievements'] }),
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ requestId, status, admin_notes }) => 
      base44.entities.Request.update(requestId, {
        status,
        admin_notes,
        resolved_by: currentUser.email,
        resolved_date: new Date().toISOString().split('T')[0],
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminRequests'] }),
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (userId) => base44.entities.User.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
      setShowRemoveMemberDialog(false);
      setMemberToRemove(null);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, data }) => base44.entities.Event.update(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      setShowEventDialog(false);
      setEditingEvent(null);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId) => base44.entities.Event.delete(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminEvents'] }),
  });

  const createFamilyMutation = useMutation({
    mutationFn: (data) => {
      const parent = members.find(m => m.email === data.parent_email);
      const student = members.find(m => m.email === data.student_email);
      return base44.entities.FamilyRelationship.create({
        ...data,
        parent_name: parent?.full_name,
        student_name: student?.full_name,
        student_belt: data.student_belt || student?.belt || 'white',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyRelationships'] });
      setShowFamilyDialog(false);
      setNewFamily({ parent_email: '', student_email: '', relationship: 'parent', student_belt: 'white' });
    },
  });

  const deleteFamilyMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyRelationship.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['familyRelationships'] }),
  });



  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 text-center">Only the administrator can access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl relative">
            <Shield className="w-6 h-6 text-purple-600" />
            {pendingRequests.length > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{pendingRequests.length}</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {pendingRequests.length > 0 
                ? `${pendingRequests.length} pending request${pendingRequests.length > 1 ? 's' : ''}`
                : 'Manage members and achievements'}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Select value={activeSection} onValueChange={setActiveSection}>
          <SelectTrigger className="w-full sm:w-64 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="requests">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Requests ({pendingRequests.length})</span>
              </div>
            </SelectItem>
            <SelectItem value="members">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Members</span>
              </div>
            </SelectItem>
            <SelectItem value="schedule">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Schedule</span>
              </div>
            </SelectItem>
            <SelectItem value="events">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Events</span>
              </div>
            </SelectItem>
            <SelectItem value="achievements">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Achievements</span>
              </div>
            </SelectItem>
            <SelectItem value="badges">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Student Badges</span>
              </div>
            </SelectItem>
            <SelectItem value="families">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                <span>Family Links</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

        {/* Requests Section */}
        {activeSection === 'requests' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">
                  Pending Requests ({pendingRequests.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div 
                    key={request.id}
                    className={`p-4 rounded-xl border-2 ${
                      request.status === 'pending' 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : request.status === 'accepted'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={
                            request.status === 'pending' ? 'default' :
                            request.status === 'accepted' ? 'success' : 'secondary'
                          }>
                            {request.status}
                          </Badge>
                          <Badge variant="outline">
                            {request.request_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{request.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span>From: <strong>{request.requester_name}</strong></span>
                          <span>•</span>
                          <span>{format(new Date(request.created_date), 'MMM d, yyyy')}</span>
                        </div>
                        {request.admin_notes && (
                          <div className="mt-2 p-2 bg-white rounded-md border">
                            <p className="text-xs text-gray-500 mb-1">Admin Notes:</p>
                            <p className="text-sm text-gray-700">{request.admin_notes}</p>
                          </div>
                        )}
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                Accept
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Accept Request</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                <p className="text-sm text-gray-600">
                                  You are about to accept the request: <strong>{request.title}</strong>
                                </p>
                                <div>
                                  <Label>Admin Notes (Optional)</Label>
                                  <Textarea
                                    id={`accept-notes-${request.id}`}
                                    placeholder="Add any notes for the requester..."
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    const notes = document.getElementById(`accept-notes-${request.id}`).value;
                                    updateRequestMutation.mutate({
                                      requestId: request.id,
                                      status: 'accepted',
                                      admin_notes: notes,
                                    });
                                  }}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  Confirm Accept
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                              >
                                Decline
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Decline Request</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                <p className="text-sm text-gray-600">
                                  You are about to decline the request: <strong>{request.title}</strong>
                                </p>
                                <div>
                                  <Label>Reason for Declining</Label>
                                  <Textarea
                                    id={`decline-notes-${request.id}`}
                                    placeholder="Explain why this request is being declined..."
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    const notes = document.getElementById(`decline-notes-${request.id}`).value;
                                    updateRequestMutation.mutate({
                                      requestId: request.id,
                                      status: 'declined',
                                      admin_notes: notes,
                                    });
                                  }}
                                  className="w-full bg-red-600 hover:bg-red-700"
                                >
                                  Confirm Decline
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {requests.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    No requests submitted yet
                  </div>
                )}
              </div>
              </CardContent>
              </Card>
              )}

              {/* Members Section */}
              {activeSection === 'members' && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <CardTitle className="text-lg sm:text-xl">Manage Members ({members.length})</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search members..."
                      className="pl-9"
                    />
                  </div>
                  <Button
                    onClick={() => setShowRemoveMemberDialog(true)}
                    className="bg-gradient-to-r from-red-600 to-red-700 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Member
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                  <Table className="min-w-[640px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Belt</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Badges</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.full_name}</TableCell>
                          <TableCell className="text-gray-500">{member.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {tierLabels[member.tier] || tierLabels.student}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {beltLabels[member.belt] || 'White'}
                              {member.belt === 'black' && member.dan_level && ` (${member.dan_level}${member.dan_level === 1 ? 'st' : member.dan_level === 2 ? 'nd' : member.dan_level === 3 ? 'rd' : 'th'} Dan)`}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.training_hours || 0}h</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedMemberBadges(member)}
                              className="text-xs"
                            >
                              {allAchievements.filter(a => a.user_email === member.email).length} badges
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingUser({ ...member })}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Member</DialogTitle>
                                  </DialogHeader>
                                  {editingUser && (
                                    <div className="space-y-4 pt-4">
                                      {isMaster && (
                                        <div>
                                          <Label>Tier</Label>
                                          <Select
                                            value={editingUser.tier || 'student'}
                                            onValueChange={(value) => setEditingUser({ ...editingUser, tier: value })}
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
                                      <div>
                                        <Label>Belt</Label>
                                        <Select
                                          value={editingUser.belt || 'white'}
                                          onValueChange={(value) => setEditingUser({ ...editingUser, belt: value })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="white">White</SelectItem>
                                            <SelectItem value="yellow">Yellow</SelectItem>
                                            <SelectItem value="orange">Orange</SelectItem>
                                            <SelectItem value="orange_green_stripe">Orange Green Stripe</SelectItem>
                                            <SelectItem value="green">Green</SelectItem>
                                            <SelectItem value="green_blue_stripe">Green Blue Stripe</SelectItem>
                                            <SelectItem value="blue">Blue</SelectItem>
                                            <SelectItem value="blue_red_stripe">Blue Red Stripe</SelectItem>
                                            <SelectItem value="red">Red</SelectItem>
                                            <SelectItem value="red_black_stripe">Red Black Stripe</SelectItem>
                                            <SelectItem value="black">Black</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      {editingUser.belt === 'black' && (
                                        <div>
                                          <Label>Dan Level</Label>
                                          <Select
                                            value={editingUser.dan_level?.toString() || '1'}
                                            onValueChange={(value) => setEditingUser({ ...editingUser, dan_level: parseInt(value) })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="1">1st Dan</SelectItem>
                                              <SelectItem value="2">2nd Dan</SelectItem>
                                              <SelectItem value="3">3rd Dan</SelectItem>
                                              <SelectItem value="4">4th Dan</SelectItem>
                                              <SelectItem value="5">5th Dan</SelectItem>
                                              <SelectItem value="6">6th Dan</SelectItem>
                                              <SelectItem value="7">7th Dan</SelectItem>
                                              <SelectItem value="8">8th Dan</SelectItem>
                                              <SelectItem value="9">9th Dan</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                      <div>
                                        <Label>Training Hours</Label>
                                        <Input
                                          type="number"
                                          value={editingUser.training_hours || 0}
                                          onChange={(e) => setEditingUser({ ...editingUser, training_hours: parseInt(e.target.value) || 0 })}
                                        />
                                      </div>
                                      <Button
                                        onClick={() => updateUserMutation.mutate({
                                          userId: editingUser.id,
                                          data: {
                                            tier: editingUser.tier,
                                            belt: editingUser.belt,
                                            dan_level: editingUser.belt === 'black' ? editingUser.dan_level : null,
                                            training_hours: editingUser.training_hours,
                                          }
                                        })}
                                        disabled={updateUserMutation.isPending}
                                        className="w-full bg-gradient-to-r from-red-600 to-red-700"
                                      >
                                        {updateUserMutation.isPending ? (
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
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUserForAchievement(member);
                                  setShowAchievementDialog(true);
                                }}
                              >
                                <Award className="w-4 h-4 text-yellow-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                )}
                </CardContent>
                </Card>
                )}

                {/* Schedule Section */}
                {activeSection === 'schedule' && (
          <ClassScheduleManager currentUser={currentUser} />
          )}

          {/* Events Section */}
          {activeSection === 'events' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Manage Events ({events.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="p-4 bg-gray-50 rounded-xl border">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        {event.image_url && (
                          <img src={event.image_url} alt={event.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                        )}
                        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline">{event.event_type}</Badge>
                          <span className="text-gray-500">
                            {format(new Date(event.date), 'MMM d, yyyy')} at {event.time}
                          </span>
                          {event.location && (
                            <span className="text-gray-500">📍 {event.location}</span>
                          )}
                          <span className="text-gray-500">
                            {event.attendees?.length || 0} attendees
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingEvent({ ...event });
                            setShowEventDialog(true);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEventMutation.mutate(event.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    No events scheduled yet
                  </div>
                )}
              </div>
              </CardContent>
              </Card>
              )}

              {/* Achievements Section */}
              {activeSection === 'achievements' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {allAchievements.slice(0, 20).map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">{achievement.icon || '🏅'}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{achievement.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          Awarded to <strong>{achievement.user_email}</strong>
                        </p>
                        {achievement.description && (
                          <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{achievement.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-xs text-gray-400">
                        {achievement.awarded_date && format(new Date(achievement.awarded_date), 'MMM d, yyyy')}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAchievementMutation.mutate(achievement.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {allAchievements.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    No achievements awarded yet
                  </div>
                )}
              </div>
              </CardContent>
              </Card>
              )}

              {/* Student Badges Section */}
              {activeSection === 'badges' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Student Badges Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {members.map((member) => {
                  const memberAchievements = allAchievements.filter(a => a.user_email === member.email);
                  return (
                    <div key={member.id} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center font-bold text-red-600">
                          {member.full_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{member.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {tierLabels[member.tier]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {beltLabels[member.belt]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {memberAchievements.length > 0 ? (
                          memberAchievements.slice(0, 6).map((achievement) => (
                            <div
                              key={achievement.id}
                              className="text-2xl hover:scale-110 transition-transform cursor-pointer"
                              title={achievement.name}
                            >
                              {achievement.icon || '🏅'}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">No badges yet</p>
                        )}
                        {memberAchievements.length > 6 && (
                          <div className="text-xs text-gray-500 flex items-center">
                            +{memberAchievements.length - 6} more
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUserForAchievement(member);
                          setShowAchievementDialog(true);
                        }}
                        className="w-full mt-3 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                      >
                        <Award className="w-3 h-3 mr-1" />
                        Award Badge
                      </Button>
                    </div>
                  );
                })}
              </div>
              {members.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  No members yet
                </div>
              )}
              </CardContent>
              </Card>
              )}

              {/* Family Links Section */}
              {activeSection === 'families' && (
              <Card>
              <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">Family Relationships ({familyRelationships.length})</CardTitle>
                <Button
                  onClick={() => setShowFamilyDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Link Family
                </Button>
              </div>
              </CardHeader>
              <CardContent>
              <div className="space-y-3">
                {(() => {
                  // Group by parent email
                  const grouped = familyRelationships.reduce((acc, family) => {
                    if (!acc[family.parent_email]) {
                      acc[family.parent_email] = {
                        parent_name: family.parent_name,
                        parent_email: family.parent_email,
                        students: []
                      };
                    }
                    acc[family.parent_email].students.push(family);
                    return acc;
                  }, {});

                  return Object.values(grouped).map((parentGroup) => (
                    <div key={parentGroup.parent_email} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                          <Link2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-2">
                            {parentGroup.parent_name || parentGroup.parent_email}
                          </p>
                          <div className="space-y-2">
                            {parentGroup.students.map((family) => (
                              <div key={family.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline">{family.relationship}</Badge>
                                  <span className="text-sm text-gray-700">
                                    {family.student_name || family.student_email}
                                  </span>
                                  <Badge className={beltLabels[family.student_belt] ? 'text-xs' : 'hidden'}>
                                    {beltLabels[family.student_belt] || 'White'} Belt
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteFamilyMutation.mutate(family.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
                {familyRelationships.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    No family relationships created yet
                  </div>
                )}
              </div>
              </CardContent>
              </Card>
              )}

      {/* Add Family Link Dialog */}
      <Dialog open={showFamilyDialog} onOpenChange={setShowFamilyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Family Relationship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Parent/Guardian</Label>
              <Select
                value={newFamily.parent_email}
                onValueChange={(value) => setNewFamily({ ...newFamily, parent_email: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.email}>
                      {member.full_name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Student (Child)</Label>
              <Input
                value={newFamily.student_email}
                onChange={(e) => setNewFamily({ ...newFamily, student_email: e.target.value })}
                placeholder="Type student name or select..."
                list="students-list"
              />
              <datalist id="students-list">
                {members.map((member) => (
                  <option key={member.id} value={member.email}>
                    {member.full_name}
                  </option>
                ))}
              </datalist>
            </div>
            <div>
              <Label>Relationship Type</Label>
              <Select
                value={newFamily.relationship}
                onValueChange={(value) => setNewFamily({ ...newFamily, relationship: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Student Belt Rank</Label>
              <Select
                value={newFamily.student_belt}
                onValueChange={(value) => setNewFamily({ ...newFamily, student_belt: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="orange_green_stripe">Orange-Green</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="green_blue_stripe">Green-Blue</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="blue_red_stripe">Blue-Red</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="red_black_stripe">Red-Black</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => createFamilyMutation.mutate(newFamily)}
              disabled={!newFamily.parent_email || !newFamily.student_email || createFamilyMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
            >
              {createFamilyMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Create Link
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Select Member to Remove</Label>
              <Select
                value={memberToRemove?.id || ''}
                onValueChange={(value) => {
                  const member = members.find(m => m.id === value);
                  setMemberToRemove(member);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {memberToRemove && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ Warning: This action cannot be undone
                </p>
                <p className="text-sm text-red-700">
                  You are about to permanently remove <strong>{memberToRemove.full_name}</strong> from the system.
                </p>
              </div>
            )}

            <Button
              onClick={() => deleteMemberMutation.mutate(memberToRemove.id)}
              disabled={!memberToRemove || deleteMemberMutation.isPending}
              className="w-full bg-gradient-to-r from-red-600 to-red-700"
            >
              {deleteMemberMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Member
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Member Badges Detail Dialog */}
      <Dialog open={!!selectedMemberBadges} onOpenChange={() => setSelectedMemberBadges(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMemberBadges?.full_name}'s Badges</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allAchievements
                .filter(a => a.user_email === selectedMemberBadges?.email)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
                  >
                    <div className="text-3xl mb-2">{achievement.icon || '🏅'}</div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">{achievement.name}</h4>
                    {achievement.description && (
                      <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                    )}
                    {achievement.awarded_date && (
                      <p className="text-xs text-gray-400">
                        {format(new Date(achievement.awarded_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                ))}
            </div>
            {allAchievements.filter(a => a.user_email === selectedMemberBadges?.email).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                No badges yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                />
              </div>
              <div>
                <Label>Event Type</Label>
                <Select
                  value={editingEvent.event_type}
                  onValueChange={(value) => setEditingEvent({ ...editingEvent, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="belt_test">Belt Test</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max Capacity</Label>
                <Input
                  type="number"
                  value={editingEvent.max_capacity}
                  onChange={(e) => setEditingEvent({ ...editingEvent, max_capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Event Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      setEditingEvent({ ...editingEvent, image_url: file_url });
                    }
                  }}
                />
                {editingEvent.image_url && (
                  <img src={editingEvent.image_url} alt="Event preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>
              <Button
                onClick={() => updateEventMutation.mutate({
                  eventId: editingEvent.id,
                  data: {
                    title: editingEvent.title,
                    description: editingEvent.description,
                    date: editingEvent.date,
                    time: editingEvent.time,
                    location: editingEvent.location,
                    event_type: editingEvent.event_type,
                    max_capacity: editingEvent.max_capacity,
                    image_url: editingEvent.image_url,
                  }
                })}
                disabled={updateEventMutation.isPending}
                className="w-full bg-gradient-to-r from-red-600 to-red-700"
              >
                {updateEventMutation.isPending ? (
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

      {/* Add Achievement Dialog */}
      <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Award Achievement to {selectedUserForAchievement?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Achievement Name</Label>
              <Input
                value={newAchievement.name}
                onChange={(e) => setNewAchievement({ ...newAchievement, name: e.target.value })}
                placeholder="e.g., First Tournament Win"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                placeholder="Describe the achievement..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <Select
                  value={newAchievement.icon}
                  onValueChange={(value) => setNewAchievement({ ...newAchievement, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="🏅">🏅 Medal</SelectItem>
                    <SelectItem value="🏆">🏆 Trophy</SelectItem>
                    <SelectItem value="⭐">⭐ Star</SelectItem>
                    <SelectItem value="🥇">🥇 Gold</SelectItem>
                    <SelectItem value="🥈">🥈 Silver</SelectItem>
                    <SelectItem value="🥉">🥉 Bronze</SelectItem>
                    <SelectItem value="🎯">🎯 Target</SelectItem>
                    <SelectItem value="💪">💪 Strength</SelectItem>
                    <SelectItem value="🔥">🔥 Fire</SelectItem>
                    <SelectItem value="⚡">⚡ Lightning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={newAchievement.category}
                  onValueChange={(value) => setNewAchievement({ ...newAchievement, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belt">Belt</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => createAchievementMutation.mutate(newAchievement)}
              disabled={!newAchievement.name || createAchievementMutation.isPending}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
            >
              {createAchievementMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Award Achievement
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
