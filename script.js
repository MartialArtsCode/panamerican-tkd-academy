function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Show the selected section
  document.getElementById(sectionId).classList.add('active');
  
  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Simple cart functionality
let cart = [];

function addToCart(itemName) {
  cart.push(itemName);
  document.getElementById('cart-status').textContent = 
    `${itemName} added to cart! (${cart.length} items)`;
  
  // Clear message after 3 seconds
  setTimeout(() => {
    document.getElementById('cart-status').textContent = '';
  }, 3000);
}

// Show home section by default when page loads
window.onload = () => {
  showSection('home');
};

// Hamburger Menu Toggle
function initHamburgerMenu() {
	const hamburger = document.getElementById('hamburger');
	const navMenu = document.getElementById('navMenu');

	if (!hamburger || !navMenu) return;

	// Toggle menu on hamburger click
	hamburger.addEventListener('click', () => {
		hamburger.classList.toggle('active');
		navMenu.classList.toggle('active');
	});

	// Close menu when a link is clicked
	navMenu.querySelectorAll('a').forEach(link => {
		link.addEventListener('click', () => {
			hamburger.classList.remove('active');
			navMenu.classList.remove('active');
		});
	});

	// Close menu when clicking outside
	document.addEventListener('click', (e) => {
		if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
			hamburger.classList.remove('active');
			navMenu.classList.remove('active');
		}
	});
}

// Call on page load
window.addEventListener('load', () => {
	showSection('home');
	initHamburgerMenu();
});
