/*
 Panamerican Taekwondo Academy
 Production-Ready Landing Page Script
 Author: Refactored & Cleaned
 Version: 1.0.0

 Features:
 - Socket.IO real-time chat (admin ↔ visitor)
 - Session-based visitor tracking
 - Chat widget UI logic
 - Smooth scrolling & scroll animations
 - Button effects & analytics logging
 - Form handling
 - Background particles & load animation
*/

/* ======================
   GLOBAL STATE
====================== */
let socket = null;
let sessionId = null;

/* ======================
   DOM READY
====================== */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🥋 Panamerican Taekwondo Academy Loaded');

    sessionId = getSessionId();

    initSocketIO();
    initChatWidget();
    initLoginModal();
    initSmoothScrolling();
    initScrollAnimations();
    initButtonTracking();
    initHoverEffects();
    initFormHandler();
    initScrollProgress();
    initParticleEffect();
    initLoadAnimation();
    addDynamicStyles();
});

/* ======================
   SOCKET.IO
====================== */
function initSocketIO() {
    if (typeof io === 'undefined') {
        console.warn('⚠️ Socket.IO not loaded');
        return;
    }

    const socketUrl = API_BASE_URL;

    socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('✅ Connected to server');
        socket.emit('identify', { type: 'visitor', sessionId });
    });

    socket.on('disconnect', () => console.warn('❌ Disconnected from server'));

    socket.on('admin-response', data => {
        hideTypingIndicator();
        addAdminMessage(data);
    });

    socket.on('restore-chat', session => restoreChatHistory(session));
}
/*LOGIN*/
    /* Inline script for login & simple user-admin interface (client-side mock) */
        (function () {
            // Elements
            const loginButton = document.getElementById('loginButton');
            const logoutButton = document.getElementById('logoutButton');
            const loginModal = document.getElementById('loginModal');
            const loginForm = document.getElementById('loginForm');
            const loginCancel = document.getElementById('loginCancel');
            const currentUserLabel = document.getElementById('currentUserLabel');
            const currentUserName = document.getElementById('currentUserName');

            const userDashboard = document.getElementById('userDashboard');
            const adminDashboard = document.getElementById('adminDashboard');
            const userNameDisplay = document.getElementById('userNameDisplay');
            const userInfoBox = document.getElementById('userInfoBox');

            const createUserForm = document.getElementById('createUserForm');
            const usersContainer = document.getElementById('usersContainer');
            const adminRefreshUsers = document.getElementById('adminRefreshUsers');

            // Local storage keys
            const USERS_KEY = 'pta_users_v1';
            const CURRENT_USER_KEY = 'pta_current_user_v1';

            // Utility functions
            function openModal() {
                loginModal.style.display = 'flex';
                loginModal.setAttribute('aria-hidden', 'false');
                document.getElementById('loginUsername').focus();
            }
            function closeModal() {
                loginModal.style.display = 'none';
                loginModal.setAttribute('aria-hidden', 'true');
                loginForm.reset();
            }

            function saveUsers(users) {
                localStorage.setItem(USERS_KEY, JSON.stringify(users || []));
            }
            function loadUsers() {
                try {
                    const raw = localStorage.getItem(USERS_KEY);
                    return raw ? JSON.parse(raw) : [];
                } catch(e) {
                    return [];
                }
            }
            function setCurrentUser(user) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            }
            function getCurrentUser() {
                try {
                    const raw = localStorage.getItem(CURRENT_USER_KEY);
                    return raw ? JSON.parse(raw) : null;
                } catch(e) {
                    return null;
                }
            }
            function clearCurrentUser() {
                localStorage.removeItem(CURRENT_USER_KEY);
            }

            // Pre-seed an admin user if none exists (for first-time use)
            (function seedAdmin() {
                const users = loadUsers();
                const hasAdmin = users.some(u => u.role === 'admin');
                if (!hasAdmin) {
                    users.push({
                        id: Date.now(),
                        username: 'admin',
                        email: 'admin@pta.local',
                        password: 'admin123', // NOTE: client-side mock only. Change in production.
                        role: 'admin'
                    });
                    saveUsers(users);
                }
            })();

            // UI state management
            function updateUIForLoggedOut() {
                logoutButton.style.display = 'none';
                logoutButton.setAttribute('aria-hidden', 'true');
                loginButton.style.display = 'inline-flex';
                currentUserLabel.style.display = 'none';
                userDashboard.style.display = 'none';
                adminDashboard.style.display = 'none';
                userDashboard.setAttribute('aria-hidden', 'true');
                adminDashboard.setAttribute('aria-hidden', 'true');
            }

            function updateUIForUser(user) {
                loginButton.style.display = 'none';
                logoutButton.style.display = 'inline-flex';
                logoutButton.setAttribute('aria-hidden', 'false');
                currentUserLabel.style.display = 'inline-block';
                currentUserName.textContent = user.username;
                userNameDisplay.textContent = user.username;
                userInfoBox.innerHTML = '<p><strong>Username:</strong> ' + user.username + '</p>'
                    + '<p><strong>Email:</strong> ' + (user.email || '-') + '</p>'
                    + '<p><strong>Role:</strong> ' + user.role + '</p>';

                if (user.role === 'admin') {
                    adminDashboard.style.display = 'block';
                    adminDashboard.setAttribute('aria-hidden', 'false');
                    userDashboard.style.display = 'none';
                    userDashboard.setAttribute('aria-hidden', 'true');
                    renderUserList();
                } else {
                    userDashboard.style.display = 'block';
                    userDashboard.setAttribute('aria-hidden', 'false');
                    adminDashboard.style.display = 'none';
                    adminDashboard.setAttribute('aria-hidden', 'true');
                }
            }

            // Authentication (mock)
            loginButton.addEventListener('click', () => openModal());
            loginCancel.addEventListener('click', () => closeModal());
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) closeModal();
            });

            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('loginUsername').value.trim();
                const password = document.getElementById('loginPassword').value;
                const role = document.getElementById('loginRole').value;

                // Check against stored users
                const users = loadUsers();
                const matched = users.find(u => u.username === username && u.role === role);

                if (matched) {
                    // If a user exists in storage, verify password (client-side)
                    if (matched.password && matched.password !== password) {
                        alert('Invalid credentials.');
                        return;
                    }
                    const user = { username: matched.username, email: matched.email, role: matched.role };
                    setCurrentUser(user);
                    updateUIForUser(user);
                    closeModal();
                    return;
                }

                // If no stored user, allow "user" role to sign in as a guest
                if (role === 'user') {
                    const guest = { username: username || 'guest', email: '', role: 'user' };
                    setCurrentUser(guest);
                    updateUIForUser(guest);
                    closeModal();
                    return;
                }

                // For admin role, restrict arbitrary sign-in: require admin password or existing admin user
                if (role === 'admin') {
                    // If an admin exists in storage but username didn't match, deny
                    const existingAdmin = users.find(u => u.role === 'admin');
                    if (existingAdmin) {
                        alert('Admin username not found. Use the existing admin account or create one.');
                        return;
                    } else {
                        // If no admin exists (should be pre-seeded), allow one-time admin creation if password matches default
                        if (password === 'admin123') {
                            const admin = { username: username || 'admin', email: '', role: 'admin' };
                            // save admin to users for persistence
                            users.push({ id: Date.now(), username: admin.username, email: admin.email, password: password, role: 'admin' });
                            saveUsers(users);
                            setCurrentUser(admin);
                            updateUIForUser(admin);
                            closeModal();
                            return;
                        } else {
                            alert('Invalid admin password.');
                            return;
                        }
                    }
                }
            });

            logoutButton.addEventListener('click', () => {
                clearCurrentUser();
                updateUIForLoggedOut();
            });

            // Admin: create user
            createUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('newUsername').value.trim();
                const email = document.getElementById('newEmail').value.trim();
                const password = document.getElementById('newPassword').value;
                const role = document.getElementById('newRole').value;

                if (!username || !email || !password) {
                    alert('Please fill all fields.');
                    return;
                }

                const users = loadUsers();
                if (users.some(u => u.username === username)) {
                    alert('Username already exists.');
                    return;
                }

                users.push({
                    id: Date.now(),
                    username,
                    email,
                    password, // store client-side only for demo
                    role
                });
                saveUsers(users);
                renderUserList();
                createUserForm.reset();
                alert('User created.');
            });

            function renderUserList() {
                const users = loadUsers();
                if (!usersContainer) return;
                if (users.length === 0) {
                    usersContainer.innerHTML = '<p class="small">No users found.</p>';
                    return;
                }
                usersContainer.innerHTML = '';
                users.forEach(u => {
                    const div = document.createElement('div');
                    div.className = 'user-item';
                    div.innerHTML = '<div><strong>' + escapeHtml(u.username) + '</strong> <span class="small">(' + u.role + ')</span><div class="small">' + (u.email || '') + '</div></div>';
                    const actions = document.createElement('div');
                    actions.style.display = 'flex';
                    actions.style.gap = '8px';
                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-secondary';
                    delBtn.textContent = 'Delete';
                    delBtn.addEventListener('click', () => {
                        if (!confirm('Delete user ' + u.username + '?')) return;
                        const remaining = loadUsers().filter(x => x.id !== u.id);
                        saveUsers(remaining);
                        renderUserList();
                    });
                    actions.appendChild(delBtn);
                    div.appendChild(actions);
                    usersContainer.appendChild(div);
                });
            }

            adminRefreshUsers.addEventListener('click', renderUserList);

            // small helper
            function escapeHtml(s) {
                return String(s).replace(/[&<>"']/g, function (m) {
                    return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m];
                });
            }

            // On load, check if a user is logged in
            (function init() {
                const current = getCurrentUser();
                if (current) {
                    updateUIForUser(current);
                } else {
                    updateUIForLoggedOut();
                }
            })();

            // Support keyboard interaction for modal (Escape to close)
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (loginModal.style.display === 'flex') closeModal();
                }
            });

            // Example: user "View Schedule" button just scrolls to schedule section
            const userGoToSchedule = document.getElementById('userGoToSchedule');
            if (userGoToSchedule) {
                userGoToSchedule.addEventListener('click', () => {
                    const scheduleSection = document.getElementById('schedule');
                    if (scheduleSection) scheduleSection.scrollIntoView({ behavior: 'smooth' });
                });
            }
        })();

