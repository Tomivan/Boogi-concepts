import './App.css';
import { useEffect } from 'react';
import Pages from './pages';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if(user) {
        navigate("/")
      }
    })
  })

  return (
    <div className="App">
      <Pages />
    </div>
  );
}

export default App;
