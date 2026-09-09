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

async function findMembershipOwner(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('workspace_memberships')
    .select('owner_user_id')
    .eq('member_user_id', userId)
    .eq('status', 'ACTIVE')
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') return null;
    throw error;
  }
  return data?.owner_user_id ?? null;
}

export const businessSyncService = {
  async load(userId: string): Promise<WorkspaceRow | null> {
    const { data: ownWorkspace, error: ownError } = await supabase.from(TABLE).select('user_id,business,data,updated_at').eq('user_id', userId).maybeSingle();
    if (ownError) throw ownError;
    if (ownWorkspace) {
      const workspace = normalizeWorkspace(ownWorkspace.data as Partial<WorkspaceData>);
      return { ...ownWorkspace, data: workspace } as WorkspaceRow;
    }

    const ownerUserId = await findMembershipOwner(userId);
    if (!ownerUserId) return null;
    const { data, error } = await supabase.from(TABLE).select('user_id,business,data,updated_at').eq('user_id', ownerUserId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const workspace = normalizeWorkspace(data.data as Partial<WorkspaceData>);
    return { ...data, data: workspace } as WorkspaceRow;
  },

  async save(userId: string, workspace: WorkspaceData, business: BusinessProfile | null): Promise<string> {
    const updatedAt = new Date().toISOString();
    const { data: ownWorkspace, error: ownError } = await supabase.from(TABLE).select('user_id').eq('user_id', userId).maybeSingle();
    if (ownError) throw ownError;
    const ownerUserId = ownWorkspace ? userId : await findMembershipOwner(userId);
    const targetUserId = ownerUserId ?? userId;
    const payload = {
      user_id: targetUserId,
      business: business ?? {},
      data: normalizeWorkspace(workspace),
      updated_at: updatedAt,
    };
    const request = ownerUserId
      ? supabase.from(TABLE).update(payload).eq('user_id', targetUserId)
      : supabase.from(TABLE).upsert(payload, { onConflict: 'user_id' });
    const { data, error } = await request.select('updated_at').single();
    if (error) throw error;
    if (!data?.updated_at) throw new Error('Supabase did not confirm the workspace save.');
    return data.updated_at;
  },
};
