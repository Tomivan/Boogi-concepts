import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import './edit-perfume.component.css';

const EditPerfumeForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    Name: '',
    Price: 0,
    Description: '',
    Image: '',
    Brand: '',
    Gender: 'Unisex'
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const storage = getStorage();

  useEffect(() => {
    if (product) {
      setFormData({
        Name: product.Name,
        Price: product.Price,
        Brand: product.Brand,
        Gender: product.Gender || 'Unisex',
        Description: product.Description || '',
        Image: product.Image || ''
      });
      if (product.Image) {
        setImagePreview(product.Image);
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Price' ? Number(value) : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    uploadImage(file);
  };

  const uploadImage = (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    const storageRef = ref(storage, `perfumes/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData(prev => ({
            ...prev,
            Image: downloadURL
          }));
          setIsUploading(false);
        });
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: product ? product.id : Date.now()
    });
  };

  return (
    <div className="edit-perfume-overlay">
      <div className="edit-perfume-container">
        <h2>{product ? 'Edit Perfume' : 'Add New Perfume'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Brand:</label>
            <input
              type="text"
              name="Brand"
              value={formData.Brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Gender:</label>
            <select
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Price (₦):</label>
            <input
              type="number"
              name="Price"
              value={formData.Price}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Image:</label>
            <input
              type="text"
              name="Image"
              value={formData.Image}
              onChange={handleChange}
              placeholder="Image URL or upload below"
            />
            
            <div className="image-upload-section">
              <label className="upload-button">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              
              {isUploading && (
                <div className="upload-progress">
                  <progress value={uploadProgress} max="100" />
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
              )}
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <p className="image-url">Image URL: {formData.Image}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className='cancel'>Cancel</button>
            <button type="submit" disabled={isUploading} className='add-image'>
              {isUploading ? 'Uploading...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPerfumeForm;