import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../../firebase";
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './signup-form.component.css';

const SignupForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError();

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            )
            const user = userCredential.user

            await addDoc(collection(db, "users"), {
                uid: user.uid,
                email: user.email,
                fullName: fullName,
                createdAt: new Date()
            })

            navigate("/")
        } catch(err) {
            setError(err.message);
            console.log(err.message)
        }
    }
    return(
        <div className='component'>
            <div className="logo">
                <span className='logo-purple'>BOGI</span>
                <span className='logo-gold'>NOIR</span>
            </div>
            {error && <p className='error-message'>{error}</p>}
            <form className='signup-form' onSubmit={handleSignup}>
                <label>Full Name</label>
                <input 
                    type='text' 
                    placeholder='Enter your first name and last name' 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
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
                    placeholder='Enter your password' 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className='signup-button'>Signup</button>
                <div className="login">
                    <p>Already have an account?</p>
                    <Link to='/login' className='purple'>Log in</Link>
                </div>
            </form>
        </div>
    )
}

export default SignupForm;