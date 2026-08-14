import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';

export interface UserProfile { id: string; fullName: string; email: string }
export interface BusinessProfile { id: string; name: string; category: string; country: string; currency: string; branchName: string }

interface AuthState {
  user: UserProfile | null;
  business: BusinessProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setSession: (user: UserProfile | null, business?: BusinessProfile | null) => void;
  updateBusiness: (business: BusinessProfile) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  user: null,
  business: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
  setSession: (user, business) => {
    if (!user) return set({ user: null, business: null, isAuthenticated: false, isLoading: false });
    const existingBusiness = get().user?.id === user.id ? get().business : null;
    set({ user, business: business === undefined ? existingBusiness : business, isAuthenticated: true, isLoading: false });
  },
  updateBusiness: (business) => set({ business }),
  setLoading: (isLoading) => set({ isLoading }),
  setHasHydrated: (hasHydrated) => set({ hasHydrated }),
  logout: async () => {
    set({ isLoading: true });
    try { await supabase.auth.signOut(); } catch (error) { console.warn('Supabase signout warning:', error); }
    finally { set({ user: null, business: null, isAuthenticated: false, isLoading: false }); }
  },
}), {
  name: 'ease-auth-v2',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: ({ user, business, isAuthenticated }) => ({ user, business, isAuthenticated }),
  onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
}));
