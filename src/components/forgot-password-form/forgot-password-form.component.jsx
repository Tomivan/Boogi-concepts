import React from 'react';
import './forgot-password-form.component.css';

const ForgotPasswordForm = () => {
    return(
        <div className="component">
            <div className="logo">
                <span className='logo-purple'>BOGI</span>
                <span className='logo-gold'>NOIR</span>
            </div>
            <div className='forgot-password'>
                <label>Email Address</label>
                <input type='email' placeholder='Enter your email address' />
                <button className='reset-password'>Reset Password</button>
            </div>
        </div>
    )
}

export default ForgotPasswordForm;