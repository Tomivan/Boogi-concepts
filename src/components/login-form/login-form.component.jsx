import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './login-form.component.css';

const LoginForm = () => {
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState('');
    const navigate = useNavigate();

    const handleLogin = async(e) => {
        e.preventDefault();
        setError('');
        setLoading(true)

        try {
            await signInWithEmailAndPassword(auth, email, password)
            navigate("/")
        } catch(err) {
            setError(getErrorMessage(err.code));
            console.log(err)
        } finally {
            setLoading(false)
        }
    }
    const getErrorMessage = (code) => {
        switch (code) {
            case 'auth/invalid-email':
                return 'Invalid Email Address';
            case 'auth/user-disabled':
                return 'Account disabled';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect Password';
            default:
                return 'Login failed. Please try again';
        }
    }
    return(
        <div className="component">
            <div className="logo">
                <span className='logo-purple'>BOGI</span>
                <span className='logo-gold'>NOIR</span>
            </div>
            <form className='login-form' onSubmit={handleLogin}>
                {error && <p className="error-message">{error}</p>}
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
                    placeholder='Enter your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className='login-button' disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <sub>
                    <Link to='/forgot-password' className='purple'>Reset Password</Link>
                </sub>
                <div className="signup">
                    <p>Don't have an account?</p>
                    <Link to='/signup' className='purple'>Sign up</Link>
                </div>
            </form>
        </div>
    )
}

export default LoginForm;