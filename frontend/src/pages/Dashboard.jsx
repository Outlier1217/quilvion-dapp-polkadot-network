// Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import useUserStore from "../store/useUserStore";
import { FaUser, FaWallet, FaShoppingBag, FaDollarSign, FaComment } from "react-icons/fa";

const API = "http://localhost:8000";

export default function Dashboard() {
  const { wallet, username, setUsername } = useUserStore();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [newName, setNewName] = useState("");
  const [convos, setConvos] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [ordersRes, convosRes, productsRes, spentRes, salesRes] = await Promise.all([
          axios.get(`${API}/orders/${wallet}`),
          axios.get(`${API}/conversations/${wallet}`),
          axios.get(`${API}/my-products/${wallet}`),
          axios.get(`${API}/total-orders/${wallet}`),
          axios.get(`${API}/total-sales/${wallet}`)
        ]);

        setOrders(ordersRes.data);
        setConvos(convosRes.data);
        setProducts(productsRes.data);
        setTotalOrders(spentRes.data.total);
        setTotalSales(salesRes.data.total);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [wallet]);

  const updateUsername = async () => {
    if (!newName.trim()) {
      alert("Please enter a username");
      return;
    }

    try {
      await axios.post(`${API}/update-username`, {
        wallet_address: wallet,
        new_username: newName
      });
      
      alert("Username updated successfully!");
      setUsername(newName);
      setNewName("");
    } catch (err) {
      console.error(err);
      alert("Failed to update username");
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'PENDING': 'pending',
      'COMPLETED': 'completed',
      'ESCROW_HOLD': 'escrow',
      'REFUNDED': 'refunded',
      'REJECTED': 'rejected'
    };
    return statusMap[status] || 'pending';
  };

  if (!wallet) {
    return (
      <div className="dashboard-container">
        <div className="empty-state-small">
          <span className="empty-icon-small">👛</span>
          <p>Please connect your wallet first</p>
          <p className="text-sm mt-2">Connect wallet to view your dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="empty-state-small">
          <span className="empty-icon-small spinner">🔄</span>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        Welcome back, {username || 'User'}! 👋
      </h1>

      {/* User Info Card */}
      <div className="user-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <FaUser className="text-purple-600" />
          </div>
          <h2 className="text-xs" style={{ color: 'black' }}>Profile Information</h2>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs" style={{ color: 'black' }}>Wallet Address</p>
            <div className="text-xs" style={{ color: 'black' }}>
              <FaWallet className="text-xs" style={{ color: 'black' }} />
              {wallet}
            </div>
          </div>

          <div className="username-display">
            <span className="text-xs" style={{ color: 'black' }}>Username:</span>
            <span className="username-badge">
              {username || 'Not set'}
            </span>
          </div>

          <div className="update-form">
            <input
              className="update-input"
              placeholder="Enter new username"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              onClick={updateUsername}
              className="update-btn"
            >
              Update Username
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card spent">
          <p className="stat-label">Total Spent</p>
          <p className="stat-value">
            {totalOrders}
            <span className="stat-unit">USDC</span>
          </p>
          <p className="text-xs" style={{ color: 'black' }}>Across all orders</p>
        </div>

        <div className="stat-card sales">
          <p className="stat-label">Total Sales</p>
          <p className="stat-value">
            {totalSales}
            <span className="stat-unit">USDC</span>
          </p>
          <p className="text-xs" style={{ color: 'black' }}>From your products</p>
        </div>
      </div>

      {/* Orders Section */}
      <div className="section-header">
        <h2 className="section-title">Order History</h2>
        <span className="section-badge">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state-small">
          <span className="empty-icon-small">🛍️</span>
          <p>No orders yet</p>
          <p className="text-sm mt-2">Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o, index) => (
            <div
              key={index}
              className={`order-card ${getStatusColor(o[2])}`}
            >
              <div className="order-header">
                <span className="order-id">Order #{index + 1}</span>
                <span className={`order-status ${getStatusColor(o[2])}`}>
                  {o[2]}
                </span>
              </div>

              <div className="order-detail">
                <span className="order-label">Product:</span>
                <span className="order-value">{o[4]}</span>
              </div>

              <div className="order-detail">
                <span className="order-label">Description:</span>
                <span className="order-value">{o[5]}</span>
              </div>

              <div className="order-detail">
                <span className="order-label">Price:</span>
                <span className="order-value font-bold text-purple-600">
                  {o[6]} USDC
                </span>
              </div>

              <div className="order-detail">
                <span className="order-label">Seller:</span>
                <span className="order-value text-sm">
                  {o[1]?.slice(0, 6)}...{o[1]?.slice(-4)}
                </span>
              </div>

              {o[7] === "DIGITAL" && o[8] && (
                <div className="digital-link">
                  <span className="font-semibold">Digital Content:</span>
                  <br />
                  <a 
                    href={o[8]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {o[8]}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* My Products Section */}
      <div className="section-header">
        <h2 className="section-title">My Products</h2>
        <span className="section-badge">{products.length} products</span>
      </div>

      {products.length === 0 ? (
        <div className="empty-state-small">
          <span className="empty-icon-small">📦</span>
          <p>No products added yet</p>
          <Link 
            to="/merchant" 
            className="text-purple-600 hover:underline mt-2 inline-block"
          >
            Become a Merchant →
          </Link>
        </div>
      ) : (
        <div className="products-grid-dashboard">
          {products.map((p) => (
            <div key={p[0]} className="dashboard-product-card">
              <img
                src={p[3] || "https://via.placeholder.com/300x200?text=No+Image"}
                alt={p[1]}
                className="dashboard-product-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
              <div className="dashboard-product-info">
                <h3 className="text-xs" style={{ color: 'black' }}>{p[1]}</h3>
                <p className="text-xs" style={{ color: 'black' }}>{p[2]}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'black' }}>{p[4]} USDC</span>
                  <span className="text-xs" style={{ color: 'black' }}>{p[5]}</span>
                </div>
                {p[6] && (
                  <p className="text-xs" style={{ color: 'black' }}>
                    🔗 Digital Link
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chats Section */}
      <div className="section-header">
        <h2 className="section-title">Recent Chats</h2>
        <span className="section-badge">{convos.length} chats</span>
      </div>

      {convos.length === 0 ? (
        <div className="empty-state-small">
          <span className="empty-icon-small">💬</span>
          <p>No chats yet</p>
          <p className="text-sm mt-2">Start a conversation with a seller!</p>
        </div>
      ) : (
        <div className="chat-list">
          {convos.map((c, i) => (
            <Link
              key={i}
              to={`/chat/${c[0]}`}
              className="chat-item"
            >
              <div className="chat-avatar">
                {c[0]?.charAt(2)?.toUpperCase() || 'U'}
              </div>
              <div className="chat-info">
                <div className="chat-wallet">
                  {c[0]?.slice(0, 6)}...{c[0]?.slice(-4)}
                </div>
                <div className="chat-preview">
                  Click to view conversation
                </div>
              </div>
              <FaComment className="text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}