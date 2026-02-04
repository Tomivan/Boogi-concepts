import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showLoadingAlert, 
  showConfirmAlert,
  closeAlert 
} from '../../utils/alert';
import './admin-shipping-editor.css';

const AdminShippingEditor = () => {
  const [areas, setAreas] = useState({});
  const [newArea, setNewArea] = useState('');
  const [newFee, setNewFee] = useState(0);
  const [defaultFee, setDefaultFee] = useState(5000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingArea, setAddingArea] = useState(false);

  useEffect(() => {
    const fetchShippingFees = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'config', 'shippingFees'));
        if (docSnap.exists()) {
          const data = docSnap.data().areas;
          setAreas(data);
          setDefaultFee(data.default || 5000);
        }
      } catch (error) {
        showErrorAlert('Load Failed', 'Failed to load shipping fees. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchShippingFees();
  }, []);

  const handleUpdate = async () => {
    if (saving) return;
    
    setSaving(true);
    showLoadingAlert('Saving', 'Updating shipping fees...');
    
    try {
      await updateDoc(doc(db, 'config', 'shippingFees'), {
        areas: {
          ...areas,
          default: defaultFee
        }
      });
      
      closeAlert();
      showSuccessAlert('Success', 'Shipping fees updated successfully!');
    } catch (error) {
      closeAlert();
      showErrorAlert('Update Failed', 'Failed to update shipping fees. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addNewArea = async () => {
    if (!newArea || newFee <= 0) {
      showErrorAlert('Invalid Input', 'Please enter a valid area name and fee');
      return;
    }
    
    if (addingArea) return;
    
    setAddingArea(true);
    try {
      const areaKey = newArea.toLowerCase().trim();
      
      // Check if area already exists
      if (areas[areaKey]) {
        showErrorAlert('Duplicate Area', 'This area already exists!');
        return;
      }
      
      setAreas(prev => ({
        ...prev,
        [areaKey]: Number(newFee)
      }));
      setNewArea('');
      setNewFee(0);
      
      showSuccessAlert('Area Added', `${newArea} added successfully!`, 1500);
    } catch (error) {
      showErrorAlert('Add Failed', 'Failed to add area. Please try again.');
    } finally {
      setAddingArea(false);
    }
  };

  const removeArea = async (area) => {
    try {
      const result = await showConfirmAlert(
        'Remove Area',
        `Are you sure you want to remove "${area}" from shipping areas?`,
        'Yes, Remove',
        'Cancel'
      );
      
      if (result.isConfirmed) {
        const newAreas = { ...areas };
        delete newAreas[area];
        setAreas(newAreas);
        
        showSuccessAlert('Area Removed', `${area} has been removed successfully!`, 1500);
      }
    } catch (error) {
      showErrorAlert('Remove Failed', 'Failed to remove area. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="admin-shipping-editor loading">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading shipping configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shipping-editor">
      <h2 className="h2">Shipping Fee Configuration</h2>
      
      <div className="default-fee">
        <label>Default Shipping Fee (₦):</label>
        <input
          type="number"
          value={defaultFee}
          onChange={(e) => setDefaultFee(Number(e.target.value))}
          disabled={saving}
        />
      </div>
      
      <div className="add-area">
        <h3>Add New Area</h3>
        <div className="add-area-inputs">
          <input
            type="text"
            placeholder="Area name (e.g., Victoria Island)"
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            disabled={addingArea || saving}
          />
          <input
            type="number"
            placeholder="Fee in Naira"
            value={newFee}
            onChange={(e) => setNewFee(Number(e.target.value))}
            disabled={addingArea || saving}
          />
        </div>
        <button 
          onClick={addNewArea} 
          className='add-area-button'
          disabled={addingArea || saving || !newArea.trim() || newFee <= 0}
        >
          {addingArea ? (
            <>
              <span className="button-loader"></span>
              Adding...
            </>
          ) : (
            'Add Area'
          )}
        </button>
      </div>
      
      <div className="areas-list">
        <h3>Current Shipping Areas</h3>
        {Object.keys(areas).filter(area => area !== 'default').length === 0 ? (
          <p className="no-areas">No custom shipping areas added yet.</p>
        ) : (
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
                      <button 
                        onClick={() => removeArea(area)}
                        disabled={saving}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <button 
        className="save-btn" 
        onClick={handleUpdate}
        disabled={saving}
      >
        {saving ? (
          <>
            <span className="button-loader"></span>
            Saving...
          </>
        ) : (
          'Save All Changes'
        )}
      </button>
    </div>
  );
};

export default AdminShippingEditor;