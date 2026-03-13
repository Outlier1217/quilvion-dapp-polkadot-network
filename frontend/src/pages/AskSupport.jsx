// AskSupport.jsx
import { useState } from "react";
import axios from "axios";
import useUserStore from "../store/useUserStore";
import { FaUser, FaWallet, FaQuestionCircle, FaPaperPlane } from "react-icons/fa";

const API = "http://localhost:8000";

export default function AskSupport() {
  const { wallet } = useUserStore();
  const [name, setName] = useState("");
  const [seller, setSeller] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    if (!wallet && !name.trim()) {
      alert("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/support`, {
        sender_wallet: wallet ? wallet : null,
        sender_name: wallet ? null : name,
        seller_wallet: seller || null,
        message: message
      });

      alert("✅ Message sent to support team!");
      setMessage("");
      setSeller("");
      setName("");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-container">
      <div className="support-card">
        <h1 className="support-title">
          <FaQuestionCircle className="inline mr-2" />
          Ask Support
        </h1>

        <div className="info-box">
          <p className="font-semibold mb-1">📌 Important:</p>
          <p>
            If your issue is related to a specific seller, please enter their wallet address below.
            This helps us resolve your query faster!
          </p>
        </div>

        {!wallet ? (
          <div className="space-y-3 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                className="support-input pl-10"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="wallet-info-box">
            <FaWallet className="inline mr-2 text-purple-600" />
            <span className="font-medium">Connected Wallet:</span>
            <div className="mt-1 text-sm break-all">{wallet}</div>
          </div>
        )}

        <div className="space-y-3 mb-4">
        <label 
          className="block text-sm font-medium" 
          style={{ color: 'black' }}
        >
          Seller Wallet (Optional)
        </label>
          <div className="relative">
            <FaWallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              className="support-input pl-10"
              placeholder="0x... (seller's wallet address)"
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
            />
          </div>
          <p 
              className="text-xs" 
              style={{ color: 'black' }}
            >
              Leave empty if this is a general inquiry
            </p>
        </div>

        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium" style={{ color: 'black' }}>
            Your Message <span className="text-red-500">*</span>
          </label>
          <textarea
            className="support-textarea"
            rows="5"
            placeholder="Please describe your issue in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button
          onClick={sendMessage}
          disabled={loading}
          className="support-btn"
        >
          {loading ? (
            <>
              <span className="spinner">🔄</span>
              Sending...
            </>
          ) : (
            <>
              <FaPaperPlane />
              Send Message
            </>
          )}
        </button>

        <p className="text-xs" style={{ color: 'black' }}>
          Our support team will respond within 24-48 hours
        </p>
      </div>
    </div>
  );
}