// Admin Panel JavaScript
let socket = null;
let authToken = null;
let currentSessionId = null;
let activeSessions = new Map();

// Backend API URL - adjust based on environment
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:4000' 
    : window.location.origin;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Admin Panel Initialized');
    
    // Check if already logged in
    checkAuth();
    
    // Setup event listeners
    setupLoginForm();
    setupTabNavigation();
    setupLogout();
    setupUserManagement();
});

/**
 * Check if user is already authenticated
 */
function checkAuth() {
    authToken = localStorage.getItem('admin_token');
    const adminEmail = localStorage.getItem('admin_email');
    
    if (authToken && adminEmail) {
        showDashboard(adminEmail);
    }
}

/**
 * Setup login form
 */
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        errorDiv.textContent = '';
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
                // Store token and email
                localStorage.setItem('admin_token', data.token);
                localStorage.setItem('admin_email', email);
                authToken = data.token;
                
                // Show dashboard
                showDashboard(email);
            } else {
                errorDiv.textContent = data.message || 'Login failed. Please check your credentials.';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Connection error. Please make sure the backend server is running.';
        }
    });
}

/**
 * Show admin dashboard
 */
function showDashboard(email) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminEmail').textContent = email;
    
    // Initialize Socket.IO
    initSocketIO();
    
    // Load initial data
    loadUsers();
}

/**
 * Initialize Socket.IO connection
 */
function initSocketIO() {
    const socketUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : window.location.origin;
    
    socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });
    
    console.log('🔌 Connecting to Socket.IO:', socketUrl);
    
    socket.on('connect', () => {
        console.log('✅ Admin connected to Socket.IO');
        socket.emit('identify', { type: 'admin' });
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Admin disconnected from Socket.IO');
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
    });
    
    // Listen for visitor messages
    socket.on('new-visitor-message', (data) => {
        console.log('📨 New visitor message:', data);
        handleNewVisitorMessage(data);
    });
    
    // Listen for active sessions
    socket.on('active-sessions', (sessions) => {
        console.log('👥 Active sessions:', sessions);
        updateSessionsList(sessions);
    });
    
    // Setup chat input
    setupChatInput();
}

/**
 * Handle new visitor message
 */
function handleNewVisitorMessage(data) {
    const { sessionId, message, timestamp } = data;
    
    // Update session in the list
    if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, {
            sessionId,
            messages: [],
            lastMessage: message,
            lastTime: timestamp,
            unreadCount: 0
        });
    }
    
    const session = activeSessions.get(sessionId);
    session.messages.push({ type: 'visitor', text: message, timestamp });
    session.lastMessage = message;
    session.lastTime = timestamp;
    session.unreadCount++;
    
    // Update UI
    updateSessionsList(Array.from(activeSessions.values()));
    
    // Update badge
    updateChatBadge();
    
    // If this is the active session, display the message
    if (currentSessionId === sessionId) {
        displayMessage('visitor', message, timestamp);
    }
}

/**
 * Update sessions list
 */
function updateSessionsList(sessions) {
    const sessionsList = document.getElementById('sessionsList');
    const sessionCount = document.getElementById('sessionCount');
    
    if (!sessions || sessions.length === 0) {
        sessionsList.innerHTML = '<p class="no-sessions">No active sessions</p>';
        sessionCount.textContent = '0';
        return;
    }
    
    sessionCount.textContent = sessions.length;
    
    sessionsList.innerHTML = sessions.map(session => {
        const isActive = session.sessionId === currentSessionId ? 'active' : '';
        const unreadBadge = session.unreadCount > 0 
            ? `<span class="unread-count">${session.unreadCount}</span>` 
            : '';
        
        return `
            <div class="session-item ${isActive}" data-session-id="${session.sessionId}">
                <div class="session-header">
                    <span class="session-id">Session ${session.sessionId.slice(-8)}</span>
                    ${unreadBadge}
                </div>
                <div class="session-time">${formatTime(session.lastTime)}</div>
                <div class="session-preview">${escapeHtml(session.lastMessage || 'No messages yet')}</div>
            </div>
        `;
    }).join('');
    
    // Add click listeners
    document.querySelectorAll('.session-item').forEach(item => {
        item.addEventListener('click', function() {
            const sessionId = this.getAttribute('data-session-id');
            selectSession(sessionId);
        });
    });
}

/**
 * Select a session
 */
function selectSession(sessionId) {
    currentSessionId = sessionId;
    
    // Update active state
    document.querySelectorAll('.session-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-session-id') === sessionId) {
            item.classList.add('active');
        }
    });
    
    // Display chat
    displayChat(sessionId);
    
    // Clear unread count
    if (activeSessions.has(sessionId)) {
        activeSessions.get(sessionId).unreadCount = 0;
        updateSessionsList(Array.from(activeSessions.values()));
        updateChatBadge();
    }
}

/**
 * Display chat for a session
 */
