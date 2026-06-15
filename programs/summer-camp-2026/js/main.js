// ─────────────────────────────────────────────────────────────
//  main.js  —  Application entry point
//              Imports all modules and initializes them in
//              dependency order once the DOM is ready.
// ─────────────────────────────────────────────────────────────

import { initSidebar }        from './pricing.js';
import { initWeeks }          from './weeks.js';
import { initPaymentButtons } from './payment.js';
import { initForm }           from './form.js';

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();        // 1. Populate rate display in info panel
    initWeeks();          // 2. Wire week-checkbox mutual exclusivity
    initPaymentButtons(); // 3. Wire pay-button click tracking
    initForm();           // 4. Wire form validation + submission
});
