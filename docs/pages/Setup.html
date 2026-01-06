import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Setup() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const handleSetupAdmin = async () => {
    setIsUpdating(true);
    
    // Update the current user to be Master Carlos Padilla
    await base44.auth.updateMe({
      tier: 'master',
      belt: 'black',
      bio: 'Master Instructor and Head of the Taekwondo Academy',
      training_hours: 5000,
      join_date: '2010-01-01'
    });

    // Also update the full_name if needed (note: full_name is a built-in field)
    // We need to update through entities since full_name is built-in
    const users = await base44.entities.User.filter({ email: currentUser.email });
    if (users.length > 0) {
      await base44.entities.User.update(users[0].id, {
        tier: 'master',
        belt: 'black',
        bio: 'Master Instructor and Head of the Taekwondo Academy',
        training_hours: 5000,
        join_date: '2010-01-01'
      });
    }
    
    setIsUpdating(false);
    setIsDone(true);
    
    // Redirect to profile after 2 seconds
    setTimeout(() => {
      window.location.href = createPageUrl('Profile');
    }, 2000);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card className="border-2 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl">
              <Settings className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Admin Setup</CardTitle>
          </div>
          <p className="text-gray-600">Configure your account as Master Administrator</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isDone ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Setup Complete!</h3>
              <p className="text-gray-600">You are now Master Carlos Padilla</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting to your profile...</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                <h3 className="font-semibold text-gray-900 mb-3">Current Account:</h3>
                <p className="text-gray-700">Email: {currentUser.email}</p>
                <p className="text-gray-700">Current Name: {currentUser.full_name}</p>
                <p className="text-gray-700">Current Tier: {currentUser.tier || 'student'}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-3">Will be updated to:</h3>
                <p className="text-gray-700">✓ Name: Master Carlos Padilla (update manually in profile)</p>
                <p className="text-gray-700">✓ Tier: Master 🏆</p>
                <p className="text-gray-700">✓ Belt: Black Belt</p>
                <p className="text-gray-700">✓ Training Hours: 5000h</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> The full name "Master Carlos Padilla" needs to be updated manually. 
                  After clicking setup, go to your Profile and click "Edit Profile" to change your display name.
                </p>
              </div>

              <Button
                onClick={handleSetupAdmin}
                disabled={isUpdating}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg py-6"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Settings className="w-5 h-5 mr-2" />
                    Setup Master Account
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
