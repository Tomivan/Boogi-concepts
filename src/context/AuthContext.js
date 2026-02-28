import { createContext, useContext, useEffect, useState, useMemo } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authModule, setAuthModule] = useState(null); 

  const ADMIN_EMAILS = useMemo(() => ['okwuchidavida@gmail.com'], []);

  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      // Dynamically import only when component mounts
      const { auth } = await import('../firebase');
      const { onAuthStateChanged } = await import('firebase/auth');

      setAuthModule({ auth }); 

      unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setIsAdmin(user ? ADMIN_EMAILS.includes(user.email) : false);
        setLoading(false);
      });
    };

    initAuth();
    return () => unsubscribe?.();
  }, [ADMIN_EMAILS]);

  const login = async (email, password) => {
    const { auth } = authModule || await import('../firebase');
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    const { auth } = authModule || await import('../firebase');
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const { auth } = authModule || await import('../firebase');
    const { signOut } = await import('firebase/auth');
    return signOut(auth);
  };

  const resetPassword = async (email) => {
    const { auth } = authModule || await import('../firebase');
    const { sendPasswordResetEmail } = await import('firebase/auth');
    return sendPasswordResetEmail(auth, email);
  };

  const updateUserEmail = async (email) => {
    const { updateEmail } = await import('firebase/auth');
    return updateEmail(currentUser, email);
  };

  const updateUserPassword = async (password) => {
    const { updatePassword } = await import('firebase/auth');
    return updatePassword(currentUser, password);
  };

  const fetchSignInMethods = async (email) => {
  const { fetchSignInMethodsForEmail } = await import('firebase/auth');
  const { getAuth } = await import('firebase/auth');
  const { default: app } = await import('../firebase');
  const auth = getAuth(app);
  return fetchSignInMethodsForEmail(auth, email);
};
const verifyResetCode = async (oobCode) => {
  const { verifyPasswordResetCode } = await import('firebase/auth');
  const { getAuth } = await import('firebase/auth');
  const { default: app } = await import('../firebase');
  const auth = getAuth(app);
  return verifyPasswordResetCode(auth, oobCode);
};

const confirmReset = async (oobCode, newPassword) => {
  const { confirmPasswordReset } = await import('firebase/auth');
  const { getAuth } = await import('firebase/auth');
  const { default: app } = await import('../firebase');
  const auth = getAuth(app);
  return confirmPasswordReset(auth, oobCode, newPassword);
};

const updateUserProfile = async (displayName) => {
  const { updateProfile } = await import('firebase/auth');
  return updateProfile(currentUser, { displayName });
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