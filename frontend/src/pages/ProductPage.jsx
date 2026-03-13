// ProductPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import axios from "axios";
import useUserStore from "../store/useUserStore";
import { FaShoppingCart, FaStore, FaWallet, FaArrowLeft } from "react-icons/fa";

import commerceAbi from "../abi/CommerceCore.json";
import erc20Abi from "../abi/ERC20Mock.json";

const API = "http://localhost:8000";
const CONTRACT_ADDRESS = "0x78c37Dcb5C3C072DAfb9D4e28638BBcdf297FeeB";
const USDC_ADDRESS = "0x84b6a3e3a7ffE62D339524d7C678c252aBD2d4b0";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wallet } = useUserStore();

  const [product, setProduct] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const loadProduct = async () => {
    setPageLoading(true);
    try {
      const res = await axios.get(`${API}/products`);
      const p = res.data.find(x => x[0] == id);
      
      if (!p) {
        alert("Product not found");
        navigate("/");
        return;
      }
      
      setProduct(p);

      // Load seller's other products
      const seller = p[7];
      const sellerRes = await axios.get(`${API}/seller-products/${seller}`);
      setSellerProducts(sellerRes.data.filter(x => x[0] != id)); // Exclude current product
    } catch (err) {
      console.error("Error loading product:", err);
      alert("Failed to load product");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const buyProduct = async () => {
    if (!wallet) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const commerce = new Contract(
        CONTRACT_ADDRESS,
        commerceAbi.abi,
        signer
      );

      const usdc = new Contract(
        USDC_ADDRESS,
        erc20Abi.abi,
        signer
      );

      const seller = product[7];
      const price = product[4];

      // USDC decimals = 6
      const amount = parseUnits(price.toString(), 6);
      
      const type = product[5]?.toLowerCase().trim();
      const productType = type === "digital" ? 0 : 1;

      // Check allowance
      const allowance = await usdc.allowance(wallet, CONTRACT_ADDRESS);
      
      if (allowance < amount) {
        const approveTx = await usdc.approve(CONTRACT_ADDRESS, amount);
        await approveTx.wait();
      }

      const tx = await commerce.createOrder(seller, amount, productType);
      const receipt = await tx.wait();

      let orderId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = commerce.interface.parseLog(log);
          if (parsed.name === "OrderCreated") {
            orderId = Number(parsed.args.id);
            break;
          }
        } catch {}
      }

      if (!orderId) {
        throw new Error("Order ID not found in logs");
      }

      const order = await commerce.orders(orderId);
      let status = "ESCROW_HOLD";
      if (Number(order.status) === 3) {
        status = "COMPLETED";
      }

      await axios.post(`${API}/save-order`, {
        order_id_onchain: orderId,
        buyer_wallet: wallet,
        seller_wallet: seller,
        product_id: product[0],
        tx_hash: tx.hash,
        status: status
      });

      alert("✅ Purchase successful!");
      navigate("/orders"); // Redirect to orders page
    } catch (err) {
      console.error("FULL ERROR:", err);
      
      if (err.response) {
        alert(err.response.data.detail || "Backend error");
      } else if (err.reason) {
        alert(err.reason);
      } else {
        alert("Transaction failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="product-page-container">
        <div className="loading-state">
          <span className="spinner">🔄</span>
          <p className="mt-2">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page-container">
        <div className="text-center p-8 bg-white rounded-xl shadow">
          <p className="text-gray-600">Product not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-purple-600 hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page-container">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4 transition-colors"
      >
        <FaArrowLeft /> Back
      </button>

      {/* Main Product Section */}
      <div className="product-grid">
        {/* Product Image */}
        <div className="product-image-container">
          <img
            src={product[3] || "https://via.placeholder.com/600x600?text=No+Image"}
            alt={product[1]}
            className="product-main-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/600x600?text=No+Image";
            }}
          />
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h1 className="product-title">{product[1]}</h1>
          
            <div className="product-description-full">
            {product[2]}
          </div>

          <div className="price-badge-container">
            <span className="product-price-large">
              {product[4]} <small>USDC</small>
            </span>
            <span className={`product-type-badge ${product[5]?.toLowerCase() === "digital" ? "digital" : "physical"}`}>
              {product[5]}
            </span>
          </div>

          {/* Buy Button */}
          <button
            onClick={buyProduct}
            disabled={loading || !wallet}
            className="buy-button"
          >
            {loading ? (
              <><span className="spinner">🔄</span> Processing...</>
            ) : (
              <><FaShoppingCart /> Buy Now</>
            )}
          </button>

          {!wallet && (
            <p className="text-sm text-red-500 mt-2">
              Please connect your wallet to purchase
            </p>
          )}

          {/* Seller Info */}
          <div className="seller-info-card">
            <h3 className="seller-info-title">
              <FaStore className="text-purple-600" />
              Seller Information
            </h3>
            
            <div className="seller-detail">
              <span className="seller-detail-label">Username:</span>
              <span className="seller-detail-value">{product[6] || "Anonymous"}</span>
            </div>
            
            <div className="seller-detail">
              <span className="seller-detail-label">Wallet:</span>
              <div className="seller-wallet">
                <FaWallet className="inline mr-2 text-gray-400" />
                {product[7]}
              </div>
            </div>

            <button
              onClick={() => navigate(`/seller/${product[7]}`)}
              className="mt-3 text-sm text-purple-600 hover:underline"
            >
              View Seller Profile →
            </button>
          </div>
        </div>
      </div>

      {/* More from this seller */}
      {sellerProducts.length > 0 && (
        <div className="more-products-section">
          <h2 className="section-title">
            <FaStore /> More from this seller
          </h2>
          
          <div className="related-products-grid">
            {sellerProducts.map((p) => (
              <div
                key={p[0]}
                className="related-product-card"
                onClick={() => navigate(`/product/${p[0]}`)}
              >
                <img
                  src={p[3] || "https://via.placeholder.com/300x300?text=No+Image"}
                  alt={p[1]}
                  className="related-product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                  }}
                />
                <div className="related-product-info">
                  <h3 className="related-product-name">{p[1]}</h3>
                  <p className="related-product-price">{p[4]} USDC</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}