'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Home, 
  BarChart3, 
  CreditCard,
  Zap,
  Activity,
  FileText,
  Settings,
  Info
} from 'lucide-react';
import Image from 'next/image';
import { logUserAction, LOG_ACTIONS } from '@/lib/logging';

export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Transactions', icon: CreditCard, href: '/transactions' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Notes', icon: FileText, href: '/notes' },
    { label: 'About', icon: Info, href: '/about' },
  ];

  const handleNavigation = (href: string) => {
    if (user) {
      logUserAction(user.uid, 'navigation', LOG_ACTIONS.NAVIGATION.PAGE_VIEW, {
        page: href,
        timestamp: new Date().toISOString()
      });
    }
    router.push(href);
    setIsMenuOpen(false);
  };


  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-glass border-b border-border/50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Mobile Menu Button + Logo */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button - Hidden on mobile, visible on tablet */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hidden md:block lg:hidden p-2 rounded-lg backdrop-blur-glass border border-border/50 hover:border-primary/50 transition-all"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-primary" />
              )}
            </motion.button>

            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-display font-bold text-gradient">
                ExpenseTracker
              </span>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation(item.href)}
                className="flex items-center space-x-1 xl:space-x-2 text-foreground/70 hover:text-primary font-body transition-colors text-sm xl:text-base"
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden xl:block">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg backdrop-blur-glass border border-border/50 hover:border-primary/50 transition-all"
              >
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                )}
                <span className="hidden sm:block font-body text-sm">
                  {user?.displayName?.split(' ')[0]}
                </span>
              </motion.button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-surface-dark/95 backdrop-blur-xl border border-border/70 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-border/70">
                      <p className="font-body font-semibold text-sm">{user?.displayName}</p>
                      <p className="font-body text-xs text-foreground/70">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          router.push('/profile');
                        }}
                        className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-surface transition-colors text-left"
                      >
                        <User className="w-4 h-4" />
                        <span className="font-body text-sm">Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          router.push('/settings');
                        }}
                        className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-surface transition-colors text-left"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="font-body text-sm">Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          router.push('/activity');
                        }}
                        className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-surface transition-colors text-left"
                      >
                        <Activity className="w-4 h-4" />
                        <span className="font-body text-sm">Activity</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-surface transition-colors text-left text-error"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-body text-sm">Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Hidden on mobile, visible on tablet */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="hidden md:block lg:hidden mt-4 pt-4 border-t border-border/50"
            >
              <div className="space-y-2">
                {navItems.map((item) => (
                  <motion.button
                    key={item.href}
                    whileHover={{ x: 10 }}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-surface transition-colors text-left"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-body">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}