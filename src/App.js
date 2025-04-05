import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { AuthProvider } from './context/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { CartProvider } from './context/CartContext';
import Pages from './pages';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setLoading(false);
    });
    return unsubscribe; // Cleanup subscription
  }, []);

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="App">
      <AuthProvider>
        <CartProvider>
          <Pages />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;