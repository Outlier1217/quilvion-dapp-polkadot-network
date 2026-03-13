// Home.jsx
import { useEffect, useState } from "react";
import { fetchProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import { FaSearch } from "react-icons/fa";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(search, filter);
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, filter]);

  return (
    <div>
      {/* Search and Filter */}
      <div className="search-container">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="search-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="DIGITAL">Digital Products</option>
          <option value="PHYSICAL">Physical Products</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="empty-state">
          <span className="empty-state-icon">🔄</span>
          <p>Loading products...</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
        <>
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product[0]} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">📦</span>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-500">
                {search || filter 
                  ? "Try adjusting your search or filter" 
                  : "Be the first to add a product!"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}