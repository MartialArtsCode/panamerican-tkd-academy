/* ====================================
   NAVIGATION & SECTION MANAGEMENT
   ==================================== */

/**
 * Show a specific section and hide all others
 * @param {string} sectionId - The ID of the section to display
 */
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  // Show the selected section
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    console.warn(`Section with ID "${sectionId}" not found`);
  }
}

/* ====================================
   HAMBURGER MENU FUNCTIONALITY
   ==================================== */

/**
 * Initialize hamburger menu toggle functionality
 */
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (!hamburger || !navMenu) {
    console.warn('Hamburger menu elements not found');
    return;
  }

  // Toggle menu on hamburger click
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
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

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

/* ====================================
   SHOPPING CART FUNCTIONALITY
   ==================================== */

let cart = [];

/**
 * Add an item to the shopping cart
 * @param {string} itemName - The name of the item to add
 */
function addToCart(itemName) {
  if (!itemName) {
    console.error('Item name is required');
    return;
  }

  cart.push(itemName);

  const cartStatus = document.getElementById('cart-status');
  if (cartStatus) {
    const itemCount = cart.length;
    cartStatus.textContent = `${itemName} added to cart! (${itemCount} item${itemCount !== 1 ? 's' : ''})`;

    // Clear message after 3 seconds
    setTimeout(() => {
      cartStatus.textContent = '';
    }, 3000);
  } else {
    console.warn('Cart status element not found');
  }
}

/* ====================================
   PAGE INITIALIZATION
   ==================================== */

/**
 * Initialize all page functionality when DOM is ready
 */
function initializePage() {
  showSection('home');
  initHamburgerMenu();
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializePage);
