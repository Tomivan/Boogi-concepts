import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext();

// Admin emails outside component — no useMemo needed, never changes
const ADMIN_EMAILS = ['okwuchidavida@gmail.com'];

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authReady, setAuthReady] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let unsubscribe;
        let timer;

        const initAuth = async () => {
            try {
                const [authModule, { auth }] = await Promise.all([
                    import('firebase/auth'),
                    import('../firebase'),
                ]);

                unsubscribe = authModule.onAuthStateChanged(auth, (user) => {
                    setCurrentUser(user ?? null);
                    setIsAdmin(user ? ADMIN_EMAILS.includes(user.email) : false);
                    setLoading(false);
                    setAuthReady(true);
                });
            } catch (error) {
                console.error('Error initializing auth:', error);
                setLoading(false);
                setAuthReady(true); // unblock UI even on failure
            }
        };

        // Defer auth init by 2s so it doesn't block first paint
        timer = setTimeout(initAuth, 2000);

        return () => {
            clearTimeout(timer);
            if (unsubscribe) unsubscribe();
        };
    }, []); // no dependency on ADMIN_EMAILS since it's now module-level

    // Shared helper — memoized so it doesn't cause re-renders in consumers
    const getAuth = useCallback(async () => {
        const { auth } = await import('../firebase');
        return auth;
    }, []);

    const login = useCallback(async (email, password) => {
        const [{ signInWithEmailAndPassword }, auth] = await Promise.all([
            import('firebase/auth'),
            getAuth(),
        ]);
        return signInWithEmailAndPassword(auth, email, password);
    }, [getAuth]);

    const signup = useCallback(async (email, password) => {
        const [{ createUserWithEmailAndPassword }, auth] = await Promise.all([
            import('firebase/auth'),
            getAuth(),
        ]);
        return createUserWithEmailAndPassword(auth, email, password);
    }, [getAuth]);

    const logout = useCallback(async () => {
        const [{ signOut }, auth] = await Promise.all([
            import('firebase/auth'),
            getAuth(),
        ]);
        return signOut(auth);
    }, [getAuth]);

    const resetPassword = useCallback(async (email) => {
        const [{ sendPasswordResetEmail }, auth] = await Promise.all([
            import('firebase/auth'),
            getAuth(),
        ]);
        return sendPasswordResetEmail(auth, email);
    }, [getAuth]);

    const updateUserEmail = useCallback(async (email) => {
        const { updateEmail } = await import('firebase/auth');
        return updateEmail(currentUser, email);
    }, [currentUser]);

    const updateUserPassword = useCallback(async (password) => {
        const { updatePassword } = await import('firebase/auth');
        return updatePassword(currentUser, password);
    }, [currentUser]);

    const updateUserProfile = useCallback(async (displayName) => {
        const { updateProfile } = await import('firebase/auth');
        return updateProfile(currentUser, { displayName });
    }, [currentUser]);

    // These three all need a fresh auth instance from getAuth
    const fetchSignInMethods = useCallback(async (email) => {
        const [{ fetchSignInMethodsForEmail }, auth] = await Promise.all([
            import('firebase/auth'),
            getAuth(),
        ]);
        return fetchSignInMethodsForEmail(auth, email);
    }, [getAuth]);

    const verifyResetCode = useCallback(async (oobCode) => {
        const [{ verifyPasswordResetCode }, auth] = await Promise.all([
            import('firebase/auth'),
            getAuth(),
        ]);
        return verifyPasswordResetCode(auth, oobCode);
    }, [getAuth]);

    const confirmReset = useCallback(async (oobCode, newPassword) => {
        const [{ confirmPasswordReset }, auth] = await Promise.all([
            import('firebase/auth'),
            getAuth(),
        ]);
        return confirmPasswordReset(auth, oobCode, newPassword);
    }, [getAuth]);

    const checkAdminStatus = useCallback(
        (email) => ADMIN_EMAILS.includes(email),
        []
    );

    // Stable value object — only updates when auth state actually changes
    const value = {
        currentUser,
        isAdmin,
        authReady,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        updateUserEmail,
        updateUserPassword,
        updateUserProfile,
        checkAdminStatus,
        fetchSignInMethods,
        verifyResetCode,
        confirmReset,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}