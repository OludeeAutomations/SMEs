import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Upload } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import { uploadProductImage } from '@/services/productImage';

export default function ProductImagePicker({ value, onChange }: { value?: string; onChange: (uri: string) => void }) {
  const [loading, setLoading] = useState(false);

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to choose a product image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if ((asset.fileSize ?? 0) > 5 * 1024 * 1024) {
      Alert.alert('Image is too large', 'Choose a PNG or JPG smaller than 5 MB.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error('Please sign in again before uploading a product image.');
      onChange(await uploadProductImage(data.user.id, asset.uri, asset.mimeType, asset.fileName));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      Alert.alert("Couldn't upload product image", message);
    } finally {
      setLoading(false);
    }
  };

  return <View className="gap-2">
    <Text className="text-xs font-medium text-[#475569]">Product image</Text>
    <Pressable onPress={chooseImage} disabled={loading} className="h-[76px] flex-row items-center gap-3 rounded-[5px] border border-[#DCE3EE] bg-[#F2F5FA] px-3.5">
      <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-[7px] border border-[#DCE3EE] bg-white">
        {value ? <Image source={{ uri: value }} style={{ width: 48, height: 48 }} contentFit="cover" /> : <ImagePlus size={22} color="#2563EB" />}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-[#0F172A]">{value ? 'Change product image' : 'Add product image'}</Text>
        <Text className="mt-0.5 text-[11px] text-[#94A3B8]">PNG or JPG, up to 5 MB</Text>
      </View>
      {loading ? <ActivityIndicator color="#2563EB" /> : <Upload size={20} color="#475569" />}
    </Pressable>
  </View>;
}
