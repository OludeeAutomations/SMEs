import { create } from 'zustand';
import { storageService } from '../services/storage';

export interface OfflineAction {
  id: string;
  type: 'RECORD_SALE' | 'CREATE_EXPENSE' | 'ADD_CUSTOMER' | 'CREATE_INVOICE';
  payload: any;
  timestamp: string;
}

interface OfflineState {
  queue: OfflineAction[];
  addToQueue: (type: OfflineAction['type'], payload: any) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
}

const OFFLINE_QUEUE_KEY = 'ease_offline_queue';

export const useOfflineStore = create<OfflineState>((set) => {
  const cachedQueue = storageService.getObject<OfflineAction[]>(OFFLINE_QUEUE_KEY) || [];

  return {
    queue: cachedQueue,
    
    addToQueue: (type, payload) => set((state) => {
      const newAction: OfflineAction = {
        id: `offline_${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type,
        payload,
        timestamp: new Date().toISOString(),
      };
      
      const newQueue = [...state.queue, newAction];
      storageService.setObject(OFFLINE_QUEUE_KEY, newQueue);
      return { queue: newQueue };
    }),

    removeFromQueue: (id) => set((state) => {
      const newQueue = state.queue.filter((item) => item.id !== id);
      storageService.setObject(OFFLINE_QUEUE_KEY, newQueue);
      return { queue: newQueue };
    }),

    clearQueue: () => {
      storageService.delete(OFFLINE_QUEUE_KEY);
      set({ queue: [] });
    },
  };
});

export default useOfflineStore;
