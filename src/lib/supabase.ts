import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Transaction, Note } from '@/types';
import { validateTransaction, sanitizeText } from './validation';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const SUPABASE_SETUP_SQL = `-- ExpenseTracker Schema for Supabase
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions ("userId", date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions ("userId", type);

CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON public.notes ("userId", "updatedAt" DESC);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    category TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_time ON public.activity_logs ("userId", timestamp DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on transactions" ON public.transactions;
CREATE POLICY "Allow anon all on transactions" ON public.transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on notes" ON public.notes;
CREATE POLICY "Allow anon all on notes" ON public.notes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on activity_logs" ON public.activity_logs;
CREATE POLICY "Allow anon all on activity_logs" ON public.activity_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
`;

let cachedClient: SupabaseClient | null = null;
let currentConfig: SupabaseConfig | null = null;

export const getSupabaseConfigFromEnv = (): SupabaseConfig | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    return { url, anonKey };
  }
  return null;
};

export const getSupabaseClient = (config?: SupabaseConfig | null): SupabaseClient | null => {
  if (config) {
    if (
      cachedClient &&
      currentConfig &&
      currentConfig.url === config.url &&
      currentConfig.anonKey === config.anonKey
    ) {
      return cachedClient;
    }
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: false },
      });
      currentConfig = config;
      return cachedClient;
    } catch (err) {
      console.error('Failed to initialize custom Supabase client:', err);
      return null;
    }
  }

  if (cachedClient) return cachedClient;

  const envConfig = getSupabaseConfigFromEnv();
  if (envConfig) {
    try {
      cachedClient = createClient(envConfig.url, envConfig.anonKey, {
        auth: { persistSession: false },
      });
      currentConfig = envConfig;
      return cachedClient;
    } catch (err) {
      console.error('Failed to initialize env Supabase client:', err);
      return null;
    }
  }

  return null;
};

export const testSupabaseConnection = async (config: SupabaseConfig): Promise<{ success: boolean; message: string; schemaReady: boolean }> => {
  try {
    const testClient = createClient(config.url, config.anonKey, {
      auth: { persistSession: false },
    });

    // Check if we can query transactions table
    const { error } = await testClient.from('transactions').select('id').limit(1);

    if (error) {
      // 42P01 is PostgreSQL code for relation does not exist
      if (error.code === '42P01' || error.message.toLowerCase().includes('relation') || error.message.toLowerCase().includes('does not exist')) {
        return {
          success: true,
          schemaReady: false,
          message: 'Connected to Supabase! The tables need to be created using the SQL Editor.',
        };
      }
      return {
        success: false,
        schemaReady: false,
        message: error.message || 'Connection error',
      };
    }

    return {
      success: true,
      schemaReady: true,
      message: 'Successfully connected to Supabase and database schema is ready!',
    };
  } catch (err: any) {
    return {
      success: false,
      schemaReady: false,
      message: err?.message || 'Failed to connect to Supabase',
    };
  }
};

// Supabase CRUD Operations

export const supabaseAddTransaction = async (
  client: SupabaseClient,
  userId: string,
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>
): Promise<string> => {
  const clean = validateTransaction(transaction);
  const row = {
    userId,
    type: clean.type,
    amount: clean.amount,
    category: clean.category,
    description: clean.description,
    date: clean.date.toISOString(),
  };

  const { data, error } = await client.from('transactions').insert([row]).select('id').single();
  if (error) throw new Error(error.message);
  return data.id;
};

export const supabaseGetUserTransactions = async (
  client: SupabaseClient,
  userId: string
): Promise<Transaction[]> => {
  const { data, error } = await client
    .from('transactions')
    .select('*')
    .eq('userId', userId)
    .order('date', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.userId,
    type: row.type,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    date: new Date(row.date),
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
  }));
};

export const supabaseUpdateTransaction = async (
  client: SupabaseClient,
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  const clean = validateTransaction(updates);
  const updateData: Record<string, any> = {
    type: clean.type,
    amount: clean.amount,
    description: clean.description,
    category: clean.category,
    date: clean.date.toISOString(),
  };

  const { error } = await client.from('transactions').update(updateData).eq('id', id);
  if (error) throw new Error(error.message);
};

export const supabaseDeleteTransaction = async (
  client: SupabaseClient,
  id: string
): Promise<void> => {
  const { error } = await client.from('transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const supabaseGetUserStats = async (
  client: SupabaseClient,
  userId: string
) => {
  const transactions = await supabaseGetUserTransactions(client, userId);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  return { totalIncome, totalExpenses, balance };
};

export const supabaseAddNote = async (
  client: SupabaseClient,
  note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const noteData = {
    userId: note.userId,
    title: sanitizeText(note.title, 200),
    content: String(note.content ?? '').slice(0, 10000),
    category: note.category,
    tags: (note.tags || []).slice(0, 20).map((t) => sanitizeText(t, 40)).filter(Boolean),
  };

  const { data, error } = await client.from('notes').insert([noteData]).select('id').single();
  if (error) throw new Error(error.message);
  return data.id;
};

export const supabaseGetUserNotes = async (
  client: SupabaseClient,
  userId: string
): Promise<Note[]> => {
  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('userId', userId)
    .order('updatedAt', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.userId,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags || [],
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
  }));
};

export const supabaseUpdateNote = async (
  client: SupabaseClient,
  id: string,
  updates: Partial<Omit<Note, 'id' | 'userId'>>
): Promise<void> => {
  const updateData: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };
  if (updates.title !== undefined) updateData.title = sanitizeText(updates.title, 200);
  if (updates.content !== undefined) updateData.content = String(updates.content).slice(0, 10000);
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.tags !== undefined) {
    updateData.tags = updates.tags.slice(0, 20).map((t) => sanitizeText(t, 40)).filter(Boolean);
  }

  const { error } = await client.from('notes').update(updateData).eq('id', id);
  if (error) throw new Error(error.message);
};

export const supabaseDeleteNote = async (
  client: SupabaseClient,
  id: string
): Promise<void> => {
  const { error } = await client.from('notes').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const supabaseDeleteAllUserData = async (
  client: SupabaseClient,
  userId: string
): Promise<void> => {
  await client.from('transactions').delete().eq('userId', userId);
  await client.from('notes').delete().eq('userId', userId);
  await client.from('activity_logs').delete().eq('userId', userId);
};

export const supabaseLogUserAction = async (
  client: SupabaseClient,
  userId: string,
  category: string,
  action: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const PII_KEYS = new Set(['email', 'name', 'displayName', 'photoURL']);
    const stripped = Object.fromEntries(
      Object.entries(details).filter(([k]) => !PII_KEYS.has(k))
    );

    await client.from('activity_logs').insert([
      {
        userId,
        category,
        action,
        details: stripped,
      },
    ]);
  } catch {
    // Silently fail logging
  }
};

export const supabaseGetUserActivityLogs = async (
  client: SupabaseClient,
  userId: string,
  limitCount: number = 50
) => {
  const { data, error } = await client
    .from('activity_logs')
    .select('*')
    .eq('userId', userId)
    .order('timestamp', { ascending: false })
    .limit(limitCount);

  if (error) {
    console.error('Error fetching Supabase activity logs:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.userId,
    category: row.category,
    action: row.action,
    details: row.details || {},
    timestamp: row.timestamp ? new Date(row.timestamp) : new Date(),
  }));
};
