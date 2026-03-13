// AdminAnalytics.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import useUserStore from "../store/useUserStore";
import { 
  FaUsers, FaStore, FaBox, FaShoppingCart, 
  FaEnvelope, FaQuestionCircle, FaChartLine,
  FaWallet, FaSearch, FaLink, FaCalendarAlt
} from "react-icons/fa";

const API = "http://localhost:8000";
const ADMIN_WALLET = "0xAb06a17af1425F499E302B639c69f8ce29a967E0";

export default function AdminAnalytics() {
  const { wallet } = useUserStore();
  
  // 🔥 DEBUG: Check wallet from store
  console.log("🔥 AdminAnalytics - wallet from store:", wallet);
  console.log("🔥 AdminAnalytics - wallet type:", typeof wallet);
  console.log("🔥 AdminAnalytics - ADMIN_WALLET:", ADMIN_WALLET);
  
  const [users, setUsers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [support, setSupport] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [search, setSearch] = useState("");
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [authChecked, setAuthChecked] = useState(false);

  // 🔥 FIX: Safe isAdmin calculation
  const isAdmin = wallet ? wallet.toLowerCase() === ADMIN_WALLET.toLowerCase() : false;

  // 🔥 DEBUG: Print isAdmin
  console.log("🔥 AdminAnalytics - isAdmin:", isAdmin);

  const loadData = async () => {
    console.log("📊 Loading admin data...");
    console.log("isAdmin:", isAdmin);
    
    if (!isAdmin) {
      console.log("❌ Not admin, not loading data");
      setLoading(false);
      setAuthChecked(true);
      return;
    }
    
    setLoading(true);
    try {
      console.log("Fetching users...");
      const u = await axios.get(`${API}/admin/users`);
      console.log("Users response:", u.data);
      setUsers(u.data);

      console.log("Fetching merchants...");
      const m = await axios.get(`${API}/admin/merchants`);
      console.log("Merchants response:", m.data);
      setMerchants(m.data);

      console.log("Fetching products...");
      const p = await axios.get(`${API}/admin/products`);
      console.log("Products response:", p.data);
      setProducts(p.data);

      console.log("Fetching orders...");
      const o = await axios.get(`${API}/admin/orders`);
      console.log("Orders response:", o.data);
      setOrders(o.data);

      console.log("Fetching messages...");
      const msg = await axios.get(`${API}/admin/messages`);
      console.log("Messages response:", msg.data);
      setMessages(msg.data);

      console.log("Fetching support...");
      const s = await axios.get(`${API}/admin/support`);
      console.log("Support response:", s.data);
      setSupport(s.data);

      console.log("Fetching total sales...");
      const sales = await axios.get(`${API}/admin/total-sales`);
      console.log("Sales response:", sales.data);
      setTotalSales(sales.data.total);

      console.log("Fetching total orders...");
      const orderTotal = await axios.get(`${API}/admin/total-orders`);
      console.log("Order total response:", orderTotal.data);
      setTotalOrders(orderTotal.data.total);

    } catch (err) {
      console.error("❌ Error loading admin data:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
      }
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    loadData();
  }, [wallet]); // ✅ Remove isAdmin dependency, just use wallet

  const searchWallet = async () => {
    if (!search.trim()) {
      alert("Please enter a wallet address");
      return;
    }

    try {
      const res = await axios.get(`${API}/admin/wallet/${search}`);
      setWalletData(res.data);
    } catch (err) {
      console.error("Error searching wallet:", err);
      alert("Wallet not found");
    }
  };

  const shortenWallet = (wallet) => {
    if (!wallet) return "";
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Access control
  if (!wallet) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <div className="access-denied-icon">👛</div>
          <h2>Connect Wallet</h2>
          <p>Please connect your wallet to access admin analytics</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && authChecked) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <div className="access-denied-icon">⛔</div>
          <h2>Access Denied</h2>
          <p>This area is restricted to admin only</p>
          <div className="mt-4 p-3 bg-gray-100 rounded text-left">
            <p className="text-sm text-gray-600">Connected Wallet:</p>
            <p className="font-mono text-sm break-all">{wallet}</p>
            <p className="text-sm text-gray-600 mt-2">Required Admin Wallet:</p>
            <p className="font-mono text-sm break-all">{ADMIN_WALLET}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <span className="spinner">🔄</span>
          <p className="mt-2">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-title">
          <FaChartLine className="text-purple-600" />
          Advanced Admin Analytics
        </h1>
        <span className="admin-badge">Admin Access</span>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <FaUsers />
          </div>
          <p className="admin-stat-label">Total Users</p>
          <p className="admin-stat-value">{users.length}</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <FaStore />
          </div>
          <p className="admin-stat-label">Merchants</p>
          <p className="admin-stat-value">{merchants.length}</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <FaBox />
          </div>
          <p className="admin-stat-label">Products</p>
          <p className="admin-stat-value">{products.length}</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <FaShoppingCart />
          </div>
          <p className="admin-stat-label">Orders</p>
          <p className="admin-stat-value">{orders.length}</p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <FaChartLine />
          </div>
          <p className="admin-stat-label">Total Sales</p>
          <p className="admin-stat-value">{totalSales} USDC</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <FaShoppingCart />
          </div>
          <p className="admin-stat-label">Total Order Value</p>
          <p className="admin-stat-value">{totalOrders} USDC</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <FaEnvelope />
          </div>
          <p className="admin-stat-label">Messages</p>
          <p className="admin-stat-value">{messages.length}</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <FaQuestionCircle />
          </div>
          <p className="admin-stat-label">Support</p>
          <p className="admin-stat-value">{support.length}</p>
        </div>
      </div>

      {/* Wallet Search */}
      <div className="admin-search-section">
        <h2 className="admin-search-title">
          <FaSearch /> Search Wallet Activity
        </h2>
        <div className="admin-search-box">
          <input
            className="admin-search-input"
            placeholder="Enter wallet address (0x...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={searchWallet}
            className="admin-search-btn"
          >
            Search
          </button>
        </div>
      </div>

      {/* Wallet Data */}
      {walletData && (
        <div className="wallet-data-card">
          <h3 className="wallet-data-title">
            <FaWallet /> Wallet Activity
          </h3>
          <div className="wallet-stats">
            <div className="wallet-stat-item">
              <p className="wallet-stat-label">Total Orders</p>
              <p className="wallet-stat-value">{walletData.total_orders}</p>
            </div>
            <div className="wallet-stat-item">
              <p className="wallet-stat-label">Total Sales</p>
              <p className="wallet-stat-value">{walletData.total_sales} USDC</p>
            </div>
          </div>
          {walletData.linked_wallets?.length > 0 && (
            <div className="linked-wallets">
              <p className="linked-wallets-title">
                <FaLink /> Linked Wallets
              </p>
              {walletData.linked_wallets.map((w, i) => (
                <div key={i} className="linked-wallet-item">
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs and content - same as before */}
      {/* ... */}
      
    </div>
  );
}