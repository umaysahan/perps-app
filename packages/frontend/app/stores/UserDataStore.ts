import { create } from 'zustand';

export interface UserDataStore {
    userAddress: string;
    setUserAddress: (userAddress: string) => void;
}

export const useUserDataStore = create<UserDataStore>((set) => ({
    userAddress: '',
    setUserAddress: (userAddress: string) => {
        set({ userAddress });
    },
}));
