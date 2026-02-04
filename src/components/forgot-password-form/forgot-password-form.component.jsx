import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { showErrorAlert, showSuccessAlert, showLoadingAlert, closeAlert } from '../../utils/alert';
import './forgot-password-form.component.css';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        showLoadingAlert('Sending reset link...');

        try {
            // First check if email exists
            const methods = await fetchSignInMethodsForEmail(auth, email);
            
            if (methods.length === 0) {
              closeAlert();
              setError('No account found with this email');
              setLoading(false);
              return;
            }
      
            // If email exists, send reset email and redirect
            await sendPasswordResetEmail(auth, email);
            closeAlert();
            showSuccessAlert('Email Sent', 'Check your inbox for reset instructions');
            setSuccess(true);
            
            // Redirect to reset password page after 3 seconds
            setTimeout(() => {
              navigate('/reset-password', { state: { email } });
            }, 3000);
            
          } catch (err) {
            closeAlert();
            const errorMessage = getErrorMessage(err.code);
            setError(errorMessage);
            showErrorAlert(errorMessage);
          } finally {
            setLoading(false);
          }
    }

    const getErrorMessage = (code) => {
        switch (code) {
          case 'auth/invalid-email':
            return 'Invalid email address';
          case 'auth/too-many-requests':
            return 'Too many attempts. Try again later';
          default:
            return 'Failed to send reset email. Please try again.';
        }
    };

    return(
        <div className="component">
            <div className="logo">
                <span className='logo-purple'>BOOGI</span>
                <span className='logo-gold'>NOIRE</span>
            </div>
            {success ? (
            <div className="success-message">
                <p>Password reset email sent to {email}!</p>
                <p>Redirecting to reset page...</p>
            </div>
            ) : (
            <form className='forgot-password' onSubmit={handleResetPassword}>
                {error && <p className="error-message">{error}</p>}
                <label>Email Address</label>
                <input 
                    type='email' 
                    placeholder='Enter your email address'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                 />
                <button 
                    className='reset-password' 
                    type="submit"
                    disabled={loading || !email}
                >
                    {loading ? (
                        <>
                            <span className="button-loader"></span>
                            Sending...
                        </>
                    ) : "Reset Password"}
                </button>
            </form>
            )}
        </div>
    )
}

export default ForgotPasswordForm;