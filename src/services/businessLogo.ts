import { supabase } from './supabase';

const BUCKET = 'business-logos';

export class BusinessLogoUploadError extends Error {
  constructor(public readonly reason: 'storage-not-ready' | 'upload-failed', message: string) {
    super(message);
    this.name = 'BusinessLogoUploadError';
  }
}

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
  if (error) {
    const storageNotReady = error.message.toLowerCase().includes('bucket not found');
    throw new BusinessLogoUploadError(storageNotReady ? 'storage-not-ready' : 'upload-failed', error.message);
  }
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
