import type { BusinessProfile } from '@/store/authStore';
import { normalizeWorkspace, type WorkspaceData } from '@/store/businessStore';
import { supabase } from './supabase';

const TABLE = 'business_workspaces';

interface WorkspaceRow {
  user_id: string;
  business: BusinessProfile | null;
  data: Partial<WorkspaceData> | null;
  updated_at: string;
}

export const businessSyncService = {
  async load(userId: string): Promise<WorkspaceRow | null> {
    const { data, error } = await supabase.from(TABLE).select('user_id,business,data,updated_at').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { ...data, data: normalizeWorkspace(data.data as Partial<WorkspaceData>) } as WorkspaceRow;
  },

  async save(userId: string, workspace: WorkspaceData, business: BusinessProfile | null): Promise<string> {
    const updatedAt = new Date().toISOString();
    const { error } = await supabase.from(TABLE).upsert({
      user_id: userId,
      business: business ?? {},
      data: normalizeWorkspace(workspace),
      updated_at: updatedAt,
    }, { onConflict: 'user_id' });
    if (error) throw error;
    return updatedAt;
  },
};
