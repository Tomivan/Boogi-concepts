import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../firebase';
import './reset-password-form.component.css';

const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [validLink, setValidLink] = useState(true);
  const { oobCode } = useParams(); // Get the reset code from URL
  const navigate = useNavigate();
  const location = useLocation();

  // Check if coming from forgot password page
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  // Verify the reset code when component mounts
  useEffect(() => {
    const verifyResetCode = async () => {
      try {
        const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(verifiedEmail);
      } catch (err) {
        setValidLink(false);
        setError('Invalid or expired reset link');
      }
    };

    if (oobCode) verifyResetCode();
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/expired-action-code':
        return 'Reset link has expired';
      case 'auth/invalid-action-code':
        return 'Invalid reset link';
      case 'auth/weak-password':
        return 'Password is too weak';
      default:
        return 'Failed to reset password';
    }
  };

  if (!validLink) {
    return (
      <div className="component">
        <div className="logo">
          <span className='logo-purple'>BOGI</span>
          <span className='logo-gold'>NOIR</span>
        </div>
        <div className="reset-password-form">
          <h2>Invalid Reset Link</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/forgot-password')}>
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="component">
      <div className="logo">
        <span className='logo-purple'>BOGI</span>
        <span className='logo-gold'>NOIR</span>
      </div>
      <div className="reset-password-form">
        {success ? (
          <div className="success-message">
            <h2>Password Reset Successful!</h2>
            <p>Redirecting to login page...</p>
          </div>
        ) : (
          <>
            <h2>Reset Your Password</h2>
            {email && <p>For: {email}</p>}
            
            {error && <p className="error-message">{error}</p>}
            
            <form onSubmit={handleSubmit}>
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              
              <button
                type="submit"
                className="set-password"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;