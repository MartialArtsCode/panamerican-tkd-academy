// Redirect immediately if already authenticated
if (localStorage.getItem('auth_token')) {
    window.location.href = '../instructor-tools/index.html';
}

// Static instructor credentials (replace with backend auth when available)
const INSTRUCTORS = [
    { email: 'cp105@panamericantkd.com', password: 'PTA@instructor1' },
    { email: 'cp320@panamericantkd.com', password: 'pan22s7r4705' }
];

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    const match = INSTRUCTORS.find(
        function (i) { return i.email === email && i.password === password; }
    );

    if (match) {
        localStorage.setItem('auth_token', btoa(email + ':' + Date.now()));
        localStorage.setItem('user_email', email);
        window.location.href = '../instructor-tools/index.html';
    } else {
        errorMsg.style.display = 'block';
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
});

// Clear error as soon as user edits either field
['email', 'password'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
        errorMsg.style.display = 'none';
    });
});
