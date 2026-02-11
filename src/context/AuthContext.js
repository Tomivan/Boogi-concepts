import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Configure your admin emails (can be array for multiple admins)
  const ADMIN_EMAILS = useMemo(() => ['okwuchidavida@gmail.com'], []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAdmin(user ? ADMIN_EMAILS.includes(user.email) : false);
      setLoading(false);
    });
    return unsubscribe;
  }, [ADMIN_EMAILS]);

  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Signup function
  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Password reset function
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Update email function
  const updateUserEmail = async (email) => {
    try {
      await updateEmail(currentUser, email);
    } catch (error) {
      console.error('Email update error:', error);
      throw error;
    }
  };

  // Update password function
  const updateUserPassword = async (password) => {
    try {
      await updatePassword(currentUser, password);
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  // Check admin status (can be used to verify admin status at any time)
  const checkAdminStatus = (email) => {
    return ADMIN_EMAILS.includes(email);
  };

  const value = { 
    currentUser,
    isAdmin,
    login,
    signup,
    logout,
    resetPassword,
    updateUserEmail,
    updateUserPassword,
    checkAdminStatus
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