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

async function syncTeamAndSuppliers(userId: string, workspace: WorkspaceData) {
  if (workspace.teamMembers.length) {
    const { error } = await supabase.from('business_members').upsert(
      workspace.teamMembers.map((member) => ({
        user_id: userId,
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        created_at: member.createdAt,
      })),
      { onConflict: 'user_id,id' },
    );
    if (error) throw error;
  }

  if (workspace.suppliers.length) {
    const { error } = await supabase.from('suppliers').upsert(
      workspace.suppliers.map((supplier) => ({
        user_id: userId,
        id: supplier.id,
        name: supplier.name,
        phone_number: supplier.phoneNumber,
        email_address: supplier.emailAddress ?? null,
        address: supplier.address ?? null,
        outstanding_balance: supplier.outstandingBalance,
        created_at: supplier.createdAt,
      })),
      { onConflict: 'user_id,id' },
    );
    if (error) throw error;
  }
}

export const businessSyncService = {
  async load(userId: string): Promise<WorkspaceRow | null> {
    const { data, error } = await supabase.from(TABLE).select('user_id,business,data,updated_at').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const workspace = normalizeWorkspace(data.data as Partial<WorkspaceData>);
    await syncTeamAndSuppliers(userId, workspace);
    return { ...data, data: workspace } as WorkspaceRow;
  },

  async save(userId: string, workspace: WorkspaceData, business: BusinessProfile | null): Promise<string> {
    const updatedAt = new Date().toISOString();
    const { data, error } = await supabase.from(TABLE).upsert({
      user_id: userId,
      business: business ?? {},
      data: normalizeWorkspace(workspace),
      updated_at: updatedAt,
    }, { onConflict: 'user_id' }).select('updated_at').single();
    if (error) throw error;
    if (!data?.updated_at) throw new Error('Supabase did not confirm the workspace save.');
    await syncTeamAndSuppliers(userId, workspace);
    return data.updated_at;
  },
};
