'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  ExternalLink,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  Server,
  Key,
  Globe,
  Loader2,
} from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { SUPABASE_SETUP_SQL } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseConnectModal({ isOpen, onClose }: SupabaseConnectModalProps) {
  const { supabaseConfig, saveSupabaseConfig, disconnectSupabase, isSupabaseConfigured, dbType, setDatabaseType } = useDatabase();
  const { user } = useAuth();

  const [url, setUrl] = useState(supabaseConfig?.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig?.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [testing, setTesting] = useState(false);

  // Update form inputs when modal opens or config updates
  React.useEffect(() => {
    if (supabaseConfig) {
      setUrl(supabaseConfig.url);
      setAnonKey(supabaseConfig.anonKey);
    }
  }, [supabaseConfig]);

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    toast.success('SQL schema copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      toast.error('Please enter both Supabase Project URL and Anon Key');
      return;
    }

    try {
      setTesting(true);
      const success = await saveSupabaseConfig({
        url: url.trim().replace(/\/+$/, ''),
        anonKey: anonKey.trim(),
      });
      if (success) {
        onClose();
      }
    } finally {
      setTesting(false);
    }
  };

  const handleDeployClick = () => {
    // Open Supabase Project Creation in a new tab
    window.open('https://database.new', '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-surface border border-border/80 rounded-2xl shadow-2xl p-6 my-8 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-foreground/50 hover:text-foreground p-1 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">
                One-Click Supabase Deployment & Setup
              </h2>
              <p className="text-sm text-foreground/70">
                Connect your personal cloud database — automatically synced to your Google Account across all devices.
              </p>
            </div>
          </div>

          {/* Quick Steps Guide */}
          <div className="space-y-4 mb-6">
            {/* Step 1: Deploy */}
            <div className="p-4 bg-background/50 border border-border/60 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                    <h3 className="text-sm font-semibold text-foreground">One-Click Deploy to Supabase</h3>
                  </div>
                  <p className="text-xs text-foreground/70">
                    Click below to open Supabase project builder directly. Sign in with GitHub/Google and name your project.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeployClick}
                  className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm gap-1.5 shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>Deploy to Supabase</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>

            {/* Step 2: Run SQL Schema */}
            <div className="p-4 bg-background/50 border border-border/60 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                    <h3 className="text-sm font-semibold text-foreground">Run Database Schema</h3>
                  </div>
                  <p className="text-xs text-foreground/70">
                    Copy the SQL setup script and paste it in your Supabase SQL Editor to initialize all tables and security policies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copySql}
                  className="inline-flex items-center justify-center px-3 py-2 bg-surface border border-border hover:border-primary/50 text-foreground text-xs font-medium rounded-lg transition-colors gap-1.5 shrink-0"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-primary" />
                      <span>Copy SQL Schema</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 3: Enter credentials */}
            <div className="p-4 bg-background/50 border border-border/60 rounded-xl">
              <div className="space-y-1 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
                  <h3 className="text-sm font-semibold text-foreground">Connect Database Credentials</h3>
                </div>
                <p className="text-xs text-foreground/70">
                  Find your Project URL and anon public key in Supabase under <strong>Project Settings → API</strong>.
                </p>
              </div>

              <form onSubmit={handleConnect} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground/80 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzabcdefghijklm.supabase.co"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground/80 mb-1 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-primary" />
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                {user && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Signed in as <strong>{user.email || user.displayName}</strong>. This database connection will automatically sync to your Google Account across all devices!
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {isSupabaseConfigured && (
                      <button
                        type="button"
                        onClick={disconnectSupabase}
                        className="px-3 py-2 text-xs font-medium text-error hover:bg-error/10 border border-error/30 rounded-lg transition-colors"
                      >
                        Disconnect Supabase
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-foreground/70 hover:text-foreground bg-surface border border-border rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={testing}
                      className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-lg transition-colors gap-1.5"
                    >
                      {testing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Testing & Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Server className="w-3.5 h-3.5" />
                          <span>Save & Connect Database</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
