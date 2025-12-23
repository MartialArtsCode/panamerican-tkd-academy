// Panamerican Taekwondo Academy - Combined Professional Landing Page

// Socket.IO connection
let socket = null;
let sessionId = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🥋 Panamerican Taekwondo Academy - Website Loaded');
    
    // Initialize Socket.IO
    initSocketIO();
    
    // Initialize all features
    initSmoothScrolling();
    initScrollAnimations();
    initButtonTracking();
    initHoverEffects();
    initFormHandler();
    addDynamicStyles();
    initParticleEffect();
    initLoadAnimation();
});

/**
 * Initialize Socket.IO connection
 */
function initSocketIO() {
    sessionId = getSessionId();
    // Use current host for production, fallback to localhost for dev
    const socketUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : window.location.origin;
    
    socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });
    
    console.log('🔌 Connecting to:', socketUrl);
    
    socket.on('connect', () => {
        console.log('✅ Connected to server');
        socket.emit('identify', { type: 'visitor', sessionId: sessionId });
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        console.error('⚠️ Make sure the server is running: npm start');
    });
    
    socket.on('admin-response', (data) => {
        console.log('💬 Admin response received:', data);
        hideTypingIndicator();
        addAdminMessage(data.message);
    });
    
    socket.on('restore-chat', (session) => {
        console.log('📋 Restoring previous chat');
        restoreChatHistory(session);
    });
}

/**
 * Restore chat history from server
 */
function restoreChatHistory(session) {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody || !session.messages || session.messages.length === 0) return;
    
    // Clear existing messages
    chatBody.innerHTML = '';
    
    // Add welcome message
    addWelcomeMessage();
    
    // Restore messages
    session.messages.forEach(msg => {
        if (msg.type === 'received') {
            // User message
            const userMessage = document.createElement('div');
            userMessage.className = 'chat-message user-message';
            userMessage.innerHTML = `
                <div class="message-content user-content">
                    <p>${escapeHtml(msg.text)}</p>
                    <span class="message-time">${formatTimestamp(msg.timestamp)}</span>
                </div>
            `;
            chatBody.appendChild(userMessage);
        } else {
            // Admin message
            addAdminMessage(msg);
        }
    });
    
    chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * Add admin message to chat
 */
function addAdminMessage(message) {
    const chatBody = document.querySelector('.chat-body');
    const adminMessage = document.createElement('div');
    adminMessage.className = 'chat-message bot-message';
    adminMessage.innerHTML = `
        <div class="message-avatar">
            <img src="icon.png" alt="Admin">
        </div>
        <div class="message-content">
            <p>${escapeHtml(message.text)}</p>
            <span class="message-time">${formatTimestamp(message.timestamp)}</span>
        </div>
    `;
    chatBody.appendChild(adminMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * Format timestamp
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Enable smooth scrolling for internal links
 */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Chat Widget Functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatButton = document.getElementById('chatButton');
    const chatPopup = document.getElementById('chatPopup');
    const chatClose = document.getElementById('chatClose');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.querySelector('.chat-body');
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');

    // Toggle chat popup
    chatButton.addEventListener('click', function() {
        chatPopup.classList.toggle('active');
        // Remove badge when opened
        document.querySelector('.chat-badge').style.display = 'none';
    });

    // Close chat popup
    chatClose.addEventListener('click', function() {
        chatPopup.classList.remove('active');
    });

    // Handle quick reply buttons
    quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const message = this.getAttribute('data-message');
            sendMessage(message);
        });
    });

    // Handle chat input
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value. trim() !== '') {
            sendMessage(this.value);
            this.value = '';
        }
    });

    // Function to send message
    function sendMessage(message) {
        // Add user message to chat
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user-message';
        userMessageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">Just now</span>
            </div>
        `;
        chatBody.appendChild(userMessageDiv);
        chatBody.scrollTop = chatBody. scrollHeight;

        // Simulate bot response (you can replace this with actual backend logic)
        setTimeout(() => {
            addBotResponse(message);
        }, 1000);
    }

    // Function to add bot response
    function addBotResponse(userMessage) {
        let response = '';
        
        // Simple response logic based on keywords
        if (userMessage.toLowerCase().includes('trial')) {
            response = 'Great! You can schedule a free trial by filling out the form below or calling us at (336) 624-8499. When would you like to come in?';
        } else if (userMessage.toLowerCase().includes('program')) {
            response = 'We offer programs for all ages:  Power Up (all ages), Little Ninjas (5-9), Dragons (10-17), and Core (18+). Which age group are you interested in?';
        } else if (userMessage.toLowerCase().includes('schedule')) {
            response = 'We have classes Monday-Friday from 4:00 PM - 8:00 PM and Saturday 8:30 AM - 10:30 AM. Check our schedule section above for specific class times! ';
        } else {
            response = 'Thanks for your message! For immediate assistance, please call us at (336) 624-8499 or text us.  One of our instructors will be happy to help! ';
        }

        const botMessageDiv = document.createElement('div');
        botMessageDiv. className = 'chat-message bot-message';
        botMessageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="icon.png" alt="Bot">
            </div>
            <div class="message-content">
                <p>${response}</p>
                <span class="message-time">Just now</span>
            </div>
        `;
        chatBody.appendChild(botMessageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});

