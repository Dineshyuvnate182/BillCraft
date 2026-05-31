import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => { try { return JSON.parse(localStorage.getItem('bc_user')); } catch { return null; } });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const login = useCallback(async (email, password) => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('bc_token', data.token);
      localStorage.setItem('bc_user',  JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed');
      return false;
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (form) => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('bc_token', data.token);
      localStorage.setItem('bc_user',  JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed');
      return false;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bc_token');
    localStorage.removeItem('bc_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
