// User Database
const users = {
    'admin': { 
        password: 'admin123', 
        role: 'Admin', 
        name: 'Master Kim',
        profilePic: '👤',
        bio: 'Head Instructor - 5th Dan Black Belt'
    },
    'admin2': { 
        password: 'admin2123', 
        role: 'Admin II', 
        name: 'Instructor Lee',
        profilePic: '👤',
        bio: 'Senior Instructor - 3rd Dan Black Belt'
    },
    'member': { 
        password: 'member123', 
        role: 'Members', 
        name: 'Carlos Martinez',
        profilePic: '👤',
        bio: 'Blue Belt - Training since 2024',
        badges: ['Attendance Champion', 'Tournament Bronze']
    }
};

// Application State
let currentUser = null;
let activeTab = 'dashboard';
let selectedStudent = null;
let selectedChat = null;

// Data
let students = [
    { id: 1, name: 'Carlos Martinez', belt: 'Blue Belt', status: 'Active', profilePic: '👤', badges: ['Attendance Champion', 'Tournament Bronze'] },
    { id: 2, name: 'Maria Sanchez', belt: 'Red Belt', status: 'Active', profilePic: '👤', badges: ['Outstanding Progress', 'Team Spirit'] },
    { id: 3, name: 'Juan Lopez', belt: 'Black Belt 1st Dan', status: 'Active', profilePic: '👤', badges: ['Tournament Gold', 'Leadership Award', 'Perfect Form'] },
    { id: 4, name: 'Sofia Hernandez', belt: 'Yellow Belt', status: 'Active', profilePic: '👤', badges: ['Rookie Star'] }
];

let events = [
    { id: 1, title: 'Belt Testing', date: '2025-12-15', time: '10:00 AM', description: 'Quarterly belt promotion ceremony', type: 'testing' },
    { id: 2, title: 'Pan-American Tournament', date: '2025-12-20', time: '8:00 AM', description: 'Regional championship competition', type: 'tournament' },
    { id: 3, title: 'Family Training Day', date: '2025-12-10', time: '2:00 PM', description: 'Special class for families', type: 'special' },
    { id: 4, title: 'Black Belt Seminar', date: '2025-12-28', time: '6:00 PM', description: 'Advanced techniques workshop', type: 'training' }
];

let feedPosts = [
    { id: 1, author: 'Juan Lopez', authorPic: '👤', text: 'Just earned my Black Belt! Thank you Master Kim and everyone at the academy! 🥋', image: '🖼️', likes: 24, comments: 8, timestamp: '2 hours ago' },
    { id: 2, author: 'Maria Sanchez', authorPic: '👤', text: 'Great tournament today! Proud to represent Panamerican TKD Academy 🏆', image: '🖼️', likes: 18, comments: 5, timestamp: '5 hours ago' },
    { id: 3, author: 'Master Kim', authorPic: '👤', text: 'Congratulations to all our students who tested today. Your dedication shows! 💪', image: null, likes: 45, comments: 12, timestamp: '1 day ago' }
];

let messages = [
    {
        id: 1,
        participants: ['Carlos Martinez', 'Master Kim'],
        messages: [
            { sender: 'Carlos Martinez', text: 'Master Kim, when is the next belt test?', timestamp: '10:30 AM' },
            { sender: 'Master Kim', text: 'December 15th. Make sure you practice your poomsae!', timestamp: '10:45 AM' }
        ]
    },
    {
        id: 2,
        participants: ['Maria Sanchez', 'Carlos Martinez'],
        messages: [
            { sender: 'Maria Sanchez', text: 'Want to practice sparring after class?', timestamp: 'Yesterday' },
            { sender: 'Carlos Martinez', text: 'Sure! See you at 6 PM', timestamp: 'Yesterday' }
        ]
    }
];

let notifications = [
    { id: 1, type: 'event', text: 'Belt Testing scheduled for Dec 15th', read: false, timestamp: '1 hour ago' },
    { id: 2, type: 'message', text: 'New message from Master Kim', read: false, timestamp: '2 hours ago' },
    { id: 3, type: 'badge', text: 'You earned a new badge: Attendance Champion!', read: false, timestamp: '1 day ago' },
    { id: 4, type: 'announcement', text: 'Tournament registration is now open', read: true, timestamp: '2 days ago' }
];

