import { supabase } from './supabase';

/**
 * Medical Report Authenticated Viewer Utility
 * Fetches medical report files client-side using authenticated request,
 * converts to a local Blob, and opens in a new window or triggers download.
 */
export async function openMedicalReport(fileUrl: string, fileName?: string): Promise<void> {
  if (!fileUrl) {
    alert('Invalid or missing file URL.');
    return;
  }

  // Handle data URLs cleanly via Blob URL to prevent about:blank popups
  if (fileUrl.startsWith('data:')) {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const win = window.open(objectUrl, '_blank');
      if (!win) {
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = fileName || 'attachment';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error('Error opening data URL:', e);
    }
    return;
  }

  let token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }
  } catch (e) {}
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

  // Construct target API endpoint URL safely
  let targetEndpoint = fileUrl;

  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    try {
      const parsed = new URL(fileUrl);
      // Ensure pathname includes '/api' prefix for backend API routes
      if (!parsed.pathname.startsWith('/api/') && (parsed.pathname.startsWith('/health-records') || parsed.pathname.startsWith('/doctor-portal'))) {
        parsed.pathname = `/api${parsed.pathname}`;
      }
      targetEndpoint = parsed.toString();
    } catch (e) {
      targetEndpoint = fileUrl;
    }
  } else {
    let cleanPath = fileUrl;
    if (cleanPath.startsWith('/api/')) {
      cleanPath = cleanPath.substring(4);
    } else if (cleanPath === '/api') {
      cleanPath = '';
    }

    if (!cleanPath.startsWith('/')) {
      cleanPath = `/${cleanPath}`;
    }

    // If it's not already pointing to an API path, treat as health-records relative path
    if (!cleanPath.startsWith('/health-records') && !cleanPath.startsWith('/doctor-portal')) {
      cleanPath = `/health-records/documents${cleanPath}`;
    }

    targetEndpoint = `${baseUrl}${cleanPath}`;
  }

  try {
    const res = await fetch(targetEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      let msg = 'Failed to load report document.';
      try {
        const parsed = JSON.parse(errText);
        msg = parsed.error || msg;
      } catch (e) {}
      throw new Error(msg);
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    // Try opening in a new browser tab
    const win = window.open(objectUrl, '_blank');
    if (!win) {
      // Fallback: trigger download if popup blocker prevents opening
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName || 'medical-report';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err: any) {
    console.error('Error fetching medical report:', err);
    alert(err?.message || 'Could not load medical report. Please check permissions.');
  }
}