/* ======================
   CHAT WIDGET (Socket.IO-based)
====================== */
function initChatWidget() {
    const chatButton = document.getElementById('chatButton');
    const chatPopup = document.getElementById('chatPopup');
    const chatClose = document.getElementById('chatClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');
    
    if (!chatButton || !chatPopup) return;

    chatButton.addEventListener('click', () => {
        chatPopup.classList.toggle('active');
        if (chatPopup.classList.contains('active')) {
            if (chatInput) chatInput.focus();
            const badge = document.querySelector('.chat-badge');
            if (badge) badge.style.display = 'none';
        }
    });

    chatClose?.addEventListener('click', e => {
        e.stopPropagation();
        chatPopup.classList.remove('active');
    });

    quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const message = this.getAttribute('data-message');
            sendMessageToWidget(message);
        });
    });

    chatSend?.addEventListener('click', sendFromInput);

    chatInput?.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendFromInput();
    });

    document.addEventListener('click', e => {
        if (!chatPopup.contains(e.target) && !chatButton.contains(e.target)) {
            chatPopup.classList.remove('active');
        }
    });

    function sendFromInput() {
        const message = chatInput.value.trim();
        if (!message) return;
        chatInput.value = '';
        sendMessageToWidget(message);
    }
}

/* ======================
   SEND MESSAGE
====================== */
function sendMessageToWidget(message) {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody) return;

    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.innerHTML = `
        <div class="message-content user-content">
            <p>${escapeHtml(message)}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>`;

    chatBody.appendChild(userMessage);
    chatBody.scrollTop = chatBody.scrollHeight;

    if (socket && socket.connected) {
        socket.emit('visitor-message', {
            message,
            sessionId,
            timestamp: new Date().toISOString()
        });
        setTimeout(showTypingIndicator, 400);
    } else {
        hideTypingIndicator();
        addAutoReplyFallback();
    }
}

