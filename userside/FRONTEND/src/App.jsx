import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  ArrowRight,
  PawPrint, 
  Home,
  Box,
  ShoppingCart,
  Bookmark,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Menu,
  X
} from './Icons';
import Signup from './Signup';
import Login from './Login';
import Logo from './Logo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'signup', 'login', 'products'
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [savedProducts, setSavedProducts] = useState([]);
  const [boughtProducts, setBoughtProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('offline'); // 'offline' or 'online'
  const [transactionId, setTransactionId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('thrivevet_user');
    const token = localStorage.getItem('thrivevet_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchUserActions(token);
    }

    fetchProducts();

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('thrivevet_token');
    localStorage.removeItem('thrivevet_user');
    setUser(null);
    setCurrentPage('home');
    setIsProfileOpen(false);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderProducts = () => (
    <div className="container products-section fade-in">
      <div className="section-header">
        <h1>Premium <span>Biological</span> Solutions</h1>
        <p>Expertly formulated supplements for livestock health and productivity.</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading the best products for your farm...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map(product => (
            <div 
              key={product._id} 
              className="product-card"
              onClick={() => setSelectedProduct(product)}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-image-wrapper">
                <img src={product.imageUrl} alt={product.name} />
                <div className="product-tag">{product.category}</div>
                <button 
                  className={`wishlist-btn ${savedProducts.some(p => p._id === product._id) ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleSaveProduct(product._id); }}
                >
                  <Heart size={20} fill={savedProducts.some(p => p._id === product._id) ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-footer">
                  <span className="price">₹{product.price}</span>
                  <button 
                    className="btn-add-cart"
                    onClick={(e) => { e.stopPropagation(); /* Cart logic */ }}
                  >
                    Add to Cart
                  </button>
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <p className="low-stock">Only {product.stock} left!</p>
                )}
                {product.stock === 0 && (
                  <p className="out-of-stock">Out of Stock</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Box size={48} />
          <h3>No products found</h3>
          <p>Check back later for new arrivals.</p>
        </div>
      )}
    </div>
  );

  const fetchUserActions = async (token) => {
    try {
      const savedRes = await fetch(`${API_URL}/api/user/saved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const savedData = await savedRes.json();
      if (savedRes.ok) setSavedProducts(savedData);

      const boughtRes = await fetch(`${API_URL}/api/user/bought`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const boughtData = await boughtRes.json();
      if (boughtRes.ok) setBoughtProducts(boughtData);
    } catch (err) {
      console.error('Error fetching user actions:', err);
    }
  };

  const toggleSaveProduct = async (productId) => {
    if (!user) {
      setCurrentPage('login');
      return;
    }

    try {
      const token = localStorage.getItem('thrivevet_token');
      const response = await fetch(`${API_URL}/api/user/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      
      const data = await response.json();
      if (response.ok) {
        if (data.saved) {
          const productToAdd = products.find(p => p._id === productId);
          setSavedProducts(prev => [...prev, productToAdd]);
        } else {
          setSavedProducts(prev => prev.filter(p => p._id !== productId));
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      setCurrentPage('login');
      return;
    }
    setShowPaymentModal(true);
  };

  const processPurchase = async () => {
    if (paymentMethod === 'online' && !transactionId) {
      alert('Please enter Transaction ID for online payment');
      return;
    }

    try {
      const token = localStorage.getItem('thrivevet_token');
      const response = await fetch(`${API_URL}/api/user/buy`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          productId: selectedProduct._id,
          quantity: quantity,
          paymentMethod: paymentMethod,
          transactionId: transactionId
        })
      });

      if (response.ok) {
        setOrderSuccess(true);
        setShowPaymentModal(false);
        setTransactionId('');
        const boughtRes = await fetch(`${API_URL}/api/user/bought`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const boughtData = await boughtRes.json();
        if (boughtRes.ok) setBoughtProducts(boughtData);
        
        // Update local products stock
        const updatedProducts = products.map(p => {
          if (p._id === selectedProduct._id) {
            return { ...p, stock: p.stock - quantity };
          }
          return p;
        });
        setProducts(updatedProducts);
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Purchase failed');
      }
    } catch (err) {
      console.error('Buy product error:', err);
      alert('Connection error');
    }
  };

  const renderSavedProducts = () => (
    <div className="container products-section fade-in">
      <div className="section-header">
        <h1>Your <span>Saved</span> Biologicals</h1>
        <p>Products you've liked for your livestock.</p>
      </div>

      {savedProducts.length > 0 ? (
        <div className="product-grid">
          {savedProducts.map(product => (
            <div 
              key={product._id} 
              className="product-card"
              onClick={() => setSelectedProduct(product)}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-image-wrapper">
                <img src={product.imageUrl} alt={product.name} />
                <div className="product-tag">{product.category}</div>
                <button 
                  className="wishlist-btn active"
                  onClick={(e) => { e.stopPropagation(); toggleSaveProduct(product._id); }}
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-footer">
                  <span className="price">₹{product.price}</span>
                  <button className="btn-add-cart" onClick={(e) => { e.stopPropagation(); /* Add to cart logic */ }}>Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={48} />
          <h3>No saved products</h3>
          <p>Click the heart icon on products you like to save them here.</p>
          <button className="btn-primary" onClick={() => setCurrentPage('home')}>Explore Products</button>
        </div>
      )}
    </div>
  );

  const renderBoughtProducts = () => (
    <div className="container products-section fade-in">
      <div className="section-header">
        <h1>Purchase <span>History</span></h1>
        <p>Products you've successfully ordered.</p>
      </div>

      {boughtProducts.length > 0 ? (
        <div className="bought-list">
          {boughtProducts.map((item, index) => (
            <div key={index} className="bought-item-card">
              <div className="bought-image">
                <img src={item.product?.imageUrl} alt={item.product?.name} />
              </div>
              <div className="bought-info">
                <h3>{item.product?.name}</h3>
                <p className="date">Purchased on: {new Date(item.purchaseDate).toLocaleDateString()}</p>
                <div className="bought-footer">
                  <span className="qty">Qty: {item.quantity}</span>
                  <span className="total-price">Total: ₹{item.product?.price * item.quantity}</span>
                </div>
              </div>
              <button className="btn-ghost" onClick={() => setSelectedProduct(item.product)}>View Item</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ShoppingCart size={48} />
          <h3>No purchase history</h3>
          <p>You haven't bought anything yet.</p>
          <button className="btn-primary" onClick={() => setCurrentPage('products')}>Shop Now</button>
        </div>
      )}
    </div>
  );

  const renderPaymentModal = () => {
    if (!selectedProduct) return null;
    const totalPrice = selectedProduct.price * quantity;
    const upiUrl = `upi://pay?pa=kavinshankar491-1@oksbi&pn=ThriveVet&am=${totalPrice}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

    return (
      <div className="order-success-overlay" onClick={() => setShowPaymentModal(false)}>
        <div className="order-success-modal fade-in" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h2>Checkout <span>Details</span></h2>
            <p>Complete your purchase for {selectedProduct.name}</p>
          </div>

          <div className="payment-options-container">
            <div 
              className={`payment-option-card ${paymentMethod === 'offline' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('offline')}
            >
              <div className="option-radio"></div>
              <div className="option-info">
                <h4>Offline Payment</h4>
                <p>Pay on delivery or via bank transfer later.</p>
              </div>
            </div>

            <div 
              className={`payment-option-card ${paymentMethod === 'online' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('online')}
            >
              <div className="option-radio"></div>
              <div className="option-info">
                <h4>Online Payment (UPI)</h4>
                <p>Pay instantly using any UPI app.</p>
              </div>
            </div>
          </div>

          {paymentMethod === 'online' && (
            <div className="online-payment-details fade-in">
              <div className="qr-container">
                <img src={qrCodeUrl} alt="UPI QR Code" />
                <p className="upi-id">UPI ID: <span>kavinshankar491-1@oksbi</span></p>
                <p className="total-amount">Amount to Pay: <span>₹{totalPrice}</span></p>
              </div>
              <div className="transaction-input-group">
                <label>Enter Transaction ID / UTR Number</label>
                <input 
                  type="text" 
                  placeholder="12-digit transaction ID" 
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
                <p className="input-hint">Please enter the ID after successful payment.</p>
              </div>
            </div>
          )}

          <div className="order-summary-v2">
            <div className="summary-row">
              <span>Subtotal ({quantity} items)</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="summary-row total">
              <span>Order Total</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>

          <div className="modal-actions-v2">
            <button className="btn-ghost" onClick={() => setShowPaymentModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={processPurchase}>
              {paymentMethod === 'online' ? 'Confirm Payment & Order' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="container product-detail-section fade-in">
        <button className="btn-back-list" onClick={() => { setSelectedProduct(null); setQuantity(1); }}>
          <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /> Back to Products
        </button>
        
        <div className="product-detail-grid-v2">
          {/* Column 1: Image */}
          <div className="detail-image-v2">
            <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
            <div className="detail-tag-v2">{selectedProduct.category}</div>
          </div>
          
          {/* Column 2: Info & Description */}
          <div className="detail-main-info-v2">
            <h1>{selectedProduct.name}</h1>
            <p className="detail-category-v2">Category: {selectedProduct.category}</p>
            
            <div className="detail-description-v2">
              <h3>About this product</h3>
              <p>{selectedProduct.description}</p>
            </div>

            <div className="detail-features-v2">
              <div className="feature-item">
                <Box size={24} />
                <span>Original Product</span>
              </div>
              <div className="feature-item">
                <ArrowRight size={24} />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
          
          {/* Column 3: Purchase Card */}
          <div className="detail-purchase-sidebar-v2">
            <div className="purchase-card-v2">
              <div className="price-tag-v2">
                <span className="currency">₹</span>
                <span className="amount">{selectedProduct.price}</span>
              </div>
              
              <div className="stock-info-v2">
                <span className={`status-dot ${selectedProduct.stock > 0 ? 'instock' : 'outofstock'}`}></span>
                <span className="status-text">{selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
              </div>

              <p className="delivery-info-v2">Free delivery within 3-5 business days.</p>

              {selectedProduct.stock > 0 && (
                <div className="quantity-group-v2">
                  <label>Quantity:</label>
                  <div className="quantity-controls-v2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}>+</button>
                  </div>
                </div>
              )}

              <div className="action-buttons-v2">
                <button 
                  className="btn-buy-v2" 
                  disabled={selectedProduct.stock === 0}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
                <button 
                  className={`btn-wishlist-v2 ${savedProducts.some(p => p._id === selectedProduct._id) ? 'active' : ''}`}
                  onClick={() => toggleSaveProduct(selectedProduct._id)}
                >
                  <Heart size={20} fill={savedProducts.some(p => p._id === selectedProduct._id) ? "currentColor" : "none"} /> 
                  {savedProducts.some(p => p._id === selectedProduct._id) ? 'Saved' : 'Add to Wishlist'}
                </button>
              </div>
              
              <p className="secure-transaction-v2">
                <ShoppingCart size={16} /> Secure Transaction
              </p>
            </div>
          </div>
        </div>

        {orderSuccess && (
          <div className="order-success-overlay" onClick={() => setOrderSuccess(false)}>
            <div className="order-success-modal fade-in" onClick={e => e.stopPropagation()}>
              <div className="success-icon-v2">
                <Box size={60} />
              </div>
              <h2>Order Placed Successfully!</h2>
              <p>Thank you for choosing ThriveVet. <br /> Your biological boosters will reach you soon.</p>
              <button 
                className="btn-primary" 
                onClick={() => { setOrderSuccess(false); setSelectedProduct(null); setQuantity(1); }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {showPaymentModal && renderPaymentModal()}
      </div>
    );
  };

  if (currentPage === 'signup') {
    return (
      <Signup 
        onBack={() => setCurrentPage('home')} 
        onLogin={() => setCurrentPage('login')} 
        onAuthSuccess={(user) => {
          setUser(user);
          setCurrentPage('home');
        }}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <Login 
        onBack={() => setCurrentPage('home')} 
        onSignUp={() => setCurrentPage('signup')} 
        onAuthSuccess={(user) => {
          setUser(user);
          setCurrentPage('home');
        }}
      />
    );
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className={scrolled ? 'nav-scrolled' : ''}>
        <div className="container nav-container">
          <a href="/" className="logo-group" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>
            <img src="/images/logo.png" alt="ThriveVet Logo" className="logo-img" />
          </a>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          
          <div className={`nav-content ${isMenuOpen ? 'nav-open' : ''}`}>
            {user && (
              <ul className="nav-links">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setSelectedProduct(null); setIsMenuOpen(false); }} className={currentPage === 'home' ? 'active' : ''}>
                    <Home size={18} /> <span>Home</span>
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('products'); setSelectedProduct(null); setIsMenuOpen(false); }} className={currentPage === 'products' ? 'active' : ''}>
                    <Box size={18} /> <span>Product</span>
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('bought'); setSelectedProduct(null); setIsMenuOpen(false); }} className={currentPage === 'bought' ? 'active' : ''}>
                    <ShoppingCart size={18} /> <span>Buy</span>
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('saved'); setSelectedProduct(null); setIsMenuOpen(false); }} className={currentPage === 'saved' ? 'active' : ''}>
                    <Bookmark size={18} /> <span>Saved</span>
                  </a>
                </li>
              </ul>
            )}

            <div className="nav-actions">
              {user ? (
                <div className="user-profile-dropdown">
                  <button className="profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <div className="avatar">
                      <UserIcon size={20} />
                    </div>
                    <span className="user-name">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={16} className={isProfileOpen ? 'rotate' : ''} />
                  </button>
                  
                  {isProfileOpen && (
                    <div className="profile-menu fade-in">
                      <div className="profile-header">
                        <p className="p-name">{user.name}</p>
                        <p className="p-email">{user.email}</p>
                      </div>
                      <div className="menu-divider"></div>
                      <a href="#" className="menu-item" onClick={(e) => { e.preventDefault(); setIsProfileOpen(false); }}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                      </a>
                      <button className="menu-item logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <button className="btn-ghost" onClick={() => { setCurrentPage('login'); setIsMenuOpen(false); }}>Log In</button>
                  <button className="btn-primary" onClick={() => { setCurrentPage('signup'); setIsMenuOpen(false); }}>Sign Up</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Sections */}
      {currentPage === 'home' && (
        <section className="container hero" id="home">
          <div className="hero-content fade-in">
            <h1>Modern Health For <span>Modern</span> Farming</h1>
            <div className="hero-subtitle">
              "Healthy goats and cow, <br /> Better profits"
            </div>
            <p>
              ThriveVet Enterprises is dedicated to providing high-quality 
              biological boosters and nutritional supplements for your farm animals. 
              Ensure your livestock thrives while maximizing your production profits.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem' }}>
              <button className="btn-primary" onClick={() => setCurrentPage('products')}>Explore Our Solutions</button>
              <button className="btn-primary" style={{ background: 'var(--secondary)' }} onClick={() => setCurrentPage('login')}>Expert Advice</button>
            </div>
          </div>
          <div className="hero-visual-container fade-in">
            <div className="anti-gravity-scene">
              <div className="floating-main-frame">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="hero-video"
                  preload="auto"
                  src={`/images/hero-video.mp4?update=${Date.now()}`}
                  onError={(e) => {
                    console.error("Video failed to load:", e);
                    e.target.style.display = 'none';
                  }}
                />
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000" 
                  alt="Modern Farm Landscape" 
                  className="hero-backup-img"
                />
                
                {/* Particle Effects */}
                <div className="particles">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`particle p-${i+1}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentPage === 'products' && (
        selectedProduct ? renderProductDetail() : renderProducts()
      )}

      {currentPage === 'saved' && (
        selectedProduct ? renderProductDetail() : renderSavedProducts()
      )}

      {currentPage === 'bought' && (
        selectedProduct ? renderProductDetail() : renderBoughtProducts()
      )}

      {/* Footer Minimal */}
      <footer style={{ padding: '3rem 0', background: 'var(--primary-dark)', color: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ color: '#fff', marginBottom: '1.2rem' }}>ThriveVet Enterprises</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Dedicated to providing high-quality biological boosters and nutritional supplements for your farm animals.
              </p>
            </div>
            <div>
              <h3 style={{ color: '#fff', marginBottom: '1.2rem' }}>Contact Us</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <UserIcon size={18} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.9rem' }}>Kavisankar: <a href="tel:+919360755400" style={{ color: '#fff', textDecoration: 'none' }}>+91 93607 55400</a></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <UserIcon size={18} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.9rem' }}>Pavishkannan: <a href="tel:+918667555920" style={{ color: '#fff', textDecoration: 'none' }}>+91 86675 55920</a></span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
            &copy; 2026 ThriveVet Enterprises Pvt. Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
