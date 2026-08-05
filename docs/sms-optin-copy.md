# SMS opt-in — copy + Klaviyo setup

Everything here assumes the same rule: **email is captured first and independently.**
The phone ask only ever appears after the email has already hit Klaviyo, so a skipped
phone number costs you nothing.

---

## 1. On-site form copy (already live in the code)

### `/invite` and homepage footer — lowercase, matches existing voice

> **you're in ✦**
>
> **want it before everyone else?**
> we text the drop link 24 hours before it goes out by email. that's the only reason we'd text you.
>
> `[ (555) 123-4567 ]  [ text me ]`
>
> ☐ Yes, text me. I agree to receive recurring marketing texts from Tualmi at the number provided, including messages sent by autodialer. Consent is not a condition of purchase. Msg & data rates may apply. Reply STOP to cancel, HELP for help. [Privacy Policy]
>
> _no thanks, email is fine_

**Confirmation after they add a number:**
> done — you'll get the drop link by text first ✦

### Welcome popup — sentence case, appears under the 15% code

> **One more thing — want the drop early?**
> We text the link 24 hours before it hits email. That's the only reason we'd text you.

### Why this copy and not something louder

- **"that's the only reason we'd text you"** is the whole pitch. The #1 reason people
  withhold a number is fear of volume, not fear of you. Naming the ceiling up front
  removes the actual objection.
- **A specific, checkable promise** (24 hours, drop link) beats "exclusive perks."
- **The skip link is visible, not buried.** Hiding it produces junk numbers and
  spam complaints, which is what actually gets an SMS sending domain throttled.

### Copy variants to A/B later

| Angle | Headline | Subcopy |
|---|---|---|
| Scarcity | `pants sold out in 9 minutes last time.` | `text list gets the link first. we'll tell you when it's live.` |
| Low-volume | `we text maybe twice a month.` | `drops and restocks. that's the whole list.` |
| Insider | `want the group chat version?` | `first look, first link, no forwarding to your inbox.` |

---

## 2. Email to your existing email-only list

**Send to:** subscribers with `SMS consent = never subscribed`
**Send timing:** 7–10 days before the pants drop, so there's still urgency but the
number is in Klaviyo before the flow builds.

### Subject line options

1. `first dibs on the pants (before email)`
2. `the text list gets it 24 hours early`
3. `one thing to add before the drop`

**Preview text:** `takes ten seconds. no, we won't text you constantly.`

### Body

> **hey —**
>
> the pants drop in a couple weeks, and we're doing it the same way we did the shorts:
> a small text list gets the link **24 hours before it goes out to email.**
>
> not because email is second-class. because last time the good sizes were gone before
> some of you even opened your inbox, and that felt bad for everyone.
>
> if you want to be on the early list:
>
> **[ add my number → ]**
>
> what you're signing up for, exactly:
> - the drop link, 24 hours early
> - restock alerts when something sells out
> - that's it. we'd guess two texts a month, and that's a high guess.
>
> if you'd rather keep it to email, do nothing — you'll still get the drop, just on
> normal time. we're not going to nag you about this again.
>
> — cheyenne & the tualmi team
>
> _By providing your number you agree to receive recurring marketing texts from Tualmi
> at the number provided, including messages sent by autodialer. Consent is not a
> condition of purchase. Msg & data rates may apply. Reply STOP to cancel, HELP for help._

**Where the button goes:** a Klaviyo-hosted subscribe page or your `/invite` page with
the email pre-filled from the link. Pre-filling matters — it keeps you at one profile
instead of creating a second one.

### One follow-up, 4 days later, to non-openers only

**Subject:** `still time to get on the text list`
Same body, shorter. Then stop. A third send on this ask is where unsubscribes spike.

---

## 3. The SMS welcome text (set this up before you collect anything)

The moment someone opts in, Klaviyo should fire a confirmation text. This isn't
optional polish — it's how you prove consent later, and it sets the volume expectation.

> Tualmi: you're on the early list ✦ you'll get the drop link 24 hrs before email.
> ~2 msgs/month. Reply STOP to cancel, HELP for help. Msg&data rates may apply.

Keep the brand name, the frequency, and STOP/HELP in this first message. All three
are expected by carriers and by the TCPA record you'd want if anyone ever complained.

---

## 4. Klaviyo setup checklist

Work through these in order — a few will block the others.

- [ ] **Confirm SMS is enabled on your plan.** It's a separate product line from email
      in Klaviyo, with its own billing. Check `Settings → SMS`.
- [ ] **Get a sending number.** A toll-free number is fine to start and is faster than
      a short code. Toll-free numbers now require carrier verification — budget a few
      business days, so do this *before* the drop, not the week of.
- [ ] **Register for 10DLC / toll-free verification.** Unverified numbers get filtered
      hard by carriers. Your consent language and a screenshot of the opt-in form are
      part of the application, which is another reason to ship the form first.
- [ ] **Confirm one profile, not two.** The API route sends email and phone on a single
      profile payload keyed to the email address, so the phone merges onto the existing
      profile. Spot-check a real signup in Klaviyo afterward to be sure.
- [ ] **Create an SMS list or use a consent-based segment** so the drop flow can target
      "SMS subscribed" as its own audience.
- [ ] **Build the drop flow with the 24-hour gap:** SMS send at T-0, email send at T+24h.
      Exclude SMS subscribers from the email send, or don't — getting both is fine and
      some people like the reminder. Just decide deliberately.
- [ ] **Set up the STOP/HELP auto-replies.** Klaviyo handles these by default; confirm
      they're on and that the HELP text names Tualmi.
- [ ] **Add an SMS section to your privacy policy** at `/footer-pages/privacy` covering
      what you collect, message frequency, and that you don't sell phone numbers.
      Carriers check this page during verification.

---

## 5. What to watch after launch

| Metric | Where | What's normal | What it means if it's off |
|---|---|---|---|
| Phone capture rate | % of email signups who also add a number | 20–35% with a clear incentive | Under 15% → the payoff isn't specific enough |
| SMS unsubscribe rate | Klaviyo SMS reporting | Under 2% per send | Above 3% → you're texting too often or off-topic |
| Email signup rate | Compare to your pre-change baseline | **Should not move** | If it drops, the phone step is leaking — check mobile layout first |

That last row is the one that matters most. The whole design here is that email
conversion stays flat. Pull the baseline number before you deploy so you can tell.
