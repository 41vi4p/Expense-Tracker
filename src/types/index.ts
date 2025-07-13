export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', icon: '🍕', color: '#FF6B6B', type: 'expense' },
  { id: '2', name: 'Transportation', icon: '🚗', color: '#4ECDC4', type: 'expense' },
  { id: '3', name: 'Shopping', icon: '🛍️', color: '#45B7D1', type: 'expense' },
  { id: '4', name: 'Entertainment', icon: '🎬', color: '#96CEB4', type: 'expense' },
  { id: '5', name: 'Bills & Utilities', icon: '⚡', color: '#FFEAA7', type: 'expense' },
  { id: '6', name: 'Healthcare', icon: '🏥', color: '#DDA0DD', type: 'expense' },
  { id: '7', name: 'Education', icon: '📚', color: '#F39C12', type: 'expense' },
  { id: '8', name: 'Travel', icon: '✈️', color: '#E74C3C', type: 'expense' },
  { id: '9', name: 'Other', icon: '💰', color: '#BDC3C7', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: '10', name: 'Salary', icon: '💼', color: '#2ECC71', type: 'income' },
  { id: '11', name: 'Freelance', icon: '💻', color: '#3498DB', type: 'income' },
  { id: '12', name: 'Investment', icon: '📈', color: '#9B59B6', type: 'income' },
  { id: '13', name: 'Business', icon: '🏢', color: '#E67E22', type: 'income' },
  { id: '14', name: 'Gift', icon: '🎁', color: '#E91E63', type: 'income' },
  { id: '15', name: 'Other', icon: '💰', color: '#27AE60', type: 'income' },
];