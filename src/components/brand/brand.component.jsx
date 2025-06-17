import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './brand.component.css';

const Brand = ({ onBrandFilter }) => {
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch unique brands from Firestore
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        
        // Extract "Brand Name" field from each document
        const allBrands = querySnapshot.docs.map(doc => doc.data()['Brand Name']);
        
        // Get unique brands, remove empty/null, and sort alphabetically
        const uniqueBrands = [...new Set(allBrands)]
          .filter(brand => brand && brand.trim() !== '')
          .sort((a, b) => a.localeCompare(b));
        
        setBrands(uniqueBrands);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching brands:', error);
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

  if (loading) {
    return <div className="component brand">Loading brands...</div>;
  }

  return (
    <div className='component brand'>
      <h3>Brand</h3>
      {brands.length > 0 ? (
        brands.map((brand) => (
          <div className="flex" key={brand}>
            <input
              type='checkbox'
              className='checkbox'
              checked={selectedBrands.includes(brand)}
              onChange={() => handleBrandToggle(brand)}
              id={`brand-${brand.replace(/\s+/g, '-')}`}
            />
            <label htmlFor={`brand-${brand.replace(/\s+/g, '-')}`}>
              {brand}
            </label>
          </div>
        ))
      ) : (
        <p>No brands found</p>
      )}
    </div>
  );
};

export default Brand;