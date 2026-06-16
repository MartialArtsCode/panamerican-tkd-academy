import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import MemberCard from '../components/members/MemberCard';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Loader2, Filter } from 'lucide-react';

export default function Members() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [beltFilter, setBeltFilter] = useState('all');

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.User.list('full_name'),
  });

  const filteredMembers = members.filter(member => {
    const searchMatch = !searchQuery || 
      member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const tierMatch = tierFilter === 'all' || member.tier === tierFilter;
    const beltMatch = beltFilter === 'all' || member.belt === beltFilter;
    
    return searchMatch && tierMatch && beltMatch;
  });

  // Group by tier for display
  const masters = filteredMembers.filter(m => m.tier === 'master');
  const instructors = filteredMembers.filter(m => m.tier === 'instructor');
  const students = filteredMembers.filter(m => m.tier === 'student' || !m.tier);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl">
          <Users className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dojang Members</h1>
          <p className="text-sm text-gray-500">{members.length} members in your academy</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="pl-10 bg-white"
          />
        </div>
        
        <Tabs value={tierFilter} onValueChange={setTierFilter} className="w-full sm:w-auto">
          <TabsList className="bg-white border shadow-sm w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
            <TabsTrigger value="master" className="flex-1 sm:flex-none">🏆 Masters</TabsTrigger>
            <TabsTrigger value="instructor" className="flex-1 sm:flex-none">👊 Instructors</TabsTrigger>
            <TabsTrigger value="student" className="flex-1 sm:flex-none">🥋 Students</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={beltFilter} onValueChange={setBeltFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Belt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Belts</SelectItem>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="yellow">Yellow</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="orange_green_stripe">Orange Green Stripe</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="green_blue_stripe">Green Blue Stripe</SelectItem>
            <SelectItem value="blue">Blue</SelectItem>
            <SelectItem value="blue_red_stripe">Blue Red Stripe</SelectItem>
            <SelectItem value="black">Black</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-red-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Masters */}
          {tierFilter === 'all' && masters.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🏆</span> Masters
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {masters.map((member, index) => (
                  <MemberCard key={member.id} member={member} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Instructors */}
          {tierFilter === 'all' && instructors.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">👊</span> Instructors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {instructors.map((member, index) => (
                  <MemberCard key={member.id} member={member} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Students (or filtered results) */}
          {tierFilter === 'all' && students.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🥋</span> Students
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {students.map((member, index) => (
                  <MemberCard key={member.id} member={member} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Show all when filter applied */}
          {tierFilter !== 'all' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMembers.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} />
              ))}
            </div>
          )}
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No members found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
