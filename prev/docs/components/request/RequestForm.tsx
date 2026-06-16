import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Send } from 'lucide-react';

export default function RequestForm({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    request_type: 'other',
    title: '',
    description: '',
  });
  const queryClient = useQueryClient();

  const createRequestMutation = useMutation({
    mutationFn: (data) => base44.entities.Request.create({
      ...data,
      requester_email: currentUser.email,
      requester_name: currentUser.full_name,
      status: 'pending',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      setFormData({ request_type: 'other', title: '', description: '' });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 gap-2">
          <Send className="w-4 h-4" />
          Submit Request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>Request Type</Label>
            <Select
              value={formData.request_type}
              onValueChange={(value) => setFormData({ ...formData, request_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="belt_promotion">Belt Promotion</SelectItem>
                <SelectItem value="event_registration">Event Registration</SelectItem>
                <SelectItem value="class_enrollment">Class Enrollment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of your request"
            />
          </div>
          <div>
            <Label>Details</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide more details about your request..."
              className="h-32"
            />
          </div>
          <Button
            onClick={() => createRequestMutation.mutate(formData)}
            disabled={!formData.title || createRequestMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
          >
            {createRequestMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
