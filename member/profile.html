<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - PTA</title>
    <script src="../config.js"></script>
    <style>
        :root {
            --primary: #cc1f2b;
            --dark: #0f0f14;
            --panel: #171720;
            --border: rgba(255,255,255,0.08);
            --text: #ffffff;
            --muted: #9aa0a6;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: Inter, system-ui, sans-serif;
            background: var(--dark);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            background: var(--panel);
            border-bottom: 1px solid var(--border);
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .header img {
            width: 32px;
            height: 32px;
        }

        .btn {
            padding: 8px 16px;
            background: rgba(255,255,255,0.08);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            transition: background 0.2s;
        }

        .btn:hover {
            background: rgba(255,255,255,0.12);
        }

        .btn-primary {
            background: var(--primary);
        }

        .btn-primary:hover {
            background: #b11a25;
        }

        .container {
            max-width: 800px;
            width: 100%;
            margin: 40px auto;
            padding: 0 24px;
        }

        .profile-card {
            background: var(--panel);
            border-radius: 12px;
            padding: 32px;
            border: 1px solid var(--border);
        }

        .profile-header {
            display: flex;
            align-items: center;
            gap: 24px;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border);
        }

        .profile-picture-container {
            position: relative;
        }

        .profile-picture {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            border: 3px solid var(--primary);
            overflow: hidden;
        }

        .profile-picture img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .profile-info h2 {
            font-size: 24px;
            margin-bottom: 8px;
        }

        .profile-info .tier-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .tier-basic { background: #607d8b; }
        .tier-premium { background: #673ab7; }
        .tier-vip { background: #ff9800; }
        .tier-instructor { background: #2196f3; }
        .tier-admin { background: var(--primary); }

        .form-group {
            margin-bottom: 24px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--muted);
        }

        .form-group input {
            width: 100%;
            padding: 12px;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--border);
            border-radius: 6px;
            color: white;
            font-size: 14px;
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--primary);
        }

        .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .message {
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            display: none;
        }

        .message.success {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
            border: 1px solid #4caf50;
        }

        .message.error {
            background: rgba(244, 67, 54, 0.2);
            color: #f44336;
            border: 1px solid #f44336;
        }

        .picture-url-hint {
            font-size: 12px;
            color: var(--muted);
            margin-top: 4px;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: var(--muted);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>
            <img src="../images/pta-logo.png" alt="PTA" onerror="this.style.display='none'">
            My Profile
        </h1>
        <div>
            <button class="btn" onclick="window.location.href='${BASE_PATH}/index.html'">← Back to Home</button>
            <button class="btn" onclick="logout()">🚪 Logout</button>
        </div>
    </div>

    <div class="container">
        <div id="loadingMessage" class="loading">Loading profile...</div>
        
        <div id="profileCard" class="profile-card" style="display: none;">
            <div class="profile-header">
                <div class="profile-picture-container">
                    <div class="profile-picture" id="profilePicturePreview">
                        <span id="profileInitials">?</span>
                    </div>
                </div>
                <div class="profile-info">
                    <h2 id="profileName">User</h2>
                    <p style="color: var(--muted); margin-bottom: 8px;" id="profileEmail">email@example.com</p>
                    <span class="tier-badge" id="profileTier">BASIC</span>
                </div>
            </div>

            <div id="message" class="message"></div>

            <form id="profileForm">
                <div class="form-group">
                    <label for="name">Display Name</label>
                    <input type="text" id="name" name="name" placeholder="Your name" required>
                </div>

                <div class="form-group">
                    <label for="profilePicture">Profile Picture URL</label>
                    <input type="url" id="profilePicture" name="profilePicture" placeholder="https://example.com/your-photo.jpg">
                    <div class="picture-url-hint">Enter a URL to your profile picture, or leave blank for initials</div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn" onclick="loadProfile()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        const authToken = localStorage.getItem('auth_token');
        const isAdmin = localStorage.getItem('is_admin') === 'true';

        if (!authToken) {
            alert('Please log in first');
            window.location.href = `${BASE_PATH}/index.html`;
        }

        // Load user profile
        async function loadProfile() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to load profile');
                }

                const user = await response.json();
                
                // Update UI
                document.getElementById('profileName').textContent = user.name || user.email.split('@')[0];
                document.getElementById('profileEmail').textContent = user.email;
                document.getElementById('profileTier').textContent = (user.tier || 'basic').toUpperCase();
                document.getElementById('profileTier').className = `tier-badge tier-${user.tier || 'basic'}`;
                
                // Update form
                document.getElementById('name').value = user.name || user.email.split('@')[0];
                document.getElementById('profilePicture').value = user.profilePicture || '';
                
                // Update profile picture
                updateProfilePicture(user.name || user.email.split('@')[0], user.profilePicture);
                
                // Show profile card
                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('profileCard').style.display = 'block';
            } catch (error) {
                console.error('Error loading profile:', error);
                document.getElementById('loadingMessage').textContent = 'Error loading profile';
            }
        }

        function updateProfilePicture(name, pictureUrl) {
            const preview = document.getElementById('profilePicturePreview');
            const initials = document.getElementById('profileInitials');
            
            if (pictureUrl) {
                preview.innerHTML = `<img src="${pictureUrl}" alt="${name}" onerror="showInitials('${name}')">`;
            } else {
                showInitials(name);
            }
        }

        function showInitials(name) {
            const preview = document.getElementById('profilePicturePreview');
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            preview.innerHTML = `<span style="font-size: 48px;">${initials}</span>`;
        }

        // Handle form submission
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const messageEl = document.getElementById('message');
            messageEl.style.display = 'none';
            
            const name = document.getElementById('name').value.trim();
            const profilePicture = document.getElementById('profilePicture').value.trim() || null;
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, profilePicture })
                });

                const data = await response.json();

                if (response.ok) {
                    messageEl.textContent = '✓ ' + data.message;
                    messageEl.className = 'message success';
                    messageEl.style.display = 'block';
                    
                    // Reload profile
                    setTimeout(() => {
                        loadProfile();
                        messageEl.style.display = 'none';
                    }, 2000);
                } else {
                    throw new Error(data.error || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                messageEl.textContent = '✗ ' + error.message;
                messageEl.className = 'message error';
                messageEl.style.display = 'block';
            }
        });

        function logout() {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('is_admin');
            window.location.href = `${BASE_PATH}/index.html`;
        }

        // Load profile on page load
        loadProfile();
    </script>
</body>
</html>
