import { create } from 'zustand';

export type SyncStatus = 'idle' | 'loading' | 'synced' | 'saving' | 'offline' | 'error';
interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  error: string | null;
  setSyncState: (state: Partial<Omit<SyncState, 'setSyncState'>>) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle', lastSyncedAt: null, error: null,
  setSyncState: (state) => set(state),
}));
