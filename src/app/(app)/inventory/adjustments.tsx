import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useWorkspace } from '@/store/businessStore';
import { formatDate } from '@/utils/format';

export default function StockAdjustmentsScreen() {
  const movements = useWorkspace().inventoryMovements;
  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title="Stock movements" subtitle="Opening stock, manual adjustments, and completed sales." showBack />
      {movements.length ? <SurfaceCard className="py-0">
        {movements.map((movement, index) => <React.Fragment key={movement.id}>
          <DataRow title={movement.productName} subtitle={`${movement.type === 'OPENING' ? 'Opening stock' : movement.type === 'SALE' ? 'Sale' : 'Manual adjustment'} · ${formatDate(movement.createdAt)}`} value={`${movement.quantity > 0 ? '+' : ''}${movement.quantity}`} />
          {index < movements.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No stock movements" message="Add a product, adjust stock, or complete a sale to build this history." />}
    </ScrollView>
  </SafeAreaView>;
}
