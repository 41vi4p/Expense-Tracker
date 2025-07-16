'use client';

import { useEffect, useState, useCallback } from 'react';

// Force dynamic rendering to avoid Firebase initialization during build
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Activity, 
  LogIn, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  User, 
  Palette, 
  Navigation,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserActivityLogs, ActivityLog, logUserAction, LOG_ACTIONS } from '@/lib/logging';
import Header from '@/components/Header';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import BottomNavigation from '@/components/BottomNavigation';

const getActionIcon = (category: string, action: string) => {
  switch (category) {
    case 'auth':
      return action.includes('login') ? LogIn : LogOut;
    case 'transaction':
      if (action.includes('create')) return Plus;
      if (action.includes('update')) return Edit;
      if (action.includes('delete')) return Trash2;
      return Eye;
    case 'profile':
      return action.includes('theme') ? Palette : User;
    case 'navigation':
      return Navigation;
    case 'system':
      return AlertTriangle;
    default:
      return Activity;
  }
};

const getActionColor = (category: string) => {
  switch (category) {
    case 'auth':
      return 'text-success';
    case 'transaction':
      return 'text-primary';
    case 'profile':
      return 'text-accent';
    case 'navigation':
      return 'text-warning';
    case 'system':
      return 'text-error';
    default:
      return 'text-foreground/70';
  }
};

const getActionDescription = (log: ActivityLog) => {
  const { category, action, details } = log;
  
  switch (category) {
    case 'auth':
      if (action === 'login') return `Signed in via ${details.method || 'unknown'}`;
      if (action === 'logout') return 'Signed out';
      if (action === 'login_failed') return `Failed to sign in: ${details.error}`;
      if (action === 'session_restored') return 'Session restored';
      break;
    case 'transaction':
      if (action === 'create_transaction') return `Added ${details.type}: ${details.description} ($${details.amount})`;
      if (action === 'update_transaction') return `Updated transaction`;
      if (action === 'delete_transaction') return `Deleted transaction`;
      if (action === 'view_transactions') return `Viewed ${details.transactionCount} transactions`;
      break;
    case 'profile':
      if (action === 'view_profile') return 'Viewed profile';
      if (action === 'update_profile') return 'Updated profile';
      if (action === 'change_theme') return `Changed theme to ${details.newTheme}`;
      break;
    case 'navigation':
      if (action === 'page_view') return `Visited ${details.page}`;
      if (action === 'modal_open') return `Opened ${details.modal} modal`;
      if (action === 'modal_close') return `Closed ${details.modal} modal`;
      break;
    case 'system':
      if (action === 'error') return `Error in ${details.action}: ${details.error}`;
      break;
  }
  
  return `${action.replace(/_/g, ' ')}`;
};

export default function ActivityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const loadActivityLogs = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userLogs = await getUserActivityLogs(user.uid, 100);
      setLogs(userLogs);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadActivityLogs();
      // Log page view
      logUserAction(user.uid, 'navigation', LOG_ACTIONS.NAVIGATION.PAGE_VIEW, {
        page: 'activity',
        timestamp: new Date().toISOString()
      });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.category === filter);

  const categories = [
    { value: 'all', label: 'All Activities', count: logs.length },
    { value: 'auth', label: 'Authentication', count: logs.filter(l => l.category === 'auth').length },
    { value: 'transaction', label: 'Transactions', count: logs.filter(l => l.category === 'transaction').length },
    { value: 'profile', label: 'Profile', count: logs.filter(l => l.category === 'profile').length },
    { value: 'navigation', label: 'Navigation', count: logs.filter(l => l.category === 'navigation').length },
    { value: 'system', label: 'System', count: logs.filter(l => l.category === 'system').length },
  ];

  if (loading || isLoading) {
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
      
      <main className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-display font-bold text-gradient mb-2">
            Activity Log
          </h1>
          <p className="text-foreground/70 font-body">
            Track all your account activities and actions
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setFilter(category.value)}
                className={`px-4 py-2 rounded-xl font-body text-sm transition-all duration-300 flex items-center space-x-2 ${
                  filter === category.value
                    ? 'bg-primary text-white glow'
                    : 'backdrop-blur-glass border border-border/50 hover:border-primary/50'
                }`}
              >
                <span>{category.label}</span>
                {category.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    filter === category.value
                      ? 'bg-white/20'
                      : 'bg-surface'
                  }`}>
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activity Log List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {filteredLogs.length === 0 ? (
            <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-surface to-surface-dark rounded-2xl flex items-center justify-center">
                <Activity className="w-8 h-8 text-foreground/50" />
              </div>
              <p className="text-foreground/70 font-body">No activity logs found</p>
              <p className="text-sm text-foreground/50 font-body mt-1">
                Activities will appear here as you use the app
              </p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const IconComponent = getActionIcon(log.category, log.action);
              const colorClass = getActionColor(log.category);
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="backdrop-blur-glass border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg bg-surface border border-border/30 ${colorClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-body font-semibold text-foreground capitalize">
                          {log.category.replace('_', ' ')}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-foreground/60">
                          <Clock className="w-3 h-3" />
                          <span>{format(log.timestamp, 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-foreground/80 font-body mb-2">
                        {getActionDescription(log)}
                      </p>
                      
                      {log.details && Object.keys(log.details).length > 0 && (
                        <details className="text-xs text-foreground/60">
                          <summary className="cursor-pointer hover:text-foreground/80 transition-colors">
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-surface rounded-lg overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Load More Button */}
        {filteredLogs.length >= 100 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <button
              onClick={loadActivityLogs}
              className="bg-gradient-primary hover:bg-gradient-to-r hover:from-primary hover:to-accent text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 glow hover:glow-accent"
            >
              Load More Activities
            </button>
          </motion.div>
        )}
      </main>

      
      <BottomNavigation />
    </div>
  );
}