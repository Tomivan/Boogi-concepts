import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { db } from '../../firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { showSuccessAlert, showErrorAlert } from '../../utils/alert';
import './product-details.component.css';

const ProductDetails = () => {
  const { state } = useLocation();
  const product = state?.product;
  
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    name: '',
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [productLoading, setProductLoading] = useState(true);
  const [showAddToCartLoader, setShowAddToCartLoader] = useState(false);
  const [showSubmitReviewLoader, setShowSubmitReviewLoader] = useState(false);

  // Fetch reviews from Firebase
  useEffect(() => {
    if (!product?.id) {
      setProductLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', product.id)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviewsData = [];
      querySnapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() });
      });
      setReviews(reviewsData);
      setLoadingReviews(false);
      setProductLoading(false);
    }, (error) => {
      console.error('Error fetching reviews:', error);
      setLoadingReviews(false);
      setProductLoading(false);
    });

    return () => unsubscribe();
  }, [product?.id]);

  // Handle add to cart with custom loader
  const handleAddToCart = async () => {
    if (!product) return;
    
    setShowAddToCartLoader(true);
    
    try {
      // Check if product already in cart
      const existingItem = cartItems.find(item => 
        item.id === product.id || 
        (item.Name === product.Name && item['Brand Name'] === product['Brand Name'])
      );
      
      // Add to cart
      addToCart(product);
      
      setShowAddToCartLoader(false);
      
      // Show success notification
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        showSuccessAlert(
          'Item Updated!', 
          `${product.Name} quantity increased to ${newQuantity}`
        );
      } else {
        showSuccessAlert(
          'Added to Cart!', 
          `${product.Name} has been added to your shopping cart`
        );
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      setShowAddToCartLoader(false);
      
      // Show error notification
      showErrorAlert(
        'Failed to Add Item',
        'There was an issue adding this item to your cart. Please try again.'
      );
    }
  };

  const Loader = ({ size = 'small', inline = false }) => (
    <div className={`loader ${size} ${inline ? 'inline-loader' : ''}`}>
      <div className="loader-spinner"></div>
    </div>
  );

  const SkeletonText = ({ width = '100%', height = '1rem', className = '' }) => (
    <div 
      className={`skeleton-text ${className}`} 
      style={{ width, height }}
    ></div>
  );

  const StarRatingSkeleton = () => (
    <div className="star-rating-skeleton">
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonText key={i} width="24px" height="24px" className="skeleton-star" />
      ))}
    </div>
  );

  const ReviewSkeleton = () => (
    <div className="review-skeleton">
      <div className="review-header-skeleton">
        <SkeletonText width="120px" height="16px" />
        <SkeletonText width="80px" height="14px" />
      </div>
      <div className="review-rating-skeleton">
        <StarRatingSkeleton />
      </div>
      <div className="review-comment-skeleton">
        <SkeletonText width="100%" height="14px" />
        <SkeletonText width="80%" height="14px" />
        <SkeletonText width="60%" height="14px" />
      </div>
    </div>
  );

  const ProductSkeleton = () => (
    <div className="product-details-skeleton">
      <div className="product-main-skeleton">
        <div className="image-skeleton">
          <div className="skeleton-image"></div>
        </div>
        <div className="details-skeleton">
          <SkeletonText width="70%" height="28px" className="title-skeleton" />
          <SkeletonText width="50%" height="20px" />
          <SkeletonText width="40%" height="24px" />
          <SkeletonText width="100%" height="16px" />
          <SkeletonText width="90%" height="16px" />
          <SkeletonText width="80%" height="16px" />
          <div className="button-skeleton">
            <SkeletonText width="120px" height="40px" />
          </div>
        </div>
      </div>
      <div className="reviews-container-skeleton">
        <SkeletonText width="120px" height="32px" className="section-title" />
        <div className="reviews-section-skeleton">
          {[1, 2, 3].map((i) => (
            <ReviewSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );

  if (productLoading) {
    return (
      <div className="product-details">
        <ProductSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      showErrorAlert('Rating Required', 'Please select a star rating before submitting your review.');
      return;
    }

    setSubmittingReview(true);
    setShowSubmitReviewLoader(true);
    
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: product.id,
        productName: product.Name,
        rating: newReview.rating,
        comment: newReview.comment,
        name: newReview.name,
        date: new Date().toISOString(),
      });

      setNewReview({
        rating: 0,
        comment: '',
        name: '',
      });
      
      setShowSubmitReviewLoader(false);
      showSuccessAlert('Review Submitted!', 'Thank you for your feedback! Your review has been submitted successfully.');
      
    } catch (error) {
      console.error('Error adding review:', error);
      setShowSubmitReviewLoader(false);
      showErrorAlert('Submission Failed', 'There was an error submitting your review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) : 0;

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i - 0.5 <= roundedRating) {
        stars.push(<FaStar key={i} className="star half-filled" />);
      } else {
        stars.push(<FaRegStar key={i} className="star" />);
      }
    }
    return stars;
  };

  return (
    <div className="product-details">

      {showAddToCartLoader && (
        <div className="product-overlay-loader">
          <div className="product-overlay-container">
            <div className="product-overlay-spinner"></div>
            <p>Adding to cart...</p>
          </div>
        </div>
      )}

      {showSubmitReviewLoader && (
        <div className="product-overlay-loader">
          <div className="product-overlay-container">
            <div className="product-overlay-spinner"></div>
            <p>Submitting review...</p>
          </div>
        </div>
      )}

      <div className="product-main">
        <img 
          src={product.ImageUrl} 
          alt={`a bottle of ${product.Name}`}
          loading="lazy"
          height="300"
          width="300"
        />
        <div className="details">
          <p><strong className='name'>{product.Name}</strong></p>
          <p>Brand: {product['Brand Name'] || product.Brand || 'No brand specified'}</p>
          <p><strong>&#8358; {product.Price.toLocaleString()}</strong></p>
          <p>{product.Description}</p>
          <button 
            className='add-to-cart'
            onClick={handleAddToCart}
            disabled={showAddToCartLoader}
          >
            {showAddToCartLoader ? (
              <>
                <span className="button-loader"></span>
                Adding...
              </>
            ) : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="reviews-container">
        <div className="reviews-section">
          <h2>Reviews</h2>
          
          <div className="average-rating">
            <div className="rating-value">
              {loadingReviews ? (
                <Loader size="small" inline />
              ) : (
                averageRating.toFixed(1)
              )}
            </div>
            <div className="rating-stars">
              {loadingReviews ? (
                <StarRatingSkeleton />
              ) : (
                renderStars(averageRating)
              )}
            </div>
            <div className="rating-count">
              {loadingReviews ? (
                <Loader size="small" inline />
              ) : (
                `(${reviews.length} reviews)`
              )}
            </div>
          </div>

          {loadingReviews ? (
            <div className="reviews-loading">
              <Loader size="medium" />
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review">
                  <div className="review-header">
                    <div className="reviewer-name">{review.name}</div>
                    <div className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <div className="review-comment">{review.comment}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <FaRegStar className="no-reviews-icon" />
              <p>No reviews yet. Be the first to review!</p>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="review-form">
            <h3>Write a Review</h3>
            <div className="form-group">
              <label>Your Rating:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewReview({...newReview, rating: star})}
                    className="star-wrapper"
                  >
                    {star <= (hoverRating || newReview.rating) ? (
                      <FaStar className="star filled" />
                    ) : (
                      <FaRegStar className="star" />
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newReview.name}
                onChange={handleInputChange}
                required
                disabled={submittingReview}
              />
            </div>
            <div className="form-group">
              <label htmlFor="comment">Comment (optional):</label>
              <textarea
                id="comment"
                name="comment"
                value={newReview.comment}
                onChange={handleInputChange}
                rows="4"
                disabled={submittingReview}
              />
            </div>
            <button 
              type="submit" 
              className="submit-review"
              disabled={submittingReview}
            >
              {submittingReview ? (
                <>
                  <span className="button-loader"></span>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;