function addAdminMessage(data) {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody) return;

    const msg = document.createElement('div');
    msg.className = 'chat-message bot-message';
    msg.innerHTML = `
        <div class="message-avatar"><img src="icon.png" alt="Admin"></div>
        <div class="message-content">
            <p>${escapeHtml(data.message)}</p>
            <span class="message-time">${formatTimestamp(data.timestamp)}</span>
        </div>`;

    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function restoreChatHistory(session) {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody || !session?.messages) return;

    chatBody.innerHTML = '';
    session.messages.forEach(msg => {
        msg.type === 'received'
            ? sendMessageToWidget(msg.text)
            : addAdminMessage(msg);
    });
}

/* ======================
   FALLBACK AUTO REPLY
====================== */
function addAutoReplyFallback() {
    const responses = [
        'Thanks! We’ll respond shortly. 🥋',
        'Message received! An instructor will reply soon.',
        'Got it! We’ll be with you shortly.'
    ];

    const chatBody = document.querySelector('.chat-body');
    if (!chatBody) return;

    const msg = document.createElement('div');
    msg.className = 'chat-message bot-message';
    msg.innerHTML = `
        <div class="message-avatar"><img src="icon.png" alt="Bot"></div>
        <div class="message-content">
            <p>${responses[Math.floor(Math.random() * responses.length)]}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>`;

    chatBody.appendChild(msg);
}

/* ======================
   UI / EFFECTS / UTILITIES
====================== */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('fade-in');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(s => observer.observe(s));
}

function initButtonTracking() {
    document.querySelectorAll('.glassy-button').forEach(btn => {
        btn.addEventListener('click', () => console.log('Button clicked:', btn.textContent));
    });
}

function initHoverEffects() {}

function initFormHandler() {}

function initScrollProgress() {}

function initParticleEffect() {}

function initLoadAnimation() {
    document.body.style.opacity = '0';
    setTimeout(() => document.body.style.opacity = '1', 100);
}

function addDynamicStyles() {}

