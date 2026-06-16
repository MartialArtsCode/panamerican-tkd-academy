// ─────────────────────────────────────────────────────────────
//  payment.js  —  Payment button click tracking
//               Highlights the selected button, records the
//               chosen method in a hidden field, and updates
//               the hint text below the payment buttons.
// ─────────────────────────────────────────────────────────────

import { PAYMENT, DROPIN_ID } from './config.js';

const BTN_IDS = Object.values(PAYMENT).map(p => p.id);

// ─────────────────────────────────────────────────────────────
//  initPaymentButtons()
//  Attaches click listeners to all three pay buttons.
//  Called once on DOMContentLoaded.
// ─────────────────────────────────────────────────────────────
export function initPaymentButtons() {
    const methodInput = document.getElementById('payment_method');
    const hint        = document.getElementById('payHint');

    BTN_IDS.forEach(id => {
        document.getElementById(id)?.addEventListener('click', function () {
            const label = this.textContent.trim().replace('Pay with ', '');

            // Record selection in hidden field
            methodInput.value = label;

            // Update hint text
            hint.textContent = `✓ ${label} selected. After paying, come back and submit the registration.`;

            // Highlight selected button
            document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// ── State accessors used by form.js ──────────────────────────

/** Returns the currently selected payment method label, or empty string. */
export function getPaymentMethod() {
    return document.getElementById('payment_method').value;
}

/** Returns true if the drop-in option is currently checked. */
export function isDropinSelected() {
    return document.getElementById(DROPIN_ID)?.checked ?? false;
}
