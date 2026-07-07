import { useEffect, useState } from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { supabase } from '../services/supabase';

export const useOffline = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const { queue, removeFromQueue } = useOfflineStore();

  useEffect(() => {
    // In production, we subscribe to @react-native-community/netinfo.
    // Here we configure a mock network checker that defaults to online.
    const simulateCheck = () => {
      // Simulate simple online check
      setIsConnected(true);
    };

    const interval = setInterval(simulateCheck, 10000);
    simulateCheck();

    return () => clearInterval(interval);
  }, []);

  const syncQueue = async (): Promise<void> => {
    if (!isConnected || queue.length === 0) return;

    console.log(`Attempting to sync ${queue.length} offline actions to Supabase...`);

    for (const action of queue) {
      try {
        let success = true;
        let table = '';
        
        switch (action.type) {
          case 'RECORD_SALE':
            table = 'sales';
            break;
          case 'CREATE_EXPENSE':
            table = 'expenses';
            break;
          case 'ADD_CUSTOMER':
            table = 'customers';
            break;
          case 'CREATE_INVOICE':
            table = 'invoices';
            break;
        }

        if (table) {
          // Push payload to Supabase database
          const { error } = await supabase.from(table).insert({
            ...action.payload,
            synced_at: new Date().toISOString(),
          });

          if (error) {
            console.error(`Sync error on table ${table}:`, error.message);
            success = false;
          }
        }

        if (success) {
          removeFromQueue(action.id);
        }
      } catch (err) {
        console.error(`Error syncing offline action ${action.id}:`, err);
      }
    }
  };

  // Run automatically when we go online
  useEffect(() => {
    if (isConnected && queue.length > 0) {
      syncQueue();
    }
  }, [isConnected, queue.length]);

  return {
    isConnected,
    queueLength: queue.length,
    syncQueue,
  };
};

export default useOffline;
