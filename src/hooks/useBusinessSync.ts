import { useEffect, useRef } from 'react';
import { useAuthStore, type BusinessProfile } from '@/store/authStore';
import { emptyWorkspace, normalizeWorkspace, useBusinessStore, type WorkspaceData } from '@/store/businessStore';
import { useSyncStore } from '@/store/syncStore';
import { businessSyncService } from '@/services/businessSync';
import { workspaceOutbox } from '@/services/workspaceOutbox';

interface PendingSave {
  workspace: WorkspaceData;
  business: BusinessProfile | null;
}

const RETRY_DELAY_MS = 10_000;
const offlineMessage = 'Your changes are safe on this device and will sync automatically.';

const mergeRows = <T extends { id: string }>(cloudRows: T[], localRows: T[]): T[] => {
  const localIds = new Set(localRows.map((row) => row.id));
  return [...localRows, ...cloudRows.filter((row) => !localIds.has(row.id))];
};

const mergeWorkspaces = (cloud: WorkspaceData, local: WorkspaceData): WorkspaceData => ({
  products: mergeRows(cloud.products, local.products),
  customers: mergeRows(cloud.customers, local.customers),
  sales: mergeRows(cloud.sales, local.sales),
  invoices: mergeRows(cloud.invoices, local.invoices),
  expenses: mergeRows(cloud.expenses, local.expenses),
  suppliers: mergeRows(cloud.suppliers, local.suppliers),
  projects: mergeRows(cloud.projects, local.projects),
  expenseCategories: Array.from(new Set([...cloud.expenseCategories, ...local.expenseCategories])),
  inventoryCategories: Array.from(new Set([...cloud.inventoryCategories, ...local.inventoryCategories])),
  automations: { ...cloud.automations, ...local.automations },
  teamMembers: mergeRows(cloud.teamMembers, local.teamMembers),
  preferences: { ...cloud.preferences, ...local.preferences },
  inventoryMovements: mergeRows(cloud.inventoryMovements, local.inventoryMovements),
  aiConversations: mergeRows(cloud.aiConversations, local.aiConversations),
  aiMessages: mergeRows(cloud.aiMessages, local.aiMessages),
});

const hasWorkspaceContent = (workspace: WorkspaceData) =>
  workspace.products.length > 0 || workspace.customers.length > 0 || workspace.sales.length > 0 ||
  workspace.invoices.length > 0 || workspace.expenses.length > 0 || workspace.suppliers.length > 0 ||
  workspace.projects.length > 0 || workspace.expenseCategories.length > 0 ||
  workspace.inventoryCategories.length > 0 || workspace.teamMembers.length > 0 ||
  workspace.inventoryMovements.length > 0 || workspace.aiConversations.length > 0 ||
  workspace.aiMessages.length > 0 || Object.keys(workspace.automations).length > 0 ||
  Object.keys(workspace.preferences).length > 0;

