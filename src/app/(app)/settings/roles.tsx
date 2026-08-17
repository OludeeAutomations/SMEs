import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ChoiceChips, DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';

export default function RolesScreen() {
  const workspace = useWorkspace();
  const addTeamMember = useBusinessStore((state) => state.addTeamMember);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Cashier');

  const save = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      Alert.alert('Check details', 'Enter the team member’s name and a valid email address.');
      return;
    }
    if (workspace.teamMembers.some((member) => member.email.toLowerCase() === cleanEmail)) {
      Alert.alert('Already added', 'A team member with this email already exists.');
      return;
    }
    addTeamMember(name.trim(), cleanEmail, role);
    setName('');
    setEmail('');
    Alert.alert('Team member added', 'The team list has been updated.');
  };

  const members = workspace.teamMembers ?? [];
  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Team and roles" subtitle="Add people who work in this business." showBack />
      <SurfaceCard className="gap-3">
        <Input label="Name" value={name} onChangeText={setName} placeholder="Team member" />
        <Input label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="name@business.com" />
        <ChoiceChips options={['Manager', 'Cashier', 'Storekeeper']} value={role} onChange={setRole} />
        <Button title="Add team member" onPress={save} />
      </SurfaceCard>
      {members.length ? <SurfaceCard className="py-0">
        {members.map((member, index) => <React.Fragment key={member.id}>
          <DataRow title={member.name} subtitle={member.email} value={member.role} />
          {index < members.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No team members" message="Only the workspace owner currently has access." />}
    </ScrollView>
  </SafeAreaView>;
}
