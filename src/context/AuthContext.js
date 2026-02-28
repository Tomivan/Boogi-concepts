import { createContext, useContext, useEffect, useState, useMemo } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const ADMIN_EMAILS = useMemo(() => ['okwuchidavida@gmail.com'], []);

  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      try {
        // Import Firebase modules
        const authModule = await import('firebase/auth');
        const { auth } = await import('../firebase');
        
        // Set up auth state listener
        unsubscribe = authModule.onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          setIsAdmin(user ? ADMIN_EMAILS.includes(user.email) : false);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [ADMIN_EMAILS]);

  // Helper function to get auth instance
  const getAuth = async () => {
    const { auth } = await import('../firebase');
    return auth;
  };

  const login = async (email, password) => {
    const authModule = await import('firebase/auth');
    const auth = await getAuth();
    return authModule.signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    const authModule = await import('firebase/auth');
    const auth = await getAuth();
    return authModule.createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const authModule = await import('firebase/auth');
    const auth = await getAuth();
    return authModule.signOut(auth);
  };

  const resetPassword = async (email) => {
    const authModule = await import('firebase/auth');
    const auth = await getAuth();
    return authModule.sendPasswordResetEmail(auth, email);
  };

  const updateUserEmail = async (email) => {
    const authModule = await import('firebase/auth');
    return authModule.updateEmail(currentUser, email);
  };

  const updateUserPassword = async (password) => {
    const authModule = await import('firebase/auth');
    return authModule.updatePassword(currentUser, password);
  };

  const fetchSignInMethods = async (email) => {
    const authModule = await import('firebase/auth');
    const { getAuth } = authModule;
    const { default: app } = await import('../firebase');
    const auth = getAuth(app);
    return authModule.fetchSignInMethodsForEmail(auth, email);
  };

  const verifyResetCode = async (oobCode) => {
    const authModule = await import('firebase/auth');
    const { getAuth } = authModule;
    const { default: app } = await import('../firebase');
    const auth = getAuth(app);
    return authModule.verifyPasswordResetCode(auth, oobCode);
  };

  const confirmReset = async (oobCode, newPassword) => {
    const authModule = await import('firebase/auth');
    const { getAuth } = authModule;
    const { default: app } = await import('../firebase');
    const auth = getAuth(app);
    return authModule.confirmPasswordReset(auth, oobCode, newPassword);
  };

  const updateUserProfile = async (displayName) => {
    const authModule = await import('firebase/auth');
    return authModule.updateProfile(currentUser, { displayName });
  };

  const checkAdminStatus = (email) => ADMIN_EMAILS.includes(email);

  const value = {
    currentUser,
    isAdmin,
    login,
    signup,
    logout,
    resetPassword,
    updateUserEmail,
    updateUserPassword,
    checkAdminStatus,
    fetchSignInMethods,
    verifyResetCode,
    confirmReset,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}