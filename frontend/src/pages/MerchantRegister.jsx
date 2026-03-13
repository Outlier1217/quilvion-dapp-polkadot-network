// MerchantRegister.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import useUserStore from "../store/useUserStore";
import { FaStore, FaBox, FaUpload, FaCheck, FaHourglass } from "react-icons/fa";

const API = "http://localhost:8000";

export default function MerchantRegister() {
  const { wallet } = useUserStore();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    address: "",
    email: "",
    product_type: "DIGITAL"
  });

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    image_url: "",
    price: "",
    product_type: "DIGITAL",
    download_link: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Check merchant status
  const checkStatus = async () => {
    if (!wallet) return;
    try {
      const res = await axios.get(`${API}/merchant-status/${wallet}`);
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [wallet]);

  // Image Upload
  const uploadImage = async () => {
    if (!imageFile) return "";
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const res = await axios.post(`${API}/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data.image_url;
    } catch (err) {
      console.error("Upload failed:", err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Add product locally
  const addTempProduct = async () => {
    if (!newProduct.title || !newProduct.price) {
      alert("Title and price are required");
      return;
    }

    if (parseFloat(newProduct.price) <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    let imageUrl = newProduct.image_url;

    if (imageFile) {
      try {
        imageUrl = await uploadImage();
      } catch (err) {
        alert("Image upload failed");
        return;
      }
    }

    const productData = {
      ...newProduct,
      image_url: imageUrl,
      price: parseFloat(newProduct.price)
    };

    setProducts([...products, productData]);
    
    // Reset form
    setNewProduct({
      title: "",
      description: "",
      image_url: "",
      price: "",
      product_type: "DIGITAL",
      download_link: ""
    });
    setImageFile(null);
    setPreview(null);
  };

  // Remove product from list
  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // Submit registration
  const registerMerchant = async () => {
    if (!wallet) {
      alert("Connect wallet first");
      return;
    }

    if (!form.name || !form.company_name || !form.email) {
      alert("Please fill all merchant fields");
      return;
    }

    if (products.length === 0) {
      alert("Add at least one product");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/register-merchant`, {
        wallet_address: wallet,
        ...form
      });

      for (let p of products) {
        const payload = {
          wallet_address: wallet,
          title: p.title,
          description: p.description,
          image_url: p.image_url,
          price: p.price,
          product_type: p.product_type
        };

        if (p.product_type === "DIGITAL") {
          payload.download_link = p.download_link;
        }

        await axios.post(`${API}/add-product`, payload);
      }

      alert("Registration submitted successfully! Waiting for admin approval.");
      setProducts([]);
      checkStatus();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error submitting registration");
    } finally {
      setLoading(false);
    }
  };

  // Approved merchant - Add single product
  const addProduct = async () => {
    if (!newProduct.title || !newProduct.price) {
      alert("Title and price are required");
      return;
    }

    if (parseFloat(newProduct.price) <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = newProduct.image_url;

      if (imageFile) {
        imageUrl = await uploadImage();
      }

      await axios.post(`${API}/add-product`, {
        wallet_address: wallet,
        title: newProduct.title,
        description: newProduct.description,
        image_url: imageUrl,
        price: parseFloat(newProduct.price),
        product_type: newProduct.product_type,
        download_link: newProduct.product_type === "DIGITAL" ? newProduct.download_link : null
      });

      alert("Product submitted for approval!");
      
      // Reset form
      setNewProduct({
        title: "",
        description: "",
        image_url: "",
        price: "",
        product_type: "DIGITAL",
        download_link: ""
      });
      setImageFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Product add failed");
    } finally {
      setLoading(false);
    }
  };

  // Wallet check
  if (!wallet) {
    return (
      <div className="merchant-container">
        <div className="merchant-card text-center p-8">
          <FaStore className="text-5xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to register as a merchant</p>
        </div>
      </div>
    );
  }

  // Approved merchant view
  if (status && status.approved) {
    return (
      <div className="merchant-container">
        <div className="merchant-card">
          <h2 className="merchant-title">
            <FaBox /> Add New Product
          </h2>

          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            className="merchant-file-input"
            onChange={(e) => {
              const file = e.target.files[0];
              setImageFile(file);
              setPreview(URL.createObjectURL(file));
            }}
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="image-preview"
            />
          )}

          {/* Product Type */}
          <select
            className="merchant-select"
            value={newProduct.product_type}
            onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })}
          >
            <option value="DIGITAL">Digital Product</option>
            <option value="PHYSICAL">Physical Product</option>
          </select>

          {/* Title */}
          <input
            placeholder="Product Title"
            className="merchant-input"
            value={newProduct.title}
            onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
          />

          {/* Description */}
          <textarea
            placeholder="Product Description"
            className="merchant-input"
            rows="3"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />

          {/* Price */}
          <input
            type="number"
            step="0.01"
            placeholder="Price (USDC)"
            className="merchant-input"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />

          {/* Download Link - Only for digital products */}
          {newProduct.product_type === "DIGITAL" && (
            <input
              placeholder="Download Link (optional)"
              className="merchant-input"
              value={newProduct.download_link}
              onChange={(e) => setNewProduct({ ...newProduct, download_link: e.target.value })}
            />
          )}

          {/* Submit Button */}
          <button
            onClick={addProduct}
            disabled={loading || uploading}
            className="merchant-btn primary"
          >
            {loading || uploading ? (
              <><span className="spinner">🔄</span> Processing...</>
            ) : (
              <><FaUpload /> Submit Product</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Pending approval view
  if (status && status.is_merchant && !status.approved) {
    return (
      <div className="merchant-container">
        <div className="pending-card">
          <div className="pending-icon">⏳</div>
          <h2 className="pending-title">Approval Pending</h2>
          <p className="pending-text">
            Your merchant registration is under review by the admin.
            You'll be notified once approved.
          </p>
          <div className="text-xs" style={{ color: 'black' }}>
            <FaHourglass className="text-xs" style={{ color: 'black' }} />
            Estimated time: 24-48 hours
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="merchant-container">
      <div className="merchant-card">
        <h2 className="merchant-title">
          <FaStore /> Merchant Registration
        </h2>

        {/* Merchant Info */}
        <div className="space-y-3">
          <input
            placeholder="Full Name *"
            className="merchant-input"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Company Name *"
            className="merchant-input"
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          />
          <input
            placeholder="Address"
            className="merchant-input"
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email *"
            className="merchant-input"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <select
            className="merchant-select"
            onChange={(e) => setForm({ ...form, product_type: e.target.value })}
          >
            <option value="DIGITAL">Digital Products Only</option>
            <option value="PHYSICAL">Physical Products Only</option>
            <option value="BOTH">Both Digital & Physical</option>
          </select>
        </div>

        <h3 className="merchant-subtitle">
          Add Products ({products.length})
        </h3>

        {/* Product Upload */}
        <input
          type="file"
          accept="image/*"
          className="merchant-file-input"
          onChange={(e) => {
            const file = e.target.files[0];
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
          }}
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="image-preview"
          />
        )}

        {/* Product Type */}
        <select
          className="merchant-select"
          value={newProduct.product_type}
          onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })}
        >
          <option value="DIGITAL">Digital Product</option>
          <option value="PHYSICAL">Physical Product</option>
        </select>

        {/* Product Fields */}
        <input
          placeholder="Product Title *"
          className="merchant-input"
          value={newProduct.title}
          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
        />
        
        <textarea
          placeholder="Product Description"
          className="merchant-input"
          rows="2"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />
        
        <input
          type="number"
          step="0.01"
          placeholder="Price (USDC) *"
          className="merchant-input"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />

        {newProduct.product_type === "DIGITAL" && (
          <input
            placeholder="Download Link"
            className="merchant-input"
            value={newProduct.download_link}
            onChange={(e) => setNewProduct({ ...newProduct, download_link: e.target.value })}
          />
        )}

        <button
          onClick={addTempProduct}
          disabled={uploading}
          className="merchant-btn secondary mb-4"
        >
          {uploading ? (
            <><span className="spinner">🔄</span> Uploading...</>
          ) : (
            <><FaBox /> Add to List</>
          )}
        </button>

        {/* Product List */}
        {products.length > 0 && (
          <div className="product-list">
            {products.map((p, index) => (
              <div key={index} className="product-list-item">
                <span className="product-list-title">{p.title}</span>
                <div className="flex items-center gap-2">
                  <span className="product-list-price">{p.price} USDC</span>
                  <button
                    onClick={() => removeProduct(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={registerMerchant}
          disabled={loading || products.length === 0}
          className="merchant-btn primary mt-4"
        >
          {loading ? (
            <><span className="spinner">🔄</span> Submitting...</>
          ) : (
            <><FaCheck /> Submit for Approval</>
          )}
        </button>
      </div>
    </div>
  );
}