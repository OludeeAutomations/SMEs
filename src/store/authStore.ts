import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';

export interface UserProfile { id: string; fullName: string; email: string }
export interface BusinessProfile { id: string; name: string; category: string; country: string; currency: string; branchName: string }

interface AuthState {
  user: UserProfile | null;
  business: BusinessProfile | null;
  businesses: Record<string, BusinessProfile>;
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
  businesses: {},
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
  setSession: (user, business) => {
    if (!user) return set({ user: null, business: null, isAuthenticated: false, isLoading: false });
    const savedBusiness = (get().businesses ?? {})[user.id] ?? (get().user?.id === user.id ? get().business : null);
    const nextBusiness = business === undefined ? savedBusiness : business;
    set((state) => ({
      user,
      business: nextBusiness,
      businesses: nextBusiness ? { ...(state.businesses ?? {}), [user.id]: nextBusiness } : (state.businesses ?? {}),
      isAuthenticated: true,
      isLoading: false,
    }));
  },
  updateBusiness: (business) => set((state) => ({
    business,
    businesses: state.user ? { ...(state.businesses ?? {}), [state.user.id]: business } : (state.businesses ?? {}),
  })),
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
  partialize: ({ user, business, businesses, isAuthenticated }) => ({ user, business, businesses, isAuthenticated }),
  onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
}));
