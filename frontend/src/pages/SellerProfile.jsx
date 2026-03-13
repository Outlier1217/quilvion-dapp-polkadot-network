// SellerProfile.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import useUserStore from "../store/useUserStore";
import { FaStore, FaWallet, FaPaperPlane, FaArrowLeft, FaUser } from "react-icons/fa";

const API = "http://localhost:8000";

export default function SellerProfile() {
  const navigate = useNavigate();
  const { wallet: userWallet } = useUserStore();
  const { seller } = useParams();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load seller info (you can add more seller details from backend)
  const loadSellerInfo = async () => {
    try {
      // You can add an API endpoint to get seller details
      // For now, we'll just set basic info
      setSellerInfo({
        wallet: seller,
        username: `Seller ${seller?.slice(0, 6)}...`,
        joinedDate: new Date().toLocaleDateString()
      });
    } catch (err) {
      console.error("Error loading seller info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (seller) {
      loadSellerInfo();
    }
  }, [seller]);

  const sendMessage = async () => {
    if (!userWallet) {
      alert("Please connect your wallet first");
      return;
    }

    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    setSending(true);
    try {
      await axios.post(`${API}/send-message`, {
        sender_wallet: userWallet,
        receiver_wallet: seller,
        message: message
      });

      alert("✅ Message sent successfully!");
      setMessage("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const startChat = () => {
    navigate(`/chat/${seller}`);
  };

  if (loading) {
    return (
      <div className="seller-profile-container">
        <div className="loading-state">
          <span className="spinner">🔄</span>
          <p className="mt-2">Loading seller profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-profile-container">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4 transition-colors"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="seller-profile-card">
        {/* Seller Header */}
        <div className="seller-header">
          <div className="seller-large-avatar">
            {seller?.charAt(2)?.toUpperCase() || 'S'}
          </div>
          <div className="seller-header-info">
            <h1>
              <FaStore className="inline mr-2 text-purple-600" />
              {sellerInfo?.username || "Seller Profile"}
            </h1>
            <p>Member since {sellerInfo?.joinedDate}</p>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="seller-wallet-full">
          <FaWallet className="inline mr-2 text-purple-600" />
          <span className="font-medium">Wallet Address:</span>
          <div className="mt-2 text-sm break-all bg-white p-2 rounded">
            {seller}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={startChat}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaStore /> View Chat
          </button>
        </div>

        {/* Message Form */}
        <div className="message-form">
          <h3>
            <FaPaperPlane className="text-purple-600" />
            Send Message to Seller
          </h3>

          {!userWallet ? (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-3">
              <p className="text-sm text-yellow-800">
                Please connect your wallet to send messages
              </p>
            </div>
          ) : (
            <>
              <textarea
                className="message-textarea"
                placeholder={`Write your message to ${sellerInfo?.username}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
              />

              <button
                onClick={sendMessage}
                disabled={sending || !message.trim()}
                className="send-message-btn"
              >
                {sending ? (
                  <><span className="spinner">🔄</span> Sending...</>
                ) : (
                  <><FaPaperPlane /> Send Message</>
                )}
              </button>
            </>
          )}
        </div>

        {/* Seller Stats (Optional) */}
        {/* <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-xl font-bold text-purple-600">--</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-xl font-bold text-green-600">--</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}