/**
 * Add animations when elements come into view
 */
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Add staggered animation for buttons
                const buttons = entry.target.querySelectorAll('.glassy-button');
                buttons.forEach((btn, index) => {
                    setTimeout(() => {
                        btn.style.animation = `fadeInUp 0.6s ease forwards`;
                    }, index * 100);
                });
                
                // Add staggered animation for program cards
                const cards = entry.target.querySelectorAll('.program-card, .achievement-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.animation = `fadeInUp 0.6s ease forwards`;
                    }, index * 150);
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

/**
 * Track button clicks for analytics
 */
function initButtonTracking() {
    const buttons = document.querySelectorAll('.glassy-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const buttonHref = this.getAttribute('href');
            
            // Log click event
            console.log(`✅ Button clicked: ${buttonText}`, {
                href: buttonHref,
                timestamp: new Date().toISOString()
            });
            
            // Add success animation
            this.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 300);
        });
    });
}

/**
 * Add enhanced hover effects to buttons
 */
function initHoverEffects() {
    const buttons = document.querySelectorAll('.glassy-button');
    
    buttons.forEach(button => {
        // Add ripple effect on click
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Add 3D tilt effect on mouse move
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.05)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

/**
 * Handle form submission
 */
function initFormHandler() {
    const form = document.getElementById('trial-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // Allow form to submit naturally to FormSubmit
            // No e.preventDefault() - let it submit to the email service
            
            // Log submission
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const ageGroup = document.getElementById('age-group').value;
            
            console.log('✅ Form submitted to panamericantkd22@gmail.com:', {
                name,
                email,
                phone,
                ageGroup,
                timestamp: new Date().toISOString()
            });
            
            // Show success message
            alert('Thank you! Your trial class request has been submitted. We will contact you soon!');
        });
        
        // Add real-time validation
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.style.borderColor = '#cc1f2b';
                } else {
                    this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
            });
        });
    }
}

