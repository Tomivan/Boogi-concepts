import React from 'react';
import './delivery.component.css';

const Delivery = () => {
    return(
        <div className="component">
            <h1>Billing Details</h1>
            <div className="delivery">
                <form className="delivery-form">
                    <div className="flex">
                        <div className="column">
                            <label>First Name</label>
                            <input type='text' placeholder='' />
                        </div>
                        <div className="column">
                            <label>Last name</label>
                            <input type='text' placeholder='' />
                        </div>
                    </div>
                    <label>Street Address</label>
                    <input type='text' placeholder='Enter house number and street name' />
                    <label>Town/City</label>
                    <input type='text' placeholder='' />
                    <label>State</label>
                    <input type='text' placeholder='' />
                    <label>Phone number</label>
                    <input type='phone' placeholder='' />
                    <label>Email Address</label>
                    <input type='email' placeholder='' />
                    <label>Order Instructions </label>
                    <textarea></textarea>
                    <button className='place-order'>Place Order</button>
                </form>
                <div className="billing-summary">
                    <div className="total">
                        <p>Item's total(2)</p>
                        <p>&#8358; 30000</p>
                    </div>
                    <div className="total">
                        <p>Shipping</p>
                        <p>&#8358; 4000</p>
                    </div>
                    <hr />
                    <div className="total">
                        <p>Total</p>
                        <p>&#8358; 34000</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Delivery;