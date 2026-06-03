import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setToken, removeToken } from '../utils/api';

const AuthContext = createContext();

function loadSession() {
  try {
    const saved = sessionStorage.getItem('desaCikulak_user');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSession);
  const [users,       setUsers]       = useState([]);
  const [loginError,  setLoginError]  = useState('');
  const [loading,     setLoading]     = useState(false);

  const isKepala  = currentUser?.role === 'kepala_desa';
  const isLoggedIn = !!currentUser;

  const login = async (username, password) => {
    setLoginError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      setToken(res.token);
      sessionStorage.setItem('desaCikulak_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
      setLoading(false);
      return true;
    } catch (err) {
      setLoginError(err.message || 'Login gagal');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    removeToken();
    sessionStorage.removeItem('desaCikulak_user');
    setCurrentUser(null);
    setUsers([]);
  };

  const register = async (data) => {
    try {
      const res = await authAPI.register(data);
      return { ok: true, msg: res.msg };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  };

  const loadUsers = async () => {
    if (!isKepala) return;
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data || []);
    } catch (e) {}
  };

  const aktivasiUser = async (id) => { await authAPI.aktifkan(id); await loadUsers(); };
  const nonaktifUser = async (id) => { await authAPI.nonaktifkan(id); await loadUsers(); };
  const hapusUser    = async (id) => { await authAPI.hapusUser(id); await loadUsers(); };

  useEffect(() => { if (isKepala) loadUsers(); }, [isKepala]);

  return (
    <AuthContext.Provider value={{
      users, currentUser, loginError, setLoginError, loading,
      login, logout, register,
      aktivasiUser, nonaktifUser, hapusUser, loadUsers,
      isKepala, isLoggedIn,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }