import { supabase } from './supabase';

const BUCKET = 'business-logos';

export async function uploadBusinessLogo(userId: string, uri: string, mimeType?: string | null, fileName?: string | null) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('The selected image could not be opened.');
  const body = await response.arrayBuffer();
  const extension = fileName?.split('.').pop()?.toLowerCase() || mimeType?.split('/').pop() || 'jpg';
  const path = `${userId}/logo-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: mimeType || 'image/jpeg',
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
