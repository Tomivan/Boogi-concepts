import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './brand.component.css';

const Brand = ({ onBrandFilter }) => {
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch unique brands from Firestore
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(false);
        const querySnapshot = await getDocs(collection(db, 'products'));
        
        const allBrands = querySnapshot.docs.map(doc => doc.data()['Brand Name']);
        
        const uniqueBrands = [...new Set(allBrands)]
          .filter(brand => brand && brand.trim() !== '')
          .sort((a, b) => a.localeCompare(b));
        
        setBrands(uniqueBrands);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandToggle = (brand) => {
    const newSelectedBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    
    setSelectedBrands(newSelectedBrands);
    onBrandFilter(newSelectedBrands);
  };

  return (
    <div className='component brand'>
      <h3>Brand</h3>
      
      {loading ? (
        <div className="brand-loader-container">
          <div className="brand-loader"></div>
          <p>Loading brands...</p>
        </div>
      ) : error ? (
        <div className="brand-error">
          <p>Failed to load brands. Please try again.</p>
        </div>
      ) : brands.length > 0 ? (
        <div className="brands-list-container">
          <div className="brands-scrollable">
            {brands.map((brand) => (
              <div className="brand-item flex" key={brand}>
                <input
                  type='checkbox'
                  className='checkbox'
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  id={`brand-${brand.replace(/\s+/g, '-')}`}
                  disabled={loading}
                />
                <label htmlFor={`brand-${brand.replace(/\s+/g, '-')}`}>
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-brands">
          <p>No brands found</p>
        </div>
      )}
    </div>
  );
};

export default Brand;