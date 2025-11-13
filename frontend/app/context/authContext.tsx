'use client';

import { createContext, useContext, useState } from 'react';

interface User {
  id?: number;
  name?: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUserProfile: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const setUserProfile =async() => {
    const res = await fetch('https://rewear-w7ik.onrender.com/api/auth/profile', {
      credentials: 'include',
    });
    const data = await res.json();
    console.log("user profile from be ",data);
    setUser(data.user); // includes isAdmin
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
