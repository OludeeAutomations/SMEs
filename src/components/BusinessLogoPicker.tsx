import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Upload } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import { uploadBusinessLogo } from '@/services/businessLogo';

export default function BusinessLogoPicker({ value, onChange }: { value?: string; onChange: (uri: string) => void }) {
  const [loading, setLoading] = useState(false);

  const chooseLogo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to choose your business logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85,
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
      if (!data.user) throw new Error('Please sign in again before uploading a logo.');
      const publicUrl = await uploadBusinessLogo(data.user.id, asset.uri, asset.mimeType, asset.fileName);
      onChange(publicUrl);
    } catch (error) {
      console.warn('Business logo upload failed:', error);
      Alert.alert('Couldn\'t upload logo', 'Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return <View className="gap-2">
    <Text className="text-xs font-medium text-[#475569]">Business logo</Text>
    <Pressable onPress={chooseLogo} disabled={loading} className="h-[76px] flex-row items-center gap-3 rounded-[5px] border border-[#DCE3EE] bg-[#F2F5FA] px-3.5">
      <View className="h-11 w-11 overflow-hidden rounded-[5px] border border-[#DCE3EE] bg-white items-center justify-center">
        {value ? <Image source={{ uri: value }} style={{ width: 44, height: 44 }} contentFit="cover" /> : <ImagePlus size={22} color="#2563EB" />}
      </View>
      <View className="flex-1"><Text className="text-sm font-semibold text-[#0F172A]">{value ? 'Change business logo' : 'Upload business logo'}</Text><Text className="mt-0.5 text-[11px] text-[#94A3B8]">PNG or JPG, up to 5 MB</Text></View>
      {loading ? <ActivityIndicator color="#2563EB" /> : <Upload size={20} color="#475569" />}
    </Pressable>
  </View>;
}
