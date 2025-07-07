// AdminShippingEditor.js
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './admin-shipping-editor.css';

const AdminShippingEditor = () => {
  const [areas, setAreas] = useState({});
  const [newArea, setNewArea] = useState('');
  const [newFee, setNewFee] = useState(0);
  const [defaultFee, setDefaultFee] = useState(5000);

  useEffect(() => {
    const fetchShippingFees = async () => {
      const docSnap = await getDoc(doc(db, 'config', 'shippingFees'));
      if (docSnap.exists()) {
        const data = docSnap.data().areas;
        setAreas(data);
        setDefaultFee(data.default || 5000);
      }
    };
    fetchShippingFees();
  }, []);

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, 'config', 'shippingFees'), {
        areas: {
          ...areas,
          default: defaultFee
        }
      });
      alert('Shipping fees updated successfully!');
    } catch (error) {
      console.error('Error updating shipping fees:', error);
      alert('Failed to update shipping fees');
    }
  };

  const addNewArea = () => {
    if (newArea && newFee > 0) {
      setAreas(prev => ({
        ...prev,
        [newArea.toLowerCase()]: Number(newFee)
      }));
      setNewArea('');
      setNewFee(0);
    }
  };

  const removeArea = (area) => {
    const newAreas = { ...areas };
    delete newAreas[area];
    setAreas(newAreas);
  };

  return (
    <div className="admin-shipping-editor">
      <h2>Shipping Fee Configuration</h2>
      
      <div className="default-fee">
        <label>Default Shipping Fee (₦):</label>
        <input
          type="number"
          value={defaultFee}
          onChange={(e) => setDefaultFee(Number(e.target.value))}
        />
      </div>
      
      <div className="add-area">
        <h3>Add New Area</h3>
        <input
          type="text"
          placeholder="Area name (e.g., Victoria Island)"
          value={newArea}
          onChange={(e) => setNewArea(e.target.value)}
        />
        <input
          type="number"
          placeholder="Fee in Naira"
          value={newFee}
          onChange={(e) => setNewFee(Number(e.target.value))}
        />
        <button onClick={addNewArea} className='add-area-button'>Add Area</button>
      </div>
      
      <div className="areas-list">
        <h3>Current Shipping Areas</h3>
        <table>
          <thead>
            <tr>
              <th>Area</th>
              <th>Fee (₦)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(areas).map(([area, fee]) => (
              area !== 'default' && (
                <tr key={area}>
                  <td>{area}</td>
                  <td>{fee.toLocaleString()}</td>
                  <td>
                    <button onClick={() => removeArea(area)}>Remove</button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
      
      <button className="save-btn" onClick={handleUpdate}>
        Save All Changes
      </button>
    </div>
  );
};

export default AdminShippingEditor;