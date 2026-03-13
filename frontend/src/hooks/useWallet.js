import { BrowserProvider } from "ethers";
import axios from "axios";
import useUserStore from "../store/useUserStore";

const API = "http://127.0.0.1:8000";

export const useWallet = () => {

  const setUser = useUserStore((state) => state.setUser);

  const connectWallet = async () => {

    try {

      // ===============================
      // CHECK WALLET PROVIDER
      // ===============================
      if (!window.ethereum) {

        const isMobile =
          /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {

          alert(
            "MetaMask not detected.\n\nIf you are on mobile, open this website inside the MetaMask app browser."
          );

        } else {

          alert(
            "MetaMask extension not detected.\nPlease install MetaMask in your browser."
          );

        }

        return;
      }

      // ===============================
      // CONNECT WALLET
      // ===============================
      const provider = new BrowserProvider(window.ethereum);

      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      console.log("Wallet Connected:", address);

      // ===============================
      // SAVE USER IN BACKEND
      // ===============================
      const res = await axios.post(`${API}/connect-wallet`, {
        wallet_address: address,
      });

      const username = res.data.username;
      const profileImage = res.data.profile_image || null;

      // ===============================
      // STORE IN GLOBAL STATE
      // ===============================
      setUser(address, username, profileImage);

      console.log("User Loaded:", username);

    } catch (err) {

      console.error("Wallet connection error:", err);

      if (err.code === 4001) {

        alert("Connection request rejected in MetaMask.");

      } else {

        alert("Wallet connection failed. Check console.");

      }

    }
  };

  return { connectWallet };

};