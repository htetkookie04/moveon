/**
 * Admin Banner Management - upload, preview, delete banner
 */
import { useState, useEffect } from 'react';
import { bannerApi } from '../api/banner.js';
import { useToast } from '../context/ToastContext.jsx';

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  const base = import.meta.env.VITE_API_URL || '';
  const uploadsBase = base.replace(/\/api\/?$/, '') || '';
  return uploadsBase ? `${uploadsBase}${imageUrl}` : imageUrl;
}

export default function AdminBannerPage() {
  const [banner, setBanner] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchBanner = async () => {
    try {
      const { data } = await bannerApi.getActive();
      setBanner(data);
    } catch {
      setBanner(null);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(f.type)) {
      toast('Only PNG, JPG, and WebP images are allowed', 'error');
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast('Image must be under 2MB', 'error');
      return;
    }
    setFile(f);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast('Select an image first', 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await bannerApi.upload(formData);
      toast('Banner updated', 'success');
      setFile(null);
      fetchBanner();
    } catch (err) {
      toast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!banner?.id || !window.confirm('Remove the banner?')) return;
    setDeleting(true);
    try {
      await bannerApi.delete(banner.id);
      toast('Banner removed', 'success');
      setBanner(null);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to remove', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-slate-800">Banner Management</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h2 className="font-semibold text-slate-800">Upload New Banner</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-streak-50 file:text-streak-700 file:font-medium hover:file:bg-streak-100"
            />
          </div>
          {preview && (
            <div className="rounded-lg overflow-hidden border border-slate-200 max-w-md">
              <img src={preview} alt="Preview" className="w-full h-auto object-cover aspect-video" />
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!file || uploading}
              className="px-4 py-2 rounded-lg bg-streak-500 text-white font-medium hover:bg-streak-600 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Save Banner'}
            </button>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Current Active Banner</h2>
        {banner ? (
          <>
            <div className="rounded-lg overflow-hidden border border-slate-200 max-w-md">
              <img
                src={getImageUrl(banner.imageUrl)}
                alt="Current banner"
                className="w-full h-auto object-cover aspect-video"
              />
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? 'Removing...' : 'Remove Banner'}
            </button>
          </>
        ) : (
          <p className="text-slate-500 text-sm">No active banner</p>
        )}
      </div>
    </div>
  );
}
