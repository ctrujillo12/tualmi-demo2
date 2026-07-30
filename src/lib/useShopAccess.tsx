'use client';

import { useEffect, useState } from 'react';

// ─── Launch config ────────────────────────────────────────────────────────────
// Secret early-access code. Email your waitlist a link like:
//   https://tualmi.com/?access=trailblazer
// (case-insensitive). It unlocks shopping 24h before the public.
export const EARLY_ACCESS_CODE = 'trailblazer';

// Club members shop starting Thursday July 30, 11:00 AM Pacific (PDT = -07:00)
export const EARLY_ACCESS_MS = new Date('2026-07-30T11:00:00-07:00').getTime();
// Public launch: Friday July 31, 11:00 AM Pacific
export const PUBLIC_LAUNCH_MS = new Date('2026-07-31T11:00:00-07:00').getTime();

const STORAGE_KEY = 'tualmi_early_access';

// Products that can be added to cart at launch
export const SELLABLE_HANDLES = ['sierra-shorts', 'juniper-pant'];
// The whole shop opens together at launch (early access, then public).
export const GATED_HANDLES = ['sierra-shorts', 'juniper-pant'];
// Preorder items (ship later) — the tote & shorts ship right away
export const PREORDER_HANDLES = ['juniper-pant'];

/** Whether a product can be bought right now, given shop-open state. */
export function isBuyable(handle: string, canShop: boolean): boolean {
  if (!SELLABLE_HANDLES.includes(handle)) return false;
  if (GATED_HANDLES.includes(handle)) return canShop;
  return true; // e.g. the tote — always available
}

function envFlag(): 'open' | 'closed' | 'auto' {
  const v = process.env.NEXT_PUBLIC_SHOP_OPEN;
  if (v === 'true') return 'open';
  if (v === 'false') return 'closed';
  return 'auto';
}

export interface ShopAccess {
  ready: boolean;      // hydrated on the client
  canShop: boolean;    // gated products are buyable for this visitor now
  hasEarly: boolean;   // this visitor unlocked early access
  publicOpen: boolean; // public launch time has passed
  opensAt: number;     // when this visitor can shop (early if unlocked, else public)
}

/**
 * Client hook for soft early-access gating.
 * - Reads a `?access=CODE` param and unlocks early access (persisted).
 * - Computes whether gated products are buyable right now.
 * - `NEXT_PUBLIC_SHOP_OPEN=false` is a kill switch that re-locks the shop.
 *   (There is no force-open flag — access comes only from the link + time,
 *   so a stray env var can't open the shop to everyone.)
 */
export function useShopAccess(): ShopAccess {
  const [state, setState] = useState<ShopAccess>({
    ready: false,
    canShop: false,
    hasEarly: false,
    publicOpen: false,
    opensAt: PUBLIC_LAUNCH_MS,
  });

  useEffect(() => {
    // Unlock from the secret link, then clean the URL
    try {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('access');
      if (code && code.trim().toLowerCase() === EARLY_ACCESS_CODE.toLowerCase()) {
        localStorage.setItem(STORAGE_KEY, '1');
        url.searchParams.delete('access');
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    } catch {
      /* ignore */
    }

    const compute = (): ShopAccess => {
      const flag = envFlag();
      let hasEarly = false;
      try { hasEarly = localStorage.getItem(STORAGE_KEY) === '1'; } catch { /* ignore */ }

      const now = Date.now();
      const publicOpen = now >= PUBLIC_LAUNCH_MS;
      const earlyOpen = hasEarly && now >= EARLY_ACCESS_MS;

      // Access is granted ONLY by the time logic: trailblazers (early link)
      // after EARLY_ACCESS_MS, everyone after PUBLIC_LAUNCH_MS. The env flag is
      // a one-way kill switch — it can re-lock the shop, but it can NEVER force
      // it open to the public (that footgun opened the shop to everyone once).
      let canShop = publicOpen || earlyOpen;
      if (flag === 'closed') canShop = false;

      return {
        ready: true,
        canShop,
        hasEarly,
        publicOpen,
        opensAt: hasEarly ? EARLY_ACCESS_MS : PUBLIC_LAUNCH_MS,
      };
    };

    setState(compute());
    const id = setInterval(() => setState(compute()), 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}
