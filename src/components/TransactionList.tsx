'use client';

import { motion } from 'framer-motion';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';
import { deleteTransaction } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { useState } from 'react';
import EditTransactionModal from './EditTransactionModal';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionUpdate: () => void;
  userId?: string;
  showActions?: boolean;
}

export default function TransactionList({ transactions, onTransactionUpdate, userId, showActions = false }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const getCategoryInfo = (categoryId: string) => {
    return allCategories.find(cat => cat.id === categoryId) || {
      name: 'Other',
      icon: '💰',
      color: '#BDC3C7'
    };
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id, userId);
      onTransactionUpdate();
      toast.success('Transaction deleted successfully');
    } catch {
      toast.error('Failed to delete transaction');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleEditClose = () => {
    setEditingTransaction(null);
  };

  const handleTransactionUpdated = () => {
    setEditingTransaction(null);
    onTransactionUpdate();
  };

  if (transactions.length === 0) {
    return (
      <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-surface to-surface-dark rounded-2xl flex items-center justify-center">
          <Calendar className="w-8 h-8 text-foreground/50" />
        </div>
        <p className="text-foreground/70 font-body">No transactions yet</p>
        <p className="text-sm text-foreground/50 font-body mt-1">
          Add your first transaction to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {transactions.map((transaction, index) => {
        const category = getCategoryInfo(transaction.category);
        
        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="backdrop-blur-glass border border-border/50 rounded-xl p-3 sm:p-4 hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl border border-border/30 flex-shrink-0"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-semibold text-foreground truncate text-sm sm:text-base">
                    {transaction.description}
                  </h3>
                  <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-foreground/70">
                    <span>{category.name}</span>
                    <span>•</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
                <div className="text-right min-w-0">
                  <p className={`font-display font-bold text-base sm:text-lg ${
                    transaction.type === 'income' ? 'text-success' : 'text-secondary'
                  }`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </p>
                  <p className="text-xs text-foreground/50 capitalize">
                    {transaction.type}
                  </p>
                </div>

                {showActions && (
                  <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(transaction)}
                      className="p-2 rounded-lg hover:bg-primary/20 transition-colors text-primary hover:text-primary border border-primary/30"
                      title="Edit transaction"
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-500 hover:text-red-500 border border-red-500/30"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
        })}
      </div>

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={handleEditClose}
          onTransactionUpdated={handleTransactionUpdated}
        />
      )}
    </>
  );
}