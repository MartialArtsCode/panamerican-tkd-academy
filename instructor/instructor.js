// Authentication Check
const authToken = localStorage.getItem('auth_token');
const userEmail = localStorage.getItem('user_email');

if (!authToken) {
    alert('Please login to access instructor tools');
    window.location.href = '/index.html';
}

// Set instructor name
document.getElementById('instructorName').textContent = userEmail || 'Instructor';

// Password Change Handler
document.getElementById('changePasswordBtn').addEventListener('click', () => {
    document.getElementById('passwordModal').classList.add('active');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordError').style.display = 'none';
    document.getElementById('passwordSuccess').style.display = 'none';
});

document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorEl = document.getElementById('passwordError');
    const successEl = document.getElementById('passwordSuccess');
    
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
    
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
            closeModal('passwordModal');
        }, 2000);
    } catch (error) {
        console.error('Error changing password:', error);
        errorEl.textContent = 'Network error. Please try again.';
        errorEl.style.display = 'block';
    }
});

// Sample data (In production, this would come from a database)
let students = [
    { id: 1, name: 'Emma Johnson', age: 8, belt: 'yellow', class: 'kids-beginner', attendance: 85 },
    { id: 2, name: 'Liam Smith', age: 10, belt: 'green', class: 'kids-intermediate', attendance: 92 },
    { id: 3, name: 'Olivia Brown', age: 12, belt: 'blue', class: 'kids-advanced', attendance: 88 },
    { id: 4, name: 'Noah Davis', age: 9, belt: 'yellow', class: 'kids-beginner', attendance: 78 },
    { id: 5, name: 'Sophia Wilson', age: 25, belt: 'red', class: 'adult-intermediate', attendance: 95 },
    { id: 6, name: 'James Taylor', age: 32, belt: 'blue', class: 'adult-advanced', attendance: 82 }
];

// Update dashboard stats
function updateDashboard() {
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('classesThisWeek').textContent = '12';
    document.getElementById('upcomingTests').textContent = '3';
    
    const avgAttendance = students.reduce((sum, s) => sum + s.attendance, 0) / students.length;
    document.getElementById('attendanceRate').textContent = Math.round(avgAttendance) + '%';
}

// Tab navigation
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const view = tab.dataset.view;
        switchView(view);
    });
});

function switchView(viewName) {
    // Update tabs
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    
    // Update views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${viewName}View`).classList.add('active');
    
    // Load view-specific data
    if (viewName === 'students') loadStudents();
    if (viewName === 'testing') loadEligibleStudents();
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    window.location.href = '/index.html';
});

// Attendance functions
function loadAttendance() {
    const classType = document.getElementById('classSelect').value;
    const date = document.getElementById('attendanceDate').value;
    
    if (!classType || !date) {
        alert('Please select a class and date');
        return;
    }
    
    const classList = students.filter(s => s.class === classType);
    const attendanceList = document.getElementById('attendanceList');
    
    attendanceList.innerHTML = '';
    
    if (classList.length === 0) {
        attendanceList.innerHTML = '<p class="empty-state">No students in this class</p>';
        return;
    }
    
    classList.forEach(student => {
        const item = document.createElement('div');
        item.className = 'attendance-item';
        item.innerHTML = `
            <span>${student.name} - <span class="student-belt belt-${student.belt}">${student.belt}</span></span>
            <input type="checkbox" class="attendance-checkbox" data-student="${student.id}">
        `;
        attendanceList.appendChild(item);
    });
    
    document.getElementById('attendanceActions').style.display = 'flex';
}

function saveAttendance() {
    const checkboxes = document.querySelectorAll('.attendance-checkbox:checked');
    alert(`Attendance saved for ${checkboxes.length} students`);
}

function clearAttendance() {
    document.querySelectorAll('.attendance-checkbox').forEach(cb => cb.checked = false);
}

// Set today's date as default
document.getElementById('attendanceDate').valueAsDate = new Date();

