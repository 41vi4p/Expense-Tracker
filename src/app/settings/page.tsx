'use client';

// Force dynamic rendering to avoid Firebase initialization during build
export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Download, 
  Upload, 
  Database, 
  Shield, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  Monitor,
  Zap,
  Server,
  ExternalLink
} from 'lucide-react';
import { LOG_ACTIONS } from '@/lib/logging';
import { MAX_IMPORT_BYTES, MAX_IMPORT_ROWS } from '@/lib/validation';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import SupabaseConnectModal from '@/components/SupabaseConnectModal';

export default function SettingsPage() {
  const { user } = useAuth();
  const { preference, setPreference } = useTheme();
  const {
    dbType,
    setDatabaseType,
    supabaseConfig,
    isSupabaseConfigured,
    getUserTransactions,
    addTransaction,
    deleteAllUserData,
    logAction
  } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);


  useEffect(() => {
    if (user?.uid) {
      // Log page view
      logAction(user.uid, 'navigation', LOG_ACTIONS.NAVIGATION.PAGE_VIEW, {
        page: 'settings',
        timestamp: new Date().toISOString()
      });
    }
  }, [user, logAction]);

  const exportData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setExportLoading(true);
      const transactions = await getUserTransactions(user.uid);
      
      const exportData = {
        user: {
          id: user.uid,
          name: user?.displayName
        },
        transactions: transactions,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logAction(user.uid, 'settings', LOG_ACTIONS.SETTINGS.DATA_EXPORT, {
        transactionCount: transactions.length,
        timestamp: new Date().toISOString()
      });

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  }, [user, getUserTransactions, logAction]);

  const importData = useCallback(async (file: File) => {
    if (!user?.uid) return;
    
    try {
      setImportLoading(true);
      if (file.size > MAX_IMPORT_BYTES) {
        throw new Error('File is too large');
      }
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data || !Array.isArray(data.transactions)) {
        throw new Error('Invalid data format');
      }
      if (data.transactions.length > MAX_IMPORT_ROWS) {
        throw new Error(`Too many transactions (max ${MAX_IMPORT_ROWS})`);
      }

      let importedCount = 0;
      
      for (const transaction of data.transactions) {
        try {
          await addTransaction(user.uid, {
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            category: transaction.category,
            date: new Date(transaction.date)
          });
          importedCount++;
        } catch (error) {
          console.error('Error importing transaction:', error);
        }
      }

      logAction(user.uid, 'settings', LOG_ACTIONS.SETTINGS.DATA_IMPORT, {
        transactionCount: importedCount,
        timestamp: new Date().toISOString()
      });

      toast.success(`Successfully imported ${importedCount} transactions!`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Please check the file format.');
    } finally {
      setImportLoading(false);
    }
  }, [user, addTransaction, logAction]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
  };

  const deleteAllData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      await deleteAllUserData(user.uid);
      
      logAction(user.uid, 'settings', LOG_ACTIONS.SETTINGS.DATA_DELETE, {
        timestamp: new Date().toISOString()
      });

      toast.success('All data deleted successfully!');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete data');
    } finally {
      setLoading(false);
    }
  }, [user, deleteAllUserData, logAction]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-display font-bold text-gradient mb-2 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-primary" />
            Settings
          </h1>
          <p className="text-foreground/70 font-body">
            Manage your account settings and data
          </p>
        </motion.div>

        {/* Appearance */}
        <div className="backdrop-blur-glass rounded-2xl p-5 mb-6">
          <h2 className="font-display font-semibold mb-1">Appearance</h2>
          <p className="text-sm text-foreground/70 mb-4">Choose how ExpenseTracker looks.</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
            {([
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                role="radio"
                aria-checked={preference === value}
                onClick={() => setPreference(value)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm transition-all ${
                  preference === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Supabase & Cloud Database Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-display font-semibold flex items-center">
                  <Database className="w-5 h-5 mr-2 text-primary" />
                  Database & Cloud Sync
                </h2>
                <p className="text-sm text-foreground/70 mt-1">
                  Active backend: <span className="font-semibold text-primary uppercase">{dbType}</span>
                  {supabaseConfig?.url && (
                    <span className="block text-xs text-foreground/60 truncate mt-0.5">
                      Supabase: {supabaseConfig.url}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isSupabaseConfigured && (
                  <button
                    onClick={() => setDatabaseType(dbType === 'supabase' ? 'firebase' : 'supabase')}
                    className="px-3 py-2 text-xs font-semibold rounded-xl border border-border hover:border-primary/50 text-foreground transition-all"
                  >
                    Switch to {dbType === 'supabase' ? 'Firebase' : 'Supabase'}
                  </button>
                )}
                <button
                  onClick={() => setShowSupabaseModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-primary hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isSupabaseConfigured ? 'Configure Supabase' : 'One-Click Supabase Setup'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/40 text-xs text-foreground/70">
              <div className="flex items-center gap-2 p-3 bg-surface/30 rounded-xl">
                <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-click deploy your personal database on Supabase with zero database expertise.</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-surface/30 rounded-xl">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Synchronized with your Google Account across all devices on login.</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-6">
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-primary" />
              Data Management
            </h2>
            
            <div className="space-y-4">
              {/* Export Data */}
              <div className="flex items-center justify-between p-4 bg-surface/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-success" />
                  <div>
                    <h3 className="font-display font-medium">Export Data</h3>
                    <p className="text-sm text-foreground/70">Download all your transactions and data</p>
                  </div>
                </div>
                <button
                  onClick={exportData}
                  disabled={exportLoading}
                  className="bg-success hover:bg-success/80 text-white px-4 py-2 rounded-lg font-body text-sm transition-colors disabled:opacity-50"
                >
                  {exportLoading ? 'Exporting...' : 'Export'}
                </button>
              </div>

              {/* Import Data */}
              <div className="flex items-center justify-between p-4 bg-surface/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Upload className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-display font-medium">Import Data</h3>
                    <p className="text-sm text-foreground/70">Upload and restore your data from a file</p>
                  </div>
                </div>
                <label className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-body text-sm transition-colors cursor-pointer">
                  {importLoading ? 'Importing...' : 'Import'}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    disabled={importLoading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-6">
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Account Settings
            </h2>
            
            <div className="space-y-4">
              {/* Account Info */}
              <div className="p-4 bg-surface/30 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-medium">{user?.displayName}</h3>
                    <p className="text-sm text-foreground/70">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>Account verified</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="backdrop-blur-glass border border-error/30 rounded-2xl p-6">
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center text-error">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Danger Zone
            </h2>
            
            <div className="space-y-4">
              {/* Delete All Data */}
              <div className="flex items-center justify-between p-4 bg-error/10 rounded-xl border border-error/20">
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-5 h-5 text-error" />
                  <div>
                    <h3 className="font-display font-medium text-error">Delete All Data</h3>
                    <p className="text-sm text-foreground/70">Permanently delete all your transactions and data</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-error hover:bg-error/80 text-white px-4 py-2 rounded-lg font-body text-sm transition-colors"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Supabase Connect Modal */}
        <SupabaseConnectModal
          isOpen={showSupabaseModal}
          onClose={() => setShowSupabaseModal(false)}
        />

        {/* Delete Confirmation Modal */}
        {user && showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-surface-dark border border-border/50 rounded-2xl p-6 max-w-md mx-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <XCircle className="w-6 h-6 text-error" />
                <h3 className="text-lg font-display font-semibold">Delete All Data</h3>
              </div>
              
              <p className="text-foreground/70 mb-6">
                Are you sure you want to delete all your data? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-surface hover:bg-surface/80 text-foreground px-4 py-2 rounded-lg font-body transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAllData}
                  className="flex-1 bg-error hover:bg-error/80 text-white px-4 py-2 rounded-lg font-body transition-colors"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}