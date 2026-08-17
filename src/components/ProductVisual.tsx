import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import {
  Apple,
  Armchair,
  Baby,
  BookOpen,
  Car,
  Package,
  Pill,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

type ProductVisualProps = {
  imageUrl?: string;
  name: string;
  category: string;
  iconSize?: number;
};

type CategoryVisual = {
  Icon: LucideIcon;
  color: string;
  tint: string;
};

const visuals: { terms: string[]; visual: CategoryVisual }[] = [
  { terms: ['food', 'grocery', 'groceries', 'oil', 'rice', 'drink', 'beverage', 'bakery', 'restaurant'], visual: { Icon: ShoppingBasket, color: '#D97706', tint: '#FFF7ED' } },
  { terms: ['fruit', 'vegetable', 'produce', 'farm'], visual: { Icon: Apple, color: '#059669', tint: '#ECFDF5' } },
  { terms: ['fashion', 'clothing', 'cloth', 'shirt', 'shoe', 'wear', 'textile'], visual: { Icon: Shirt, color: '#7C3AED', tint: '#F5F3FF' } },
  { terms: ['electronic', 'phone', 'mobile', 'computer', 'laptop', 'gadget', 'tech'], visual: { Icon: Smartphone, color: '#2563EB', tint: '#EFF6FF' } },
  { terms: ['health', 'medicine', 'medical', 'pharmacy', 'drug'], visual: { Icon: Pill, color: '#DC2626', tint: '#FEF2F2' } },
  { terms: ['furniture', 'chair', 'home', 'decor'], visual: { Icon: Armchair, color: '#92400E', tint: '#FFFBEB' } },
  { terms: ['book', 'stationery', 'school', 'education', 'office'], visual: { Icon: BookOpen, color: '#4F46E5', tint: '#EEF2FF' } },
  { terms: ['hardware', 'tool', 'building', 'construction', 'repair'], visual: { Icon: Wrench, color: '#475569', tint: '#F1F5F9' } },
  { terms: ['beauty', 'cosmetic', 'skincare', 'makeup', 'salon'], visual: { Icon: Sparkles, color: '#DB2777', tint: '#FDF2F8' } },
  { terms: ['baby', 'kids', 'children', 'toy'], visual: { Icon: Baby, color: '#0891B2', tint: '#ECFEFF' } },
  { terms: ['car', 'auto', 'vehicle', 'motor', 'spare part'], visual: { Icon: Car, color: '#334155', tint: '#F1F5F9' } },
];

function categoryVisual(name: string, category: string): CategoryVisual {
  const searchable = `${name} ${category}`.toLowerCase();
  return visuals.find(({ terms }) => terms.some((term) => searchable.includes(term)))?.visual
    ?? { Icon: Package, color: '#2563EB', tint: '#EAF2FF' };
}

export default function ProductVisual({ imageUrl, name, category, iconSize = 24 }: ProductVisualProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [imageUrl]);

  if (imageUrl && !imageFailed) {
    return <Image accessibilityLabel={`${name} product image`} source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={150} onError={() => setImageFailed(true)} />;
  }

  const { Icon, color, tint } = categoryVisual(name, category);
  return <View className="h-full w-full items-center justify-center" style={{ backgroundColor: tint }}>
    <Icon size={iconSize} color={color} />
  </View>;
}
