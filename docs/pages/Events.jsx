import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EventCard from '../components/events/EventCard';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Loader2, Filter, List, CalendarDays, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import CalendarView from '../components/events/CalendarView';

export default function Events() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const queryClient = useQueryClient();

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'training',
    date: '',
    time: '',
    location: '',
    max_capacity: '',
    required_belt: '',
    image_url: '',
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('date'),
  });

  const canCreate = currentUser?.tier === 'master' || currentUser?.tier === 'instructor';
  const canManage = currentUser?.tier === 'master';

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const timeMatch = filter === 'upcoming' 
      ? eventDate >= today 
      : filter === 'past' 
        ? eventDate < today 
        : true;
    
    const typeMatch = typeFilter === 'all' || event.event_type === typeFilter;
    
    return timeMatch && typeMatch;
  });

  const createMutation = useMutation({
    mutationFn: (eventData) => base44.entities.Event.create({
      ...eventData,
      attendees: [],
      max_capacity: eventData.max_capacity ? parseInt(eventData.max_capacity) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowCreateDialog(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        description: '',
        event_type: 'training',
        date: '',
        time: '',
        location: '',
        max_capacity: '',
        required_belt: '',
        image_url: '',
      });
    },
  });

  const handleSubmit = () => {
    if (editingEvent) {
      updateMutation.mutate({ eventId: editingEvent.id, data: newEvent });
    } else {
      createMutation.mutate(newEvent);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewEvent({ ...newEvent, image_url: file_url });
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploadingImage(false);
  };

  const rsvpMutation = useMutation({
    mutationFn: async ({ event, attending }) => {
      const newAttendees = attending
        ? [...(event.attendees || []), currentUser?.email]
        : (event.attendees || []).filter(email => email !== currentUser?.email);
      return base44.entities.Event.update(event.id, { attendees: newAttendees });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId) => base44.entities.Event.delete(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ eventId, data }) => base44.entities.Event.update(eventId, {
      ...data,
      max_capacity: data.max_capacity ? parseInt(data.max_capacity) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowCreateDialog(false);
    },
  });

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl">
            <Calendar className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Academy Events</h1>
            <p className="text-xs sm:text-sm text-gray-500">Trainings, tournaments & more</p>
          </div>
        </div>

        {canCreate && (
          <Dialog open={showCreateDialog} onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) {
              setEditingEvent(null);
              setNewEvent({
                title: '',
                description: '',
                event_type: 'training',
                date: '',
                time: '',
                location: '',
                max_capacity: '',
                required_belt: '',
                image_url: '',
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-600 to-red-700 gap-2 text-sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Event</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Type</Label>
                    <Select
                      value={newEvent.event_type}
                      onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
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
                    <Label>Required Belt</Label>
                    <Select
                      value={newEvent.required_belt}
                      onValueChange={(value) => setNewEvent({ ...newEvent, required_belt: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Any</SelectItem>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="black_1dan">Black 1st Dan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Event location"
                  />
                </div>
                <div>
                  <Label>Max Capacity (optional)</Label>
                  <Input
                    type="number"
                    value={newEvent.max_capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, max_capacity: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div>
                  <Label>Event Image (optional)</Label>
                  {newEvent.image_url ? (
                    <div className="relative">
                      <img 
                        src={newEvent.image_url} 
                        alt="Event preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setNewEvent({ ...newEvent, image_url: '' })}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-red-500 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Upload image</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!newEvent.title || !newEvent.date || createMutation.isPending || updateMutation.isPending}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    editingEvent ? 'Update Event' : 'Create Event'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming</TabsTrigger>
            <TabsTrigger value="past" className="text-xs sm:text-sm">Past</TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="tournament">Tournament</SelectItem>
            <SelectItem value="belt_test">Belt Test</SelectItem>
            <SelectItem value="seminar">Seminar</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>

        <div className="sm:ml-auto">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="bg-white border shadow-sm">
              <TabsTrigger value="list" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <List className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Events Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-red-600" />
        </div>
      ) : viewMode === 'calendar' ? (
        <CalendarView 
          events={filteredEvents} 
          onEventClick={(event) => {
            // Scroll to event in list or show details
            console.log('Event clicked:', event);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              currentUser={currentUser}
              onRSVP={(event, attending) => rsvpMutation.mutate({ event, attending })}
              canManage={canManage}
              onEdit={() => {
                setEditingEvent(event);
                setNewEvent({
                  title: event.title,
                  description: event.description,
                  event_type: event.event_type,
                  date: event.date,
                  time: event.time,
                  location: event.location,
                  max_capacity: event.max_capacity || '',
                  required_belt: event.required_belt || '',
                  image_url: event.image_url || '',
                });
                setShowCreateDialog(true);
              }}
              onDelete={(eventId) => deleteMutation.mutate(eventId)}
            />
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
              <p className="text-gray-500">
                {filter === 'upcoming' ? 'No upcoming events scheduled' : 'No events match your filters'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
