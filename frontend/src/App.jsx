// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MerchantRegister from "./pages/MerchantRegister";
import ProductPage from "./pages/ProductPage";
import MyOrders from "./pages/MyOrders";
import AdminPanel from "./pages/AdminPanel";
import Dashboard from "./pages/Dashboard";
import SellerProfile from "./pages/SellerProfile";
import Chat from "./pages/Chat";
import AskSupport from "./pages/AskSupport";
import AdminAnalytics from "./pages/AdminAnalytics";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/merchant" element={<MerchantRegister />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/seller/:seller" element={<SellerProfile/>}/>
            <Route path="/chat/:user" element={<Chat/>}/>
            <Route path="/support" element={<AskSupport />} />
            <Route path="/admin-analytics" element={<AdminAnalytics />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;