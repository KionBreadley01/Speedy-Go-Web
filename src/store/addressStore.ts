import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AddressItem {
  id?: string;
  title: string;
  description: string;
  type: string; // Casa, Oficina, Departamento, etc.
  details?: string;
  tag?: string; // Quick tag or custom name
  deliveryOption?: string; // door, outside, etc.
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
  addAddressToStore: (address: AddressItem) => void;
  updateAddressInStore: (address: AddressItem) => void;
  removeAddressFromStore: (addressId: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Helper to fetch the description string safe
  getCurrentAddressName: () => string;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      currentAddress: null,
      loading: false,

      setAddresses: (addresses) => set({ addresses }),
      
      setCurrentAddress: (address) => set({ currentAddress: address }),

      addAddressToStore: (address) => set((state) => ({
        addresses: [address, ...state.addresses]
      })),

      updateAddressInStore: (address) => set((state) => ({
        addresses: state.addresses.map((a) => a.id === address.id ? address : a),
        currentAddress: state.currentAddress?.id === address.id ? address : state.currentAddress
      })),

      removeAddressFromStore: (addressId) => set((state) => ({
        addresses: state.addresses.filter((a) => a.id !== addressId)
      })),

      setLoading: (loading) => set({ loading }),

      getCurrentAddressName: () => {
        const current = get().currentAddress;
        if (current) {
            return current.description || current.title;
        }
        return "Seleccionar dirección";
      }
    }),
    {
      name: 'speedygo-address',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