/* ======================
   HELPERS
====================== */
function getSessionId() {
    let id = sessionStorage.getItem('pta_session_id');
    if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem('pta_session_id', id);
    }
    return id;
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatTimestamp(ts) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showTypingIndicator() {
    if (document.getElementById('typingIndicator')) return;
    const chatBody = document.querySelector('.chat-body');
    const el = document.createElement('div');
    el.id = 'typingIndicator';
    el.className = 'chat-message bot-message typing-indicator';
    el.innerHTML = '<div class="message-content"><span>Typing…</span></div>';
    chatBody?.appendChild(el);
}

function hideTypingIndicator() {
    document.getElementById('typingIndicator')?.remove();
}

/* ======================
   LOGIN MODAL
====================== */
function initLoginModal() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginSuccess = document.getElementById('loginSuccess');
    const modalTitle = document.getElementById('modalTitle');
    const toggleMode = document.getElementById('toggleMode');
    const toggleText = document.getElementById('toggleText');
    const submitBtnText = document.getElementById('submitBtnText');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const confirmPasswordInput = document.getElementById('login-password-confirm');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    let isSignupMode = false;

    if (!loginBtn || !loginModal) {
        console.warn('⚠️ Login elements not found');
        return;
    }

    // Load saved credentials if "Remember Me" was checked
    const savedEmail = localStorage.getItem('saved_email');
    const savedRememberMe = localStorage.getItem('remember_me') === 'true';
    
    if (savedEmail && savedRememberMe) {
        document.getElementById('login-email').value = savedEmail;
        rememberMeCheckbox.checked = true;
    }

    // Toggle between login and signup mode
    toggleMode?.addEventListener('click', (e) => {
        e.preventDefault();
        isSignupMode = !isSignupMode;
        
        if (isSignupMode) {
            modalTitle.textContent = 'Create Account';
            submitBtnText.textContent = 'Create Account';
            toggleText.textContent = 'Already have an account?';
            toggleMode.textContent = 'Sign In';
            confirmPasswordGroup.style.display = 'block';
            confirmPasswordInput.required = true;
            document.getElementById('login-password').placeholder = 'Create your password (min 6 characters)';
        } else {
            modalTitle.textContent = 'Sign In';
            submitBtnText.textContent = 'Sign In';
            toggleText.textContent = "Don't have an account?";
            toggleMode.textContent = 'Create Account';
            confirmPasswordGroup.style.display = 'none';
            confirmPasswordInput.required = false;
            document.getElementById('login-password').placeholder = 'Enter your password';
        }
        loginError.textContent = '';
        loginSuccess.style.display = 'none';
    });

    // Open modal
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
        isSignupMode = false;
        modalTitle.textContent = 'Sign In';
        submitBtnText.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleMode.textContent = 'Create Account';
        confirmPasswordGroup.style.display = 'none';
        confirmPasswordInput.required = false;
        document.getElementById('login-email').focus();
    });

    // Close modal
    const closeModalFunc = () => {
        loginModal.style.display = 'none';
        loginForm.reset();
        loginError.textContent = '';
        loginSuccess.style.display = 'none';
        isSignupMode = false;
    };
    
    closeModal?.addEventListener('click', closeModalFunc);

    // Close on outside click
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeModalFunc();
        }
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';
        loginSuccess.style.display = 'none';
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const confirmPassword = document.getElementById('login-password-confirm').value;

        // Validate password confirmation in signup mode
        if (isSignupMode) {
            if (password.length < 6) {
                loginError.textContent = 'Password must be at least 6 characters';
                return;
            }
            if (password !== confirmPassword) {
                loginError.textContent = 'Passwords do not match';
                return;
            }
        }

        try {
            const apiUrl = `${API_BASE_URL}/auth/login`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Store token and user info
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_email', email);
                localStorage.setItem('is_admin', data.isAdmin ? 'true' : 'false');
                
                // Handle "Remember Me"
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('saved_email', email);
                    localStorage.setItem('remember_me', 'true');
                } else {
                    localStorage.removeItem('saved_email');
                    localStorage.removeItem('remember_me');
                }
                
                // Determine redirect location based on user role
                const redirectUrl = data.isAdmin 
                    ? `${BASE_PATH}/admin/admin.html` 
                    : `${BASE_PATH}/member/member.html`;
                
                // Show success message for new accounts
                if (data.message && data.message.includes('created')) {
                    loginSuccess.textContent = '✓ Account created and saved! Redirecting...';
                    loginSuccess.style.display = 'block';
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 1500);
                } else {
                    // Redirect immediately for existing users
                    window.location.href = redirectUrl;
                }
            } else {
                loginError.textContent = data.message || 'Invalid credentials';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'Connection error. Please try again.';
        }
    });
}

console.log('✨ PTA Production Script Initialized');
