// Feed Page Logic
let currentUser = null;
let currentPostId = null;

// Initialize
(async function init() {
    currentUser = await checkAuth();
    if (!currentUser) return;

    loadUserInfo();
    loadFeed();
    setupEventListeners();
    loadNotifications();
})();

function loadUserInfo() {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('userInitials').textContent = initials;
}

async function loadFeed(filter = 'all') {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '<div class="loading">Loading posts...</div>';

    try {
        const data = await api.getFeed(1);
        const posts = data.posts || data;

        if (!posts || posts.length === 0) {
            container.innerHTML = '<div class="empty-state">No posts yet. Be the first to share!</div>';
            return;
        }

        let filteredPosts = posts;
        if (filter === 'announcements') {
            filteredPosts = posts.filter(p => p.is_announcement);
        } else if (filter === 'pinned') {
            filteredPosts = posts.filter(p => p.is_pinned);
        }

        container.innerHTML = filteredPosts.map(post => renderPost(post)).join('');
    } catch (error) {
        utils.showToast('Failed to load feed', 'error');
        container.innerHTML = '<div class="error-state">Failed to load posts</div>';
    }
}

function renderPost(post) {
    const isLiked = post.likes?.includes(currentUser.email);
    const tierBadge = utils.getTierBadge(post.author_tier);
    
    return `
        <div class="post-card ${post.is_pinned ? 'pinned' : ''}" data-post-id="${post._id}">
            ${post.is_pinned ? '<div class="pin-indicator">📌 Pinned</div>' : ''}
            ${post.is_announcement ? '<div class="announcement-indicator">📢 Announcement</div>' : ''}
            
            <div class="post-header">
                <div class="post-author">
                    <div class="author-avatar">${post.author_name[0]}</div>
                    <div class="author-info">
                        <div class="author-name">
                            ${post.author_name}
                            <span class="tier-badge" style="background: ${tierBadge.color}">
                                ${tierBadge.emoji} ${tierBadge.label}
                            </span>
                        </div>
                        <div class="post-time">${utils.timeAgo(post.createdAt)}</div>
                    </div>
                </div>
                ${post.author_email === currentUser.email ? `
                    <button class="post-menu-btn" data-post-id="${post._id}">⋯</button>
                ` : ''}
            </div>

            <div class="post-content">
                <p>${escapeHtml(post.content)}</p>
                ${post.image_url ? `<img src="${post.image_url}" alt="Post image" class="post-image">` : ''}
                ${post.video_url ? `<video src="${post.video_url}" controls class="post-video"></video>` : ''}
            </div>

            <div class="post-actions">
                <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post._id}">
                    ❤️ ${post.likes?.length || 0}
                </button>
                <button class="action-btn comment-btn" data-post-id="${post._id}">
                    💬 ${post.comments_count || 0}
                </button>
                <button class="action-btn share-btn">🔗 Share</button>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    // Create post
    document.getElementById('createPostBtn').addEventListener('click', createPost);

    // Tab filters
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            loadFeed(e.target.dataset.filter);
        });
    });

    // Post actions (using event delegation)
    document.getElementById('postsContainer').addEventListener('click', async (e) => {
        if (e.target.classList.contains('like-btn')) {
            const postId = e.target.dataset.postId;
            await likePost(postId, e.target);
        } else if (e.target.classList.contains('comment-btn')) {
            const postId = e.target.dataset.postId;
            openCommentModal(postId);
        }
    });

    // Comment modal
    document.querySelector('.modal-close').addEventListener('click', closeCommentModal);
    document.getElementById('submitCommentBtn').addEventListener('click', submitComment);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', utils.logout);

    // Notifications
    document.getElementById('notificationsBtn').addEventListener('click', toggleNotifications);
}

async function createPost() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) {
        utils.showToast('Please enter some content', 'error');
        return;
    }

    try {
        await api.createPost({ content });
        utils.showToast('Post created!', 'success');
        document.getElementById('postContent').value = '';
        loadFeed();
    } catch (error) {
        utils.showToast('Failed to create post', 'error');
    }
}

async function likePost(postId, button) {
    try {
        const post = await api.likePost(postId);
        const isLiked = post.likes?.includes(currentUser.email);
        button.classList.toggle('liked', isLiked);
        button.innerHTML = `❤️ ${post.likes?.length || 0}`;
    } catch (error) {
        utils.showToast('Failed to like post', 'error');
    }
}

async function openCommentModal(postId) {
    currentPostId = postId;
    const modal = document.getElementById('commentModal');
    modal.classList.remove('hidden');

    const container = document.getElementById('commentsContainer');
    container.innerHTML = '<div class="loading">Loading comments...</div>';

    try {
        const comments = await api.getComments(postId);
        if (comments.length === 0) {
            container.innerHTML = '<div class="empty-state">No comments yet. Be the first!</div>';
        } else {
            container.innerHTML = comments.map(comment => renderComment(comment)).join('');
        }
    } catch (error) {
        container.innerHTML = '<div class="error-state">Failed to load comments</div>';
    }
}

function renderComment(comment) {
    return `
        <div class="comment">
            <div class="comment-avatar">${comment.author_name[0]}</div>
            <div class="comment-body">
                <div class="comment-author">${comment.author_name}</div>
                <div class="comment-content">${escapeHtml(comment.content)}</div>
                <div class="comment-time">${utils.timeAgo(comment.createdAt)}</div>
            </div>
        </div>
    `;
}

function closeCommentModal() {
    document.getElementById('commentModal').classList.add('hidden');
    document.getElementById('commentText').value = '';
    currentPostId = null;
}

async function submitComment() {
    const content = document.getElementById('commentText').value.trim();
    if (!content || !currentPostId) return;

    try {
        await api.addComment(currentPostId, content);
        document.getElementById('commentText').value = '';
        openCommentModal(currentPostId); // Reload comments
        loadFeed(); // Refresh feed to update comment count
        utils.showToast('Comment added!', 'success');
    } catch (error) {
        utils.showToast('Failed to add comment', 'error');
    }
}

async function loadNotifications() {
    try {
        const { unreadCount } = await api.getNotifications(true);
        const badge = document.getElementById('notifBadge');
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

function toggleNotifications() {
    // Navigate to notifications or show dropdown
    utils.showToast('Notifications coming soon!', 'info');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
