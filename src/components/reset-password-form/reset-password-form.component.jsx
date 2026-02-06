import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../firebase';
import { 
  showSuccessAlert, 
  showErrorAlert
} from '../../utils/alert';
import './reset-password-form.component.css';

const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [validLink, setValidLink] = useState(true);
  const [showResetLoader, setShowResetLoader] = useState(false);
  const [showRedirectLoader, setShowRedirectLoader] = useState(false);
  const { oobCode } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();

  // Check if coming from forgot password page
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  useEffect(() => {
    const verifyResetCode = async () => {
      try {
        const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(verifiedEmail);
        showSuccessAlert(
          'Valid Link', 
          'Please enter your new password.',
          2000
        );
      } catch (err) {
        setValidLink(false);
        showErrorAlert(
          'Invalid Reset Link',
          'This password reset link is invalid or has expired. Please request a new one.'
        );
      }
    };

    if (oobCode) verifyResetCode();
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      showErrorAlert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    if (newPassword.length < 8) {
      showErrorAlert('Password Too Short', 'Password must be at least 8 characters.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      showErrorAlert('Weak Password', 'Password must contain at least one uppercase letter.');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      showErrorAlert('Weak Password', 'Password must contain at least one number.');
      return;
    }

    setLoading(true);
    setShowResetLoader(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      
      setShowResetLoader(false);
      showSuccessAlert(
        'Password Reset!', 
        'Your password has been reset successfully.',
        2000
      );
      
      setSuccess(true);
      
      // Show redirect loader
      setTimeout(() => {
        setShowRedirectLoader(true);
        
        setTimeout(() => {
          setShowRedirectLoader(false);
          navigate('/login');
        }, 1800);
      }, 2200);
      
    } catch (err) {
      setShowResetLoader(false);
      const errorMessage = getErrorMessage(err.code);
      showErrorAlert('Reset Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/expired-action-code':
        return 'Reset link has expired. Please request a new one.';
      case 'auth/invalid-action-code':
        return 'Invalid reset link. Please request a new one.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      default:
        return 'Failed to reset password. Please try again.';
    }
  };

  const handleRequestNewLink = () => {
    setShowRedirectLoader(true);
    
    setTimeout(() => {
      setShowRedirectLoader(false);
      navigate('/forgot-password');
    }, 1800);
  };

  if (!validLink) {
    return (
      <div className="component">
        {/* Redirect Loader Overlay */}
        {showRedirectLoader && (
          <div className="reset-overlay-loader">
            <div className="reset-overlay-container">
              <div className="reset-overlay-spinner"></div>
              <p>Redirecting to reset page...</p>
            </div>
          </div>
        )}
        
        <div className="logo">
          <span className='logo-purple'>BOOGI</span>
          <span className='logo-gold'>NOIRE</span>
        </div>
        <div className="reset-password-form">
          <h2>Invalid Reset Link</h2>
          <p className="error-text">This password reset link is invalid or has expired.</p>
          <button 
            onClick={handleRequestNewLink}
            className="set-password"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="component">
      {/* Reset Password Loader Overlay */}
      {showResetLoader && (
        <div className="reset-overlay-loader">
          <div className="reset-overlay-container">
            <div className="reset-overlay-spinner"></div>
            <p>Resetting your password...</p>
          </div>
        </div>
      )}

      {/* Redirect Loader Overlay */}
      {showRedirectLoader && (
        <div className="reset-overlay-loader">
          <div className="reset-overlay-container">
            <div className="reset-overlay-spinner"></div>
            <p>Redirecting to login...</p>
          </div>
        </div>
      )}

      <div className="logo">
        <span className='logo-purple'>BOOGI</span>
        <span className='logo-gold'>NOIRE</span>
      </div>
      <div className="reset-password-form">
        {success ? (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h2>Password Reset Successful!</h2>
            <p className="success-text">Your password has been updated successfully.</p>
            <p className="redirect-text">Redirecting to login page...</p>
          </div>
        ) : (
          <>
            <h2>Reset Your Password</h2>
            {email && <p className="email-display">For: <strong>{email}</strong></p>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
              
              <div className="password-requirements">
                <h4>Password Requirements:</h4>
                <ul>
                  <li className={newPassword.length >= 8 ? 'met' : ''}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(newPassword) ? 'met' : ''}>One uppercase letter</li>
                  <li className={/[0-9]/.test(newPassword) ? 'met' : ''}>One number</li>
                </ul>
              </div>
              
              <button
                type="submit"
                className="set-password"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? (
                  <>
                    <span className="button-loader"></span>
                    Resetting Password...
                  </>
                ) : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;