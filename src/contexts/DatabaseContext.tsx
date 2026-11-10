'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  SupabaseConfig,
  getSupabaseClient,
  getSupabaseConfigFromEnv,
  testSupabaseConnection,
  supabaseAddTransaction,
  supabaseGetUserTransactions,
  supabaseUpdateTransaction,
  supabaseDeleteTransaction,
  supabaseGetUserStats,
  supabaseAddNote,
  supabaseGetUserNotes,
  supabaseUpdateNote,
  supabaseDeleteNote,
  supabaseDeleteAllUserData,
  supabaseLogUserAction,
  supabaseGetUserActivityLogs,
} from '@/lib/supabase';
import {
  addTransaction as firestoreAddTransaction,
  getUserTransactions as firestoreGetUserTransactions,
  updateTransaction as firestoreUpdateTransaction,
  deleteTransaction as firestoreDeleteTransaction,
  getUserStats as firestoreGetUserStats,
  addNote as firestoreAddNote,
  getUserNotes as firestoreGetUserNotes,
  updateNote as firestoreUpdateNote,
  deleteNote as firestoreDeleteNote,
  deleteAllUserData as firestoreDeleteAllUserData,
} from '@/lib/firestore';
import {
  logUserAction as firestoreLogUserAction,
  getUserActivityLogs as firestoreGetUserActivityLogs,
} from '@/lib/logging';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Transaction, Note } from '@/types';
import toast from 'react-hot-toast';

export type DatabaseType = 'supabase' | 'firebase';

