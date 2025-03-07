import React from 'react';
import { Link } from 'react-router-dom';
import './login-form.component.css';

const LoginForm = () => {
    return(
        <div className="component">
            <div className="logo">
                <span className='logo-purple'>BOGI</span>
                <span className='logo-gold'>NOIR</span>
            </div>
            <div className='login-form'>
                <label>Email Address</label>
                <input type='email' placeholder='Enter your email address' />
                <label>Password</label>
                <input type='password' placeholder='Enter your password' />
                <button className='login-button'>Login</button>
                <sub>
                    <Link to='/forgot-password' className='purple'>Reset Password</Link>
                </sub>
                <div className="signup">
                    <p>Don't have an account?</p>
                    <Link to='/signup' className='purple'>Sign up</Link>
                </div>
            </div>
        </div>
    )
}

export default LoginForm;