/**
 * Chunked video upload to Cloudinary (direct) or backend storage (fallback).
 * Splits the file into ~6MB chunks to:
 *  - Avoid browser/server JSON body size limits
 *  - Show accurate per-chunk progress
 *  - Enable retry of individual chunks on failure
 *  - Keep the UI responsive (non-blocking per chunk)
 */

const CHUNK_SIZE = 6 * 1024 * 1024; // 6 MB per chunk
const MAX_CHUNK_RETRIES = 3;

/**
 * Convert an ArrayBuffer slice into a base64 string (without data URL prefix).
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Upload a single chunk to the backend with retry logic.
 */
async function uploadChunk(
  uploadId: string,
  chunkIndex: number,
  totalChunks: number,
  chunkBase64: string,
  mimeType: string,
  fileName: string,
  token: string,
  baseUrl: string,
  attempt = 0
): Promise<void> {
  try {
    const res = await fetch(`${baseUrl}/admin/upload-video/chunk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        upload_id: uploadId,
        chunk_index: chunkIndex,
        total_chunks: totalChunks,
        chunk_data: chunkBase64,
        mime_type: mimeType,
        file_name: fileName,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `Chunk ${chunkIndex} failed with status ${res.status}`);
    }
  } catch (err: any) {
    if (attempt < MAX_CHUNK_RETRIES - 1) {
      const delay = (attempt + 1) * 1000; // 1s, 2s, 3s backoff
      console.warn(`[ChunkedUpload] Chunk ${chunkIndex} failed (attempt ${attempt + 1}), retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      return uploadChunk(uploadId, chunkIndex, totalChunks, chunkBase64, mimeType, fileName, token, baseUrl, attempt + 1);
    }
    throw new Error(`Chunk ${chunkIndex} failed after ${MAX_CHUNK_RETRIES} attempts: ${err.message}`);
  }
}

/**
 * Main upload function: chunks the file, uploads via Cloudinary direct (if configured),
 * or falls back to the backend chunked upload API.
 *
 * @param file - The video File object
 * @param onProgress - Progress callback (0–100)
 * @param onPhase - Optional phase label callback ('preparing' | 'uploading' | 'processing' | 'complete')
 * @returns Hosted HTTPS video URL
 */
export async function uploadVideoToCloudinary(
  file: File,
  onProgress?: (progressPercent: number) => void,
  onPhase?: (phase: 'preparing' | 'uploading' | 'processing' | 'complete') => void
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'shebloom';

  onPhase?.('preparing');
  onProgress?.(0);

  // ─── Strategy 1: Direct Cloudinary unsigned upload (best performance) ───────
  const presets = ['shebloom_videos', 'shebloom', 'ml_default'];
  let cloudinaryError = '';

  for (const preset of presets) {
    try {
      console.log(`[VideoUpload] Trying Cloudinary preset: ${preset}`);
      onPhase?.('uploading');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);

      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            // Reserve last 5% for server-side processing confirmation
            const pct = Math.min(95, Math.round((e.loaded / e.total) * 95));
            onProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data?.secure_url) {
                resolve(data.secure_url);
              } else {
                reject(new Error('No secure_url in Cloudinary response'));
              }
            } catch {
              reject(new Error('Invalid JSON from Cloudinary'));
            }
          } else {
            reject(new Error(`Preset "${preset}" failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error connecting to Cloudinary'));
        xhr.ontimeout = () => reject(new Error('Cloudinary upload timed out'));
        xhr.timeout = 5 * 60 * 1000; // 5-minute timeout
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
        xhr.send(formData);
      });

      onPhase?.('processing');
      onProgress?.(98);
      await new Promise((r) => setTimeout(r, 400));
      onProgress?.(100);
      onPhase?.('complete');
      console.log(`[VideoUpload] Cloudinary upload complete via preset "${preset}"`);
      return url;
    } catch (err: any) {
      cloudinaryError = err?.message || 'Cloudinary upload error';
      console.warn(`[VideoUpload] Cloudinary preset "${preset}" failed: ${cloudinaryError}`);
    }
  }

  // ─── Strategy 2: Backend chunked upload (server-side Supabase Storage) ───────
  console.log(`[VideoUpload] Falling back to backend chunked upload for "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
  onPhase?.('uploading');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const uploadId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  console.log(`[VideoUpload] Starting chunked upload: ${uploadId} | ${totalChunks} chunks | file=${file.name}`);

  const fileArrayBuffer = await file.arrayBuffer();

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunkBuffer = fileArrayBuffer.slice(start, end);
    const chunkBase64 = bufferToBase64(chunkBuffer);

    await uploadChunk(uploadId, i, totalChunks, chunkBase64, file.type || 'video/mp4', file.name, token, baseUrl);

    // Progress: 0–85% during chunk uploads (leave 15% for finalize)
    const chunkProgress = Math.round(((i + 1) / totalChunks) * 85);
    onProgress?.(chunkProgress);
    console.log(`[VideoUpload] Chunk ${i + 1}/${totalChunks} uploaded (${chunkProgress}%)`);
  }

  // Finalize: assemble all chunks on the server and upload to storage
  console.log(`[VideoUpload] All chunks sent. Finalizing upload ${uploadId}...`);
  onPhase?.('processing');
  onProgress?.(90);

  const finalizeRes = await fetch(`${baseUrl}/admin/upload-video/finalize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ upload_id: uploadId }),
  });

  if (!finalizeRes.ok) {
    const errData = await finalizeRes.json().catch(() => ({ error: 'Unknown finalize error' }));
    throw new Error(errData.error || 'Failed to finalize chunked video upload');
  }

  const finalizeData = await finalizeRes.json();
  if (!finalizeData.video_url) {
    throw new Error('Finalize succeeded but no video_url returned');
  }

  onProgress?.(100);
  onPhase?.('complete');
  console.log(`[VideoUpload] Chunked upload complete: ${finalizeData.video_url}`);
  return finalizeData.video_url;
}
