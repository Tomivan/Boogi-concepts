import React, { useState } from 'react';
import './brand.component.css';

const Brand = ({ onBrandFilter }) => {
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Remove duplicate brands
  const brands = [
    'Antonio Banderas',
    'Christian Dior',
    'Fragrance Avenue',
    'Fragrance World',
    'Hugo Boss'
  ];

  const handleBrandToggle = (brand) => {
    const newSelectedBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    
    setSelectedBrands(newSelectedBrands);
    onBrandFilter(newSelectedBrands);
  };

  return (
    <div className='component brand'>
      <h3>Filter by Brand</h3>
      {brands.map((brand) => (
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
      ))}
    </div>
  );
};

export default Brand;