function displayChat(sessionId) {
    const chatMessages = document.getElementById('chatMessages');
    const chatTitle = document.getElementById('activeChatTitle');
    const chatInputArea = document.getElementById('chatInputArea');
    
    chatTitle.textContent = `Session ${sessionId.slice(-8)}`;
    chatInputArea.style.display = 'flex';
    
    const session = activeSessions.get(sessionId);
    if (!session || !session.messages || session.messages.length === 0) {
        chatMessages.innerHTML = '<div class="no-chat-selected"><i class="fas fa-comments"></i><p>No messages yet</p></div>';
        return;
    }
    
    chatMessages.innerHTML = session.messages.map(msg => {
        const messageClass = msg.type === 'visitor' ? 'visitor' : 'admin';
        return `
            <div class="message ${messageClass}">
                <div class="message-bubble">
                    <div class="message-text">${escapeHtml(msg.text)}</div>
                    <div class="message-time">${formatTime(msg.timestamp)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Display a single message
 */
function displayMessage(type, text, timestamp) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove "no messages" placeholder if exists
    const noChat = chatMessages.querySelector('.no-chat-selected');
    if (noChat) {
        noChat.remove();
    }
    
    const messageClass = type === 'visitor' ? 'visitor' : 'admin';
    const messageElement = document.createElement('div');
    messageElement.className = `message ${messageClass}`;
    messageElement.innerHTML = `
        <div class="message-bubble">
            <div class="message-text">${escapeHtml(text)}</div>
            <div class="message-time">${formatTime(timestamp)}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Setup chat input
 */
function setupChatInput() {
    const sendBtn = document.getElementById('sendMessageBtn');
    const input = document.getElementById('adminMessageInput');
    
    if (!sendBtn || !input) return;
    
    sendBtn.addEventListener('click', sendAdminMessage);
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendAdminMessage();
        }
    });
}

/**
 * Send admin message
 */
function sendAdminMessage() {
    const input = document.getElementById('adminMessageInput');
    const message = input.value.trim();
    
    if (!message || !currentSessionId) return;
    
    const messageData = {
        sessionId: currentSessionId,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    // Send via Socket.IO
    if (socket && socket.connected) {
        socket.emit('admin-response', messageData);
        console.log('📤 Admin message sent:', message);
        
        // Add to local session
        if (activeSessions.has(currentSessionId)) {
            activeSessions.get(currentSessionId).messages.push({
                type: 'admin',
                text: message,
                timestamp: messageData.timestamp
            });
        }
        
        // Display the message
        displayMessage('admin', message, messageData.timestamp);
        
        // Clear input
        input.value = '';
    } else {
        console.error('❌ Not connected to Socket.IO');
        alert('Not connected to server. Please refresh the page.');
    }
}

/**
 * Update chat badge
 */
function updateChatBadge() {
    const badge = document.getElementById('chatBadge');
    let totalUnread = 0;
    
    activeSessions.forEach(session => {
        totalUnread += session.unreadCount || 0;
    });
    
    badge.textContent = totalUnread;
    badge.style.display = totalUnread > 0 ? 'inline' : 'none';
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const contentId = tabName + 'Tab';
            const content = document.getElementById(contentId);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

/**
 * Setup logout
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', function() {
        // Clear storage
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
        authToken = null;
        
        // Disconnect socket
        if (socket) {
            socket.disconnect();
        }
        
        // Show login
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('loginContainer').style.display = 'flex';
        
        // Reset form
        document.getElementById('loginForm').reset();
    });
}

/**
 * Setup user management
 */
function setupUserManagement() {
    const addUserBtn = document.getElementById('addUserBtn');
    const addUserModal = document.getElementById('addUserModal');
    const cancelBtn = document.getElementById('cancelAddUser');
    const closeBtn = addUserModal.querySelector('.close');
    const addUserForm = document.getElementById('addUserForm');
    
    // Open modal
    addUserBtn.addEventListener('click', function() {
        addUserModal.classList.add('active');
    });
    
    // Close modal
    closeBtn.addEventListener('click', function() {
        addUserModal.classList.remove('active');
    });
    
    cancelBtn.addEventListener('click', function() {
        addUserModal.classList.remove('active');
    });
    
    // Submit form
    addUserForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('newUserEmail').value;
        const password = document.getElementById('newUserPassword').value;
        
        try {
            const response = await fetch(`${API_URL}/admin/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('User created successfully!');
                addUserModal.classList.remove('active');
                addUserForm.reset();
                loadUsers();
            } else {
                alert(data.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Connection error');
        }
    });
}

/**
 * Load users
 */
async function loadUsers() {
    // This would require a new backend endpoint to list users
    // For now, we'll show a placeholder
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="no-data">User list endpoint not yet implemented</td></tr>';
}

/**
 * Delete user
 */
async function deleteUser(email) {
    if (!confirm(`Are you sure you want to delete user: ${email}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/remove-user`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('User deleted successfully!');
            loadUsers();
        } else {
            alert(data.message || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Connection error');
    }
}

/**
 * Utility: Format timestamp
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✨ Admin Panel JavaScript Loaded');
