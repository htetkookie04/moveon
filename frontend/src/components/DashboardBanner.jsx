/**
 * Dashboard Banner - displays active banner in the right panel
 */
import { useState, useEffect } from 'react';
import { bannerApi } from '../api/banner.js';

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  const base = import.meta.env.VITE_API_URL || '';
  const uploadsBase = base.replace(/\/api\/?$/, '') || '';
  return uploadsBase ? `${uploadsBase}${imageUrl}` : imageUrl;
}

export default function DashboardBanner() {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
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

  if (!banner?.imageUrl) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-400">No banner</p>
      </div>
    );
  }

  const src = getImageUrl(banner.imageUrl);

  return (
    <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <img
        src={src}
        alt="Banner"
        className="w-full h-auto object-cover aspect-[16/9]"
      />
    </div>
  );
}
