import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { normalizeWorkspace, useBusinessStore } from '@/store/businessStore';
import { useSyncStore } from '@/store/syncStore';
import { businessSyncService } from '@/services/businessSync';

export function useBusinessSync() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const business = useAuthStore((state) => state.business);
  const updateBusiness = useAuthStore((state) => state.updateBusiness);
  const hydrated = useBusinessStore((state) => state.hasHydrated);
  const initializedUser = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId || !hydrated) return;
    let active = true;
    initializedUser.current = null;
    useSyncStore.getState().setSyncState({ status: 'loading', error: null });

    businessSyncService.load(userId).then(async (remote) => {
      if (!active) return;
      const state = useBusinessStore.getState();
      const localIsDirty = state.dirtyUsers[userId];
      if (remote && !localIsDirty) {
        useBusinessStore.getState().replaceWorkspace(userId, normalizeWorkspace(remote.data));
        if (remote.business?.id) updateBusiness(remote.business);
        useSyncStore.getState().setSyncState({ status: 'synced', lastSyncedAt: remote.updated_at, error: null });
      } else {
        const local = state.workspaces[userId] ?? normalizeWorkspace();
        const updatedAt = await businessSyncService.save(userId, local, useAuthStore.getState().business);
        if (active) {
          useBusinessStore.getState().markSynced(userId);
          useSyncStore.getState().setSyncState({ status: 'synced', lastSyncedAt: updatedAt, error: null });
        }
      }
      initializedUser.current = userId;
    }).catch((error) => {
      if (!active) return;
      const message = error instanceof Error ? error.message : 'Could not sync with Supabase.';
      useSyncStore.getState().setSyncState({ status: 'offline', error: message });
      initializedUser.current = userId;
    });

    return () => { active = false; if (timer.current) clearTimeout(timer.current); };
  }, [userId, hydrated, updateBusiness]);

  useEffect(() => {
    if (!userId || !hydrated) return;
    return useBusinessStore.subscribe((state, previous) => {
      const currentWorkspace = state.workspaces[userId];
      if (initializedUser.current !== userId || currentWorkspace === previous.workspaces[userId]) return;
      if (timer.current) clearTimeout(timer.current);
      useSyncStore.getState().setSyncState({ status: 'saving', error: null });
      timer.current = setTimeout(() => {
        businessSyncService.save(userId, normalizeWorkspace(currentWorkspace), useAuthStore.getState().business)
          .then((updatedAt) => {
            useBusinessStore.getState().markSynced(userId);
            useSyncStore.getState().setSyncState({ status: 'synced', lastSyncedAt: updatedAt, error: null });
          })
          .catch((error) => useSyncStore.getState().setSyncState({ status: 'offline', error: error instanceof Error ? error.message : 'Changes are saved offline.' }));
      }, 700);
    });
  }, [userId, hydrated]);

  useEffect(() => {
    if (!userId || initializedUser.current !== userId) return;
    const workspace = useBusinessStore.getState().workspaces[userId];
    if (!workspace) return;
    useSyncStore.getState().setSyncState({ status: 'saving', error: null });
    businessSyncService.save(userId, workspace, business)
      .then((updatedAt) => useSyncStore.getState().setSyncState({ status: 'synced', lastSyncedAt: updatedAt, error: null }))
      .catch((error) => useSyncStore.getState().setSyncState({ status: 'offline', error: error instanceof Error ? error.message : 'Business profile is saved offline.' }));
  }, [business, userId]);
}
