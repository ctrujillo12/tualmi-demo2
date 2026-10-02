import type { Metadata } from 'next';
import ClubEventsPage from '@/components/ClubEventsPage';

// Server component so the page can carry its own metadata; everything
// interactive lives in ClubEventsPage. Events are edited in lib/events.ts.
// The URL stays /invite on purpose: referral links (?ref=), the product-page
// "join the club" buttons and the header all point here.
export const metadata: Metadata = {
  title: 'The Trailblazing Club',
  description:
    'Join the Tualmi Trailblazing Club: in-person hikes and meetups for women who spend time outside. See what we’ve done, and save your spot at the next one.',
  alternates: { canonical: '/invite' },
};

export default function InvitePage() {
  return <ClubEventsPage />;
}
