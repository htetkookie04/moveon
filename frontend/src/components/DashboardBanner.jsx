/**
 * Dashboard Banner - displays active banner in the right panel
 * Uses full Cloudinary URL from API; fallback when null or broken
 */
import { useState, useEffect } from 'react';
import { bannerApi } from '../api/banner.js';

const FALLBACK_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect fill="%23e2e8f0" width="400" height="225"/%3E%3Ctext fill="%2394a3b8" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14"%3ENo banner%3C/text%3E%3C/svg%3E';

export default function DashboardBanner() {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setImageError(false);
    bannerApi
      .getActive()
      .then(({ data }) => {
        if (!cancelled) setBanner(data);
      })
      .catch(() => {
        if (!cancelled) setBanner(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 aspect-[16/9] animate-pulse" />
    );
  }

  const imageUrl = banner?.imageUrl;
  const src = imageUrl && !imageError ? imageUrl : FALLBACK_PLACEHOLDER;

  return (
    <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <img
        src={src}
        alt="Banner"
        className="w-full h-auto object-cover aspect-[16/9]"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
