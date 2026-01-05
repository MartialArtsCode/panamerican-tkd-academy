/**
 * API Configuration
 * Automatically detects local vs production environment
 */

// Backend API URL - update PRODUCTION_API_URL when you deploy your backend
const PRODUCTION_API_URL = 'https://your-backend-url.com'; // TODO: Update this when backend is deployed

const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

const API_BASE_URL = isLocalhost 
    ? 'http://localhost:3000' 
    : PRODUCTION_API_URL;

console.log(`🔧 Environment: ${isLocalhost ? 'Local' : 'Production'}`);
console.log(`🌐 API URL: ${API_BASE_URL}`);
