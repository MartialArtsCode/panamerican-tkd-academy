// ─────────────────────────────────────────────────────────────
//  form.js  —  Form validation and async Formspree submission
// ─────────────────────────────────────────────────────────────

import { FORMSPREE_URL, WEEK_IDS, FULL_ID, DROPIN_ID } from './config.js';
import { getPaymentMethod, isDropinSelected } from './payment.js';

// ─────────────────────────────────────────────────────────────
//  initForm()
//  Attaches the submit handler to #campForm.
//  Called once on DOMContentLoaded.
// ─────────────────────────────────────────────────────────────
export function initForm() {
    const form           = document.getElementById('campForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn      = document.getElementById('submitBtn');

    form.onsubmit = async (e) => {
        e.preventDefault();

        if (!_validateWeekSelection()) {
            alert('Please select at least one week or the drop-in option.');
            return;
        }

        if (!isDropinSelected() && !getPaymentMethod()) {
            alert('Please click a payment option (Venmo, Cash App, or PayPal) before submitting.');
            return;
        }

        _setSubmitting(submitBtn, true);

        try {
            const response = await fetch(FORMSPREE_URL, {
                method:  'POST',
                body:    new FormData(form),
                headers: { 'Accept': 'application/json' },
            });

            if (response.ok) {
                form.style.display           = 'none';
                successMessage.style.display = 'block';
                document.getElementById('top').scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Submission error. Please check your connection.');
                _setSubmitting(submitBtn, false);
            }
        } catch {
            alert('Network error.');
            _setSubmitting(submitBtn, false);
        }
    };
}

// ── Private helpers ───────────────────────────────────────────

function _validateWeekSelection() {
    const fullChk   = document.getElementById(FULL_ID);
    const dropinChk = document.getElementById(DROPIN_ID);
    const weekChks  = WEEK_IDS.map(id => document.getElementById(id));
    return fullChk.checked || dropinChk.checked || weekChks.some(c => c.checked);
}

function _setSubmitting(btn, isSubmitting) {
    btn.disabled   = isSubmitting;
    btn.innerText  = isSubmitting ? 'PROCESSING...' : 'SUBMIT REGISTRATION';
}
