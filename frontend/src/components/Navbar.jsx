// Navbar.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import useUserStore from "../store/useUserStore";
import { useWallet } from "../hooks/useWallet";
import { FaEnvelope, FaBars, FaTimes, FaWallet, FaShieldAlt, FaChartLine } from "react-icons/fa";

const API = "http://localhost:8000";
const ADMIN_WALLET = "0xAb06a17af1425F499E302B639c69f8ce29a967E0";

export default function Navbar() {
  const { wallet, username } = useUserStore();
  const { connectWallet } = useWallet();
  const [merchantStatus, setMerchantStatus] = useState(null);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const isAdmin = wallet && wallet.toLowerCase() === ADMIN_WALLET.toLowerCase();

  // Check screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load merchant status
  useEffect(() => {
    if (!wallet) return;
    axios
      .get(`${API}/merchant-status/${wallet}`)
      .then(res => setMerchantStatus(res.data))
      .catch(() => {});
  }, [wallet]);

  // Load unread messages
  const loadUnread = () => {
    if (!wallet) return;
    axios
      .get(`${API}/unread/${wallet}`)
      .then(res => setUnread(res.data.count))
      .catch(() => {});
  };

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 5000);
    return () => clearInterval(interval);
  }, [wallet]);

  // Open messages
  const openMessages = async () => {
    if (!wallet) return;
    try {
      await axios.post(`${API}/mark-read/${wallet}`);
      setUnread(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle connect wallet on mobile
  const handleMobileConnect = () => {
    connectWallet();
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side - Logo or Mobile Connect Button */}
        <div className="navbar-left">
          {isMobile && !wallet ? (
            // Mobile & Not Connected: Show Connect Button
            <button
              onClick={handleMobileConnect}
              className="mobile-connect-btn"
            >
              <FaWallet className="mr-2" />
              Connect
            </button>
          ) : (
            // Show Logo for all other cases
            <Link to="/" className="navbar-logo">
              Quilvion
            </Link>
          )}
        </div>

        {/* Desktop Wallet Info - FIXED: Yeh add kiya */}
        {!isMobile && wallet && (
          <div className="desktop-wallet-info">
            <span className="desktop-username">{username}</span>
            <span className="desktop-wallet-address">
              {wallet.slice(0,6)}...{wallet.slice(-4)}
            </span>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Desktop Connect Button - Only show on desktop when not connected */}
        {!isMobile && !wallet && (
          <button
            onClick={connectWallet}
            className="desktop-connect-btn"
          >
            Connect Wallet
          </button>
        )}

        {/* Navigation Links */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {/* Show wallet info first on mobile */}
          {isMobile && wallet && (
            <div className="mobile-wallet-info">
              <div className="wallet-address">
                {wallet.slice(0,6)}...{wallet.slice(-4)}
              </div>
              <span className="wallet-username">{username}</span>
            </div>
          )}

          {/* Support - Available for everyone */}
          <Link to="/support" onClick={() => setMenuOpen(false)}>
            Ask Me
          </Link>

          {/* Normal user - Be a Merchant */}
          {wallet && merchantStatus && !merchantStatus.is_merchant && (
            <Link to="/merchant" onClick={() => setMenuOpen(false)}>
              Be a Merchant
            </Link>
          )}

          {/* Dashboard */}
          {wallet && (
            <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}

          {/* Mail Icon */}
          {wallet && (
            <Link
              to="/dashboard"
              onClick={() => {
                openMessages();
                setMenuOpen(false);
              }}
              className="mail-icon-wrapper"
            >
              <FaEnvelope />
              {unread > 0 && (
                <span className="unread-badge">{unread}</span>
              )}
            </Link>
          )}

          {/* Approved merchant - Add Product */}
          {wallet && merchantStatus && merchantStatus.approved && (
            <Link to="/merchant" onClick={() => setMenuOpen(false)}>
              Add Product
            </Link>
          )}

          {/* 👑 ADMIN LINKS - Jab admin wallet connect ho to ye dono dikhenge */}
          {isAdmin && (
            <>
              <div className="admin-badge-container">
                <span className="admin-nav-badge">👑 Admin</span>
              </div>
              
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="admin-link">
                <FaShieldAlt className="admin-icon" /> Admin Panel
              </Link>
              
              <Link to="/admin-analytics" onClick={() => setMenuOpen(false)} className="admin-link">
                <FaChartLine className="admin-icon" /> Analytics
              </Link>
            </>
          )}

          {/* Mobile Disconnect Option */}
          {isMobile && wallet && (
            <button 
              onClick={() => {
                // Add disconnect logic if you have it
                setMenuOpen(false);
              }}
              className="mobile-disconnect-btn"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}