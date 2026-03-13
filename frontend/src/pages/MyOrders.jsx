// MyOrders.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import useUserStore from "../store/useUserStore";
import { FaShoppingBag, FaFilter } from "react-icons/fa";

const API = "http://localhost:8000";

export default function MyOrders() {
  const { wallet } = useUserStore();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const loadOrders = async () => {
    if (!wallet) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`${API}/orders/${wallet}`);
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet) {
      loadOrders();
    }
  }, [wallet]);

  // Filter orders
  const filterOrders = (status) => {
    setActiveFilter(status);
    if (status === "ALL") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o[2] === status));
    }
  };

  // Get status color
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

  // Get risk score color
  const getRiskColor = (score) => {
    if (score < 30) return 'risk-low';
    if (score < 70) return 'risk-medium';
    return 'risk-high';
  };

  if (!wallet) {
    return (
      <div className="orders-page-container">
        <div className="merchant-card text-center p-8">
          <FaShoppingBag className="text-5xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      <div className="orders-header">
        <h1 className="orders-title">
          <FaShoppingBag className="inline mr-3" />
          My Orders
        </h1>

        {/* Filter Buttons */}
        <div className="orders-filter">
          <button
            className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => filterOrders('ALL')}
          >
            All
          </button>
          <button
            className={`filter-btn ${activeFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => filterOrders('PENDING')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${activeFilter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => filterOrders('COMPLETED')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${activeFilter === 'ESCROW_HOLD' ? 'active' : ''}`}
            onClick={() => filterOrders('ESCROW_HOLD')}
          >
            Escrow
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">
          <span className="spinner inline-block text-2xl">🔄</span>
          <p className="mt-2 text-gray-600">Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="merchant-card text-center p-8">
          <FaShoppingBag className="text-5xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-gray-600">
            {activeFilter === 'ALL' 
              ? "You haven't placed any orders yet" 
              : `No ${activeFilter.toLowerCase()} orders found`}
          </p>
        </div>
      ) : (
        <div>
          {filteredOrders.map((o, index) => (
            <div
              key={index}
              className={`order-item-card ${getStatusColor(o[2])}`}
            >
              <div className="order-item-header">
                <span className="order-item-id">
                  Order #{o[0] || index + 1}
                </span>
                <span className={`order-item-status ${getStatusColor(o[2])}`}>
                  {o[2]}
                </span>
              </div>

              <div className="order-item-detail">
                <span className="order-item-label">Seller:</span>
                <span className="order-item-value">
                  {o[1]?.slice(0, 6)}...{o[1]?.slice(-4)}
                </span>
              </div>

              <div className="order-item-detail">
                <span className="order-item-label">Risk Score:</span>
                <span className={`order-risk-score ${getRiskColor(o[3])}`}>
                  {o[3] || 0}%
                </span>
              </div>

              {o[4] && (
                <div className="order-item-detail">
                  <span className="order-item-label">Product:</span>
                  <span className="order-item-value">{o[4]}</span>
                </div>
              )}

              {o[6] && (
                <div className="order-item-detail">
                  <span className="order-item-label">Amount:</span>
                  <span className="order-item-value font-bold text-purple-600">
                    {o[6]} USDC
                  </span>
                </div>
              )}

              {/* Order Actions based on status */}
              {o[2] === 'PENDING' && (
                <div className="mt-3 flex gap-2">
                  <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                    Cancel
                  </button>
                </div>
              )}

              {o[2] === 'ESCROW_HOLD' && (
                <div className="mt-3">
                  <p className="text-sm text-yellow-600">
                    ⏳ Payment held in escrow. Awaiting seller confirmation.
                  </p>
                </div>
              )}

              {o[2] === 'COMPLETED' && (
                <div className="mt-3">
                  <p className="text-sm text-green-600">
                    ✅ Order completed successfully
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}