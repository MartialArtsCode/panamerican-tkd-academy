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
