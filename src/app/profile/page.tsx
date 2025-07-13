'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Settings, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-dark to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-2xl font-display font-bold text-gradient mb-8">
            Profile Settings
          </h1>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-glass border border-border/50 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center space-x-6 mb-8">
              <div className="relative">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={80}
                    height={80}
                    className="rounded-2xl border-2 border-primary/30"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-background"></div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-display font-bold mb-1">
                  {user.displayName}
                </h2>
                <p className="text-foreground/70 font-body mb-2">
                  {user.email}
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-success/20 text-success font-body">
                  Active User
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground/70 font-body">Display Name</p>
                  <p className="font-body font-medium">{user.displayName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground/70 font-body">Email Address</p>
                  <p className="font-body font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground/70 font-body">Member Since</p>
                  <p className="font-body font-medium">
                    {user.metadata.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      }) 
                      : 'Recently'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground/70 font-body">Account Type</p>
                  <p className="font-body font-medium">Premium User</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-glass border border-border/50 rounded-2xl p-8 mb-8"
          >
            <h3 className="text-lg font-display font-semibold mb-6">
              App Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-body font-medium">Theme</h4>
                  <p className="text-sm text-foreground/70">Choose your preferred appearance</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-surface border border-border/50 rounded-lg font-body text-sm hover:border-primary/50 transition-all"
                >
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-body font-medium">Currency</h4>
                  <p className="text-sm text-foreground/70">Your preferred currency format</p>
                </div>
                <span className="px-4 py-2 bg-surface border border-border/50 rounded-lg font-body text-sm">
                  INR (₹)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-body font-medium">Notifications</h4>
                  <p className="text-sm text-foreground/70">Receive transaction alerts</p>
                </div>
                <span className="px-4 py-2 bg-success/20 text-success border border-success/30 rounded-lg font-body text-sm">
                  Enabled
                </span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-primary hover:bg-gradient-to-r hover:from-primary hover:to-accent text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 font-body glow hover:glow-accent"
            >
              Back to Dashboard
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={signOut}
              className="w-full bg-gradient-secondary hover:bg-gradient-to-r hover:from-secondary hover:to-error text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 font-body flex items-center justify-center space-x-2 glow-secondary hover:glow-secondary"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center">
        <p className="text-sm text-foreground/50 font-body">
          Made by David Porathur
        </p>
      </footer>
    </div>
  );
}