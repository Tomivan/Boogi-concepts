import React from "react";
import "./reset-password-form.component.css";

const ResetPasswordForm = () => {
    return(
        <div className="component">
            <div className="logo">
                <span className='logo-purple'>BOGI</span>
                <span className='logo-gold'>NOIR</span>
            </div>
            <div className="reset-password-form">
                <label>Reset Password</label>
                <input type='password' placeholder="Enter a new password" />
            <button className="set-password">Confirm Password</button>
            </div>
        </div>
    )
}

export default ResetPasswordForm;