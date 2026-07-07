import { Platform } from 'react-native';
import { supabase } from './supabase';
import { storageService } from './storage';

const PUSH_TOKEN_KEY = 'ease_push_token';

export const notificationsService = {
  /**
   * Requests device permission for notifications and retrieves the push token.
   * Compiles with React Native APIs, ready for expo-notifications.
   */
  registerForPushNotifications: async (userId?: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      // Simulation of permission requesting
      console.log('Requesting notification permissions...');
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Mock Expo Push Token
      const mockPushToken = `ExponentPushToken[mock-token-${Math.random().toString(36).substring(2)}]`;
      
      // Cache token locally
      storageService.setString(PUSH_TOKEN_KEY, mockPushToken);
      
      // Save token to Supabase user profile for notifications targeting
      if (userId) {
        await notificationsService.saveTokenToProfile(userId, mockPushToken);
      }
      
      return mockPushToken;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  },

  /**
   * Saves the push token to the Supabase user profile table.
   */
  saveTokenToProfile: async (userId: string, token: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ push_token: token, updated_at: new Date().toISOString() })
        .eq('id', userId);
        
      if (error) {
        console.warn('Failed to update push token in user profile:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error saving push token to Supabase:', e);
      return false;
    }
  },

  /**
   * Retrieves the cached push token.
   */
  getCachedToken: (): string | null => {
    return storageService.getString(PUSH_TOKEN_KEY) ?? null;
  },
};

export default notificationsService;
