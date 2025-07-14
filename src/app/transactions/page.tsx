'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, Plus } from 'lucide-react';
import { Transaction } from '@/types';
import { getUserTransactions } from '@/lib/firestore';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import TransactionList from '@/components/TransactionList';
import AddTransactionModal from '@/components/AddTransactionModal';

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userTransactions = await getUserTransactions(user.uid);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const filterTransactions = useCallback(() => {
    let filtered = transactions;

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterType, searchTerm]);

  const handleTransactionAdded = () => {
    setShowAddModal(false);
    loadTransactions();
    toast.success('Transaction added successfully!');
  };

  if (authLoading || loading) {
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
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-gradient mb-2">
                All Transactions
              </h1>
              <p className="text-foreground/70 font-body">
                Manage and track your financial transactions
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-primary hover:bg-gradient-to-r hover:from-primary hover:to-accent text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2 glow hover:glow-accent"
            >
              <Plus className="w-5 h-5" />
              <span className="font-body">Add Transaction</span>
            </motion.button>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border/50 rounded-xl font-body focus:border-primary focus:outline-none transition-colors"
                placeholder="Search transactions..."
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/50" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border/50 rounded-xl font-body focus:border-primary focus:outline-none transition-colors appearance-none"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>
          </div>

          {/* Transaction Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="backdrop-blur-glass border border-border/50 rounded-xl p-4 text-center">
              <p className="text-sm text-foreground/70 font-body">Total</p>
              <p className="text-xl font-display font-bold">{filteredTransactions.length}</p>
            </div>
            <div className="backdrop-blur-glass border border-border/50 rounded-xl p-4 text-center">
              <p className="text-sm text-foreground/70 font-body">Income</p>
              <p className="text-xl font-display font-bold text-success">
                {filteredTransactions.filter(t => t.type === 'income').length}
              </p>
            </div>
            <div className="backdrop-blur-glass border border-border/50 rounded-xl p-4 text-center">
              <p className="text-sm text-foreground/70 font-body">Expenses</p>
              <p className="text-xl font-display font-bold text-secondary">
                {filteredTransactions.filter(t => t.type === 'expense').length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TransactionList 
            transactions={filteredTransactions} 
            onTransactionUpdate={loadTransactions}
            userId={user.uid}
          />
        </motion.div>
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onTransactionAdded={handleTransactionAdded}
          userId={user.uid}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 py-8 text-center">
        <p className="text-sm text-foreground/50 font-body">
          Made by David Porathur
        </p>
      </footer>
    </div>
  );
}