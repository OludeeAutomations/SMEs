import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';

export default function ProjectsScreen() {
  const workspace = useWorkspace();
  const addProject = useBusinessStore((state) => state.addProject);
  const updateProject = useBusinessStore((state) => state.updateProject);
  const toggleProject = useBusinessStore((state) => state.toggleProject);
  const deleteProject = useBusinessStore((state) => state.deleteProject);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const save = () => { if (!title.trim()) return; addProject(title.trim()); setTitle(''); };
  const remove = (id: string) => Alert.alert('Delete task?', 'This task will be removed.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteProject(id) }]);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
    <ScreenHeader title="Projects and tasks" />
    <SurfaceCard className="gap-3"><Input label="New task" placeholder="What needs to be done?" value={title} onChangeText={setTitle} /><Button title="Add task" onPress={save} /></SurfaceCard>
    {workspace.projects.length ? <SurfaceCard className="py-0">{workspace.projects.map((project, index) => <React.Fragment key={project.id}>
      <View className="py-1">
        {editingId === project.id ? <View className="gap-2 py-2"><Input label="Task title" value={editingTitle} onChangeText={setEditingTitle} /><Button title="Save title" onPress={() => { if (editingTitle.trim()) updateProject(project.id, editingTitle.trim()); setEditingId(null); }} /></View> : <DataRow title={project.completed ? `✓ ${project.title}` : project.title} subtitle={project.completed ? 'Completed · tap to reopen' : 'Tap to complete'} onPress={() => toggleProject(project.id)} />}
        <View className="flex-row gap-2"><Button title="Rename" variant="secondary" onPress={() => { setEditingId(project.id); setEditingTitle(project.title); }} className="flex-1" /><Button title="Delete" variant="secondary" onPress={() => remove(project.id)} className="flex-1" /></View>
      </View>
      {index < workspace.projects.length - 1 ? <Divider /> : null}
    </React.Fragment>)}</SurfaceCard> : <EmptyState title="No tasks" message="Add a task to start planning work." />}
  </ScrollView></SafeAreaView>;
}
