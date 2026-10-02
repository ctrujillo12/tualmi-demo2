import type { Metadata } from 'next';
import ClubEventsPage from '@/components/ClubEventsPage';

// Server component so the page can carry its own metadata; everything
// interactive lives in ClubEventsPage. Events are edited in lib/events.ts.
// The URL is /trail-club. The old /invite URL 308-redirects here (see
// next.config.js) so referral links (?ref=) already sent out keep working.
export const metadata: Metadata = {
  title: 'The Trailblazing Club',
  description:
    'Join the Tualmi Trailblazing Club: in-person hikes and meetups for women who spend time outside. See what we’ve done, and save your spot at the next one.',
  alternates: { canonical: '/trail-club' },
};

export default function InvitePage() {
  return <ClubEventsPage />;
}
