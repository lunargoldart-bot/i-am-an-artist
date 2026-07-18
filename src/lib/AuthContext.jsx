import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthChange } from '@/lib/firebaseAuth';
import authService from '@/services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((nextUser, error) => {
      setUser(nextUser);
      setAuthError(error ? { type: 'unknown', message: error.message } : null);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const nextUser = await authService.getCurrentUser();
      setUser(nextUser);
      setAuthError(null);
      return nextUser;
    } catch (error) {
      setUser(null);
      setAuthError({ type: 'unknown', message: error.message });
      return null;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  const logout = useCallback(async (shouldRedirect = false) => {
    await authService.logout();
    setUser(null);
    if (shouldRedirect) window.location.assign(typeof shouldRedirect === 'string' ? shouldRedirect : '/');
  }, []);

  const navigateToLogin = useCallback((returnUrl = window.location.href) => {
    authService.redirectToLogin(returnUrl);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      isLoadingAuth,
      isLoadingPublicSettings: false,
      appPublicSettings: null,
      authError,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
