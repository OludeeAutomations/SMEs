import React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { formatDate, formatMoney } from '@/utils/format';

export default function DraftSalesScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const deleteDraft = useBusinessStore((state) => state.deleteSaleDraft);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');

  const remove = (id: string) => Alert.alert('Delete draft?', 'This unfinished sale will be removed.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => deleteDraft(id) },
  ]);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title="Draft sales" subtitle="Resume or remove unfinished sales." showBack />
      {workspace.saleDrafts.length ? <SurfaceCard className="py-0">
        {workspace.saleDrafts.map((draft, index) => <React.Fragment key={draft.id}>
          <View>
            <DataRow title={draft.item} subtitle={`${draft.quantity} item(s) · saved ${formatDate(draft.updatedAt)}`} value={formatMoney(draft.amount * draft.quantity, currency)} onPress={() => router.push(`/(app)/sales/record?draftId=${draft.id}` as never)} />
            <DataRow title="Delete draft" subtitle="Remove this unfinished sale" onPress={() => remove(draft.id)} />
          </View>
          {index < workspace.saleDrafts.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No drafts" message="Save an unfinished checkout and it will appear here." actionLabel="Start a sale" onAction={() => router.push('/(app)/sales/record')} />}
    </ScrollView>
  </SafeAreaView>;
}
