/**
 * Trailblazing Club events. The ONE file to edit when an event is added,
 * changes, or happens. The /invite page renders straight from this list.
 *
 * Adding photos: put web-sized copies (about 1800px on the long edge, under
 * 1 MB) in  public/images-2/events/web/  and list them in `photos`, e.g.
 *   photos: ['/images-2/events/web/trail-club-1.jpg', '/images-2/events/web/trail-club-1b.jpg']
 * The first photo is the cover. With no photos the card shows a plain
 * placeholder. Phone originals are 2 to 5 MB each, so don't point `photos` at
 * them directly.
 *
 * Moving an event from upcoming to past: change `status` to 'past', add photos,
 * optionally fill in `recap`, and turn `rsvpOpen` off. The page re-sorts itself.
 *
 * Anything marked TODO is a placeholder to replace before this goes live.
 */

export type ClubEvent = {
  /** URL-safe and stable. Also the folder name under public/events/ and the
   *  value stored on the Klaviyo profile as `rsvp_event`. Never reuse one. */
  id: string;
  status: 'upcoming' | 'past';
  title: string;
  /** Shown as-is, e.g. "oct 18 2026". Free text so "mid october" works until a
   *  date is locked. */
  dateLabel: string;
  /** Shown as-is, e.g. "ojai, ca". */
  location: string;
  /** One or two sentences: what people actually do. */
  blurb: string;
  /** Practical rows on the card, e.g. { label: 'when', text:
   *  'about 9:30am to 3pm' }. Optional until decided. */
  details?: { label: string; text: string }[];
  /** Past only. A sentence looking back. Shown instead of `blurb` if set. */
  recap?: string;
  /** Upcoming only. false hides the RSVP form and shows "details soon". */
  rsvpOpen?: boolean;
  /** Link to the trail (e.g. AllTrails), shown at the end of the
   *  details line and opened in a new tab. */
  trail?: { label: string; url: string };
  /** Upcoming only. A rule or heads-up people must see before they sign up.
   *  Shown in a boxed callout directly above the form. */
  callout?: string;
  /**
   * Upcoming only. Extra quick questions on the RSVP form, for events where
   * you need the answer up front. Each is off unless set.
   *   ride      "do you need transportation?" (need_ride / own_ride). Required.
   *   camera    "do you have a camera to bring?" (has_camera / need_disposable).
   *             Required.
   *   instagram optional @handle.
   * Answers go to Klaviyo as profile properties (rsvp_ride, rsvp_camera,
   * rsvp_instagram) and on the "Event RSVP" event, and are copied into the
   * Supabase backup row (signups.attribution -> 'rsvp').
   */
  rsvpQuestions?: { ride?: boolean; camera?: boolean; instagram?: boolean };
  /**
   * Upcoming only. Optional Google Form for the extra questions (rides, food,
   * anything else). When `url` is set, the confirmation shows a "one more step"
   * button that opens the form with the person's name and email pre-filled.
   * Leave `url` empty and nothing changes.
   *
   * Setup: in the Form, three-dot menu > "Get pre-filled link", type any
   * placeholder into the name and email questions, click "Get link", and paste
   * it into the browser. The address contains `entry.123456789=...` for each
   * question. `url` is everything before the `?`, and the numbers go in
   * `nameEntry` / `emailEntry` (digits only, without "entry.").
   */
  detailsForm?: {
    url: string;
    nameEntry?: string;
    emailEntry?: string;
  };
  /** Public paths under /public. First is the cover. */
  photos: string[];
};

export const CLUB_EVENTS: ClubEvent[] = [
  {
    id: 'logging-off-idyllwild',
    status: 'upcoming',
    title: 'tualmi logging off: idyllwild',
    // TODO: confirm the date (carried over from the old Ojai placeholder).
    dateLabel: 'oct 17 2026',
    location: 'idyllwild, ca',
    blurb:
      'BRB, playing outside. We’re logging off for the day and getting nostalgic. Think digicams, colorful hiking fits, making camera charms, picnic snacks, and a day outside without staring at your phone. Transportation available from LA.',
    details: [
      { label: 'when', text: 'about 9:30am to 3pm' },
      { label: 'the hike', text: '4 to 5 miles' },
    ],
    trail: {
      label: 'see the trail on alltrails',
      url: 'https://www.alltrails.com/trail/us/california/ernie-maxwell-trail/photos',
    },
    rsvpOpen: true,
    rsvpQuestions: { ride: true, camera: true, instagram: true },
    photos: ['/images-2/events/web/logging-off-idyllwild.jpg'],
    // TODO: paste the Google Form link here for the follow-up questions (age,
    // emergency contact, food, accessibility) once interest is in. See above.
    // detailsForm: {
    //   url: 'https://docs.google.com/forms/d/e/XXXXXXXX/viewform',
    //   nameEntry: '123456789',
    //   emailEntry: '987654321',
    // },
  },
  {
    id: 'trail-club-1',
    status: 'past',
    title: 'trail club 1',
    dateLabel: 'aug 16 2026',
    location: 'bridge to nowhere trail',
    blurb: 'A watering hole and hike day on the East Fork Trail toward the Bridge to Nowhere.',
    photos: ['/images-2/events/web/trail-club-1.jpg'],
  },
  {
    id: 'trail-club-2',
    status: 'past',
    title: 'trail club 2',
    dateLabel: 'aug 28 2026',
    location: 'dipsea trail, bay area',
    blurb: 'A hike on the historic Dipsea Trail in Marin County, which runs from Mill Valley to Stinson Beach.',
    photos: ['/images-2/events/web/trail-club-2.jpg'],
  },
  {
    id: 'city-girl-hollywood-hike',
    status: 'past',
    title: 'city girl hollywood hike',
    dateLabel: 'sep 20 2026',
    location: 'griffith park, los angeles',
    blurb: 'A Griffith Park hike, in collab with Camelia Collective, an AAPI and BIPOC community.',
    photos: ['/images-2/events/web/trail-club-3.jpg'],
  },
];

export const UPCOMING_EVENTS = CLUB_EVENTS.filter((e) => e.status === 'upcoming');
export const PAST_EVENTS = CLUB_EVENTS.filter((e) => e.status === 'past');
