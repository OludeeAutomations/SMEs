import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BusinessProfile } from '@/store/authStore';
import { normalizeWorkspace, type WorkspaceData } from '@/store/businessStore';

const OUTBOX_PREFIX = 'rekoda-workspace-outbox-v1';
const LEGACY_WORKSPACE_KEY = 'ease-business-data-v2';

export interface WorkspaceOutboxEntry {
  userId: string;
  workspace: WorkspaceData;
  business: BusinessProfile | null;
  queuedAt: string;
  mergeWithCloud?: boolean;
}

interface LegacyPersistedState {
  state?: {
    workspaces?: Record<string, Partial<WorkspaceData>>;
    dirtyUsers?: Record<string, boolean>;
  };
}

const outboxKey = (userId: string) => `${OUTBOX_PREFIX}:${userId}`;

const parseJson = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const workspaceOutbox = {
  async load(userId: string): Promise<WorkspaceOutboxEntry | null> {
    const entry = parseJson<WorkspaceOutboxEntry>(await AsyncStorage.getItem(outboxKey(userId)));
    if (!entry || entry.userId !== userId) return null;
    return { ...entry, workspace: normalizeWorkspace(entry.workspace) };
  },

  async save(
    userId: string,
    workspace: WorkspaceData,
    business: BusinessProfile | null,
    mergeWithCloud = false,
  ): Promise<void> {
    const entry: WorkspaceOutboxEntry = {
      userId,
      workspace: normalizeWorkspace(workspace),
      business,
      queuedAt: new Date().toISOString(),
      mergeWithCloud,
    };
    await AsyncStorage.setItem(outboxKey(userId), JSON.stringify(entry));
  },

  async clear(userId: string): Promise<void> {
    await AsyncStorage.removeItem(outboxKey(userId));
  },

  async loadLegacy(userId: string): Promise<{ workspace: WorkspaceData; dirty: boolean } | null> {
    const legacy = parseJson<LegacyPersistedState>(await AsyncStorage.getItem(LEGACY_WORKSPACE_KEY));
    const workspace = legacy?.state?.workspaces?.[userId];
    if (!workspace) return null;
    return {
      workspace: normalizeWorkspace(workspace),
      dirty: Boolean(legacy?.state?.dirtyUsers?.[userId]),
    };
  },

  async clearLegacy(userId: string): Promise<void> {
    const raw = await AsyncStorage.getItem(LEGACY_WORKSPACE_KEY);
    const legacy = parseJson<LegacyPersistedState>(raw);
    if (!legacy?.state?.workspaces?.[userId]) return;

    delete legacy.state.workspaces[userId];
    if (legacy.state.dirtyUsers) delete legacy.state.dirtyUsers[userId];

    if (Object.keys(legacy.state.workspaces).length === 0) {
      await AsyncStorage.removeItem(LEGACY_WORKSPACE_KEY);
      return;
    }
    await AsyncStorage.setItem(LEGACY_WORKSPACE_KEY, JSON.stringify(legacy));
  },
};
