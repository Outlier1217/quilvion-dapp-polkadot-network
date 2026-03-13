// AdminPanel.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import useUserStore from "../store/useUserStore";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import commerceArtifact from "../abi/CommerceCore.json";
import { 
  FaStore, FaBox, FaLock, FaCog, FaCheck, 
  FaTimes, FaExclamationTriangle, FaLink,
  FaMoneyBillWave, FaUserCheck, FaShieldAlt
} from "react-icons/fa";

const API = "http://localhost:8000";
const ADMIN_WALLET = "0xAb06a17af1425F499E302B639c69f8ce29a967E0"; 
const CONTRACT_ADDRESS = "0x78c37Dcb5C3C072DAfb9D4e28638BBcdf297FeeB";

export default function AdminPanel() {
  const { wallet } = useUserStore();
  const [merchants, setMerchants] = useState([]);
  const [products, setProducts] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [dailyLimit, setDailyLimit] = useState("");
  const [threshold, setThreshold] = useState("");
  const [fee, setFee] = useState("");
  const [settings, setSettings] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("merchants");
  const [loading, setLoading] = useState(true);

  // 🔥 FIX: Case-insensitive comparison
  const isAdmin = wallet && wallet.toLowerCase() === ADMIN_WALLET.toLowerCase();

  // Load all data
  const loadSettings = async () => {
    try {
      const res = await axios.get(`${API}/platform-settings`);
      setSettings(res.data);
      setDailyLimit(res.data.daily_limit);
      setThreshold(res.data.admin_threshold);
      setFee(res.data.platform_fee_bps);
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  const loadMerchants = async () => {
    try {
      const res = await axios.get(`${API}/pending-merchants`);
      setMerchants(res.data);
    } catch (err) {
      console.error("Error loading merchants:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API}/pending-products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const loadEscrows = async () => {
    try {
      const res = await axios.get(`${API}/escrow-orders`);
      setEscrows(res.data);
    } catch (err) {
      console.error("Error loading escrows:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        loadMerchants(),
        loadProducts(),
        loadEscrows(),
        loadSettings()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [wallet]);

  // Update settings
  const updateSettings = async () => {
    setProcessing(true);
    try {
      // DB update
      await axios.post(`${API}/update-platform-settings`, {
        admin_wallet: wallet,
        daily_limit: Number(dailyLimit),
        admin_threshold: Number(threshold),
        platform_fee_bps: Number(fee)
      });

      // Contract update
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, commerceArtifact.abi, signer);

      const tx1 = await contract.setDailyLimit(parseUnits(dailyLimit.toString(), 6));
      await tx1.wait();

      const tx2 = await contract.setAdminThreshold(parseUnits(threshold.toString(), 6));
      await tx2.wait();

      const tx3 = await contract.setPlatformFee(Number(fee));
      await tx3.wait();

      alert("✅ Platform settings updated successfully!");
      loadSettings();
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.reason || "Update failed. Check console.");
    } finally {
      setProcessing(false);
    }
  };

  // Merchant actions
  const approveMerchant = async (walletAddress) => {
    setProcessing(true);
    try {
      await axios.post(`${API}/approve-merchant`, {
        admin_wallet: wallet,
        merchant_wallet: walletAddress
      });
      alert("✅ Merchant approved successfully!");
      loadMerchants();
    } catch (err) {
      console.error(err);
      alert("Failed to approve merchant");
    } finally {
      setProcessing(false);
    }
  };

  const rejectMerchant = async (walletAddress) => {
    setProcessing(true);
    try {
      await axios.post(`${API}/reject-merchant`, {
        admin_wallet: wallet,
        merchant_wallet: walletAddress
      });
      alert("❌ Merchant rejected");
      loadMerchants();
    } catch (err) {
      console.error(err);
      alert("Failed to reject merchant");
    } finally {
      setProcessing(false);
    }
  };

  // Product actions
  const approveProduct = async (productId) => {
    setProcessing(true);
    try {
      await axios.post(`${API}/approve-product`, null, {
        params: { product_id: productId, admin_wallet: wallet }
      });
      alert("✅ Product approved successfully!");
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to approve product");
    } finally {
      setProcessing(false);
    }
  };

  const rejectProduct = async (productId) => {
    setProcessing(true);
    try {
      await axios.post(`${API}/reject-product`, null, {
        params: { product_id: productId, admin_wallet: wallet }
      });
      alert("❌ Product rejected");
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to reject product");
    } finally {
      setProcessing(false);
    }
  };

  // Escrow actions
// AdminPanel.jsx - Line ~200
const approveEscrow = async (orderId, onchainId) => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return;
  }

  setProcessing(true);
  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const signerAddress = await signer.getAddress();
    if (signerAddress.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
      alert("Please connect admin wallet in MetaMask");
      setProcessing(false);
      return;
    }

    const contract = new Contract(CONTRACT_ADDRESS, commerceArtifact.abi, signer);

    console.log(`🔍 Approving order #${onchainId} on-chain...`);
    
    // ON-CHAIN TRANSACTION
    const tx = await contract.adminApprove(onchainId, { 
      gasLimit: 300000 
    });
    
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    // 🔥 DATABASE UPDATE - YEH IMPORTANT HAI
    console.log(`🔍 Updating database for order ID: ${orderId}`);
    
    const response = await axios.post(`${API}/admin-order-decision`, {
      order_id: orderId,        // Database ID
      admin_wallet: wallet,
      action: "APPROVE"
    });
    
    console.log("Database response:", response.data);
    
    alert(`✅ Order #${onchainId} released successfully!`);
    loadEscrows(); // Refresh list

  } catch (err) {
    console.error("❌ Approval failed:", err);
    
    if (err.response) {
      // Database error
      console.error("Database error:", err.response.data);
      alert(`Database error: ${err.response.data.detail || "Unknown error"}`);
    } else if (err.code === 'ACTION_REJECTED') {
      alert("Transaction rejected in MetaMask");
    } else {
      alert("On-chain transaction failed: " + err.message);
    }
  } finally {
    setProcessing(false);
  }
};

  const rejectEscrow = async (orderId, onchainId) => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    setProcessing(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
        alert("Please connect admin wallet in MetaMask");
        setProcessing(false);
        return;
      }

      const contract = new Contract(CONTRACT_ADDRESS, commerceArtifact.abi, signer);

      console.log(`Rejecting order #${onchainId}...`);
      const tx = await contract.adminReject(onchainId, { gasLimit: 300000 });
      await tx.wait();

      await axios.post(`${API}/admin-order-decision`, {
        order_id: orderId,
        admin_wallet: wallet,
        action: "REJECT"
      });

      alert(`✅ Order #${onchainId} rejected. Refund issued.`);
      loadEscrows();
    } catch (err) {
      console.error("Rejection failed:", err);
      if (err.code === 'ACTION_REJECTED') {
        alert("Transaction rejected in MetaMask");
      } else {
        alert("On-chain transaction failed");
      }
    } finally {
      setProcessing(false);
    }
  };

  // Shorten wallet
  const shortenWallet = (wallet) => {
    if (!wallet) return "";
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  // 🔥 FIX: Debug log
  console.log("Current wallet:", wallet);
  console.log("Admin wallet:", ADMIN_WALLET);
  console.log("Is admin:", isAdmin);

  // Access control
  if (!wallet) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <div className="access-denied-icon">👛</div>
          <h2>Connect Wallet</h2>
          <p>Please connect your wallet to access admin panel</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <div className="access-denied-icon">⛔</div>
          <h2>Access Denied</h2>
          <p>This area is restricted to admin only</p>
          <p className="text-sm text-gray-500 mt-2">
            Connected: {shortenWallet(wallet)}
          </p>
          <p className="text-sm text-gray-500">
            Required: {shortenWallet(ADMIN_WALLET)}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <span className="spinner">🔄</span>
          <p className="mt-2">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-title">
          <FaShieldAlt className="text-purple-600" />
          Admin Dashboard
        </h1>
        <span className="admin-badge">Super Admin</span>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <FaStore />
          </div>
          <p className="admin-stat-label">Pending Merchants</p>
          <p className="admin-stat-value">{merchants.length}</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <FaBox />
          </div>
          <p className="admin-stat-label">Pending Products</p>
          <p className="admin-stat-value">{products.length}</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <FaLock />
          </div>
          <p className="admin-stat-label">Escrow Orders</p>
          <p className="admin-stat-value">{escrows.length}</p>
        </div>
      </div>

      {/* Settings Card */}
      <div className="settings-card">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
          <FaCog className="text-purple-600" />
          Platform Settings
        </h2>

        {settings && (
          <div className="current-settings">
            <p><span className="font-semibold">Current Daily Limit:</span> {settings.daily_limit} USDC</p>
            <p><span className="font-semibold">Current Admin Threshold:</span> {settings.admin_threshold} USDC</p>
            <p><span className="font-semibold">Current Platform Fee:</span> {settings.platform_fee_bps / 100}%</p>
          </div>
        )}

        <div className="settings-grid">
          <div className="setting-item">
            <label className="setting-label">Daily Limit (USDC)</label>
            <input
              type="number"
              className="setting-input"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              placeholder="Enter daily limit"
            />
          </div>
          <div className="setting-item">
            <label className="setting-label">Admin Threshold (USDC)</label>
            <input
              type="number"
              className="setting-input"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Enter threshold"
            />
          </div>
          <div className="setting-item">
            <label className="setting-label">Platform Fee (BPS)</label>
            <input
              type="number"
              className="setting-input"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="Enter fee in BPS"
            />
          </div>
        </div>

        <button
          onClick={updateSettings}
          disabled={processing}
          className="admin-search-btn w-full"
        >
          {processing ? "Updating..." : "Update Settings"}
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'merchants' ? 'active' : ''}`}
          onClick={() => setActiveTab('merchants')}
        >
          <FaStore className="inline mr-1" /> Pending Merchants ({merchants.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <FaBox className="inline mr-1" /> Pending Products ({products.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'escrows' ? 'active' : ''}`}
          onClick={() => setActiveTab('escrows')}
        >
          <FaLock className="inline mr-1" /> Escrow Orders ({escrows.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Pending Merchants */}
        {activeTab === 'merchants' && (
          <div>
            {merchants.length === 0 ? (
              <p className="text-xs" style={{ color: 'black' }}>No pending merchants</p>
            ) : (
              merchants.map((m, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow mb-3">
                  <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div>
                      <p className="text-xs" style={{ color: 'black' }}>{m[1]}</p>
                      <p className="text-xs" style={{ color: 'black' }}>{m[2]}</p>
                      <p className="text-xs" style={{ color: 'black' }}>
                        <FaLink className="text-xs" style={{ color: 'black' }} />
                        {shortenWallet(m[0])}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMerchant(m[0])}
                        disabled={processing}
                        className="admin-btn approve"
                      >
                        <FaCheck className="inline mr-1" /> Approve
                      </button>
                      <button
                        onClick={() => rejectMerchant(m[0])}
                        disabled={processing}
                        className="admin-btn reject"
                      >
                        <FaTimes className="inline mr-1" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Products */}
        {activeTab === 'products' && (
          <div>
            {products.length === 0 ? (
              <p className="text-xs" style={{ color: 'black' }}>No pending products</p>
            ) : (
              products.map((p, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow mb-3">
                  <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div>
                      <p className="text-xs" style={{ color: 'black' }}>{p[1]}</p>
                      <p className="text-xs" style={{ color: 'black' }}>{p[5]}</p>
                      <p className="text-xs" style={{ color: 'black' }}>{p[2]} USDC</p>
                      <p className="text-xs" style={{ color: 'black' }}>
                        <FaStore className="inline mr-1" />
                        Merchant: {shortenWallet(p[4])}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveProduct(p[0])}
                        disabled={processing}
                        className="admin-btn approve"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        onClick={() => rejectProduct(p[0])}
                        disabled={processing}
                        className="admin-btn reject"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Escrow Orders */}
        {activeTab === 'escrows' && (
          <div>
            {escrows.length === 0 ? (
              <p className="text-xs" style={{ color: 'black' }}>No escrow orders</p>
            ) : (
              escrows.map((o, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow mb-3 border-2 border-orange-200">
                  <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div>
                        <p className="font-semibold text-lg flex items-center gap-2">
                        <FaExclamationTriangle className="text-xs" style={{ color: 'black' }} />
                        Order #{o[1]} (DB ID: {o[0]})
                      </p>
                      <p className="text-xs" style={{ color: 'black' }}>
                        <span className="font-medium">Buyer:</span> {shortenWallet(o[2])}
                      </p>
                      <p className="text-xs" style={{ color: 'black' }}>
                        <span className="font-medium">Seller:</span> {shortenWallet(o[3])}
                      </p>
                      <p className="text-xs" style={{ color: 'black' }}>
                        ⚠️ On-chain action required
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveEscrow(o[0], o[1])}
                        disabled={processing}
                        className="admin-btn approve"
                      >
                        {processing ? "..." : <><FaCheck /> Release</>}
                      </button>
                      <button
                        onClick={() => rejectEscrow(o[0], o[1])}
                        disabled={processing}
                        className="admin-btn reject"
                      >
                        {processing ? "..." : <><FaTimes /> Refund</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Analytics Link */}
      <div className="mt-8 text-center">
        <a
          href="/admin-analytics"
          className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          View Advanced Analytics 📊
        </a>
      </div>
    </div>
  );
}