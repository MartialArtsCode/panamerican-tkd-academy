
/**
 * API Configuration
 * Automatically detects local vs production environment
 */

// Backend API URL - configured for Render.com deployment
const PRODUCTION_API_URL = 'https://pta-backend-6ncd.onrender.com'; 'https://github.com/MartialArtsCode/panamerican-tkd-academy/backend/config/config.js';

const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

const API_BASE_URL = isLocalhost 
    ? 'http://localhost:3000' 
    : PRODUCTION_API_URL;

// Base path for GitHub Pages (repository name)
// Check if we're on GitHub Pages, then always use the repo base path
const BASE_PATH = window.location.hostname.includes('github.io') 
    ? '/panamerican-tkd-academy' 
    : '';

console.log(`🔧 Environment: ${isLocalhost ? 'Local' : 'Production'}`);
console.log(`🌐 API URL: ${API_BASE_URL}`);
console.log(`📁 Base Path: ${BASE_PATH || '(root)'}`);
console.log(`🌍 Full URL: ${window.location.href}`);
