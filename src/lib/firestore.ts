import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction, Note } from '@/types';
import { logUserAction, LOG_ACTIONS } from './logging';

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
  try {
    const transactionData = {
      ...transaction,
      date: Timestamp.fromDate(transaction.date),
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'transactions'), transactionData);
    
    // Log the transaction creation
    await logUserAction(transaction.userId, 'transaction', LOG_ACTIONS.TRANSACTION.CREATE, {
      transactionId: docRef.id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    
    // Log the error
    await logUserAction(transaction.userId, 'system', LOG_ACTIONS.SYSTEM.ERROR, {
      action: 'add_transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Transaction[];
    
    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    
    // Log the error
    await logUserAction(userId, 'system', LOG_ACTIONS.SYSTEM.ERROR, {
      action: 'get_transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
  try {
    const transactionRef = doc(db, 'transactions', id);
    const updateData: any = { ...updates };
    
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }
    
    await updateDoc(transactionRef, updateData);
    
    // Log the update action
    if (updates.userId) {
      await logUserAction(updates.userId, 'transaction', LOG_ACTIONS.TRANSACTION.UPDATE, {
        transactionId: id,
        updatedFields: Object.keys(updates)
      });
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    
    // Log the error
    if (updates.userId) {
      await logUserAction(updates.userId, 'system', LOG_ACTIONS.SYSTEM.ERROR, {
        action: 'update_transaction',
        transactionId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    throw error;
  }
};

export const deleteTransaction = async (id: string, userId?: string) => {
  try {
    await deleteDoc(doc(db, 'transactions', id));
    
    // Log the delete action
    if (userId) {
      await logUserAction(userId, 'transaction', LOG_ACTIONS.TRANSACTION.DELETE, {
        transactionId: id
      });
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    
    // Log the error
    if (userId) {
      await logUserAction(userId, 'system', LOG_ACTIONS.SYSTEM.ERROR, {
        action: 'delete_transaction',
        transactionId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    throw error;
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const transactions = await getUserTransactions(userId);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const balance = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, balance };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Notes functionality
export const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const noteData = {
      ...note,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'notes'), noteData);
    
    await logUserAction(note.userId, 'profile', 'create_note', {
      noteId: docRef.id,
      category: note.category,
      title: note.title
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

export const getUserNotes = async (userId: string): Promise<Note[]> => {
  try {
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const notes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Note[];
    
    return notes;
  } catch (error) {
    console.error('Error getting notes:', error);
    throw error;
  }
};

export const updateNote = async (id: string, updates: Partial<Note>) => {
  try {
    const noteRef = doc(db, 'notes', id);
    const updateData: any = { 
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(noteRef, updateData);
    
    if (updates.userId) {
      await logUserAction(updates.userId, 'profile', 'update_note', {
        noteId: id,
        updatedFields: Object.keys(updates)
      });
    }
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const deleteNote = async (id: string, userId?: string) => {
  try {
    await deleteDoc(doc(db, 'notes', id));
    
    if (userId) {
      await logUserAction(userId, 'profile', 'delete_note', {
        noteId: id
      });
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};