const availableBadges = [
    'Attendance Champion', 'Tournament Gold', 'Tournament Silver', 'Tournament Bronze',
    'Outstanding Progress', 'Team Spirit', 'Leadership Award', 'Perfect Form',
    'Rookie Star', 'Discipline Master', 'Respect Award', 'Perseverance',
    'Black Belt Excellence', 'Community Service', 'Mentor', 'Sparring Champion'
];

// Login Handler
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users[username];
    if (user && user.password === password) {
        currentUser = { ...user, username };
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        initializeApp();
    } else {
        alert('Invalid credentials');
    }
}

// Logout Handler
function handleLogout() {
    currentUser = null;
    activeTab = 'dashboard';
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Initialize App
function initializeApp() {
    // Set navbar color based on role
    const navbar = document.getElementById('navbar');
    if (currentUser.role === 'Admin') {
        navbar.className = 'bg-red-600 text-white p-4 shadow-lg';
    } else if (currentUser.role === 'Admin II') {
        navbar.className = 'bg-blue-600 text-white p-4 shadow-lg';
    } else {
        navbar.className = 'bg-gray-800 text-white p-4 shadow-lg';
    }
    
    document.getElementById('roleText').textContent = currentUser.role + ' Portal';
    document.getElementById('welcomeText').textContent = 'Welcome, ' + currentUser.name;
    
    renderTabs();
    renderContent();
}

// Render Tabs
function renderTabs() {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'calendar', label: 'Events' },
        { id: 'feed', label: 'Community Feed' },
        { id: 'messages', label: 'Messages' },
        { id: 'notifications', label: 'Notifications', badge: notifications.filter(n => !n.read).length }
    ];
    
    if (currentUser.role === 'Admin') {
        tabs.push({ id: 'students', label: 'Students' });
    }
    
    const tabsHTML = tabs.map(tab => `
        <button
            onclick="switchTab('${tab.id}')"
            class="px-6 py-4 font-medium whitespace-nowrap ${activeTab === tab.id ? 'tab-active' : 'text-gray-600 hover:text-gray-800'}"
        >
            ${tab.label}
            ${tab.badge ? `<span class="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full notification-badge">${tab.badge}</span>` : ''}
        </button>
    `).join('');
    
    document.getElementById('tabsContainer').innerHTML = tabsHTML;
}

// Switch Tab
function switchTab(tabId) {
    activeTab = tabId;
    renderTabs();
    renderContent();
}

// Render Content
function renderContent() {
    const contentArea = document.getElementById('contentArea');
    
    switch(activeTab) {
        case 'dashboard':
            contentArea.innerHTML = renderDashboard();
            break;
        case 'calendar':
            contentArea.innerHTML = renderCalendar();
            break;
        case 'feed':
            contentArea.innerHTML = renderFeed();
            break;
        case 'messages':
            contentArea.innerHTML = renderMessages();
            break;
        case 'notifications':
            contentArea.innerHTML = renderNotifications();
            break;
        case 'students':
            contentArea.innerHTML = renderStudents();
            break;
    }
}

