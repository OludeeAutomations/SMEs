import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2 } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ChoiceChips, DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { inviteTeamMember, revokeTeamInvitation, type TeamRole } from '@/services/teamInvitations';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';

export default function RolesScreen() {
  const workspace = useWorkspace();
  const addTeamMember = useBusinessStore((state) => state.addTeamMember);
  const deleteTeamMember = useBusinessStore((state) => state.deleteTeamMember);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('Cashier');
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const save = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      Alert.alert('Check details', "Enter the team member's name and a valid email address.");
      return;
    }
    if (workspace.teamMembers.some((member) => member.email.toLowerCase() === cleanEmail)) {
      Alert.alert('Already added', 'A team member with this email already exists.');
      return;
    }

    try {
      setSaving(true);
      const member = await inviteTeamMember(name.trim(), cleanEmail, role);
      addTeamMember(member.name, member.email, member.role, member.id, member.status);
      setName('');
      setEmail('');
      Alert.alert('Invitation sent', `${member.name} will receive an email with a secure link for joining this workspace.`);
    } catch (error) {
      Alert.alert('Invitation failed', error instanceof Error ? error.message : 'Please try again shortly.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (memberId: string, memberName: string) => Alert.alert(
    'Remove team member?',
    `${memberName} will lose access to this workspace.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setRemovingId(memberId);
            await revokeTeamInvitation(memberId);
            deleteTeamMember(memberId);
          } catch (error) {
            Alert.alert('Could not remove team member', error instanceof Error ? error.message : 'Please try again shortly.');
          } finally {
            setRemovingId(null);
          }
        },
      },
    ],
  );

  const members = workspace.teamMembers ?? [];
  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-40 pt-5" keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Team and roles" subtitle="Invite people securely by email." showBack />
      <SurfaceCard className="gap-3">
        <Input label="Name" value={name} onChangeText={setName} placeholder="Team member" />
        <Input label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="name@business.com" />
        <ChoiceChips options={['Manager', 'Cashier', 'Storekeeper']} value={role} onChange={(value) => setRole(value as TeamRole)} />
        <Button title="Send invitation" onPress={save} isLoading={saving} />
      </SurfaceCard>
      {members.length ? <SurfaceCard className="py-0">
        {members.map((member, index) => <React.Fragment key={member.id}>
          <DataRow
            title={member.name}
            subtitle={`${member.email} · ${member.role} · ${member.status === 'PENDING' ? 'Invitation pending' : 'Active'}`}
            actions={[{ label: removingId === member.id ? 'Removing...' : 'Remove team member', icon: Trash2, destructive: true, onPress: () => remove(member.id, member.name) }]}
          />
          {index < members.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No team members" message="Only the workspace owner currently has access." />}
    </ScrollView>
  </SafeAreaView>;
}
