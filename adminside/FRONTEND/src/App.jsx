import React, { useState, useEffect } from 'react';
import { 
  Home,
  Box,
  ShoppingCart,
  Bookmark,
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Eye,
  EyeOff,
  Plus,
  ArrowRight,
  ShoppingBag,
  Search,
  Heart,
  Upload
} from './Icons';
import Signup from './Signup';
import ProductChart from './ProductChart';
import { supabase } from './supabaseClient';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://thirvevet.onrender.com';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'dashboard', 'login', 'signup', 'products', 'orders', 'users'
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setProductImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    category: 'Supplements',
    stock: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    const testSupabase = async () => {
      console.log('--- Supabase Connection Diagnostics ---');
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
          console.error('❌ Supabase Connection Failed:', bucketError.message);
          return;
        }

        console.log('✅ Supabase Connected! Available Buckets:', buckets.map(b => b.name));
        
        // Specifically check for product-images
        const productImageBucket = buckets.find(b => b.name === 'product-images');
        if (!productImageBucket) {
          console.warn('⚠️ Warning: "product-images" bucket was not found. Please create it in your Supabase dashboard.');
        } else {
          console.log('✅ "product-images" bucket exists and is ready.');
        }
      } catch (err) {
        console.error('❌ Supabase Unexpected Error:', err);
      }
    };
    testSupabase();

    const token = localStorage.getItem('thrivevet_admin_token');
    const storedAdmin = localStorage.getItem('thrivevet_admin_user');
    if (token && storedAdmin) {
      setIsAdminLoggedIn(true);
      setAdminUser(JSON.parse(storedAdmin));
      fetchUsers();
      fetchProducts();
      fetchOrders();
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Realtime Polling (Every 5 seconds)
    const pollingInterval = setInterval(() => {
      if (isAdminLoggedIn) {
        fetchProducts();
        fetchUsers();
        fetchOrders();
      }
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(pollingInterval);
    };
  }, [isAdminLoggedIn]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('thrivevet_admin_token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('thrivevet_admin_token')}`
        }
      });
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('thrivevet_admin_token')}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('thrivevet_admin_token', data.token);
        localStorage.setItem('thrivevet_admin_user', JSON.stringify(data.user));
        setIsAdminLoggedIn(true);
        setAdminUser(data.user);
        setCurrentPage('dashboard');
        fetchUsers();
        fetchProducts();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server connection error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('thrivevet_admin_token');
    localStorage.removeItem('thrivevet_admin_user');
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setCurrentPage('home');
    setIsProfileOpen(false);
  };

  const renderSidebar = () => (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/images/logo.png" alt="Logo" />
          <h2>Admin</h2>
        </div>
      </div>
      <div className="sidebar-menu">
        <button 
          className={`sidebar-link ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentPage('dashboard')}
        >
          <LayoutDashboard size={20} /> <span>Dashboard</span>
        </button>
        <button 
          className={`sidebar-link ${currentPage === 'products' ? 'active' : ''}`}
          onClick={() => setCurrentPage('products')}
        >
          <Box size={20} /> <span>Product Upload</span>
        </button>
        <button 
          className={`sidebar-link ${currentPage === 'all-products' ? 'active' : ''}`}
          onClick={() => setCurrentPage('all-products')}
        >
          <ShoppingBag size={20} /> <span>All Products</span>
        </button>
        <button 
          className={`sidebar-link ${currentPage === 'orders' ? 'active' : ''}`}
          onClick={() => setCurrentPage('orders')}
        >
          <ShoppingCart size={20} /> <span>Orders</span>
        </button>
        <button 
          className={`sidebar-link ${currentPage === 'users' ? 'active' : ''}`}
          onClick={() => setCurrentPage('users')}
        >
          <User size={20} /> <span>Users</span>
        </button>
      </div>
      <div className="sidebar-footer">
        <button className="sidebar-link logout" onClick={handleLogout}>
          <LogOut size={20} /> <span>Logout</span>
        </button>
      </div>
    </div>
  );

  const renderStats = () => {
    const totalSales = products.reduce((acc, p) => acc + (p.salesCount || 0), 0);
    
    return (
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Eye size={28} /></div>
          <div className="stat-info">
            <h3>Product Views</h3>
            <p className="stat-value">1,284</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><ShoppingBag size={28} /></div>
          <div className="stat-info">
            <h3>Total Units Sold</h3>
            <p className="stat-value">{totalSales}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><User size={28} /></div>
          <div className="stat-info">
            <h3>Customers</h3>
            <p className="stat-value">{users.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Box size={28} /></div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p className="stat-value">{products.length}</p>
          </div>
        </div>
      </div>
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProduct = async (e) => {
    e.preventDefault();
    if (!productImage) {
      alert('Please select an image first');
      return;
    }

    setIsUploading(true);
    try {
      console.log('--- Starting Product Upload ---');
      console.log('Selected Image:', productImage.name, productImage.type, productImage.size);

      // 1. Upload to Supabase
      const fileExt = productImage.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      console.log('Uploading to bucket: product-images, Path:', filePath);

      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, productImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase Upload Error Object:', JSON.stringify(uploadError, null, 2));
        let errorMsg = uploadError.message;
        if (uploadError.status === 404) errorMsg = 'Bucket "product-images" not found. Please create it in Supabase.';
        if (uploadError.status === 403) errorMsg = 'Permission denied. Check your Supabase "product-images" bucket policies (RLS).';
        throw new Error(`Supabase Error: ${errorMsg} (Status: ${uploadError.status})`);
      }

      console.log('Supabase Upload Success:', data);

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('Generated Public URL:', publicUrl);

      // 3. Send to Backend (Product metadata + image URL)
      const response = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('thrivevet_admin_token')}`
        },
        body: JSON.stringify({ ...productData, imageUrl: publicUrl })
      });

      if (response.ok) {
        alert('Product uploaded successfully!');
        // Reset form
        setProductData({ name: '', price: '', category: 'Supplements', stock: '', description: '', imageUrl: '' });
        setProductImage(null);
        setProductImagePreview(null);
        fetchProducts(); // Refresh product list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload to backend');
      }

    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading product: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const renderProductUpload = () => (
    <div className="form-card fade-in">
      <h1>Upload New Product</h1>
      <form className="admin-form" onSubmit={handleUploadProduct}>
        <div className="form-group full">
          <label>Product Image</label>
          <div 
            className="image-upload-zone"
            onClick={() => document.getElementById('product-image-input').click()}
          >
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" />
                <div className="change-image-overlay">Click to change image</div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <Upload size={40} />
                <p>Click or Drag to upload product picture</p>
                <span>Supports JPG, PNG, WEBP</span>
              </div>
            )}
            <input 
              id="product-image-input"
              type="file" 
              hidden 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Product Name</label>
          <input 
            type="text" 
            placeholder="e.g. Biological Booster" 
            required
            value={productData.name}
            onChange={(e) => setProductData({...productData, name: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Price (₹)</label>
          <input 
            type="number" 
            placeholder="0.00" 
            required
            value={productData.price}
            onChange={(e) => setProductData({...productData, price: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select 
            value={productData.category}
            onChange={(e) => setProductData({...productData, category: e.target.value})}
          >
            <option>Supplements</option>
            <option>Boosters</option>
            <option>Vaccines</option>
          </select>
        </div>
        <div className="form-group">
          <label>Stock Quantity</label>
          <input 
            type="number" 
            placeholder="0" 
            required
            value={productData.stock}
            onChange={(e) => setProductData({...productData, stock: e.target.value})}
          />
        </div>
        <div className="form-group full">
          <label>Description</label>
          <textarea 
            rows="4" 
            placeholder="Enter product details..."
            required
            value={productData.description}
            onChange={(e) => setProductData({...productData, description: e.target.value})}
          ></textarea>
        </div>
        <div className="form-group full">
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: 'auto' }}
            disabled={isUploading}
          >
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <><Plus size={20} style={{ marginRight: '8px' }} /> Upload Product</>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-dashboard fade-in">
      <h1>User Management</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Location</th>
            <th>Phone</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.location}</td>
              <td>{user.phone}</td>
              <td><span className={`role-tag ${user.role}`}>{user.role}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAllProducts = () => (
    <div className="admin-dashboard fade-in">
      <div className="page-header-row">
        <h1>All Products</h1>
        <span className="realtime-dot">Live</span>
      </div>
      <div className="product-grid">
        {products.map(product => (
          <div key={product._id} className="product-card-admin">
            <img src={product.imageUrl} alt={product.name} className="product-image-admin" />
            <div className="product-info-admin">
              <h3>{product.name}</h3>
              <p className="price">₹{product.price}</p>
              <div className="admin-product-stats">
                <span className="stock">{product.stock} in stock</span>
                <span className="sales-tag">
                  <ShoppingCart size={14} /> {product.salesCount || 0} Sold
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="admin-dashboard fade-in">
      <div className="page-header-row">
        <h1>Recent Orders</h1>
        <span className="realtime-dot">Live</span>
      </div>
      <div className="orders-container">
        {orders.length > 0 ? (
          <table className="user-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Payment</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.orderId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={order.product?.imageUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span>{order.product?.name || 'Deleted Product'}</span>
                    </div>
                  </td>
                  <td>
                    <div>{order.userName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.userLocation}</div>
                  </td>
                  <td>
                    <div>{order.userEmail}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.userPhone}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className={`role-tag ${order.paymentMethod === 'online' ? 'admin' : 'user'}`} style={{ width: 'fit-content' }}>
                        {order.paymentMethod === 'online' ? 'Online' : 'Offline'}
                      </span>
                      {order.transactionId && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          ID: {order.transactionId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{order.quantity}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>{new Date(order.purchaseDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <ShoppingBag size={48} />
            <h3>No orders found</h3>
            <p>When users buy products, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch(currentPage) {
      case 'dashboard': return (
        <div className="fade-in">
          <div className="page-header-row">
            <h1>Dashboard Overview</h1>
            <span className="realtime-dot">Live</span>
          </div>
          {renderStats()}
          <ProductChart />
        </div>
      );
      case 'products': return renderProductUpload();
      case 'all-products': return renderAllProducts();
      case 'users': return renderUsers();
      case 'orders': return renderOrders();
      default: return null;
    }
  };

  // Auth pages logic
  if (currentPage === 'signup' && !isAdminLoggedIn) {
    return <Signup onBack={() => setCurrentPage('home')} onLogin={() => setCurrentPage('login')} onAuthSuccess={(u) => { setIsAdminLoggedIn(true); setAdminUser(u); setCurrentPage('dashboard'); fetchUsers(); }} />;
  }

  if (currentPage === 'login' && !isAdminLoggedIn) {
    return (
      <div className="admin-login-container fade-in">
        <form onSubmit={handleLogin} className="admin-login-card">
          <h1>Admin Portal</h1>
          {error && <p className="error">{error}</p>}
          <input type="email" placeholder="Admin Email" required value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} />
          <div className="password-input-wrapper">
            <input type={showPassword ? "text" : "password"} placeholder="Password" required value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
            <button type="button" className="admin-password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
          <button type="submit" className="btn-primary">Login</button>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Don't have an account? <button type="button" className="link-btn" onClick={() => setCurrentPage('signup')}>Sign Up</button>
            </p>
          </div>
          <button type="button" className="btn-ghost w-full" style={{ marginTop: '1rem', border: 'none' }} onClick={() => setCurrentPage('home')}>Back to Home</button>
        </form>
      </div>
    );
  }

  // Landing page for non-logged in or when on 'home'
  if (!isAdminLoggedIn || currentPage === 'home') {
    return (
      <div className="app">
        <nav className={scrolled ? 'nav-scrolled' : ''}>
          <div className="container nav-container">
            <a href="/" className="logo-group" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>
              <img src="/images/logo.png" alt="Logo" className="logo-img" />
            </a>
            <div className="nav-actions">
              {isAdminLoggedIn ? (
                <button className="btn-primary" onClick={() => setCurrentPage('dashboard')}>Go to Dashboard</button>
              ) : (
                <button className="btn-primary" onClick={() => setCurrentPage('login')}>Admin Login</button>
              )}
            </div>
          </div>
        </nav>
        <section className="container hero">
          <div className="hero-content fade-in">
            <h1>Admin Portal <span>Management</span></h1>
            <p>Oversee your entire farm ecosystem from one central hub. Manage products, track orders, and monitor customer activity in real-time.</p>
            <button className="btn-primary" onClick={() => isAdminLoggedIn ? setCurrentPage('dashboard') : setCurrentPage('login')}>
              {isAdminLoggedIn ? 'Enter Dashboard' : 'Admin Login'}
            </button>
          </div>
          <div className="hero-visual-container fade-in">
            <div className="anti-gravity-scene">
              <div className="floating-main-frame">
                <video autoPlay loop muted playsInline className="hero-video" src="/images/hero-video.mp4" />
                <div className="particles">{[...Array(12)].map((_, i) => <div key={i} className={`particle p-${i+1}`}></div>)}</div>
              </div>
            </div>
          </div>
        </section>
        {/* Admin Footer */}
        <footer style={{ padding: '3rem 0', background: 'var(--primary-dark)', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ color: '#fff', marginBottom: '1.2rem' }}>Admin Control Center</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Managing the ThriveVet ecosystem with precision and care.
                </p>
              </div>
              <div>
                <h3 style={{ color: '#fff', marginBottom: '1.2rem' }}>Support Contact</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <User size={18} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.9rem' }}>Kavisankar: <a href="tel:+919360755400" style={{ color: '#fff', textDecoration: 'none' }}>+91 93607 55400</a></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <User size={18} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.9rem' }}>Pavishkannan: <a href="tel:+918667555920" style={{ color: '#fff', textDecoration: 'none' }}>+91 86675 55920</a></span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
              &copy; 2026 ThriveVet Enterprises Pvt. Ltd. Admin Portal.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Admin Dashboard Layout
  return (
    <div className="admin-layout">
      {renderSidebar()}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          {renderMainContent()}
        </div>
        {/* Dashboard Footer */}
        <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <User size={14} /> <span>Kavisankar: +91 93607 55400</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <User size={14} /> <span>Pavishkannan: +91 86675 55920</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&copy; 2026 ThriveVet Enterprises Pvt. Ltd. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;