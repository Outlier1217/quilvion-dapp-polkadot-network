// ProductCard.jsx
import { BrowserProvider, Contract } from "ethers";
import axios from "axios";
import useUserStore from "../store/useUserStore";
import commerceAbi from "../abi/CommerceCore.json";
import erc20Abi from "../abi/ERC20Mock.json";
import { Link } from "react-router-dom";
import { useState } from "react";  // ✅ YEH IMPORT KARNA BHOOL GAYE THE

const CONTRACT_ADDRESS = "0x78c37Dcb5C3C072DAfb9D4e28638BBcdf297FeeB";
const USDC_ADDRESS = "0x84b6a3e3a7ffE62D339524d7C678c252aBD2d4b0";
const API = "http://localhost:8000";

export default function ProductCard({ product }) {
  const { wallet } = useUserStore();
  const seller = product[7];
  const [loading, setLoading] = useState(false);  // ✅ AB YEH KAAM KAREGA

  const buyProduct = async () => {
    if (!wallet) {
      alert("Connect wallet first");
      return;
    }

    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new Contract(
        CONTRACT_ADDRESS,
        commerceAbi.abi,
        signer
      );

      const usdc = new Contract(
        USDC_ADDRESS,
        erc20Abi.abi,
        signer
      );

      const price = product[4];
      const amount = BigInt(price * 1e6);
      const productTypeFromDB = product[5];
      const productType = productTypeFromDB === "DIGITAL" ? 0 : 1;

      const approveTx = await usdc.approve(CONTRACT_ADDRESS, amount);
      await approveTx.wait();

      const tx = await contract.createOrder(seller, amount, productType);
      const receipt = await tx.wait();

      const event = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(e => e && e.name === "OrderCreated");

      const orderId = Number(event.args.id);
      const order = await contract.orders(orderId);
      const status = Number(order.status) === 3 ? "COMPLETED" : "ESCROW_HOLD";

      await axios.post(`${API}/save-order`, {
        order_id_onchain: orderId,
        buyer_wallet: wallet,
        seller_wallet: seller,
        product_id: product[0],
        tx_hash: receipt.hash,
        status: status
      });

      alert("Purchase successful!");
    } catch (err) {
      console.error(err);
      alert("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    return category === "DIGITAL" 
      ? "DIGITAL" 
      : "PHYSICAL";
  };

  return (
    <div className="product-card">
      {/* Image Container */}
      <div className="product-image-container">
        {product[3] ? (
          <img
            src={product[3]}
            alt={product[1]}
            className="product-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />
        ) : (
          <div className="product-image flex items-center justify-center text-white text-4xl">
            🖼️
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3>{product[1]}</h3>
        <div className="product-description-container"></div>
        <p className="product-description">      {product[2].length > 100 
        ? `${product[2].substring(0, 100)}...` 
        : product[2]
      }</p>
          {product[2].length > 100 && (
          <Link 
            to={`/product/${product[0]}`}
            className="read-more-link"
          >
            Read More
          </Link>
        )}
        
        <span className={`product-category ${getCategoryColor(product[5])}`}>
          {product[5]}
        </span>

        <div className="product-footer">
          <span className="product-price">
            {product[4]} <small>USDC</small>
          </span>
          
          <Link 
            to={`/seller/${seller}`}
            className="seller-link"
          >
            View Seller
          </Link>
        </div>

        {/* Buy Button */}
        <button
          onClick={buyProduct}
          disabled={loading || !wallet}
          className="buy-btn"
        >
          {loading ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}