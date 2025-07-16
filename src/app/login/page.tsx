'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { logUserAction, LOG_ACTIONS } from '@/lib/logging';
import GoogleIcon from '@/components/GoogleIcon';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    // Log page view
    logUserAction('anonymous', 'navigation', LOG_ACTIONS.NAVIGATION.PAGE_VIEW, {
      page: 'login',
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleGoogleSignIn = async () => {
    console.log('Google sign-in initiated');
    await signInWithGoogle();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-glass rounded-2xl p-8 shadow-2xl border border-border/50">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center glow">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gradient mb-2">
              ExpenseTracker
            </h1>
            <p className="text-foreground/70 font-body">
             By 41vi4p
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6"
          >
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-gradient-primary hover:bg-gradient-to-r hover:from-primary hover:to-accent text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 group glow hover:glow-accent transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-body text-lg">
                {loading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>

            <div className="text-center">
              <p className="text-sm text-foreground/60 font-body">
                Secure authentication powered by Google
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-border/50"
          >
            <div className="text-center space-y-2">
              <p className="text-xs text-foreground/50 font-body">
                Features include:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-foreground/70">
                <div>• Real-time tracking</div>
                <div>• Smart categorization</div>
                <div>• Visual analytics</div>
                <div>• Secure cloud sync</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* About Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => router.push('/about')}
            className="inline-flex items-center space-x-2 text-sm text-foreground/60 hover:text-primary transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>About ExpenseTracker</span>
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}