import axios from "axios";

const API = "http://localhost:8000";

export const fetchProducts = async (search = "", type = "") => {
  const res = await axios.get(`${API}/products`, {
    params: {
      search,
      product_type: type,
    },
  });
  return res.data;
};