// Dashboard
function renderDashboard() {
    if (currentUser.role === 'Admin') {
        return `
            <div class="fade-in">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Students</p>
                                <p class="text-3xl font-bold text-gray-800">247</p>
                            </div>
                            <span class="text-4xl">👥</span>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Active Classes</p>
                                <p class="text-3xl font-bold text-gray-800">12</p>
                            </div>
                            <span class="text-4xl">📅</span>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Upcoming Events</p>
                                <p class="text-3xl font-bold text-gray-800">${events.length}</p>
                            </div>
                            <span class="text-4xl">🔔</span>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">New Posts</p>
                                <p class="text-3xl font-bold text-gray-800">${feedPosts.length}</p>
                            </div>
                            <span class="text-4xl">📸</span>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-xl font-bold mb-4">Quick Actions</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button onclick="switchTab('calendar'); openModal('eventModal')" class="bg-red-600 text-white py-3 rounded-lg hover:bg-red-700">Create Event</button>
                        <button onclick="switchTab('feed')" class="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">Post Update</button>
                        <button onclick="switchTab('messages'); openModal('massMessageModal')" class="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">Send Message</button>
                        <button onclick="switchTab('students')" class="bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700">Manage Students</button>
                    </div>
                </div>
            </div>
        `;
    } else if (currentUser.role === 'Admin II') {
        return `
            <div class="fade-in">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">My Students</p>
                                <p class="text-3xl font-bold text-gray-800">42</p>
                            </div>
                            <span class="text-4xl">✅</span>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">My Classes</p>
                                <p class="text-3xl font-bold text-gray-800">5</p>
                            </div>
                            <span class="text-4xl">📖</span>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Messages</p>
                                <p class="text-3xl font-bold text-gray-800">${messages.length}</p>
                            </div>
                            <span class="text-4xl">💬</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                            <span>🏆</span> My Profile
                        </h2>
                        <div class="text-center">
                            <div class="text-6xl mb-4">${currentUser.profilePic}</div>
                            <h3 class="text-2xl font-bold">${currentUser.name}</h3>
                            <p class="text-gray-600 mb-4">${currentUser.bio}</p>
                            ${currentUser.badges ? `
                                <div class="mt-4">
                                    <p class="font-semibold mb-2">My Badges:</p>
                                    <div class="flex flex-wrap gap-2 justify-center">
                                        ${currentUser.badges.map(badge => `
                                            <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-1">
                                                <span>🏆</span> ${badge}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                            <span>📅</span> Upcoming Events
                        </h2>
                        <div class="space-y-3">
                            ${events.slice(0, 3).map(event => `
                                <div class="p-3 bg-gray-50 rounded">
                                    <p class="font-semibold">${event.title}</p>
                                    <p class="text-sm text-gray-600">${event.date} - ${event.time}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Calendar
function renderCalendar() {
    return `
        <div class="fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Events Calendar</h2>
                ${currentUser.role === 'Admin' ? `
                    <button onclick="openModal('eventModal')" class="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                        <span>➕</span> Add Event
                    </button>
                ` : ''}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${events.map(event => `
                    <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
                        <div class="flex justify-between items-start mb-3">
                            <h3 class="text-xl font-bold text-gray-800">${event.title}</h3>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeClass(event.type)}">
                                ${event.type}
                            </span>
                        </div>
                        <div class="space-y-2 text-gray-600">
                            <p class="flex items-center gap-2">📅 ${event.date}</p>
                            <p class="flex items-center gap-2">⏰ ${event.time}</p>
                            <p class="mt-3">${event.description}</p>
                        </div>
                        ${currentUser.role === 'Members' ? `
                            <button class="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">RSVP</button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getEventTypeClass(type) {
    switch(type) {
        case 'tournament': return 'bg-yellow-100 text-yellow-800';
        case 'testing': return 'bg-purple-100 text-purple-800';
        case 'training': return 'bg-blue-100 text-blue-800';
        default: return 'bg-green-100 text-green-800';
    }
}

// Feed
function renderFeed() {
    return `
        <div class="fade-in max-w-3xl mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex gap-4">
                    <div class="text-4xl">${currentUser.profilePic}</div>
                    <div class="flex-1">
                        <textarea id="newPostText" placeholder="Share your training experience, photos from events..." class="w-full px-4 py-2 border rounded-lg resize-none" rows="3"></textarea>
                        <div class="flex justify-between items-center mt-3">
                            <button onclick="addPhoto()" class="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                                📷 Add Photo
                            </button>
                            <button onclick="createPost()" class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">Post</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="space-y-6">
                ${feedPosts.map(post => `
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-start gap-4">
                            <div class="text-4xl">${post.authorPic}</div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h4 class="font-bold text-gray-800">${post.author}</h4>
                                        <p class="text-sm text-gray-500">${post.timestamp}</p>
                                    </div>
                                </div>
                                <p class="mt-3 text-gray-700">${post.text}</p>
                                ${post.image ? `
                                    <div class="mt-4 bg-gray-200 rounded-lg h-64 flex items-center justify-center text-6xl">
                                        ${post.image}
                                    </div>
                                ` : ''}
                                <div class="flex gap-6 mt-4 text-gray-600">
                                    <button class="flex items-center gap-2 hover:text-red-600">❤️ ${post.likes} Likes</button>
                                    <button class="flex items-center gap-2 hover:text-blue-600">💬 ${post.comments} Comments</button>
                                    <button class="flex items-center gap-2 hover:text-green-600">↗️ Share</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Messages
function renderMessages() {
    return `
        <div class="fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Messages</h2>
                ${currentUser.role === 'Admin' ? `
                    <button onclick="openModal('massMessageModal')" class="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                        📤 Mass Message
                    </button>
                ` : ''}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg shadow-md p-4">
                    <h3 class="font-bold mb-4">Conversations</h3>
                    <div class="space-y-2">
                        ${messages.map(chat => `
                            <button onclick="selectChat(${chat.id})" class="w-full text-left p-3 rounded-lg hover:bg-gray-100 ${selectedChat && selectedChat.id === chat.id ? 'bg-gray-100' : ''}">
                                <p class="font-semibold text-sm">
                                    ${chat.participants.filter(p => p !== currentUser.name).join(', ')}
                                </p>
                                <p class="text-xs text-gray-500 truncate">
                                    ${chat.messages[chat.messages.length - 1].text}
                                </p>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="md:col-span-2 bg-white rounded-lg shadow-md p-4">
                    ${selectedChat ? `
                        <div class="flex flex-col h-96">
                            <div class="border-b pb-3 mb-3">
                                <h3 class="font-bold">
                                    ${selectedChat.participants.filter(p => p !== currentUser.name).join(', ')}
                                </h3>
                            </div>
                            <div class="flex-1 overflow-y-auto space-y-3 mb-4" id="messagesList">
                                ${selectedChat.messages.map((msg, idx) => `
                                    <div class="flex ${msg.sender === currentUser.name ? 'justify-end' : 'justify-start'}">
                                        <div class="max-w-xs px-4 py-2 rounded-lg ${msg.sender === currentUser.name ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}">
                                            <p class="text-sm font-semibold">${msg.sender}</p>
                                            <p>${msg.text}</p>
                                            <p class="text-xs opacity-75 mt-1">${msg.timestamp}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="flex gap-2">
                                <input type="text" id="newMessageInput" placeholder="Type a message..." class="flex-1 px-4 py-2 border rounded-lg" onkeypress="if(event.key==='Enter') sendMessage()">
                                <button onclick="sendMessage()" class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">📤</button>
                            </div>
                        </div>
                    ` : `
                        <div class="h-96 flex items-center justify-center text-gray-500">
                            Select a conversation to start messaging
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Notifications
function renderNotifications() {
    return `
        <div class="fade-in max-w-3xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>
            <div class="space-y-3">
                ${notifications.map(notif => `
                    <div class="bg-white rounded-lg shadow-md p-4 ${!notif.read ? 'border-l-4 border-red-600' : ''}">
                        <div class="flex items-start gap-4">
                            <div class="text-2xl">
                                ${notif.type === 'event' ? '📅' : ''}
                                ${notif.type === 'message' ? '💬' : ''}
                                ${notif.type === 'badge' ? '🏆' : ''}
                                ${notif.type === 'announcement' ? '📢' : ''}
                            </div>
                            <div class="flex-1">
                                <p class="text-gray-800">${notif.text}</p>
                                <p class="text-sm text-gray-500 mt-1">${notif.timestamp}</p>
                            </div>
                            ${!notif.read ? `<span class="bg-red-600 text-white text-xs px-2 py-1 rounded">New</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Students
function renderStudents() {
    return `
        <div class="fade-in">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Student Management</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${students.map(student => `
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-start gap-4">
                            <div class="text-5xl">${student.profilePic}</div>
                            <div class="flex-1">
                                <h3 class="font-bold text-lg">${student.name}</h3>
                                <p class="text-sm text-gray-600">${student.belt}</p>
                                <span class="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    ${student.status}
                                </span>
                            </div>
                        </div>
                        ${student.badges && student.badges.length > 0 ? `
                            <div class="mt-4">
                                <p class="text-sm font-semibold text-gray-700 mb-2">Badges:</p>
                                <div class="flex flex-wrap gap-2">
                                    ${student.badges.map(badge => `
                                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded flex items-center gap-1">
                                            🏆 ${badge}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        <div class="mt-4 flex gap-2">
                            <button class="flex-1 bg-blue-600 text-white py-2 text-sm rounded hover:bg-blue-700">Edit Profile</button>
                            <button onclick="openBadgeModal(${student.id})" class="flex-1 bg-yellow-600 text-white py-2 text-sm rounded hover:bg-yellow-700">Add Badge</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Event Functions
function createEvent() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const description = document.getElementById('eventDescription').value;
    
    if (title && date) {
        events.push({
            id: events.length + 1,
            title,
            date,
            time,
            description,
            type: 'special'
        });
        
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventTime').value = '';
        document.getElementById('eventDescription').value = '';
        
        closeModal('eventModal');
        renderContent();
    }
}

// Feed Functions
function createPost() {
    const text = document.getElementById('newPostText').value;
    
    if (text.trim()) {
        feedPosts.unshift({
            id: feedPosts.length + 1,
            author: currentUser.name,
            authorPic: currentUser.profilePic,
            text: text,
            image: null,
            likes: 0,
            comments: 0,
            timestamp: 'Just now'
        });
        
        document.getElementById('newPostText').value = '';
        renderContent();
    }
}

function addPhoto() {
    alert('Photo upload feature - In production, this would open a file picker');
}

// Message Functions
function selectChat(chatId) {
    selectedChat = messages.find(m => m.id === chatId);
    renderContent();
}

function sendMessage() {
    const input = document.getElementById('newMessageInput');
    const text = input.value;
    
    if (text.trim() && selectedChat) {
        selectedChat.messages.push({
            sender: currentUser.name,
            text: text,
            timestamp: 'Just now'
        });
        
        input.value = '';
        renderContent();
    }
}

function sendMassMessage() {
    const text = document.getElementById('massMessageText').value;
    
    if (text.trim()) {
        notifications.unshift({
            id: notifications.length + 1,
            type: 'announcement',
            text: text,
            read: false,
            timestamp: 'Just now'
        });
        
        document.getElementById('massMessageText').value = '';
        closeModal('massMessageModal');
        alert('Mass message sent to all members!');
        renderTabs();
    }
}

// Badge Functions
function openBadgeModal(studentId) {
    selectedStudent = students.find(s => s.id === studentId);
    
    const badgeList = document.getElementById('badgeList');
    badgeList.innerHTML = availableBadges.map(badge => {
        const hasBadge = selectedStudent.badges && selectedStudent.badges.includes(badge);
        return `
            <button 
                onclick="addBadge('${badge}')" 
                class="text-left px-4 py-3 border rounded-lg hover:bg-yellow-50 hover:border-yellow-600 ${hasBadge ? 'opacity-50' : ''}"
                ${hasBadge ? 'disabled' : ''}
            >
                <span class="flex items-center gap-2">
                    🏆 ${badge}
                    ${hasBadge ? '<span class="ml-auto text-xs text-green-600">✓ Already earned</span>' : ''}
                </span>
            </button>
        `;
    }).join('');
    
    openModal('badgeModal');
}

function addBadge(badge) {
    if (selectedStudent) {
        if (!selectedStudent.badges) {
            selectedStudent.badges = [];
        }
        
        if (!selectedStudent.badges.includes(badge)) {
            selectedStudent.badges.push(badge);
            
            // Update in students array
            const index = students.findIndex(s => s.id === selectedStudent.id);
            if (index !== -1) {
                students[index] = selectedStudent;
            }
            
            closeModal('badgeModal');
            selectedStudent = null;
            renderContent();
        }
    }
}

// Keyboard event listeners
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'password') {
            handleLogin();
        }
    }
});

// Initialize
console.log('Panamerican Taekwondo Academy App Loaded');
console.log('Demo Credentials:');
console.log('Admin: admin / admin123');
console.log('Admin II: admin2 / admin2123');
console.log('Member: member / member123');
