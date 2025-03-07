import React from 'react';
import { Link } from 'react-router-dom';
import './signup-form.component.css';

const SignupForm = () => {
    return(
        <div className='component'>
            <div className="logo">
                <span className='logo-purple'>BOGI</span>
                <span className='logo-gold'>NOIR</span>
            </div>
            <div className='signup-form'>
                <label>Full Name</label>
                <input type='text' placeholder='Enter your first name and last name' />
                <label>Email Address</label>
                <input type='email' placeholder='Enter your email address' />
                <label>Password</label>
                <input type='password' placeholder='Enter your password' />
                <button className='signup-button'>Signup</button>
                <div className="login">
                    <p>Already have an account?</p>
                    <Link to='/login' className='purple'>Log in</Link>
                </div>
            </div>
        </div>
    )
}

export default SignupForm;