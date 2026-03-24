import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, ClipboardCheck, MessageSquare, Target,
  Loader2, AlertTriangle
} from 'lucide-react';
import ClassScheduler from '../components/instructor/ClassScheduler';
import AttendanceTracker from '../components/instructor/AttendanceTracker';
import FeedbackForm from '../components/instructor/FeedbackForm';
import TrainingAssignment from '../components/instructor/TrainingAssignment';

export default function InstructorTools() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const canAccess = currentUser?.tier === 'instructor' || currentUser?.tier === 'master';

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
        <p className="text-gray-600 text-center">You need to be an instructor or master to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
          <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Instructor Tools</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage classes and students</p>
        </div>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="bg-white border mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="schedule" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <ClipboardCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Attend.</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Training</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <ClassScheduler currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTracker currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackForm currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="training">
          <TrainingAssignment currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
