import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Home, Calendar, Users, User, LogOut, Menu, X, 
  ChevronRight, Shield, MessageCircle, MessageSquare
} from 'lucide-react';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from 'framer-motion';

const tierStyles = {
  student: { label: 'Student', icon: '🥋', color: 'bg-blue-100 text-blue-800' },
  instructor: { label: 'Instructor', icon: '👊', color: 'bg-purple-100 text-purple-800' },
  master: { label: 'Master', icon: '🏆', color: 'bg-red-100 text-red-800' },
};

const navItems = [
  { name: 'Feed', page: 'Feed', icon: Home },
  { name: 'Events', page: 'Events', icon: Calendar },
  { name: 'Members', page: 'Members', icon: Users },
  { name: 'Forum', page: 'Forum', icon: MessageSquare },
  { name: 'Messages', page: 'Messages', icon: MessageCircle },
  { name: 'Profile', page: 'Profile', icon: User },
];

export default function Layout({ children, currentPageName }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const instructorNavItems = (currentUser?.tier === 'instructor' || currentUser?.tier === 'master') 
    ? [{ name: 'Instructor Tools', page: 'InstructorTools', icon: Shield }]
    : [];

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const tierStyle = tierStyles[currentUser?.tier] || tierStyles.student;

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-red-500">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 py-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-lg p-1.5">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694278324be725a921f7e597/c0114b23b_makeitallgolden.png" 
                alt="TKD Academy Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Panamerican Taekwondo Academy</h1>
              <p className="text-xs text-gray-500">Community Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col mt-6">
            <ul className="flex flex-1 flex-col gap-y-2">
              {[...navItems, ...instructorNavItems].map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <li key={item.name}>
                    <Link
                      to={createPageUrl(item.page)}
                      className={`group flex items-center gap-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`} />
                      {item.name}
                      {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
                    </Link>
                  </li>
                );
              })}
              
              {/* Admin Modal for Masters */}
              {currentUser?.tier === 'master' && (
                <li className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={createPageUrl('Admin')}
                    className="group flex items-center gap-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-gray-700 hover:bg-gray-100"
                  >
                    <Shield className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                    Admin Panel
                  </a>
                </li>
              )}
            </ul>
          </nav>

          {/* User Card */}
          {currentUser && (
            <div className="mt-auto">
              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-white">
                    <AvatarImage src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.full_name}`} />
                    <AvatarFallback>{currentUser.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{currentUser.full_name}</p>
                    <Badge className={`text-xs mt-1 ${tierStyle.color}`}>
                      {tierStyle.icon} {tierStyle.label}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full mt-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center p-1.5">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694278324be725a921f7e597/c0114b23b_makeitallgolden.png" 
              alt="TKD Academy Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-gray-900">Panamerican Taekwondo Academy</span>
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown currentUser={currentUser} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.full_name}`} />
                  <AvatarFallback>{currentUser?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="font-medium">{currentUser?.full_name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-bold text-lg">Menu</span>
                </div>
                <nav className="flex-1">
                  <ul className="space-y-2">
                    {[...navItems, ...instructorNavItems].map((item) => {
                      const isActive = currentPageName === item.page;
                      return (
                        <li key={item.name}>
                          <Link
                            to={createPageUrl(item.page)}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                    
                    {currentUser?.tier === 'master' && (
                      <li className="pt-4 mt-4 border-t">
                        <a
                          href={createPageUrl('Admin')}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-gray-700 hover:bg-gray-100"
                        >
                          <Shield className="w-5 h-5" />
                          Admin Panel
                        </a>
                      </li>
                    )}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="min-h-screen">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center h-16">
          {[...navItems, ...instructorNavItems].map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-red-600' : ''}`} />
                <span className="text-xs mt-1">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 w-12 h-0.5 bg-red-600 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}