interface DatabaseContextType {
  dbType: DatabaseType;
  supabaseConfig: SupabaseConfig | null;
  isSupabaseConfigured: boolean;
  isFirebaseConfigured: boolean;
  saveSupabaseConfig: (config: SupabaseConfig) => Promise<boolean>;
  disconnectSupabase: () => Promise<void>;
  setDatabaseType: (type: DatabaseType) => void;
  // Unified Data APIs
  addTransaction: (userId: string, transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Promise<string>;
  getUserTransactions: (userId: string) => Promise<Transaction[]>;
  updateTransaction: (id: string, userId: string, updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: string, userId?: string) => Promise<void>;
  getUserStats: (userId: string) => Promise<{ totalIncome: number; totalExpenses: number; balance: number }>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  getUserNotes: (userId: string) => Promise<Note[]>;
  updateNote: (id: string, userId: string, updates: Partial<Omit<Note, 'id' | 'userId'>>) => Promise<void>;
  deleteNote: (id: string, userId?: string) => Promise<void>;
  deleteAllUserData: (userId: string) => Promise<void>;
  logAction: (userId: string, category: any, action: string, details?: Record<string, any>) => Promise<void>;
  getUserActivityLogs: (userId: string, limitCount?: number) => Promise<any[]>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const LOCAL_STORAGE_SUPABASE_KEY = 'expensetracker_supabase_config';
const LOCAL_STORAGE_DB_TYPE_KEY = 'expensetracker_db_type';

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig | null>(null);
  const [dbType, setDbType] = useState<DatabaseType>('firebase');

  // Load initial configuration from localStorage or Env
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(LOCAL_STORAGE_SUPABASE_KEY);
      const savedType = localStorage.getItem(LOCAL_STORAGE_DB_TYPE_KEY) as DatabaseType | null;

      if (savedConfig) {
        const parsed = JSON.parse(savedConfig) as SupabaseConfig;
        if (parsed.url && parsed.anonKey) {
          setSupabaseConfig(parsed);
          if (savedType === 'supabase') {
            setDbType('supabase');
          }
          return;
        }
      }

      // Fallback to env config
      const envConfig = getSupabaseConfigFromEnv();
      if (envConfig) {
        setSupabaseConfig(envConfig);
        if (savedType === 'supabase' || !isFirebaseConfigured) {
          setDbType('supabase');
        }
      }
    } catch (e) {
      console.warn('Error reading local database config:', e);
    }
  }, []);

  // When user logs in with Google on ANY device, automatically sync their database config
  useEffect(() => {
    if (!user?.uid || !db || !isFirebaseConfigured) return;
    const firestoreDb = db;

    const syncUserDatabaseConfig = async () => {
      try {
        const userDbRef = doc(firestoreDb, 'user_database_configs', user.uid);
        const snapshot = await getDoc(userDbRef);

        if (snapshot.exists()) {
          const cloudConfig = snapshot.data() as { supabaseUrl?: string; supabaseAnonKey?: string };
          if (cloudConfig.supabaseUrl && cloudConfig.supabaseAnonKey) {
            const config: SupabaseConfig = {
              url: cloudConfig.supabaseUrl,
              anonKey: cloudConfig.supabaseAnonKey,
            };
            setSupabaseConfig(config);
            setDbType('supabase');
            localStorage.setItem(LOCAL_STORAGE_SUPABASE_KEY, JSON.stringify(config));
            localStorage.setItem(LOCAL_STORAGE_DB_TYPE_KEY, 'supabase');
            return;
          }
        }

        // If cloud had none but user has local supabaseConfig, back it up to cloud!
        if (supabaseConfig?.url && supabaseConfig?.anonKey) {
          await setDoc(userDbRef, {
            supabaseUrl: supabaseConfig.url,
            supabaseAnonKey: supabaseConfig.anonKey,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      } catch (err) {
        console.warn('Failed to sync user database configuration across devices:', err);
      }
    };

    syncUserDatabaseConfig();
  }, [user?.uid, supabaseConfig]);

  const saveSupabaseConfig = useCallback(async (config: SupabaseConfig): Promise<boolean> => {
    try {
      const testResult = await testSupabaseConnection(config);
      if (!testResult.success) {
        toast.error(`Connection failed: ${testResult.message}`);
        return false;
      }

      setSupabaseConfig(config);
      setDbType('supabase');
      localStorage.setItem(LOCAL_STORAGE_SUPABASE_KEY, JSON.stringify(config));
      localStorage.setItem(LOCAL_STORAGE_DB_TYPE_KEY, 'supabase');

      // Sync to cloud user account if logged in
      if (user?.uid && db && isFirebaseConfigured) {
        try {
          const userDbRef = doc(db, 'user_database_configs', user.uid);
          await setDoc(userDbRef, {
            supabaseUrl: config.url,
            supabaseAnonKey: config.anonKey,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (cloudErr) {
          console.warn('Could not sync config to cloud profile:', cloudErr);
        }
      }

      toast.success('Connected to Supabase successfully!');
      return true;
    } catch (err: any) {
      toast.error(`Failed to save configuration: ${err?.message || 'Unknown error'}`);
      return false;
    }
  }, [user]);

  const disconnectSupabase = useCallback(async () => {
    setSupabaseConfig(null);
    setDbType('firebase');
    localStorage.removeItem(LOCAL_STORAGE_SUPABASE_KEY);
    localStorage.setItem(LOCAL_STORAGE_DB_TYPE_KEY, 'firebase');

    if (user?.uid && db && isFirebaseConfigured) {
      try {
        const userDbRef = doc(db, 'user_database_configs', user.uid);
        await deleteDoc(userDbRef);
      } catch (e) {
        console.warn('Failed to remove cloud database config:', e);
      }
    }

    toast.success('Disconnected from Supabase. Defaulted to Firebase.');
  }, [user]);

  const handleSetDatabaseType = useCallback((type: DatabaseType) => {
    setDbType(type);
    localStorage.setItem(LOCAL_STORAGE_DB_TYPE_KEY, type);
    toast.success(`Switched active database to ${type === 'supabase' ? 'Supabase' : 'Firebase'}`);
  }, []);

  const activeSupabaseClient = useMemo(() => {
    if (dbType === 'supabase') {
      return getSupabaseClient(supabaseConfig);
    }
    return null;
  }, [dbType, supabaseConfig]);

  // Unified Data APIs
  const addTransaction = useCallback(async (userId: string, transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseAddTransaction(activeSupabaseClient, userId, transaction);
    }
    return await firestoreAddTransaction(userId, transaction);
  }, [dbType, activeSupabaseClient]);

  const getUserTransactions = useCallback(async (userId: string) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseGetUserTransactions(activeSupabaseClient, userId);
    }
    return await firestoreGetUserTransactions(userId);
  }, [dbType, activeSupabaseClient]);

  const updateTransaction = useCallback(async (id: string, userId: string, updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseUpdateTransaction(activeSupabaseClient, id, updates);
    }
    return await firestoreUpdateTransaction(id, userId, updates);
  }, [dbType, activeSupabaseClient]);

  const deleteTransaction = useCallback(async (id: string, userId?: string) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseDeleteTransaction(activeSupabaseClient, id);
    }
    return await firestoreDeleteTransaction(id, userId);
  }, [dbType, activeSupabaseClient]);

  const getUserStats = useCallback(async (userId: string) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseGetUserStats(activeSupabaseClient, userId);
    }
    return await firestoreGetUserStats(userId);
  }, [dbType, activeSupabaseClient]);

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseAddNote(activeSupabaseClient, note);
    }
    return await firestoreAddNote(note);
  }, [dbType, activeSupabaseClient]);

  const getUserNotes = useCallback(async (userId: string) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseGetUserNotes(activeSupabaseClient, userId);
    }
    return await firestoreGetUserNotes(userId);
  }, [dbType, activeSupabaseClient]);

  const updateNote = useCallback(async (id: string, userId: string, updates: Partial<Omit<Note, 'id' | 'userId'>>) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseUpdateNote(activeSupabaseClient, id, updates);
    }
    return await firestoreUpdateNote(id, userId, updates);
  }, [dbType, activeSupabaseClient]);

  const deleteNote = useCallback(async (id: string, userId?: string) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseDeleteNote(activeSupabaseClient, id);
    }
    return await firestoreDeleteNote(id, userId);
  }, [dbType, activeSupabaseClient]);

  const deleteAllUserData = useCallback(async (userId: string) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseDeleteAllUserData(activeSupabaseClient, userId);
    }
    return await firestoreDeleteAllUserData(userId);
  }, [dbType, activeSupabaseClient]);

  const logAction = useCallback(async (userId: string, category: any, action: string, details?: Record<string, any>) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseLogUserAction(activeSupabaseClient, userId, category, action, details);
    }
    return await firestoreLogUserAction(userId, category, action, details);
  }, [dbType, activeSupabaseClient]);

  const getUserActivityLogs = useCallback(async (userId: string, limitCount?: number) => {
    if (dbType === 'supabase' && activeSupabaseClient) {
      return await supabaseGetUserActivityLogs(activeSupabaseClient, userId, limitCount);
    }
    return await firestoreGetUserActivityLogs(userId, limitCount);
  }, [dbType, activeSupabaseClient]);

  const isSupabaseConfigured = Boolean(supabaseConfig?.url && supabaseConfig?.anonKey);

  return (
    <DatabaseContext.Provider
      value={{
        dbType,
        supabaseConfig,
        isSupabaseConfigured,
        isFirebaseConfigured,
        saveSupabaseConfig,
        disconnectSupabase,
        setDatabaseType: handleSetDatabaseType,
        addTransaction,
        getUserTransactions,
        updateTransaction,
        deleteTransaction,
        getUserStats,
        addNote,
        getUserNotes,
        updateNote,
        deleteNote,
        deleteAllUserData,
        logAction,
        getUserActivityLogs,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