export function useBusinessSync() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const business = useAuthStore((state) => state.business);
  const updateBusiness = useAuthStore((state) => state.updateBusiness);
  const hydrated = useBusinessStore((state) => state.hasHydrated);
  const initializedUser = useRef<string | null>(null);
  const enqueueSave = useRef<((workspace: WorkspaceData, business: BusinessProfile | null) => void) | null>(null);

  useEffect(() => {
    if (!userId || !hydrated) return;

    let active = true;
    let ready = false;
    let initializing = false;
    let saving = false;
    let applyingCloudState = false;
    let pendingBeforeBaseline: WorkspaceData | null = null;
    let recoveryWorkspace: WorkspaceData | null = null;
    let pending: PendingSave | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const setOffline = (error: unknown) => {
      console.warn('Workspace cloud sync failed:', error);
      useSyncStore.getState().setSyncState({ status: 'offline', error: offlineMessage });
    };

    const scheduleRetry = () => {
      if (!active || retryTimer) return;
      retryTimer = setTimeout(async () => {
        retryTimer = null;
        if (!active) return;
        if (!ready) {
          void initialize();
          return;
        }
        try {
          const queued = await workspaceOutbox.load(userId);
          if (queued) {
            pending = { workspace: queued.workspace, business: queued.business };
            void flush();
          }
        } catch (error) {
          setOffline(error);
          scheduleRetry();
        }
      }, RETRY_DELAY_MS);
    };

    const flush = async () => {
      if (!active || saving || !pending) return;
      saving = true;

      while (active && pending) {
        const snapshot = pending;
        pending = null;
        useSyncStore.getState().setSyncState({ status: 'saving', error: null });

        try {
          const updatedAt = await businessSyncService.save(userId, snapshot.workspace, snapshot.business);
          await workspaceOutbox.clear(userId);
          if (!pending) {
            useBusinessStore.getState().markSynced(userId);
            useSyncStore.getState().setSyncState({ status: 'synced', lastSyncedAt: updatedAt, error: null });
          }
        } catch (error) {
          const latest = pending ?? snapshot;
          pending = null;
          try {
            await workspaceOutbox.save(userId, latest.workspace, latest.business);
          } catch (storageError) {
            console.warn('Could not queue the failed cloud save:', storageError);
          }
          setOffline(error);
          scheduleRetry();
          break;
        }
      }

      saving = false;
      if (active && pending) void flush();
    };

    const enqueue = (workspace: WorkspaceData, nextBusiness: BusinessProfile | null) => {
      pending = { workspace: normalizeWorkspace(workspace), business: nextBusiness };
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      void flush();
    };
    enqueueSave.current = (workspace, nextBusiness) => {
      if (ready) enqueue(workspace, nextBusiness);
    };

    const replaceFromCloud = (workspace: WorkspaceData) => {
      applyingCloudState = true;
      useBusinessStore.getState().replaceWorkspace(userId, workspace);
      applyingCloudState = false;
    };

    const initialize = async () => {
      if (!active || initializing) return;
      initializing = true;
      useSyncStore.getState().setSyncState({ status: 'loading', error: null });
      let legacy: Awaited<ReturnType<typeof workspaceOutbox.loadLegacy>> = null;

      try {
        legacy = await workspaceOutbox.loadLegacy(userId);
        const queued = await workspaceOutbox.load(userId);
        if (queued) {
          const remote = queued.mergeWithCloud ? await businessSyncService.load(userId) : null;
          const queuedWorkspace = remote
            ? mergeWorkspaces(normalizeWorkspace(remote.data), queued.workspace)
            : queued.workspace;
          const workspace = pendingBeforeBaseline
            ? mergeWorkspaces(queuedWorkspace, pendingBeforeBaseline)
            : queuedWorkspace;
          pendingBeforeBaseline = null;
          recoveryWorkspace = workspace;
          replaceFromCloud(workspace);
          const queuedBusiness = queued.business ?? remote?.business ?? useAuthStore.getState().business;
          if (queuedBusiness?.id) updateBusiness(queuedBusiness);
          const updatedAt = await businessSyncService.save(
            userId,
            workspace,
            queuedBusiness,
          );
          await Promise.all([workspaceOutbox.clear(userId), workspaceOutbox.clearLegacy(userId)]);
          recoveryWorkspace = null;
          useSyncStore.getState().setSyncState({ status: 'synced', lastSyncedAt: updatedAt, error: null });
          ready = true;
          return;
        }

        const remote = await businessSyncService.load(userId);
        if (legacy && (legacy.dirty || !remote)) {
          const currentBusiness = useAuthStore.getState().business;
          const workspace = pendingBeforeBaseline
            ? mergeWorkspaces(legacy.workspace, pendingBeforeBaseline)
            : legacy.workspace;
          pendingBeforeBaseline = null;
          recoveryWorkspace = workspace;
          replaceFromCloud(workspace);
          const updatedAt = await businessSyncService.save(userId, workspace, currentBusiness);
          await Promise.all([workspaceOutbox.clear(userId), workspaceOutbox.clearLegacy(userId)]);
          recoveryWorkspace = null;
          useSyncStore.getState().setSyncState({ status: 'synced', lastSyncedAt: updatedAt, error: null });
          ready = true;
          return;
        }

        if (remote) {
          const remoteWorkspace = normalizeWorkspace(remote.data);
          const workspace = pendingBeforeBaseline
            ? mergeWorkspaces(remoteWorkspace, pendingBeforeBaseline)
            : remoteWorkspace;
          const hadPendingChanges = pendingBeforeBaseline !== null;
          pendingBeforeBaseline = null;
          recoveryWorkspace = hadPendingChanges ? workspace : null;
          replaceFromCloud(workspace);
          if (remote.business?.id) updateBusiness(remote.business);
          const updatedAt = hadPendingChanges
            ? await businessSyncService.save(userId, workspace, useAuthStore.getState().business)
            : remote.updated_at;
          await Promise.all([workspaceOutbox.clear(userId), workspaceOutbox.clearLegacy(userId)]);
          recoveryWorkspace = null;
          useSyncStore.getState().setSyncState({ status: 'synced', lastSyncedAt: updatedAt, error: null });
          ready = true;
          return;
        }

        const workspace = pendingBeforeBaseline ?? emptyWorkspace();
        pendingBeforeBaseline = null;
        const currentBusiness = useAuthStore.getState().business;
        recoveryWorkspace = workspace;
        replaceFromCloud(workspace);
        const updatedAt = await businessSyncService.save(userId, workspace, currentBusiness);
        await workspaceOutbox.clear(userId);
        recoveryWorkspace = null;
        useSyncStore.getState().setSyncState({ status: 'synced', lastSyncedAt: updatedAt, error: null });
        ready = true;
      } catch (error) {
        const fallback = recoveryWorkspace ?? legacy?.workspace;
        if (fallback) {
          const workspace = pendingBeforeBaseline
            ? mergeWorkspaces(fallback, pendingBeforeBaseline)
            : fallback;
          pendingBeforeBaseline = null;
          replaceFromCloud(workspace);
          try {
            await workspaceOutbox.save(userId, workspace, useAuthStore.getState().business);
          } catch (storageError) {
            console.warn('Could not preserve the offline workspace:', storageError);
          }
          pending = { workspace, business: useAuthStore.getState().business };
          ready = true;
        }
        setOffline(error);
        scheduleRetry();
      } finally {
        initializing = false;
        if (active) {
          initializedUser.current = ready ? userId : null;
        }
      }
    };

    const unsubscribe = useBusinessStore.subscribe((state, previous) => {
      const currentWorkspace = state.workspaces[userId];
      if (!currentWorkspace || currentWorkspace === previous.workspaces[userId] || applyingCloudState) return;
      if (!ready) {
        if (!hasWorkspaceContent(currentWorkspace)) return;
        pendingBeforeBaseline = normalizeWorkspace(currentWorkspace);
        void workspaceOutbox.save(
          userId,
          pendingBeforeBaseline,
          useAuthStore.getState().business,
          true,
        );
        return;
      }
      enqueue(currentWorkspace, useAuthStore.getState().business);
    });

    void initialize();

    return () => {
      active = false;
      ready = false;
      initializedUser.current = null;
      enqueueSave.current = null;
      unsubscribe();
      if (retryTimer) clearTimeout(retryTimer);
      if (pending) {
        void workspaceOutbox.save(userId, pending.workspace, pending.business);
      } else if (pendingBeforeBaseline) {
        void workspaceOutbox.save(
          userId,
          pendingBeforeBaseline,
          useAuthStore.getState().business,
          true,
        );
      }
    };
  }, [userId, hydrated, updateBusiness]);

  useEffect(() => {
    if (!userId || initializedUser.current !== userId) return;
    const workspace = useBusinessStore.getState().workspaces[userId];
    if (workspace) enqueueSave.current?.(workspace, business);
  }, [business, userId]);
}
