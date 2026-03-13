// components/Footer.jsx
import { Link } from "react-router-dom";
import { 
  FaYoutube, 
  FaInstagram, 
  FaFacebook, 
  FaTwitter, 
  FaGithub, 
  FaDiscord,
  FaTelegram,
  FaMedium,
  FaReddit
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section">
          <h3>About</h3>
          <p>
            Decentralized e-commerce platform built on Polkadot Network. 
            Buy and sell products with cryptocurrency securely and transparently.
          </p>
          <div className="social-links">
            <a href="https://www.youtube.com/@Outlier1217" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaYoutube />
            </a>
            <a href="https://www.instagram.com/mustak_1217?igsh=MWEzMTlkYjk1djY0" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaInstagram />
            </a>
            {/* <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaFacebook />
            </a> */}
            <a href="https://x.com/Mustak1217" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaTwitter />
            </a>
            {/* <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaGithub />
            </a> */}
            {/* <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaDiscord />
            </a> */}
            <a href="t.me/Mustak1217" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaTelegram />
            </a>
            {/* <a href="https://medium.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaMedium />
            </a>
            <a href="https://reddit.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaReddit />
            </a> */}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/merchant">Become a Merchant</Link></li>
            <li><Link to="/support">Support</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        {/* Support & Help */}
        <div className="footer-section">
          <h3>Help & Support</h3>
          <ul className="footer-links">
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/refund">Refund Policy</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-section">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for updates and offers!</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>
          © {currentYear} Quilvion. All rights reserved. | 
          Powered by <a href="https://polkadot.testnet.routescan.io/address/0x78c37Dcb5C3C072DAfb9D4e28638BBcdf297FeeB
" target="_blank" rel="noopener noreferrer">POLKADOT Network</a>
        </p>
      </div>
    </footer>
  );
}