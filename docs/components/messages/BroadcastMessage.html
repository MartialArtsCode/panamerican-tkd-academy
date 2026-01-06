import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Send, Loader2, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function BroadcastMessage({ currentUser }) {
  const [showDialog, setShowDialog] = useState(false);
  const [broadcast, setBroadcast] = useState({
    title: '',
    content: '',
    target_group: 'all',
  });
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.User.filter({ tier: 'student' }),
  });

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => base44.entities.Broadcast.filter(
      { sender_email: currentUser.email },
      '-created_date',
      10
    ),
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: async (data) => {
      let recipients = students;
      if (data.target_group !== 'all') {
        recipients = students.filter(s => s.belt === data.target_group);
      }
      
      return base44.entities.Broadcast.create({
        ...data,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        recipient_emails: recipients.map(s => s.email),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      setShowDialog(false);
      setBroadcast({ title: '', content: '', target_group: 'all' });
    },
  });

  const beltLabels = {
    all: 'All Students',
    white: 'White Belt',
    yellow: 'Yellow Belt',
    orange: 'Orange Belt',
    orange_green_stripe: 'Orange-Green Stripe',
    green: 'Green Belt',
    green_blue_stripe: 'Green-Blue Stripe',
    blue: 'Blue Belt',
    blue_red_stripe: 'Blue-Red Stripe',
    black: 'Black Belt',
  };

  const getRecipientCount = (targetGroup) => {
    if (targetGroup === 'all') return students.length;
    return students.filter(s => s.belt === targetGroup).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-600" />
              Broadcast Messages
            </CardTitle>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-600 to-orange-700 gap-2">
                  <Send className="w-4 h-4" />
                  Send Broadcast
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Send Broadcast Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Message Title *</Label>
                    <Input
                      value={broadcast.title}
                      onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                      placeholder="e.g., Important Announcement"
                    />
                  </div>
                  <div>
                    <Label>Target Group *</Label>
                    <Select
                      value={broadcast.target_group}
                      onValueChange={(value) => setBroadcast({ ...broadcast, target_group: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students ({students.length})</SelectItem>
                        <SelectItem value="white">White Belt ({students.filter(s => s.belt === 'white').length})</SelectItem>
                        <SelectItem value="yellow">Yellow Belt ({students.filter(s => s.belt === 'yellow').length})</SelectItem>
                        <SelectItem value="orange">Orange Belt ({students.filter(s => s.belt === 'orange').length})</SelectItem>
                        <SelectItem value="orange_green_stripe">Orange-Green Stripe ({students.filter(s => s.belt === 'orange_green_stripe').length})</SelectItem>
                        <SelectItem value="green">Green Belt ({students.filter(s => s.belt === 'green').length})</SelectItem>
                        <SelectItem value="green_blue_stripe">Green-Blue Stripe ({students.filter(s => s.belt === 'green_blue_stripe').length})</SelectItem>
                        <SelectItem value="blue">Blue Belt ({students.filter(s => s.belt === 'blue').length})</SelectItem>
                        <SelectItem value="blue_red_stripe">Blue-Red Stripe ({students.filter(s => s.belt === 'blue_red_stripe').length})</SelectItem>
                        <SelectItem value="black">Black Belt ({students.filter(s => s.belt === 'black').length})</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Will be sent to {getRecipientCount(broadcast.target_group)} student(s)
                    </p>
                  </div>
                  <div>
                    <Label>Message Content *</Label>
                    <Textarea
                      value={broadcast.content}
                      onChange={(e) => setBroadcast({ ...broadcast, content: e.target.value })}
                      placeholder="Your message to students..."
                      rows={6}
                    />
                  </div>
                  <Button
                    onClick={() => sendBroadcastMutation.mutate(broadcast)}
                    disabled={!broadcast.title || !broadcast.content || sendBroadcastMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700"
                  >
                    {sendBroadcastMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Megaphone className="w-4 h-4 mr-2" />
                        Send to {getRecipientCount(broadcast.target_group)} Student(s)
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {broadcasts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No broadcasts sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((bc) => (
                <div key={bc.id} className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{bc.title}</h3>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                          {beltLabels[bc.target_group]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{bc.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{format(new Date(bc.created_date), 'MMM d, yyyy h:mm a')}</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {bc.recipient_emails?.length || 0} recipients
                        </span>
                        <span>
                          {bc.read_by?.length || 0} read
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
