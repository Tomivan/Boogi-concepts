import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from "../../firebase";
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { showErrorAlert, showSuccessAlert } from '../../utils/alert';
import './signup-form.component.css';

const SignupForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCreatingLoader, setShowCreatingLoader] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (password) => {
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            setPasswordError('Password must contain at least one uppercase letter');
            return false;
        }
        if (!/[0-9]/.test(password)) {
            setPasswordError('Password must contain at least one number');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (!validatePassword(password)) {
            return;
        }

        if (loading) return;
        
        setLoading(true);
        setShowCreatingLoader(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // Update user profile with display name
            await updateProfile(user, {
                displayName: fullName
            });

            // Save additional user data to Firestore
            await addDoc(collection(db, "users"), {
                uid: user.uid,
                email: user.email,
                fullName: fullName,
                createdAt: new Date()
            });

            setShowCreatingLoader(false);
            showSuccessAlert('Welcome!', 'Account created successfully');
            setLoading(false);
            navigate("/login");
        } catch(err) {
            setShowCreatingLoader(false);
            setLoading(false);
            let errorMessage = 'Signup Failed';
            
            switch(err.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters';
                    break;
                default:
                    errorMessage = 'An error occurred during signup';
            }
            
            showErrorAlert('Signup Failed', errorMessage);
        }
    };

    return(
        <div className='component'>
            {showCreatingLoader && (
                <div className="signup-overlay-loader">
                    <div className="signup-overlay-container">
                        <div className="signup-overlay-spinner"></div>
                        <p>Creating your account...</p>
                    </div>
                </div>
            )}
            
            <div className="logo">
                <span className='logo-purple'>BOOGI</span>
                <span className='logo-gold'>NOIRE</span>
            </div>
            <form className='signup-form' onSubmit={handleSignup}>
                <label>Full Name</label>
                <input 
                    type='text' 
                    placeholder='Enter your first name and last name' 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    minLength={2}
                    disabled={loading}
                />
                
                <label>Email Address</label>
                <input 
                    type='email' 
                    placeholder='Enter your email address' 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                
                <label>Password</label>
                <input 
                    type='password' 
                    placeholder='Enter your password (min 8 characters)' 
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                    }}
                    required
                    minLength={8}
                    disabled={loading}
                />
                {passwordError && <p className="error-message">{passwordError}</p>}
                
                <button 
                    type="submit" 
                    className='signup-button'
                    disabled={!email || !password || !fullName || passwordError || loading}
                >
                    {loading ? (
                        <>
                            <span className="button-loader"></span>
                            Creating Account...
                        </>
                    ) : 'Signup'}
                </button>
                
                <div className="login">
                    <p>Already have an account?</p>
                    <Link to='/login' className='purple' tabIndex={loading ? -1 : 0}>Log in</Link>
                </div>
            </form>
        </div>
    );
};

export default SignupForm;