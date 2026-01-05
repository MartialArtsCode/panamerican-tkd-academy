/*
 Member Portal Script
 Panamerican Taekwondo Academy
*/

document.addEventListener('DOMContentLoaded', () => {
    initMemberPortal();
});

function initMemberPortal() {
    // Check authentication
    const authToken = localStorage.getItem('auth_token');
    const userEmail = localStorage.getItem('user_email');

    if (!authToken || !userEmail) {
        // Not logged in, redirect to home
        window.location.href = '../index.html';
        return;
    }

    // Populate user information
    populateUserInfo(userEmail);

    // Initialize logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', handleLogout);

    // Initialize password change button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    changePasswordBtn?.addEventListener('click', openPasswordModal);

    // Initialize quick action buttons
    initQuickActions();

    console.log('✅ Member portal initialized');
}

function populateUserInfo(email) {
    // Set user email in header
    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) {
        userEmailEl.textContent = email;
    }

    // Extract username from email (part before @)
    const username = email.split('@')[0];
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = username.charAt(0).toUpperCase() + username.slice(1);
    }

    // Set profile email
    const profileEmailEl = document.getElementById('profileEmail');
    if (profileEmailEl) {
        profileEmailEl.textContent = email;
    }

    // Set member since date (use current date for now)
    const memberSinceEl = document.getElementById('memberSince');
    if (memberSinceEl) {
        const now = new Date();
        memberSinceEl.textContent = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

function handleLogout() {
    // Clear authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    
    // Optionally keep "remember me" email if it was set
    const rememberMe = localStorage.getItem('remember_me');
    if (rememberMe !== 'true') {
        localStorage.removeItem('saved_email');
    }

    // Show logout message
    alert('You have been logged out successfully.');

    // Redirect to home page
    window.location.href = '../index.html';
}

function initQuickActions() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const action = btn.querySelector('span').textContent;
            
            switch(action) {
                case 'Contact Academy':
                    window.location.href = 'tel:3366248499';
                    break;
                case 'Book Private Lesson':
                    alert('Private lesson booking coming soon! Please call (336) 624-8499.');
                    break;
                case 'Training Resources':
                    alert('Training resources coming soon!');
                    break;
                case 'Contact Instructor':
                    alert('Instructor chat coming soon! Please use the chat widget on the main page.');
                    break;
            }
        });
    });
}

// Password Change Functions
function openPasswordModal() {
    const modal = document.getElementById('passwordModal');
    modal.style.display = 'flex';
    
    // Clear fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordError').style.display = 'none';
    document.getElementById('passwordSuccess').style.display = 'none';
}

const closePasswordModal = document.getElementById('closePasswordModal');
closePasswordModal?.addEventListener('click', () => {
    document.getElementById('passwordModal').style.display = 'none';
});

const savePasswordBtn = document.getElementById('savePasswordBtn');
savePasswordBtn?.addEventListener('click', async () => {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorEl = document.getElementById('passwordError');
    const successEl = document.getElementById('passwordSuccess');
    
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        errorEl.textContent = 'All fields are required';
        errorEl.style.display = 'block';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorEl.textContent = 'New passwords do not match';
        errorEl.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        errorEl.style.display = 'block';
        return;
    }
    
    try {
        const authToken = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorEl.textContent = data.error || 'Failed to change password';
            errorEl.style.display = 'block';
            return;
        }
        
        successEl.textContent = 'Password changed successfully!';
        successEl.style.display = 'block';
        
        setTimeout(() => {
            document.getElementById('passwordModal').style.display = 'none';
        }, 2000);
    } catch (error) {
        console.error('Error changing password:', error);
        errorEl.textContent = 'Network error. Please try again.';
        errorEl.style.display = 'block';
    }
});

// Check session validity periodically
setInterval(() => {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
        console.warn('⚠️ Session expired');
        window.location.href = '../index.html';
    }
}, 60000); // Check every minute

console.log('🥋 Member portal script loaded');
