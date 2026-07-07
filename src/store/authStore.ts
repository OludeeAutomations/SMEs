import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { storageService } from '../services/storage';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  country: string;
  currency: string;
  branchName: string;
}

interface AuthState {
  user: UserProfile | null;
  business: BusinessProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setSession: (user: UserProfile | null, business: BusinessProfile | null) => void;
  updateBusiness: (business: BusinessProfile) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

const USER_SESSION_KEY = 'ease_user_session';
const BUSINESS_PROFILE_KEY = 'ease_business_profile';

export const useAuthStore = create<AuthState>((set) => {
  // Load initial cached state from MMKV
  const cachedUser = storageService.getObject<UserProfile>(USER_SESSION_KEY);
  const cachedBusiness = storageService.getObject<BusinessProfile>(BUSINESS_PROFILE_KEY);

  return {
    user: cachedUser,
    business: cachedBusiness,
    isAuthenticated: !!cachedUser,
    isLoading: false,

    setSession: (user, business) => {
      if (user) {
        storageService.setObject(USER_SESSION_KEY, user);
        if (business) storageService.setObject(BUSINESS_PROFILE_KEY, business);
        set({ user, business, isAuthenticated: true, isLoading: false });
      } else {
        storageService.delete(USER_SESSION_KEY);
        storageService.delete(BUSINESS_PROFILE_KEY);
        set({ user: null, business: null, isAuthenticated: false, isLoading: false });
      }
    },

    updateBusiness: (business) => {
      storageService.setObject(BUSINESS_PROFILE_KEY, business);
      set({ business });
    },

    setLoading: (loading) => set({ isLoading: loading }),

    logout: async () => {
      set({ isLoading: true });
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout warning:', e);
      } finally {
        storageService.delete(USER_SESSION_KEY);
        storageService.delete(BUSINESS_PROFILE_KEY);
        set({ user: null, business: null, isAuthenticated: false, isLoading: false });
      }
    },
  };
});
