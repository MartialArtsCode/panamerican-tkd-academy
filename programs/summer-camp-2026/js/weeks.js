// ─────────────────────────────────────────────────────────────
//  weeks.js  —  Week-selector checkbox logic
//               Enforces mutual exclusivity between:
//               • Full Package
//               • Individual weeks
//               • Drop-in
//               Calls updatePricing() on every change.
// ─────────────────────────────────────────────────────────────

import { WEEK_IDS, FULL_ID, DROPIN_ID } from './config.js';
import { updatePricing } from './pricing.js';

// ─────────────────────────────────────────────────────────────
//  initWeeks()
//  Attaches all checkbox change listeners.
//  Called once on DOMContentLoaded.
// ─────────────────────────────────────────────────────────────
export function initWeeks() {
    const fullChk   = document.getElementById(FULL_ID);
    const dropinChk = document.getElementById(DROPIN_ID);
    const weekChks  = WEEK_IDS.map(id => document.getElementById(id));

    // Full Package selected → clear individual weeks + drop-in
    fullChk.addEventListener('change', () => {
        if (fullChk.checked) {
            weekChks.forEach(c => { c.checked = false; });
            dropinChk.checked = false;
        }
        updatePricing();
    });

    // Individual week selected → clear full package + drop-in
    weekChks.forEach(chk => {
        chk.addEventListener('change', () => {
            if (chk.checked) {
                fullChk.checked   = false;
                dropinChk.checked = false;
            }
            updatePricing();
        });
    });

    // Drop-in selected → clear everything else
    dropinChk.addEventListener('change', () => {
        if (dropinChk.checked) {
            fullChk.checked = false;
            weekChks.forEach(c => { c.checked = false; });
        }
        updatePricing();
    });
}
