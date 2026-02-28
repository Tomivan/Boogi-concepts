import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './components/CartProvider';
import Pages from './pages';
import './App.css';

function App() {

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