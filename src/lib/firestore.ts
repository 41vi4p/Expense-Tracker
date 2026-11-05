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
  writeBatch,
  DocumentReference,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Transaction, Note } from '@/types';
import { logUserAction, LOG_ACTIONS } from './logging';
import { validateTransaction, sanitizeText } from './validation';

const BATCH_SIZE = 400;

/** Delete documents in chunks (Firestore batches are limited to 500 writes). */
const deleteInBatches = async (refs: DocumentReference[]) => {
  for (let i = 0; i < refs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db!);
    refs.slice(i, i + BATCH_SIZE).forEach((r) => batch.delete(r));
    await batch.commit();
  }
};


export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
  try {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase is not configured');
    }
    const clean = validateTransaction(transaction);
    const transactionData = {
      ...clean,
      userId,
      date: Timestamp.fromDate(clean.date),
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'transactions'), transactionData);
    
    // Log the transaction creation
    await logUserAction(userId, 'transaction', LOG_ACTIONS.TRANSACTION.CREATE, {
      transactionId: docRef.id,
      type: transaction.type,
      amount: clean.amount,
      category: clean.category
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    
    // Log the error
    await logUserAction(userId, 'system', LOG_ACTIONS.SYSTEM.ERROR, {
      action: 'add_transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    if (!isFirebaseConfigured || !db) {
      return [];
    }
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
      createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
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

export const updateTransaction = async (
  id: string,
  userId: string,
  updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
) => {
  try {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase is not configured');
    }
    if (!userId) throw new Error('Not authenticated');
    // Only whitelisted, validated fields are ever written. Ownership is enforced by firestore.rules.
    const clean = validateTransaction(updates);
    await updateDoc(doc(db, 'transactions', id), {
      type: clean.type,
      amount: clean.amount,
      description: clean.description,
      category: clean.category,
      date: Timestamp.fromDate(clean.date),
    });

    await logUserAction(userId, 'transaction', LOG_ACTIONS.TRANSACTION.UPDATE, {
      transactionId: id,
      updatedFields: Object.keys(updates)
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    await logUserAction(userId, 'system', LOG_ACTIONS.SYSTEM.ERROR, {
      action: 'update_transaction',
      transactionId: id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

export const deleteTransaction = async (id: string, userId?: string) => {
  try {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase is not configured');
    }
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
    if (!isFirebaseConfigured || !db) {
      return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }
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
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase is not configured');
    }
    const noteData = {
      userId: note.userId,
      title: sanitizeText(note.title, 200),
      content: String(note.content ?? '').slice(0, 10000),
      category: note.category,
      tags: (note.tags || []).slice(0, 20).map((t) => sanitizeText(t, 40)).filter(Boolean),
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
    if (!isFirebaseConfigured || !db) {
      return [];
    }
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

export const updateNote = async (id: string, userId: string, updates: Partial<Omit<Note, 'id' | 'userId'>>) => {
  try {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase is not configured');
    }
    const noteRef = doc(db, 'notes', id);
    const updateData: Record<string, any> = { updatedAt: Timestamp.now() };
    if (updates.title !== undefined) updateData.title = sanitizeText(updates.title, 200);
    if (updates.content !== undefined) updateData.content = String(updates.content).slice(0, 10000);
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.slice(0, 20).map((t) => sanitizeText(t, 40)).filter(Boolean);
    }

    await updateDoc(noteRef, updateData);

    if (userId) {
      await logUserAction(userId, 'profile', 'update_note', {
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
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase is not configured');
    }
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

// Delete all user data
export const deleteAllUserData = async (userId: string) => {
  try {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase is not configured');
    }

    // Delete all transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    
    // Delete all notes
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId)
    );
    const notesSnapshot = await getDocs(notesQuery);
    
    
    // Delete all activity logs
    const activityQuery = query(
      collection(db, 'activity_logs'),
      where('userId', '==', userId)
    );
    const activitySnapshot = await getDocs(activityQuery);
    
    
    await deleteInBatches([
      ...transactionsSnapshot.docs.map((d) => d.ref),
      ...notesSnapshot.docs.map((d) => d.ref),
      ...activitySnapshot.docs.map((d) => d.ref),
    ]);
    
    // Log the deletion
    await logUserAction(userId, 'settings', LOG_ACTIONS.SETTINGS.DATA_DELETE, {
      deletedTransactions: transactionsSnapshot.docs.length,
      deletedNotes: notesSnapshot.docs.length,
      deletedActivity: activitySnapshot.docs.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};