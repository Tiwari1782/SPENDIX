import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.getMe();
        setUser(data);
        setCompanyId(data.company_id || 1); // fallback to 1 for demo
      } catch {
        setUser(null);
        setCompanyId(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.login(email, password);
    setUser(data.user);
    setCompanyId(data.user?.company_id || 1);
    return data;
  };

  const registerUser = async (formData) => {
    const { data } = await api.register(formData);
    setUser(data.user);
    setCompanyId(data.company_id);
    return data;
  };

  const logoutUser = async () => {
    await api.logout();
    setUser(null);
    setCompanyId(null);
  };

  const value = {
    user,
    companyId,
    loading,
    login,
    register: registerUser,
    logout: logoutUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
