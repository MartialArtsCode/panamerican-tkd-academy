// ─────────────────────────────────────────────────────────────
//  pricing.js  —  Derived pricing state, sidebar display,
//                 live total updates, and payment link builder
// ─────────────────────────────────────────────────────────────

import {
    EARLY_BIRD_PRICE, REGULAR_PRICE,
    FULL_PKG_BASE, FULL_PKG_EARLY, FULL_PKG_REGULAR,
    EARLY_BIRD_CUTOFF, WEEK_IDS, FULL_ID, DROPIN_ID,
    PAYMENT,
} from './config.js';

// ── Derived state (computed once at load time) ────────────────
export const isEarlyBird  = new Date() <= EARLY_BIRD_CUTOFF;
export const pricePerWeek = isEarlyBird ? EARLY_BIRD_PRICE : REGULAR_PRICE;
export const fullPkgPrice = isEarlyBird ? FULL_PKG_EARLY   : FULL_PKG_REGULAR;

// ─────────────────────────────────────────────────────────────
//  initSidebar()
//  Populates the static rate display in the info panel.
//  Called once on DOMContentLoaded.
// ─────────────────────────────────────────────────────────────
export function initSidebar() {
    document.getElementById('pricePerWeek').textContent = pricePerWeek;
    document.getElementById('ebStatus').textContent     = isEarlyBird ? '(Active ✓)' : '(Expired)';

    const fullPkgLine = document.getElementById('fullPkgLine');
    const regularNote = document.getElementById('regularNote');
    const ebBadge     = document.getElementById('ebBadge');
    const ebLabel     = document.getElementById('ebLabel');
    const fpNote      = document.getElementById('fullPkgCardNote');

    if (isEarlyBird) {
        fullPkgLine.style.display = '';
        regularNote.style.display = 'none';
    } else {
        fullPkgLine.style.display = 'none';
        regularNote.style.display = '';
        ebBadge.textContent       = 'Regular Price';
        ebBadge.style.background  = '#94a3b8';
        ebLabel.textContent       = 'Rate';
    }

    if (fpNote) {
        fpNote.textContent = isEarlyBird
            ? `$${FULL_PKG_EARLY} — save $${FULL_PKG_BASE - FULL_PKG_EARLY}! (20% off)`
            : `$${FULL_PKG_REGULAR} — all 4 weeks`;
    }
}

// ─────────────────────────────────────────────────────────────
//  updatePricing()
//  Reads current checkbox state and refreshes:
//    • sidebar total + summary + savings line
//    • pay-now header total
//    • hidden Formspree fields
//    • payment link URLs
//  Called on every checkbox change event.
// ─────────────────────────────────────────────────────────────
export function updatePricing() {
    const fullChk   = document.getElementById(FULL_ID);
    const dropinChk = document.getElementById(DROPIN_ID);
    const weekChks  = WEEK_IDS.map(id => document.getElementById(id));

    let weekCount    = 0;
    let total        = 0;
    let savings      = 0;
    let summaryParts = [];

    if (fullChk.checked) {
        weekCount    = 4;
        total        = fullPkgPrice;
        summaryParts = ['Full Summer Package (4 weeks)'];
        if (isEarlyBird) savings = FULL_PKG_BASE - FULL_PKG_EARLY;

    } else if (dropinChk.checked) {
        summaryParts = ['Daily Drop-in (rates TBD)'];

    } else {
        weekChks.forEach(chk => {
            if (chk.checked) {
                weekCount++;
                summaryParts.push(chk.value);
            }
        });
        total = weekCount * pricePerWeek;
    }

    _renderTotal(total, dropinChk.checked);
    _renderSummary(weekCount, total, savings, summaryParts, fullChk.checked, dropinChk.checked);
    _renderPayHeader(total);
    _renderHiddenFields(summaryParts, total, dropinChk.checked);
    updatePaymentLinks(total, summaryParts.join(', '));
}

// ─────────────────────────────────────────────────────────────
//  updatePaymentLinks(total, note)
//  Injects the calculated amount into all three payment URLs.
// ─────────────────────────────────────────────────────────────
export function updatePaymentLinks(total, note) {
    const noteEncoded = encodeURIComponent('Summer Camp 2026 – ' + (note || 'Registration'));

    if (total > 0) {
        document.getElementById(PAYMENT.venmo.id).href   = `${PAYMENT.venmo.baseUrl}?txn=pay&amount=${total}&note=${noteEncoded}`;
        document.getElementById(PAYMENT.cashapp.id).href = `${PAYMENT.cashapp.baseUrl}/${total}`;
        document.getElementById(PAYMENT.paypal.id).href  = `${PAYMENT.paypal.baseUrl}/${total}`;
    } else {
        document.getElementById(PAYMENT.venmo.id).href   = PAYMENT.venmo.baseUrl;
        document.getElementById(PAYMENT.cashapp.id).href = PAYMENT.cashapp.baseUrl;
        document.getElementById(PAYMENT.paypal.id).href  = PAYMENT.paypal.baseUrl;
    }
}

// ── Private render helpers ────────────────────────────────────

function _renderTotal(total, isDropin) {
    const el = document.getElementById('totalDisplay');
    el.textContent = total > 0 ? `$${total}` : (isDropin ? 'TBD' : '$0');
    el.classList.remove('price-pop');
    void el.offsetWidth; // force reflow to re-trigger animation
    el.classList.add('price-pop');
}

function _renderSummary(weekCount, total, savings, summaryParts, isFull, isDropin) {
    const wkSummary  = document.getElementById('weeksSummary');
    const savingsLine = document.getElementById('savingsLine');

    if (summaryParts.length === 0) {
        wkSummary.textContent     = 'No weeks selected';
        savingsLine.style.display = 'none';
        return;
    }

    if (isDropin) {
        wkSummary.textContent     = 'Drop-in inquiry';
        savingsLine.style.display = 'none';
        return;
    }

    if (isFull) {
        wkSummary.textContent = isEarlyBird
            ? `4 wks × $120 = $${FULL_PKG_BASE} → 20% off`
            : `4 weeks × $${REGULAR_PRICE}`;
        if (savings > 0) {
            savingsLine.textContent   = `You save $${savings}!`;
            savingsLine.style.display = '';
        } else {
            savingsLine.style.display = 'none';
        }
        return;
    }

    wkSummary.textContent     = `${weekCount} week${weekCount !== 1 ? 's' : ''} × $${pricePerWeek}`;
    savingsLine.style.display = 'none';
}

function _renderPayHeader(total) {
    document.getElementById('payTotal').textContent = total > 0 ? `Total: $${total}` : '';
}

function _renderHiddenFields(summaryParts, total, isDropin) {
    document.getElementById('selectedWeeksField').value =
        summaryParts.join(', ') || 'None';
    document.getElementById('totalAmountField').value =
        total > 0 ? `$${total}` : (isDropin ? 'Drop-in TBD' : '$0');
}
