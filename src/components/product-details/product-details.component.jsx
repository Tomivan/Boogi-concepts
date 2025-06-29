import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { db } from '../../firebase'; // Import your Firebase configuration
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { FaStar, FaRegStar } from 'react-icons/fa';
import './product-details.component.css';

const ProductDetails = () => {
  const { state } = useLocation();
  const product = state?.product;
  const { addToCart } = useCart();

  // State for reviews
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    name: '',
  });
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch reviews from Firebase
  useEffect(() => {
    if (!product?.id) return;

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
    });

    return () => unsubscribe();
  }, [product?.id]);

  if (!product) {
    return <div>Product not found</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      alert('Please select a rating');
      return;
    }

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
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) : 0;

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

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
      <div className="product-main">
        <img src={product.ImageUrl} alt={`a bottle of ${product.Name}`} />
        <div className="details">
          <p><strong className='name'>{product.Name}</strong></p>
          <p>Brand: {product['Brand Name'] || product.Brand || 'No brand specified'}</p>
          <p><strong>&#8358; {product.Price.toLocaleString()}</strong></p>
          <p>{product.Description}</p>
          <button className='add-to-cart' onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
      </div>

      <div className="reviews-container">
        <div className="reviews-section">
          <h2>Reviews</h2>
          
          <div className="average-rating">
            <div className="rating-value">{averageRating.toFixed(1)}</div>
            <div className="rating-stars">
              {renderStars(averageRating)}
            </div>
            <div className="rating-count">({reviews.length} reviews)</div>
          </div>

          {loadingReviews ? (
            <p>Loading reviews...</p>
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
            <p>No reviews yet. Be the first to review!</p>
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
              />
            </div>
            <button type="submit" className="submit-review">Submit Review</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;