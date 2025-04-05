import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from "../../firebase";
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { showErrorAlert, showSuccessAlert, showLoadingAlert, closeAlert } from '../../utils/alert';
import './signup-form.component.css';

const SignupForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [passwordError, setPasswordError] = useState('');
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

        showLoadingAlert('Creating account...');

        try {
            // Create user with email/password
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

            closeAlert();
            showSuccessAlert('Welcome!', 'Account created successfully');
            navigate("/login");
        } catch(err) {
            closeAlert();
            let errorMessage = 'Signup Failed';
            
            // More specific error messages
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
            <div className="logo">
                <span className='logo-purple'>BOGI</span>
                <span className='logo-gold'>NOIR</span>
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
                />
                
                <label>Email Address</label>
                <input 
                    type='email' 
                    placeholder='Enter your email address' 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                />
                {passwordError && <p className="error-message">{passwordError}</p>}
                
                <button 
                    type="submit" 
                    className='signup-button'
                    disabled={!email || !password || !fullName || passwordError}
                >
                    Signup
                </button>
                
                <div className="login">
                    <p>Already have an account?</p>
                    <Link to='/login' className='purple'>Log in</Link>
                </div>
            </form>
        </div>
    );
};

export default SignupForm;