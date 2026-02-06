import { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  showSuccessAlert, 
  showErrorAlert
} from '../../utils/alert';
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
  const [isSaving, setIsSaving] = useState(false);
  const [showImageUploadLoader, setShowImageUploadLoader] = useState(false);
  const [showSavingLoader, setShowSavingLoader] = useState(false);

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorAlert('File Too Large', 'Please select an image smaller than 5MB.');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showErrorAlert('Invalid File Type', 'Please select a JPEG, PNG, WEBP, or GIF image.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    await uploadImage(file);
  };

  const uploadImage = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setShowImageUploadLoader(true);

    const storageRef = ref(storage, `perfumes/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setIsUploading(false);
        setShowImageUploadLoader(false);
        showErrorAlert('Upload Failed', 'Failed to upload image. Please try again.');
        console.error('Upload error:', error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({
            ...prev,
            Image: downloadURL
          }));
          setIsUploading(false);
          setShowImageUploadLoader(false);
          showSuccessAlert(
            'Image Uploaded!', 
            'Your image has been uploaded successfully.',
            1500
          );
        } catch (error) {
          setIsUploading(false);
          setShowImageUploadLoader(false);
          showErrorAlert('Upload Error', 'Failed to get image URL. Please try again.');
          console.error('Download URL error:', error);
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSaving || isUploading) return;
    
    // Validate form
    if (!formData.Name.trim() || !formData.Brand.trim() || !formData.Description.trim()) {
      showErrorAlert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    if (formData.Price <= 0) {
      showErrorAlert('Validation Error', 'Please enter a valid price greater than 0.');
      return;
    }

    setIsSaving(true);
    setShowSavingLoader(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setShowSavingLoader(false);
      
      showSuccessAlert(
        product ? 'Perfume Updated!' : 'Perfume Added!',
        product 
          ? 'Your perfume has been updated successfully.' 
          : 'New perfume has been added to the catalog.',
        1500
      );
      
      // Call parent save function
      onSave({
        ...formData,
        id: product ? product.id : Date.now()
      });
      
      if (!product) {
        setFormData({
          Name: '',
          Price: 0,
          Description: '',
          Image: '',
          Brand: '',
          Gender: 'Unisex'
        });
        setImagePreview('');
      }
      
    } catch (error) {
      setShowSavingLoader(false);
      showErrorAlert(
        product ? 'Update Failed' : 'Add Failed',
        product 
          ? 'Failed to update perfume. Please try again.' 
          : 'Failed to add perfume. Please try again.'
      );
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if ((formData.Name || formData.Brand || formData.Description || formData.Image) && !isSaving) {
      // Ask for confirmation if form has data
      showErrorAlert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?'
      ).then((result) => {
        if (result.isConfirmed) {
          onCancel();
        }
      });
    } else {
      onCancel();
    }
  };

  return (
    <div className="edit-perfume-overlay">
      {/* Image Upload Loader Overlay */}
      {showImageUploadLoader && (
        <div className="upload-overlay-loader">
          <div className="upload-overlay-container">
            <div className="upload-overlay-spinner"></div>
            <p>Uploading image...</p>
            <div className="upload-overlay-progress">
              <div className="upload-overlay-bar">
                <div 
                  className="upload-overlay-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="upload-overlay-percentage">{Math.round(uploadProgress)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Saving Loader Overlay */}
      {showSavingLoader && (
        <div className="saving-overlay-loader">
          <div className="saving-overlay-container">
            <div className="saving-overlay-spinner"></div>
            <p>{product ? 'Updating perfume...' : 'Adding perfume...'}</p>
          </div>
        </div>
      )}

      <div className="edit-perfume-container">
        <h2>{product ? 'Edit Perfume' : 'Add New Perfume'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              required
              disabled={isUploading || isSaving}
              placeholder="Enter perfume name"
            />
          </div>

          <div className="form-group">
            <label>Brand *</label>
            <input
              type="text"
              name="Brand"
              value={formData.Brand}
              onChange={handleChange}
              required
              disabled={isUploading || isSaving}
              placeholder="Enter brand name"
            />
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <select
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              required
              disabled={isUploading || isSaving}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Price (₦) *</label>
            <input
              type="number"
              name="Price"
              value={formData.Price}
              onChange={handleChange}
              min="0"
              step="100"
              required
              disabled={isUploading || isSaving}
              placeholder="Enter price in Naira"
            />
          </div>
          
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              required
              disabled={isUploading || isSaving}
              placeholder="Describe the perfume scent, notes, and characteristics"
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label>Image</label>
            <input
              type="text"
              name="Image"
              value={formData.Image}
              onChange={handleChange}
              placeholder="Image URL or upload below"
              disabled={isUploading || isSaving}
            />
            
            <div className="image-upload-section">
              <label className={`upload-button ${isUploading || isSaving ? 'disabled' : ''}`}>
                {isUploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={isUploading || isSaving}
                />
              </label>
              
              {imagePreview && !isUploading && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  {formData.Image && (
                    <p className="image-url">Image URL: {formData.Image.substring(0, 50)}...</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel} 
              className='cancel'
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isUploading || isSaving} 
              className='add-image'
            >
              {isSaving ? (
                <>
                  <span className="button-loader"></span>
                  {product ? 'Saving...' : 'Adding...'}
                </>
              ) : (product ? 'Update Perfume' : 'Add Perfume')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPerfumeForm;