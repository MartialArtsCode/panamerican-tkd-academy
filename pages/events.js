// Events Page Logic
let currentUser = null;

(async function init() {
    currentUser = await checkAuth();
    if (!currentUser) return;

    if (['instructor', 'master'].includes(currentUser.tier)) {
        document.getElementById('createEventBtn').style.display = 'block';
    }

    loadEvents({ upcoming: true });
    setupEventListeners();
})();

function setupEventListeners() {
    // Filter tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const type = e.target.dataset.type;
            loadEvents({ upcoming: true, ...(type && { type }) });
        });
    });

    // Create event modal
    document.getElementById('createEventBtn')?.addEventListener('click', () => {
        document.getElementById('createEventModal').classList.remove('hidden');
    });

    document.querySelector('#createEventModal .modal-close')?.addEventListener('click', () => {
        document.getElementById('createEventModal').classList.add('hidden');
    });

    document.getElementById('submitEventBtn')?.addEventListener('click', createEvent);
    document.getElementById('logoutBtn').addEventListener('click', utils.logout);

    // Event actions (delegation)
    document.getElementById('eventsContainer').addEventListener('click', async (e) => {
        if (e.target.classList.contains('rsvp-btn')) {
            const eventId = e.target.dataset.eventId;
            await rsvpEvent(eventId, e.target);
        }
    });
}

async function loadEvents(params = {}) {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '<div class="loading">Loading events...</div>';

    try {
        const events = await api.getEvents(params);

        if (!events || events.length === 0) {
            container.innerHTML = '<div class="empty-state">No upcoming events</div>';
            return;
        }

        container.innerHTML = events.map(event => renderEvent(event)).join('');
    } catch (error) {
        utils.showToast('Failed to load events', 'error');
        container.innerHTML = '<div class="error-state">Failed to load events</div>';
    }
}

function renderEvent(event) {
    const isAttending = event.attendees?.includes(currentUser.email);
    const eventDate = new Date(event.date);
    const typeEmoji = {
        'training': '🥋',
        'tournament': '🏆',
        'belt_test': '🎖️',
        'seminar': '📚',
        'social': '🎉'
    };

    const spotsLeft = event.max_capacity ? event.max_capacity - event.attendees.length : null;

    return `
        <div class="event-card" data-event-id="${event._id}">
            <div class="event-type-badge">
                ${typeEmoji[event.event_type] || '📅'} ${event.event_type.replace('_', ' ')}
            </div>
            
            ${event.image_url ? `<img src="${event.image_url}" class="event-image" alt="${event.title}">` : ''}
            
            <div class="event-body">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description || 'No description'}</p>
                
                <div class="event-details">
                    <div class="event-detail">
                        📅 ${utils.formatDate(event.date)}
                    </div>
                    ${event.time ? `<div class="event-detail">🕐 ${event.time}</div>` : ''}
                    ${event.location ? `<div class="event-detail">📍 ${event.location}</div>` : ''}
                    <div class="event-detail">
                        👥 ${event.attendees.length} attending
                        ${spotsLeft !== null ? `(${spotsLeft} spots left)` : ''}
                    </div>
                </div>

                <button class="btn rsvp-btn ${isAttending ? 'attending' : ''}" 
                        data-event-id="${event._id}"
                        ${spotsLeft === 0 && !isAttending ? 'disabled' : ''}>
                    ${isAttending ? '✓ Attending' : spotsLeft === 0 ? 'Full' : 'RSVP'}
                </button>
            </div>
        </div>
    `;
}

async function createEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const event_type = document.getElementById('eventType').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value.trim();
    const max_capacity = document.getElementById('eventCapacity').value;

    if (!title || !date) {
        utils.showToast('Please fill in required fields', 'error');
        return;
    }

    try {
        await api.createEvent({
            title,
            description,
            event_type,
            date,
            time,
            location,
            ...(max_capacity && { max_capacity: parseInt(max_capacity) })
        });

        utils.showToast('Event created!', 'success');
        document.getElementById('createEventModal').classList.add('hidden');
        
        // Clear form
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDescription').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventTime').value = '';
        document.getElementById('eventLocation').value = '';
        document.getElementById('eventCapacity').value = '';

        loadEvents({ upcoming: true });
    } catch (error) {
        utils.showToast('Failed to create event', 'error');
    }
}

async function rsvpEvent(eventId, button) {
    try {
        const event = await api.rsvpEvent(eventId);
        const isAttending = event.attendees.includes(currentUser.email);
        button.textContent = isAttending ? '✓ Attending' : 'RSVP';
        button.classList.toggle('attending', isAttending);
        utils.showToast(isAttending ? 'RSVP confirmed!' : 'RSVP cancelled', 'success');
        
        // Update attendee count
        const eventCard = button.closest('.event-card');
        const detailDiv = eventCard.querySelector('.event-detail:last-child');
        const spotsLeft = event.max_capacity ? event.max_capacity - event.attendees.length : null;
        detailDiv.innerHTML = `👥 ${event.attendees.length} attending
            ${spotsLeft !== null ? `(${spotsLeft} spots left)` : ''}`;
    } catch (error) {
        utils.showToast(error.message || 'Failed to RSVP', 'error');
    }
}
