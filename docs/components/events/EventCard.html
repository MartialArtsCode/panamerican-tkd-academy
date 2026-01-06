import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Award, Edit3, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const eventTypeStyles = {
  training: { bg: 'bg-blue-500', icon: '🥋' },
  tournament: { bg: 'bg-red-500', icon: '🏆' },
  belt_test: { bg: 'bg-orange-500', icon: '🎯' },
  seminar: { bg: 'bg-purple-500', icon: '📚' },
  social: { bg: 'bg-green-500', icon: '🎉' },
};

export default function EventCard({ event, currentUser, onRSVP, canManage, onEdit, onDelete }) {
  const isAttending = event.attendees?.includes(currentUser?.email);
  const attendeesCount = event.attendees?.length || 0;
  const spotsLeft = event.max_capacity ? event.max_capacity - attendeesCount : null;
  const isFull = event.max_capacity && attendeesCount >= event.max_capacity;
  const eventStyle = eventTypeStyles[event.event_type] || eventTypeStyles.training;

  const isPast = new Date(event.date) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
        {/* Header with event type */}
        <div className={`h-2 ${eventStyle.bg}`} />
        
        {/* Event Image */}
        {event.image_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}
        
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">{eventStyle.icon}</span>
                <Badge variant="secondary" className="text-xs capitalize">
                  {event.event_type?.replace('_', ' ')}
                </Badge>
                {event.required_belt && (
                  <Badge variant="outline" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    {event.required_belt.replace('_', ' ')} belt+
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-2">{event.title}</h3>
              {event.description && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{event.description}</p>
              )}
            </div>
            
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(event.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            
            {/* Date box */}
            <div className="flex-shrink-0 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3 text-center min-w-[70px]">
              <p className="text-xs font-medium text-red-600 uppercase">
                {format(new Date(event.date), 'MMM')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {format(new Date(event.date), 'd')}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-red-500" />
              {format(new Date(event.date), 'EEEE')}
            </div>
            {event.time && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-red-500" />
                {event.time}
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" />
                {event.location}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-red-500" />
              {attendeesCount} attending
              {spotsLeft !== null && spotsLeft > 0 && (
                <span className="text-orange-600">({spotsLeft} spots left)</span>
              )}
            </div>
          </div>

          {/* RSVP Button */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {isPast ? (
              <p className="text-sm text-gray-500 text-center">This event has ended</p>
            ) : (
              <Button
                onClick={() => onRSVP(event, !isAttending)}
                disabled={isFull && !isAttending}
                variant={isAttending ? 'outline' : 'default'}
                className={`w-full ${isAttending ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'}`}
              >
                {isAttending ? 'Cancel RSVP' : isFull ? 'Event Full' : 'RSVP Now'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
