// Fade-in trainer cards as they enter the viewport
(function () {
    var cards = document.querySelectorAll('.trainer-card');

    if (!cards.length) return;

    // If IntersectionObserver is available, use it for scroll-triggered animation
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // Stagger each card by its index
                    var index = Array.prototype.indexOf.call(cards, entry.target);
                    setTimeout(function () {
                        entry.target.classList.add('visible');
                    }, index * 120);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        cards.forEach(function (card) {
            observer.observe(card);
        });
    } else {
        // Fallback: make all cards visible immediately
        cards.forEach(function (card) {
            card.classList.add('visible');
        });
    }
})();
