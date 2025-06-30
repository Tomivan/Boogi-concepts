// orders.component.js
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './orders.component.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const ordersRef = collection(db, 'orders');
          const q = query(
            ordersRef,
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          
          const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setOrders(ordersData);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="component loading">Loading orders...</div>;
  }

  if (!user) {
    return (
      <div className="component">
        <div className="orders">
          <h1>Orders</h1>
          <p>Please login to view your orders</p>
          <Link to="/login" className="login-link">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="component">
      <div className="orders">
        <h1>Orders</h1>
        {orders.length === 0 ? (
          <p className='no-order'>You haven't placed any orders yet</p>
        ) : (
          orders.map(order => (
            <div className="order" key={order.id}>
              <div className="item">
                <img 
                  src={order.items[0]?.imageUrl || '../../assets/images/perfume.jpg'} 
                  alt="ordered perfume" 
                  className="cart-perfume" 
                />
                <div className="left-detail">
                  <p>Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p>{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                  <p><strong>₦{order.total.toLocaleString()}</strong></p>
                  <p>Placed on {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                </div>
              </div>
              <Link to={`/orders/${order.id}`} className='purple'>See details</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;