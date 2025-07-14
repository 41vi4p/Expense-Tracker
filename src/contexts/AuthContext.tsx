'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { logUserAction } from '@/lib/logging';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        logUserAction(user.uid, 'auth', 'session_restored', {
          email: user.email,
          name: user.displayName,
          lastSignIn: user.metadata.lastSignInTime
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<UserCredential | null> => {
    try {
      //changes
      // if (!isFirebaseConfigured || !auth || !googleProvider) {
      //   toast.error('Authentication is not configured');
      //   return null;
      // }
      if(!isFirebaseConfigured){
        toast.error('Authentication is not configured');
        console.log(isFirebaseConfigured);
        return null;
      }
      if (!auth ) {
        console.error('Firebase auth  is not initialized');
        return null;
      }
      if (!googleProvider) {
        console.error('Google provider is not initialized');
        return null;
      }
      
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      await logUserAction(result.user.uid, 'auth', 'login', {
        method: 'google',
        email: result.user.email,
        name: result.user.displayName,
        isNewUser: result.user.metadata.creationTime === result.user.metadata.lastSignInTime
      });
      
      toast.success(`Welcome ${result.user.displayName?.split(' ')[0] || 'back'}!`);
      return result;
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      await logUserAction('anonymous', 'auth', 'login_failed', {
        error: error.message,
        method: 'google'
      });
      
      toast.error('Failed to sign in. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (!isFirebaseConfigured || !auth) {
        return;
      }
      
      if (user) {
        await logUserAction(user.uid, 'auth', 'logout', {
          email: user.email,
          sessionDuration: Date.now() - new Date(user.metadata.lastSignInTime!).getTime()
        });
      }
      
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};