// Students functions
function loadStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const beltFilter = document.getElementById('beltFilter').value;
    
    let filtered = students;
    
    if (searchTerm) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(searchTerm));
    }
    
    if (beltFilter) {
        filtered = filtered.filter(s => s.belt === beltFilter);
    }
    
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = '';
    
    if (filtered.length === 0) {
        studentsList.innerHTML = '<p class="empty-state">No students found</p>';
        return;
    }
    
    filtered.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <h3>${student.name}</h3>
            <span class="student-belt belt-${student.belt}">${student.belt} Belt</span>
            <div class="student-info">
                <p>Age: ${student.age}</p>
                <p>Class: ${student.class.replace('-', ' ')}</p>
                <p>Attendance: ${student.attendance}%</p>
            </div>
        `;
        card.onclick = () => showStudentDetails(student);
        studentsList.appendChild(card);
    });
}

document.getElementById('studentSearch').addEventListener('input', loadStudents);
document.getElementById('beltFilter').addEventListener('change', loadStudents);

function showStudentDetails(student) {
    alert(`Student Details:\n\nName: ${student.name}\nAge: ${student.age}\nBelt: ${student.belt}\nClass: ${student.class}\nAttendance: ${student.attendance}%`);
}

function showAddStudent() {
    document.getElementById('studentModal').classList.add('active');
}

document.getElementById('addStudentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newStudent = {
        id: students.length + 1,
        name: document.getElementById('studentName').value,
        age: parseInt(document.getElementById('studentAge').value),
        belt: document.getElementById('studentBelt').value,
        class: document.getElementById('studentClass').value,
        attendance: 0
    };
    
    students.push(newStudent);
    closeModal('studentModal');
    loadStudents();
    updateDashboard();
    alert('Student added successfully!');
});

function printRoster() {
    alert('Printing roster... (Feature coming soon)');
}

// Testing functions
function loadEligibleStudents() {
    const eligibleList = document.getElementById('eligibleList');
    eligibleList.innerHTML = '';
    
    // Students with 85%+ attendance are eligible
    const eligible = students.filter(s => s.attendance >= 85);
    
    if (eligible.length === 0) {
        eligibleList.innerHTML = '<p class="empty-state">No students currently eligible</p>';
        return;
    }
    
    eligible.forEach(student => {
        const item = document.createElement('div');
        item.className = 'eligible-item';
        item.innerHTML = `
            <div>
                <strong>${student.name}</strong><br>
                <span class="student-belt belt-${student.belt}">${student.belt} Belt</span>
                <span style="margin-left: 8px;">→ Testing for next belt</span>
            </div>
            <button class="btn-primary" onclick="approveForTest(${student.id})">Approve</button>
        `;
        eligibleList.appendChild(item);
    });
}

function approveForTest(studentId) {
    alert(`Student approved for belt testing!`);
}

function showTestTab(tabName) {
    document.querySelectorAll('.test-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.test-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    if (tabName === 'requirements') showRequirements();
}

function showRequirements() {
    const belt = document.getElementById('requirementBelt').value;
    const requirementsList = document.getElementById('requirementsList');
    
    const requirements = {
        yellow: [
            'Basic stances: Attention, Ready, Walking',
            'Basic blocks: Low block, Middle block',
            'Basic strikes: Front punch, Knife hand strike',
            'Kicks: Front kick, Turning kick',
            'Taegeuk Il Jang (Form 1)',
            'Basic one-step sparring',
            'Breaking: 1 board with front kick'
        ],
        green: [
            'Horse stance, Back stance',
            'High block, Double knife hand block',
            'Back fist, Hammer fist',
            'Side kick, Back kick',
            'Taegeuk Ee Jang & Sam Jang',
            'Two-step sparring',
            'Breaking: 2 boards'
        ],
        blue: [
            'Tiger stance, Crane stance',
            'Palm block, X-block',
            'Elbow strikes, Ridge hand',
            'Crescent kick, Hook kick',
            'Taegeuk Sa Jang & Oh Jang',
            'Three-step sparring',
            'Breaking: 3 boards'
        ],
        red: [
            'All previous stances (mastery level)',
            'Combined blocks and strikes',
            'Advanced combinations',
            'Jumping kicks, Spinning kicks',
            'Taegeuk Yuk Jang & Chil Jang',
            'Free sparring',
            'Breaking: Board and brick'
        ],
        black: [
            'Master-level stances',
            'All blocks, strikes, and kicks (expert level)',
            'Taegeuk Pal Jang & Koryo',
            'Advanced free sparring',
            'Board breaking demonstration',
            'Teaching demonstration',
            'Written test on Taekwondo history and philosophy'
        ]
    };
    
    requirementsList.innerHTML = '';
    requirements[belt].forEach(req => {
        const item = document.createElement('div');
        item.className = 'requirement-item';
        item.innerHTML = `✓ ${req}`;
        requirementsList.appendChild(item);
    });
}

function scheduleTest() {
    const date = document.getElementById('testDate').value;
    const time = document.getElementById('testTime').value;
    const location = document.getElementById('testLocation').value;
    
    if (!date || !time) {
        alert('Please enter test date and time');
        return;
    }
    
    alert(`Belt test scheduled!\n\nDate: ${date}\nTime: ${time}\nLocation: ${location}`);
}

// Forms reference
function showFormDetails(formId) {
    const formDetails = {
        taegeuk1: {
            name: 'Taegeuk Il Jang',
            meaning: 'Heaven and Light',
            movements: 18,
            description: 'First form, focuses on basic blocks and strikes in walking stance.'
        },
        taegeuk2: {
            name: 'Taegeuk Ee Jang',
            meaning: 'Inner Firmness and Outer Softness',
            movements: 18,
            description: 'Introduces back stance and various hand techniques.'
        },
        koryo: {
            name: 'Koryo',
            meaning: 'Learned Man',
            movements: 30,
            description: 'First black belt form, represents the spirit of Korean scholars.'
        }
    };
    
    const form = formDetails[formId] || { name: 'Form Details', description: 'Coming soon' };
    
    const modalContent = `
        <h2>${form.name}</h2>
        <p><strong>Meaning:</strong> ${form.meaning || 'N/A'}</p>
        <p><strong>Movements:</strong> ${form.movements || 'N/A'}</p>
        <p>${form.description}</p>
    `;
    
    document.getElementById('formDetails').innerHTML = modalContent;
    document.getElementById('formModal').classList.add('active');
}

// Modal functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Schedule navigation
function previousWeek() {
    alert('Loading previous week schedule...');
}

function nextWeek() {
    alert('Loading next week schedule...');
}

// Initialize
updateDashboard();
loadStudents();
showRequirements();
