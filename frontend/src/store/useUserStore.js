import { create } from "zustand";

const useUserStore = create((set) => ({
  wallet: null,
  username: null,
  profileImage: null,

  setUser: (wallet, username, profileImage) =>
    set({ wallet, username, profileImage }),

  clearUser: () =>
    set({ wallet: null, username: null, profileImage: null }),
}));

export default useUserStore;