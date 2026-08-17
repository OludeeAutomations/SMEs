import { supabase } from './supabase';

const BUCKET = 'business-logos';

export async function uploadProductImage(userId: string, uri: string, mimeType?: string | null, fileName?: string | null) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('The selected image could not be opened.');

  const body = await response.arrayBuffer();
  const extension = fileName?.split('.').pop()?.toLowerCase() || mimeType?.split('/').pop() || 'jpg';
  const path = `${userId}/products/product-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: mimeType || 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
