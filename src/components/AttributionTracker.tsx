'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';
import { captureReferralCode } from '@/lib/referralClient';

/**
 * Renders nothing — just records first-touch attribution (UTM params +
 * referring channel) and any ?ref= referral code as early as possible, before
 * internal navigation overwrites document.referrer or drops the query string.
 * Mounted once in the root layout.
 */
export default function AttributionTracker() {
  useEffect(() => {
    captureAttribution();
    captureReferralCode();
  }, []);

  return null;
}
