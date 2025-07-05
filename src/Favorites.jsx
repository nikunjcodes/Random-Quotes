import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext.jsx';
import './Favorites.css';

const Favorites = ({ onBack }) => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    if (!user?.token) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/quotes/favorites', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFavorites(response.data);
    } catch (err) {
      setError('Failed to load favorites');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (quoteId) => {
    try {
      await axios.post(`/api/quotes/favorite/${quoteId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Remove from local state
      setFavorites(favorites.filter(quote => quote._id !== quoteId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="favorites-card">
          <div className="loading">Loading your favorites...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-card">
        <div className="favorites-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Quotes
          </button>
          <h2>Your Favorite Quotes</h2>
          <p>{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {favorites.length === 0 ? (
          <div className="no-favorites">
            <div className="empty-icon">💔</div>
            <h3>No favorites yet</h3>
            <p>Start exploring quotes and add them to your favorites!</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((quote) => (
              <div key={quote._id} className="favorite-quote-card">
                <div className="quote-text">"{quote.text}"</div>
                <div className="quote-author">— {quote.author || 'Unknown'}</div>
                {quote.category && (
                  <div className="quote-category">{quote.category}</div>
                )}
                <button 
                  className="remove-favorite-button"
                  onClick={() => removeFavorite(quote._id)}
                >
                  💔 Remove from Favorites
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 