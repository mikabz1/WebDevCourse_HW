
const USERS_STORAGE_KEY = 'users';
const SESSION_KEY = 'currentUser';

// Get form and input elements
const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Get users from localStorage
function getUsers() {
    const usersData = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersData) {
        // Initialize with demo user if no users exist
        const demoUser = {
            id: Date.now(),
            username: 'demo',
            password: 'demo123',
            firstName: 'משתמש',
            imageUrl: 'https://via.placeholder.com/150/667eea/ffffff?text=Demo',
            registrationDate: new Date().toISOString()
        };
        const users = [demoUser];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        return users;
    }
    return JSON.parse(usersData);
}

// Save current user to sessionStorage
function saveCurrentUser(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Login as demo user
function loginAsDemo() {
    const users = getUsers();
    const demoUser = users.find(u => u.username.toLowerCase() === 'demo');
    
    if (demoUser && demoUser.password === 'demo123') {
        const { password, ...userWithoutPassword } = demoUser;
        saveCurrentUser(userWithoutPassword);
        alert('התחברת כמשתמש דמו בהצלחה! מעביר לדף החיפוש...');
        window.location.href = 'search.html';
    } else {
        alert('שגיאה בהתחברות כמשתמש דמו');
    }
}

// Make function globally available
window.loginAsDemo = loginAsDemo;

// Login function
function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
        return {
            valid: false,
            message: 'שם המשתמש או הסיסמה שגויים'
        };
    }
    
    if (user.password !== password) {
        return {
            valid: false,
            message: 'שם המשתמש או הסיסמה שגויים'
        };
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return {
        valid: true,
        user: userWithoutPassword
    };
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

    // Login
    const validationResult = login(username, password);
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
