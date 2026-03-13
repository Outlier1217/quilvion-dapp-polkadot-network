// Chat.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import useUserStore from "../store/useUserStore";
import { FaPaperPlane, FaUser, FaCircle, FaArrowDown } from "react-icons/fa";

const API = "http://localhost:8000";

export default function Chat() {
  const { wallet } = useUserStore();
  const { user } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Scroll to bottom function
  const scrollToBottom = (force = false) => {
    if (force || shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Check if user scrolled up
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShouldAutoScroll(isNearBottom);
    setShowScrollBtn(!isNearBottom && messages.length > 0);
  };

  const loadChat = async () => {
    if (!wallet || !user) return;
    
    try {
      const res = await axios.get(`${API}/chat/${wallet}/${user}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error loading chat:", err);
    }
  };

  useEffect(() => {
    if (wallet) {
      loadChat();
    }
    
    const interval = setInterval(() => {
      if (wallet) loadChat();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [wallet, user]);

  // Handle auto-scroll only when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessagesLength) {
      scrollToBottom(true);
    }
    setPrevMessagesLength(messages.length);
  }, [messages]);

  // Add scroll event listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) {
      alert("Please enter a message");
      return;
    }

    setSending(true);
    try {
      await axios.post(`${API}/send-message`, {
        sender_wallet: wallet,
        receiver_wallet: user,
        message: text
      });

      setText("");
      setShouldAutoScroll(true);
      await loadChat();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!wallet) {
    return (
      <div className="chat-page-container">
        <div className="merchant-card text-center p-8">
          <FaUser className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Please connect your wallet to start chatting</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="chat-page-container">
        <div className="merchant-card text-center p-8">
          <p className="text-gray-600">Invalid chat user</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page-container">
      <div className="chat-layout">
        {/* Chat Header - Fixed at top */}
        <div className="chat-header">
          <div className="chat-avatar-large">
            {user?.charAt(2)?.toUpperCase() || 'U'}
          </div>
          <div className="chat-user-info">
            <div className="chat-user-wallet">
              {user?.slice(0, 6)}...{user?.slice(-4)}
            </div>
            <div className="chat-user-status">
              <FaCircle className="text-[8px] text-green-500" />
              Online
            </div>
          </div>
        </div>

        {/* Messages Container - Scrollable middle section */}
        <div 
          ref={chatContainerRef}
          className="chat-messages-area"
          onScroll={handleScroll}
        >
          {loading && messages.length === 0 ? (
            <div className="chat-empty-state">
              <span className="spinner inline-block">🔄</span>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Say hello to start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((m, i) => {
                const isSent = m[0] === wallet;
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div
                    key={i}
                    className={`message-wrapper ${isSent ? 'sent' : 'received'}`}
                  >
                    <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                      {m[1]}
                      <div className="message-time">{time}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => {
              setShouldAutoScroll(true);
              scrollToBottom(true);
            }}
            className="scroll-bottom-btn"
            title="Scroll to bottom"
          >
            <FaArrowDown />
          </button>
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="chat-input-area">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="chat-input-field"
            placeholder="Type your message..."
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !text.trim()}
            className="chat-send-button"
          >
            {sending ? <span className="spinner">🔄</span> : <FaPaperPlane />}
          </button>
        </div>
      </div>
    </div>
  );
}