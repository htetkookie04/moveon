import { useState, useEffect, useCallback } from 'react';
import { statsApi } from '../api/stats.js';

/**
 * Fetches stats for a target - used by Day Counter Widget
 * Refetch when entries change
 */
export function useStats(targetId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!targetId) {
      setStats(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await statsApi.get(targetId);
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
