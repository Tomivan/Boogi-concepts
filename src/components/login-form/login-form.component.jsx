import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showErrorAlert, showSuccessAlert } from '../../utils/alert';
import './login-form.component.css';

const LoginForm = () => {
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLoginLoader, setShowLoginLoader] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleLogin = async(e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setShowLoginLoader(true);

        try {
            await login(email, password);
            setShowLoginLoader(false);
            showSuccessAlert('Welcome back!', 'You have successfully logged in');
            navigate("/")
        } catch(err) {
            setShowLoginLoader(false);
            const errorMessage = getErrorMessage(err.code);
            setError(errorMessage);
            showErrorAlert('Login Failed', errorMessage);
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
            {showLoginLoader && (
                <div className="login-overlay-loader">
                    <div className="login-overlay-container">
                        <div className="login-overlay-spinner"></div>
                        <p>Signing in...</p>
                    </div>
                </div>
            )}
            
            <div className="logo">
                <span className='logo-purple'>BOOGI</span>
                <span className='logo-gold'>NOIRE</span>
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
                    disabled={loading}
                />
                <label>Password</label>
                <input 
                    type='password' 
                    placeholder='Enter your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
                <button className='login-button' disabled={loading}>
                    {loading ? (
                        <>
                            <span className="button-loader"></span>
                            Logging in...
                        </>
                    ) : 'Login'}
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