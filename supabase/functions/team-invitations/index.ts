// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inviteUrl = 'https://www.rekodaapp.com/auth/team-invite';
const allowedRoles = new Set(['Manager', 'Cashier', 'Storekeeper']);

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, 'Content-Type': 'application/json' },
});

const cleanEmail = (value: unknown) => String(value ?? '').trim().toLowerCase();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authorization = req.headers.get('Authorization') || '';
  const client = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
  const admin = createClient(url, serviceKey);

  try {
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return json({ message: 'Please sign in again.' }, 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? '');

    if (action === 'accept') {
      const invitationId = String(user.user_metadata?.team_invitation_id ?? '');
      const email = cleanEmail(user.email);
      if (!invitationId || !email) return json({ message: 'This account does not contain a valid team invitation.' }, 400);

      const { data: membership, error: membershipError } = await admin
        .from('workspace_memberships')
        .select('id,owner_user_id,email,name,role,status,expires_at')
        .eq('id', invitationId)
        .maybeSingle();
      if (membershipError) throw membershipError;
      if (!membership || cleanEmail(membership.email) !== email) return json({ message: 'This team invitation does not match your email address.' }, 403);
      if (membership.status === 'REVOKED') return json({ message: 'This team invitation has been withdrawn.' }, 410);
      if (membership.status !== 'ACTIVE' && new Date(membership.expires_at).getTime() < Date.now()) {
        return json({ message: 'This team invitation has expired. Ask the business owner to invite you again.' }, 410);
      }

      const acceptedAt = new Date().toISOString();
      const { error: acceptError } = await admin.from('workspace_memberships').update({
        member_user_id: user.id,
        status: 'ACTIVE',
        accepted_at: acceptedAt,
      }).eq('id', membership.id);
      if (acceptError) throw acceptError;

      const { data: workspace, error: workspaceError } = await admin
        .from('business_workspaces')
        .select('business,data')
        .eq('user_id', membership.owner_user_id)
        .single();
      if (workspaceError) throw workspaceError;
      const data = workspace.data ?? {};
      const teamMembers = Array.isArray(data.teamMembers) ? data.teamMembers : [];
      data.teamMembers = teamMembers.map((member: Record<string, unknown>) =>
        member.id === membership.id ? { ...member, status: 'ACTIVE', acceptedAt } : member
      );
      const { error: updateError } = await admin.from('business_workspaces').update({ data, updated_at: acceptedAt }).eq('user_id', membership.owner_user_id);
      if (updateError) throw updateError;

      return json({ accepted: true, businessName: workspace.business?.name ?? 'the business', role: membership.role });
    }

    const { data: workspace, error: workspaceError } = await admin
      .from('business_workspaces')
      .select('business,data')
      .eq('user_id', user.id)
      .maybeSingle();
    if (workspaceError) throw workspaceError;
    if (!workspace) return json({ message: 'Only the business owner can manage team invitations.' }, 403);

    if (action === 'invite') {
      const name = String(body.name ?? '').trim();
      const email = cleanEmail(body.email);
      const role = String(body.role ?? '');
      if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return json({ message: 'Enter the team member name and a valid email address.' }, 400);
      if (!allowedRoles.has(role)) return json({ message: 'Choose a valid team role.' }, 400);
      if (email === cleanEmail(user.email)) return json({ message: 'The workspace owner already has access.' }, 400);

      const { data: duplicate, error: duplicateError } = await admin
        .from('workspace_memberships')
        .select('id,status')
        .eq('owner_user_id', user.id)
        .ilike('email', email)
        .neq('status', 'REVOKED')
        .maybeSingle();
      if (duplicateError) throw duplicateError;
      if (duplicate) return json({ message: duplicate.status === 'ACTIVE' ? 'This person already has access.' : 'An invitation is already pending for this email.' }, 409);

      const invitationId = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const membership = {
        id: invitationId,
        owner_user_id: user.id,
        email,
        name,
        role,
        status: 'PENDING',
        created_at: createdAt,
      };
      const { error: insertError } = await admin.from('workspace_memberships').insert(membership);
      if (insertError) throw insertError;

      const workspaceData = workspace.data ?? {};
      const currentMembers = Array.isArray(workspaceData.teamMembers) ? workspaceData.teamMembers : [];
      workspaceData.teamMembers = [{ id: invitationId, name, email, role, status: 'PENDING', createdAt }, ...currentMembers];
      const { error: updateError } = await admin.from('business_workspaces').update({ data: workspaceData, updated_at: createdAt }).eq('user_id', user.id);
      if (updateError) {
        await admin.from('workspace_memberships').delete().eq('id', invitationId);
        throw updateError;
      }

      const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: inviteUrl,
        data: {
          full_name: name,
          team_invitation_id: invitationId,
          workspace_owner_id: user.id,
          business_name: workspace.business?.name ?? 'a Rekoda business',
          role,
        },
      });
      if (inviteError) {
        workspaceData.teamMembers = currentMembers;
        await Promise.all([
          admin.from('business_workspaces').update({ data: workspaceData, updated_at: new Date().toISOString() }).eq('user_id', user.id),
          admin.from('workspace_memberships').delete().eq('id', invitationId),
        ]);
        const existingAccount = /already|registered|exists/i.test(inviteError.message);
        return json({ message: existingAccount ? 'This email already has a Rekoda account. Existing-account team invitations are not supported yet.' : inviteError.message }, 400);
      }

      if (inviteData.user?.id) {
        await admin.from('workspace_memberships').update({ member_user_id: inviteData.user.id }).eq('id', invitationId);
      }
      return json({ member: { id: invitationId, name, email, role, status: 'PENDING', createdAt } });
    }

    if (action === 'revoke') {
      const memberId = String(body.memberId ?? '');
      if (!memberId) return json({ message: 'Choose a team member to remove.' }, 400);
      const data = workspace.data ?? {};
      const currentMembers = Array.isArray(data.teamMembers) ? data.teamMembers : [];
      const member = currentMembers.find((candidate: Record<string, unknown>) => candidate.id === memberId);
      const { data: membership, error: membershipError } = await admin
        .from('workspace_memberships')
        .select('id,member_user_id,status')
        .eq('owner_user_id', user.id)
        .eq('id', memberId)
        .maybeSingle();
      if (membershipError) throw membershipError;
      if (!member && !membership) return json({ removed: true });

      data.teamMembers = currentMembers.filter((member: Record<string, unknown>) => member.id !== memberId);
      const { error: updateError } = await admin.from('business_workspaces').update({ data, updated_at: new Date().toISOString() }).eq('user_id', user.id);
      if (updateError) throw updateError;

      if (membership) {
        const { error: removeError } = await admin
          .from('workspace_memberships')
          .delete()
          .eq('owner_user_id', user.id)
          .eq('id', memberId);
        if (removeError) throw removeError;

        if (membership.status === 'PENDING' && membership.member_user_id) {
          const { error: invitedUserError } = await admin.auth.admin.deleteUser(membership.member_user_id);
          if (invitedUserError) console.warn('Could not remove the pending invited auth user:', invitedUserError.message);
        }
      }
      return json({ removed: true });
    }

    return json({ message: 'Unknown team invitation action.' }, 400);
  } catch (error) {
    console.error(error);
    return json({ message: error instanceof Error ? error.message : 'The team invitation service failed.' }, 500);
  }
});
