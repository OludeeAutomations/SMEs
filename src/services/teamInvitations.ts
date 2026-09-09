import { supabase } from './supabase';

export type TeamRole = 'Manager' | 'Cashier' | 'Storekeeper';

export interface InvitedTeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: 'PENDING' | 'ACTIVE';
  createdAt: string;
}

type TeamInvitationResponse = {
  member?: InvitedTeamMember;
  accepted?: boolean;
  removed?: boolean;
  businessName?: string;
  role?: TeamRole;
  message?: string;
};

async function invokeTeamInvitations(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke<TeamInvitationResponse>('team-invitations', { body });
  if (error) {
    let message = error.message || 'The team invitation service could not be reached.';
    const response = (error as { context?: Response }).context;
    if (response) {
      try {
        const payload = await response.json() as { message?: string };
        if (payload.message) message = payload.message;
      } catch {
        // Keep the SDK error when the function did not return JSON.
      }
    }
    throw new Error(message);
  }
  return data ?? {};
}

export async function inviteTeamMember(name: string, email: string, role: TeamRole) {
  const data = await invokeTeamInvitations({ action: 'invite', name, email, role });
  if (!data.member) throw new Error(data.message || 'The invitation was not created.');
  return data.member;
}

export async function revokeTeamInvitation(memberId: string) {
  const data = await invokeTeamInvitations({ action: 'revoke', memberId });
  if (!data.removed) throw new Error(data.message || 'The team member was not removed.');
}

export async function acceptTeamInvitation() {
  const data = await invokeTeamInvitations({ action: 'accept' });
  if (!data.accepted) throw new Error(data.message || 'The team invitation was not accepted.');
  return { businessName: data.businessName ?? 'the business', role: data.role };
}
