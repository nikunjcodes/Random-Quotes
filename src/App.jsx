import React, { useEffect, useState, useContext } from 'react';
import './index.css';
import axios from 'axios';
import { AuthContext } from './AuthContext.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Favorites from './Favorites.jsx';

const QuoteCard = ({ quote, onToggleFavorite, userId }) => {
  const isFavorited = quote.isFavorited || quote.favoritedBy?.includes(userId);
  return (
    <div className="quote-card">
      <div className="quote-text">"{quote.text}"</div>
      <div className="quote-author">— {quote.author || 'Unknown'}</div>
      {quote.category && (
        <div className="quote-category">{quote.category}</div>
      )}
      <button className="favorite-button" onClick={() => onToggleFavorite(quote._id)}>
        {isFavorited ? '💔 Unfavorite' : '❤️ Favorite'}
      </button>
    </div>
  );
};

const Header = ({ user, onLogout, onShowFavorites, onShowQuotes, currentView }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>Quote of the Day</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || 'User'}!</span>
          <div className="header-buttons">
            {currentView === 'quotes' && (
              <button className="header-button" onClick={onShowFavorites}>
                ❤️ Favorites
              </button>
            )}
            {currentView === 'favorites' && (
              <button className="header-button" onClick={onShowQuotes}>
                📖 All Quotes
              </button>
            )}
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

function App() {
  const { user, logout } = useContext(AuthContext);
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [newQuoteLoading, setNewQuoteLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentView, setCurrentView] = useState('quotes'); // 'quotes' or 'favorites'

  const fetchQuotes = async () => {
    if (!user?.token) return;
    
    setQuotesLoading(true);
    try {
      const res = await axios.get('/api/quotes', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setQuotes(res.data);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setQuotesLoading(false);
    }
  };

  const fetchNewQuote = async () => {
    if (!user?.token) return;
    
    setNewQuoteLoading(true);
    try {
      const res = await axios.get('/api/quotes/fetch', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCurrentQuote(res.data);
      // Add to quotes list if not already there
      if (!quotes.find(q => q._id === res.data._id)) {
        setQuotes(prev => [res.data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to fetch new quote:', error);
    } finally {
      setNewQuoteLoading(false);
    }
  };

  const toggleFavorite = async (quoteId) => {
    if (!user?.token) return;
    
    try {
      const response = await axios.post(`/api/quotes/favorite/${quoteId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // Update quotes list
      setQuotes(prev => prev.map(quote => 
        quote._id === quoteId 
          ? { ...quote, isFavorited: response.data.isFavorited }
          : quote
      ));
      
      // Update current quote if it's the one being toggled
      if (currentQuote && currentQuote._id === quoteId) {
        setCurrentQuote(prev => ({ ...prev, isFavorited: response.data.isFavorited }));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setQuotes([]);
    setCurrentQuote(null);
    setCurrentView('quotes');
  };

  const showFavorites = () => {
    setCurrentView('favorites');
  };

  const showQuotes = () => {
    setCurrentView('quotes');
  };

  useEffect(() => {
    if (user?.token) {
      fetchQuotes();
      fetchNewQuote();
    }
  }, [user]);

  // Show authentication pages if user is not logged in
  if (!user) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  // Show favorites page
  if (currentView === 'favorites') {
    return (
      <div className="app-wrapper">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onShowFavorites={showFavorites}
          onShowQuotes={showQuotes}
          currentView={currentView}
        />
        <Favorites onBack={showQuotes} />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onShowFavorites={showFavorites}
        onShowQuotes={showQuotes}
        currentView={currentView}
      />
      
      <main className="main-content">
        {/* New Quote Section */}
        <div className="new-quote-section">
          <h2>Today's Quote</h2>
          {newQuoteLoading ? (
            <div className="loading">Fetching a new quote...</div>
          ) : currentQuote ? (
            <div className="current-quote-card">
              <QuoteCard 
                quote={currentQuote} 
                userId={user.id} 
                onToggleFavorite={toggleFavorite} 
              />
              <button className="new-quote-button" onClick={fetchNewQuote} disabled={newQuoteLoading}>
                {newQuoteLoading ? '🔄 Loading...' : '🔄 Get Another Quote'}
              </button>
            </div>
          ) : (
            <div className="no-quote">
              <p>Click the button below to get your first quote!</p>
              <button className="new-quote-button" onClick={fetchNewQuote} disabled={newQuoteLoading}>
                {newQuoteLoading ? '🔄 Loading...' : '🎲 Get Random Quote'}
              </button>
            </div>
          )}
        </div>

        {/* All Quotes Section */}
        <div className="all-quotes-section">
          <h2>All Quotes</h2>
          {quotesLoading ? (
            <div className="loading">Loading quotes...</div>
          ) : quotes.length > 0 ? (
            <div className="quotes-grid">
              {quotes.map((quote) => (
                <QuoteCard 
                  key={quote._id} 
                  quote={quote} 
                  userId={user.id} 
                  onToggleFavorite={toggleFavorite} 
                />
              ))}
            </div>
          ) : (
            <div className="no-quotes">
              <p>No quotes available at the moment.</p>
              <button className="refresh-button" onClick={fetchQuotes}>
                Refresh
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
