// ─────────────────────────────────────────────────────────────
//  config.js  —  Single source of truth for all camp constants
//  Edit ONLY this file to update prices, dates, or handles.
// ─────────────────────────────────────────────────────────────

// ── Pricing ──────────────────────────────────────────────────
export const EARLY_BIRD_PRICE    = 99;          // per week, before cutoff
export const REGULAR_PRICE       = 120;         // per week, after cutoff
export const FULL_PKG_BASE       = 480;         // 4 × REGULAR_PRICE
export const FULL_PKG_EARLY_DISC = 0.20;        // 20 % off full pkg before cutoff
export const FULL_PKG_EARLY      = FULL_PKG_BASE * (1 - FULL_PKG_EARLY_DISC); // 384
export const FULL_PKG_REGULAR    = FULL_PKG_BASE;                              // 480

// ── Dates ────────────────────────────────────────────────────
export const EARLY_BIRD_CUTOFF = new Date('2026-05-20T23:59:59');

// ── DOM element IDs — week checkboxes ────────────────────────
export const WEEK_IDS  = ['wk1', 'wk2', 'wk3', 'wk4'];
export const FULL_ID   = 'wkFull';
export const DROPIN_ID = 'wkDropin';

// ── Formspree endpoint ───────────────────────────────────────
export const FORMSPREE_URL = 'https://formspree.io/f/mwvaqzyd';

// ── Payment handles ──────────────────────────────────────────
export const PAYMENT = {
    venmo:   { id: 'venmoLink',   handle: 'PanamericanTKD',  baseUrl: 'https://venmo.com/PanamericanTKD'      },
    cashapp: { id: 'cashappLink', handle: '$PanamericanTKD', baseUrl: 'https://cash.app/$PanamericanTKD'      },
    paypal:  { id: 'paypalLink',  handle: 'PanamericanTKD',  baseUrl: 'https://www.paypal.me/PanamericanTKD'  },
};
