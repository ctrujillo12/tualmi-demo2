'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';

/**
 * Renders nothing — just records first-touch attribution (UTM params +
 * referring channel) as early as possible, before internal navigation
 * overwrites document.referrer. Mounted once in the root layout.
 */
export default function AttributionTracker() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
