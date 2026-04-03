"use client";

import { create } from 'zustand';

export interface AddressItem {
  id?: string;
  title: string;
  description: string;
  type?: string;
  details?: string;
  tag?: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
}

interface AddressState {
  addresses: AddressItem[];
  currentAddress: AddressItem | null;
  loading: boolean;

  setAddresses: (addresses: AddressItem[]) => void;
  setCurrentAddress: (address: AddressItem | null) => void;
  setLoading: (loading: boolean) => void;

  // 🔥 NUEVO: reset total del estado
  reset: () => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  addresses: [],
  currentAddress: null,
  loading: false,

  setAddresses: (addresses) => set({ addresses }),

  setCurrentAddress: (address) => set({ currentAddress: address }),

  setLoading: (loading) => set({ loading }),

  // 🔥 CLAVE DEL FIX
  reset: () =>
    set({
      addresses: [],
      currentAddress: null,
      loading: false,
    }),
}));