
const API_BASE_URL = 'http://localhost:3000/api';
const SESSION_KEY = 'currentUser';

// Get form and input elements
const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Login as demo user
async function loginAsDemo() {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: 'demo',
                password: 'demo123'
            })
        });

        if (response.ok) {
            const user = await response.json();
            saveCurrentUser(user);
            alert('התחברת כמשתמש דמו בהצלחה! מעביר לדף החיפוש...');
            window.location.href = 'search.html';
        } else {
            const error = await response.json();
            alert('שגיאה בהתחברות כמשתמש דמו: ' + (error.error || 'שגיאה לא ידועה'));
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('שגיאה בהתחברות כמשתמש דמו');
    }
}

// Make function globally available
window.loginAsDemo = loginAsDemo;

// Save current user to sessionStorage
function saveCurrentUser(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Login via API
async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const user = await response.json();
            return {
                valid: true,
                user: user
            };
        } else {
            const error = await response.json();
            return {
                valid: false,
                message: error.error || 'שם המשתמש או הסיסמה שגויים'
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        return {
            valid: false,
            message: 'שגיאה בחיבור לשרת'
        };
    }
}

// Validate field
function validateField(field, feedbackElement, message) {
    if (!field.value.trim()) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        feedbackElement.textContent = message || 'שדה זה חובה';
        return false;
    }
    
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    feedbackElement.textContent = '';
    return true;
}

// Real-time validation
usernameInput.addEventListener('blur', () => {
    validateField(usernameInput, document.getElementById('usernameFeedback'), 'שדה זה חובה');
});

passwordInput.addEventListener('blur', () => {
    validateField(passwordInput, document.getElementById('passwordFeedback'), 'שדה זה חובה');
});

// Form submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Validate fields are filled
    const isUsernameValid = validateField(usernameInput, document.getElementById('usernameFeedback'), 'שדה זה חובה');
    const isPasswordValid = validateField(passwordInput, document.getElementById('passwordFeedback'), 'שדה זה חובה');

    if (!isUsernameValid || !isPasswordValid) {
        form.classList.add('was-validated');
        return;
    }

    // Login via API
    login(username, password).then(validationResult => {
        if (validationResult.valid) {
            // Save user to sessionStorage
            saveCurrentUser(validationResult.user);

            // Show success message
            alert('התחברת בהצלחה! מעביר לדף החיפוש...');

            // Redirect to search page
            window.location.href = 'search.html';
        } else {
            // Show error message
            usernameInput.classList.add('is-invalid');
            passwordInput.classList.add('is-invalid');
            document.getElementById('usernameFeedback').textContent = validationResult.message;
            document.getElementById('passwordFeedback').textContent = validationResult.message;
        }
    });
});

