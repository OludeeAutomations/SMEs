// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inviteUrl = 'https://www.rekodaapp.com/auth/team-invite';
const emailLogoUrl = 'https://www.rekodaapp.com/rekoda-email-logo-v2.png';
const allowedRoles = new Set(['Manager', 'Cashier', 'Storekeeper']);

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, 'Content-Type': 'application/json' },
});

const cleanEmail = (value: unknown) => String(value ?? '').trim().toLowerCase();

const escapeHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
};

const invitationEmail = ({ name, businessName, role, inviteLink }: {
  name: string;
  businessName: string;
  role: string;
  inviteLink: string;
}) => {
  const safeName = escapeHtml(name);
  const safeBusinessName = escapeHtml(businessName);
  const safeRole = escapeHtml(role);
  const safeInviteLink = escapeHtml(inviteLink);

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;">${safeBusinessName} invited you to join their team on Rekoda.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dce3ee;border-radius:12px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:28px 32px 16px;">
                <img src="cid:rekoda-logo.png" width="140" alt="Rekoda" style="display:block;width:140px;max-width:100%;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 36px;">
                <h1 style="margin:0 0 16px;font-size:26px;line-height:34px;text-align:center;color:#0b1f5e;">Join ${safeBusinessName}</h1>
                <p style="margin:0 0 12px;text-align:center;font-size:15px;line-height:24px;color:#475569;">Hello ${safeName}, you have been invited to join ${safeBusinessName} on Rekoda as ${safeRole}.</p>
                <p style="margin:0 0 16px;text-align:center;font-size:15px;line-height:24px;color:#475569;">Create your password to accept the invitation and access the workspace securely.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="padding:12px 0 24px;">
                      <a data-mt-no-track href="${safeInviteLink}" style="display:inline-block;background:#0b1f5e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:14px 28px;border-radius:6px;">Join ${safeBusinessName}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;text-align:center;font-size:13px;line-height:20px;color:#64748b;">This secure invitation link can only be used once and expires automatically.</p>
                <p style="margin:18px 0 6px;font-size:13px;line-height:20px;color:#64748b;">If the button does not open, copy and paste this address into your browser:</p>
                <p style="margin:0;word-break:break-all;font-size:12px;line-height:19px;"><a data-mt-no-track href="${safeInviteLink}" style="color:#2563eb;text-decoration:underline;">${safeInviteLink}</a></p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e7ebf1;padding:20px 32px;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:18px;color:#64748b;">If you were not expecting this invitation, you can safely ignore this email.</p>
                <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">Rekoda &middot; Run your business with clarity</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

async function sendInvitationEmail({ email, name, businessName, role, inviteLink }: {
  email: string;
  name: string;
  businessName: string;
  role: string;
  inviteLink: string;
}) {
  const token = Deno.env.get('MAILTRAP_API_TOKEN')?.trim();
  const fromEmail = Deno.env.get('MAILTRAP_FROM_EMAIL')?.trim();
  const fromName = Deno.env.get('MAILTRAP_FROM_NAME')?.trim() || 'Rekoda';
  if (!token || !fromEmail) throw new Error('Mailtrap invitation email secrets are not configured.');

  const logoResponse = await fetch(emailLogoUrl);
  if (!logoResponse.ok) throw new Error('The Rekoda email logo could not be loaded.');
  const logo = bytesToBase64(new Uint8Array(await logoResponse.arrayBuffer()));
  const cleanBusinessName = businessName.replace(/[\r\n]+/g, ' ').trim() || 'A Rekoda business';
  const response = await fetch('https://send.api.mailtrap.io/api/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email, name }],
      subject: `${cleanBusinessName} invited you to join their team on Rekoda`,
      html: invitationEmail({ name, businessName: cleanBusinessName, role, inviteLink }),
      text: `Hello ${name},\n\nYou have been invited to join ${cleanBusinessName} on Rekoda as ${role}.\n\nCreate your password and accept the invitation: ${inviteLink}\n\nThis secure link can only be used once.`,
      category: 'Team invitation',
      attachments: [{
        filename: 'rekoda-logo.png',
        content_id: 'rekoda-logo.png',
        disposition: 'inline',
        content: logo,
      }],
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.errors?.join?.(', ') || payload?.message || `Mailtrap rejected the invitation email (${response.status}).`);
  }
}

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

      const businessName = String(workspace.business?.name ?? 'A Rekoda business');
      const { data: inviteData, error: inviteError } = await admin.auth.admin.generateLink({
        type: 'invite',
        email,
        options: {
          redirectTo: inviteUrl,
          data: {
            full_name: name,
            team_invitation_id: invitationId,
            workspace_owner_id: user.id,
            business_name: businessName,
            role,
          },
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

      const hashedToken = inviteData.properties?.hashed_token;
      if (!hashedToken || !inviteData.user?.id) {
        workspaceData.teamMembers = currentMembers;
        await Promise.all([
          admin.from('business_workspaces').update({ data: workspaceData, updated_at: new Date().toISOString() }).eq('user_id', user.id),
          admin.from('workspace_memberships').delete().eq('id', invitationId),
        ]);
        if (inviteData.user?.id) await admin.auth.admin.deleteUser(inviteData.user.id);
        return json({ message: 'Supabase did not create a valid invitation link.' }, 500);
      }

      const { error: memberLinkError } = await admin
        .from('workspace_memberships')
        .update({ member_user_id: inviteData.user.id })
        .eq('id', invitationId);
      if (memberLinkError) {
        workspaceData.teamMembers = currentMembers;
        await Promise.all([
          admin.from('business_workspaces').update({ data: workspaceData, updated_at: new Date().toISOString() }).eq('user_id', user.id),
          admin.from('workspace_memberships').delete().eq('id', invitationId),
          admin.auth.admin.deleteUser(inviteData.user.id),
        ]);
        throw memberLinkError;
      }

      const secureInviteLink = `${inviteUrl}?token_hash=${encodeURIComponent(hashedToken)}&type=invite`;
      try {
        await sendInvitationEmail({ email, name, businessName, role, inviteLink: secureInviteLink });
      } catch (emailError) {
        workspaceData.teamMembers = currentMembers;
        await Promise.all([
          admin.from('business_workspaces').update({ data: workspaceData, updated_at: new Date().toISOString() }).eq('user_id', user.id),
          admin.from('workspace_memberships').delete().eq('id', invitationId),
          admin.auth.admin.deleteUser(inviteData.user.id),
        ]);
        return json({ message: emailError instanceof Error ? emailError.message : 'The invitation email could not be sent.' }, 502);
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