/**
 * Add dynamic styles and animations
 */
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .particle {
            position: fixed;
            background: radial-gradient(circle, rgba(204, 31, 43, 0.4), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            filter: blur(2px);
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0) translateX(0);
                opacity: 0.2;
            }
            50% {
                transform: translateY(-30px) translateX(15px);
                opacity: 0.5;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Add subtle particle/glow effects to background
 */
function initParticleEffect() {
    const particleCount = 12;
    const body = document.body;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 80 + 40;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 4 + 3}s infinite ease-in-out`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        body.appendChild(particle);
    }
}

/**
 * Add loading animation
 */
function initLoadAnimation() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
}

/**
 * Utility: Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Add scroll progress indicator
 */
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background: linear-gradient(90deg, #cc1f2b, #ff2d3d);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', debounce(function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    }, 10));
}

// Initialize scroll progress
initScrollProgress();

/**
 * Initialize chat widget functionality
 */
function initChatWidget() {
    const chatButton = document.getElementById('chatButton');
    const chatPopup = document.getElementById('chatPopup');
    const chatClose = document.getElementById('chatClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');
    
    // Toggle chat popup
    chatButton.addEventListener('click', function() {
        chatPopup.classList.toggle('active');
        if (chatPopup.classList.contains('active')) {
            chatInput.focus();
            // Hide badge when opened
            const badge = document.querySelector('.chat-badge');
            if (badge) {
                badge.style.display = 'none';
            }
        }
    });
    
    // Close chat popup
    chatClose.addEventListener('click', function(e) {
        e.stopPropagation();
        chatPopup.classList.remove('active');
    });
    
    // Handle quick reply buttons
    quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const message = this.getAttribute('data-message');
            sendMessageToWidget(message);
        });
    });
    
    // Handle send button
    chatSend.addEventListener('click', function() {
        const message = chatInput.value.trim();
        if (message) {
            sendMessageToWidget(message);
            chatInput.value = '';
        }
    });
    
    // Handle Enter key in input
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const message = chatInput.value.trim();
            if (message) {
                sendMessageToWidget(message);
                chatInput.value = '';
            }
        }
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        if (!chatPopup.contains(e.target) && !chatButton.contains(e.target)) {
            chatPopup.classList.remove('active');
        }
    });
    
    // Add typing animation
    chatInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            chatSend.style.transform = 'scale(1.1)';
        } else {
            chatSend.style.transform = 'scale(1)';
        }
    });
}

/**
 * Generate or retrieve session ID
 */
function getSessionId() {
    let sessionId = sessionStorage.getItem('pta_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('pta_session_id', sessionId);
    }
    return sessionId;
}

/**
 * Send message to chat widget and notify admin app
 */
function sendMessageToWidget(message) {
    const chatBody = document.querySelector('.chat-body');
    
    // Add user message to chat
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.innerHTML = `
        <div class="message-content user-content">
            <p>${escapeHtml(message)}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
    `;
    chatBody.appendChild(userMessage);
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Send message to server via Socket.IO
    if (socket && socket.connected) {
        const messageData = {
            message: message,
            timestamp: new Date().toISOString(),
            sessionId: sessionId
        };
        
        socket.emit('visitor-message', messageData);
        console.log('📱 Message sent to server:', message);
        
        // Show typing indicator
        setTimeout(() => {
            showTypingIndicator();
        }, 500);
    } else {
        console.error('❌ Not connected to server');
        // Fallback to auto-response if not connected
        setTimeout(() => {
            hideTypingIndicator();
            addBotResponse();
        }, 2000);
    }
}

/**
 * Check for admin response (deprecated - using Socket.IO now)
 */
function checkForAdminResponse() {
    // This function is no longer needed with Socket.IO
    // Responses come through the 'admin-response' socket event
}
    
    // Stop checking after 5 seconds
    setTimeout(() => {
        clearInterval(checkInterval);
    }, 5000);
}

/**
 * Listen for admin responses (continuously)
 */
setInterval(() => {
    const response = localStorage.getItem('pta_admin_response');
    if (response) {
        try {
            const responseData = JSON.parse(response);
            if (responseData.sessionId === getSessionId()) {
                // Clear the response
                localStorage.removeItem('pta_admin_response');
                
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add admin response
                const chatBody = document.querySelector('.chat-body');
                const adminMessage = document.createElement('div');
                adminMessage.className = 'chat-message bot-message';
                adminMessage.innerHTML = `
                    <div class="message-avatar">
                        <img src="icon.png" alt="Admin">
                    </div>
                    <div class="message-content">
                        <p>${escapeHtml(responseData.message)}</p>
                        <span class="message-time">${getCurrentTime()}</span>
                    </div>
                `;
                chatBody.appendChild(adminMessage);
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        } catch (e) {
            console.error('Error parsing admin response:', e);
        }
    }
}, 1000);

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const chatBody = document.querySelector('.chat-body');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message bot-message typing-indicator';
    typingIndicator.id = 'typingIndicator';
    typingIndicator.innerHTML = `
        <div class="message-avatar">
            <img src="icon.png" alt="Bot">
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatBody.appendChild(typingIndicator);
    chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Add bot response
 */
function addBotResponse() {
    const chatBody = document.querySelector('.chat-body');
    const responses = [
        "Thanks for your message! We'll get back to you shortly. 😊",
        "Got it! One of our instructors will respond soon. 🥋",
        "Thank you! We'll contact you as soon as possible. 👍",
        "Message received! We'll be in touch shortly. ⭐"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const botMessage = document.createElement('div');
    botMessage.className = 'chat-message bot-message';
    botMessage.innerHTML = `
        <div class="message-avatar">
            <img src="icon.png" alt="Bot">
        </div>
        <div class="message-content">
            <p>${randomResponse}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
    `;
    chatBody.appendChild(botMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * Get current time formatted
 */
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Open WhatsApp chat with pre-filled message (for backward compatibility)
 */
//*function openWhatsAppChat(message) {
    //const phoneNumber = '13366248499';
    //const encodedMessage = encodeURIComponent(message);
    //const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    //window.open(whatsappUrl, '_blank');
//}

// Initialize chat widget
initChatWidget();

// Export utilities for use in other scripts
window.PTAcademy = {
    debounce,
    //openWhatsAppChat//
};

console.log('✨ All features initialized successfully!');
console.log('💬 Chat widget ready!');
