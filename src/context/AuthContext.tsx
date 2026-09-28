import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export interface ERPUserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'FINANCE_HEAD' | 'PROCUREMENT_MGR' | 'PLANT_MGR';
  department: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: ERPUserProfile;
  currentTenantId: string;
  currentCompanyCode: string;
  currentPlantCode: string;
  currentFY: string;
  setCurrentCompanyCode: (code: string) => void;
  setCurrentPlantCode: (code: string) => void;
  setCurrentFY: (fy: string) => void;
  switchRole: (role: ERPUserProfile['role']) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const DEFAULT_USER: ERPUserProfile = {
  uid: 'usr-admin-default',
  email: 'admin@apexsteel.com',
  name: 'System Administrator (CEO)',
  role: 'ADMIN',
  department: 'Executive Governance',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<ERPUserProfile>(DEFAULT_USER);
  const [currentTenantId] = useState<string>(''); // Resolved dynamically or defaulted by backend
  const [currentCompanyCode, setCurrentCompanyCode] = useState<string>('COMP-1000');
  const [currentPlantCode, setCurrentPlantCode] = useState<string>('PLT-RAIPUR');
  const [currentFY, setCurrentFY] = useState<string>('FY 2026-27');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setCurrentUser((prev) => ({
          uid: user.uid,
          email: user.email || 'operator@apexsteel.com',
          name: user.displayName || user.email?.split('@')[0] || 'ERP Operator',
          role: prev.role,
          department: prev.department,
        }));

        // Sync with backend database
        try {
          const token = await user.getIdToken();
          await fetch('/api/v1/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              name: user.displayName,
            }),
          });
        } catch (e) {
          console.error('Failed to sync user with database:', e);
        }
      } else {
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const switchRole = (role: ERPUserProfile['role']) => {
    const roleMeta: Record<ERPUserProfile['role'], { name: string; dept: string }> = {
      ADMIN: { name: 'System Administrator (MD)', dept: 'Executive Board' },
      FINANCE_HEAD: { name: 'Chief Financial Officer (CFO)', dept: 'Finance & Treasury' },
      PROCUREMENT_MGR: { name: 'Head of Strategic Sourcing', dept: 'Procurement & Contracts' },
      PLANT_MGR: { name: 'Vice President - Steel Plants', dept: 'Operations & Manufacturing' },
    };

    setCurrentUser((prev) => ({
      ...prev,
      role,
      name: roleMeta[role].name,
      department: roleMeta[role].dept,
    }));
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Sign-in failed:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(DEFAULT_USER);
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = '';
    if (firebaseUser) {
      token = await firebaseUser.getIdToken();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-erp-user': JSON.stringify(currentUser),
      ...(currentTenantId ? { 'x-tenant-id': currentTenantId } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        currentTenantId,
        currentCompanyCode,
        currentPlantCode,
        currentFY,
        setCurrentCompanyCode,
        setCurrentPlantCode,
        setCurrentFY,
        switchRole,
        signInWithGoogle,
        signOut,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
