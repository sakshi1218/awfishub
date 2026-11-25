'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CurrentEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string | null;
  designation: string;
  role: 'FOUNDER' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE' | 'SALES_DIRECTOR' | 'SALES_EMPLOYEE';
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
  reportingManager?: {
    id: string;
    name: string;
    designation: string;
  } | null;
  reportingDirector?: {
    id: string;
    name: string;
    designation: string;
  } | null;
  joiningDate: string;
  status: string;
  responsibilities?: string | null;
  leaveBalanceCasual?: number | null;
  leaveBalanceSick?: number | null;
  leaveBalancePrivilege?: number | null;
}

interface AuthContextType {
  currentUser: CurrentEmployee | null;
  allUsers: CurrentEmployee[];
  loading: boolean;
  switchUser: (userId: string) => void;
  refreshUsers: () => Promise<void>;
  isFounder: boolean;
  isDirector: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isSalesRole: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentEmployee | null>(null);
  const [allUsers, setAllUsers] = useState<CurrentEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);

        // Check local storage for selected user or default to Founder
        const savedUserId = localStorage.getItem('awfis_hub_active_user');
        if (savedUserId) {
          const found = data.find((u: CurrentEmployee) => u.id === savedUserId);
          if (found) {
            setCurrentUser(found);
            setLoading(false);
            return;
          }
        }
        // Default to Founder
        const founderUser = data.find((u: CurrentEmployee) => u.role === 'FOUNDER') || data[0];
        if (founderUser) {
          setCurrentUser(founderUser);
          localStorage.setItem('awfis_hub_active_user', founderUser.id);
        }
      }
    } catch (err) {
      console.error('Failed to load employees for auth context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('awfis_hub_active_user', target.id);
    }
  };

  const isFounder = currentUser?.role === 'FOUNDER';
  const isDirector = currentUser?.role === 'DIRECTOR' || currentUser?.role === 'SALES_DIRECTOR' || isFounder;
  const isManager = currentUser?.role === 'MANAGER' || isDirector;
  const isEmployee = !!currentUser;
  const isSalesRole = currentUser?.role === 'SALES_DIRECTOR' || currentUser?.role === 'SALES_EMPLOYEE' || isFounder;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        loading,
        switchUser,
        refreshUsers: fetchUsers,
        isFounder,
        isDirector,
        isManager,
        isEmployee,
        isSalesRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
