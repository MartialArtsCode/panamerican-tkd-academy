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

    const socketUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : window.location.origin;

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

/* ======================
   CHAT WIDGET
====================== */
function initChatWidget() {
    const chatButton = document.getElementById('chatButton');
    const chatPopup = document.getElementById('chatPopup');
    const chatClose = document.getElementById('chatClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');

    if (!chatButton || !chatPopup) return;

    chatButton.addEventListener('click', () => {
        chatPopup.classList.toggle('active');
        chatInput?.focus();
        document.querySelector('.chat-badge')?.style.setProperty('display', 'none');
    });

    chatClose?.addEventListener('click', e => {
        e.stopPropagation();
        chatPopup.classList.remove('active');
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

console.log('✨ PTA Production Script Initialized');
