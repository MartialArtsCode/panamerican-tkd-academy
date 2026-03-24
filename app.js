// API Configuration and Utilities
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://panamerican-tkd-backend.onrender.com/api';

const api = {
    // Auth
    async login(email, password) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async register(userData) {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async getProfile() {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
    },

    // Feed
    async getFeed(page = 1) {
        return this._authFetch(`${API_BASE}/feed?page=${page}`);
    },

    async createPost(postData) {
        return this._authFetch(`${API_BASE}/feed`, 'POST', postData);
    },

    async likePost(postId) {
        return this._authFetch(`${API_BASE}/feed/${postId}/like`, 'POST');
    },

    async getComments(postId) {
        return this._authFetch(`${API_BASE}/feed/${postId}/comments`);
    },

    async addComment(postId, content) {
        return this._authFetch(`${API_BASE}/feed/${postId}/comments`, 'POST', { content });
    },

    // Events
    async getEvents(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this._authFetch(`${API_BASE}/events?${query}`);
    },

    async createEvent(eventData) {
        return this._authFetch(`${API_BASE}/events`, 'POST', eventData);
    },

    async rsvpEvent(eventId) {
        return this._authFetch(`${API_BASE}/events/${eventId}/rsvp`, 'POST');
    },

    // Forum
    async getThreads(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this._authFetch(`${API_BASE}/forum/threads?${query}`);
    },

    async getThread(threadId) {
        return this._authFetch(`${API_BASE}/forum/threads/${threadId}`);
    },

    async createThread(threadData) {
        return this._authFetch(`${API_BASE}/forum/threads`, 'POST', threadData);
    },

    async getReplies(threadId) {
        return this._authFetch(`${API_BASE}/forum/threads/${threadId}/replies`);
    },

    async addReply(threadId, content) {
        return this._authFetch(`${API_BASE}/forum/threads/${threadId}/replies`, 'POST', { content });
    },

    // Members
    async getMembers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this._authFetch(`${API_BASE}/members?${query}`);
    },

    async getMemberProfile(email) {
        return this._authFetch(`${API_BASE}/members/${email}`);
    },

    async updateProfile(email, updates) {
        return this._authFetch(`${API_BASE}/members/${email}`, 'PUT', updates);
    },

    // Notifications
    async getNotifications(unread = false) {
        return this._authFetch(`${API_BASE}/notifications?unread=${unread}`);
    },

    async markNotificationRead(notificationId) {
        return this._authFetch(`${API_BASE}/notifications/${notificationId}/read`, 'PUT');
    },

    async markAllRead() {
        return this._authFetch(`${API_BASE}/notifications/mark-all-read`, 'PUT');
    },

    // Classes
    async getClasses() {
        return this._authFetch(`${API_BASE}/classes`);
    },

    async getTrainingModules(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this._authFetch(`${API_BASE}/classes/training-modules?${query}`);
    },

    async completeModule(moduleId) {
        return this._authFetch(`${API_BASE}/classes/training-modules/${moduleId}/complete`, 'POST');
    },

    // Helper method
    async _authFetch(url, method = 'GET', body = null) {
        const token = localStorage.getItem('token');
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        if (body) options.body = JSON.stringify(body);
        
        const res = await fetch(url, options);
        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }
        return res.json();
    }
};

// Utility functions
const utils = {
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    formatDateTime(date) {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    },

    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [name, value] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / value);
            if (interval >= 1) {
                return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
            }
        }
        return 'just now';
    },

    getBeltColor(belt) {
        const colors = {
            'white': '#ffffff',
            'yellow': '#ffd700',
            'green': '#00a86b',
            'blue': '#0066cc',
            'red': '#cc0000',
            'black': '#000000'
        };
        return colors[belt?.toLowerCase()] || '#cccccc';
    },

    getTierBadge(tier) {
        const badges = {
            'student': { emoji: '🥋', color: '#3b82f6', label: 'Student' },
            'instructor': { emoji: '👊', color: '#8b5cf6', label: 'Instructor' },
            'master': { emoji: '🏆', color: '#ef4444', label: 'Master' }
        };
        return badges[tier] || badges.student;
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    }
};

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
            window.location.href = '/index.html';
        }
        return null;
    }

    try {
        const user = await api.getProfile();
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Auth failed:', error);
        utils.logout();
        return null;
    }
}

// Export for use in other files
window.api = api;
window.utils = utils;
window.checkAuth = checkAuth;
