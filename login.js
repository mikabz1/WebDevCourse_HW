
const STORAGE_KEY = 'users';
const SESSION_KEY = 'currentUser';
const DEMO_USER_KEY = 'demoUserCreated';

// Get form and input elements
const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Create demo user if doesn't exist
function createDemoUser() {
    const users = getUsers();
    const demoUserExists = users.some(u => u.username.toLowerCase() === 'demo');
    
    if (!demoUserExists) {
        const demoUser = {
            id: Date.now(),
            username: 'demo',
            password: 'demo123',
            firstName: 'משתמש',
            imageUrl: 'https://via.placeholder.com/150/667eea/ffffff?text=Demo',
            registrationDate: new Date().toISOString()
        };
        users.push(demoUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
}

// Login as demo user
function loginAsDemo() {
    // Create demo user if needed
    createDemoUser();
    
    // Get demo user
    const users = getUsers();
    const demoUser = users.find(u => u.username.toLowerCase() === 'demo');
    
    if (demoUser) {
        // Save to sessionStorage
        saveCurrentUser(demoUser);
        
        // Show success message
        alert('התחברת כמשתמש דמו בהצלחה! מעביר לדף החיפוש...');
        
        // Redirect to search page
        window.location.href = 'search.html';
    } else {
        alert('שגיאה בהתחברות כמשתמש דמו');
    }
}

// Make function globally available
window.loginAsDemo = loginAsDemo;

// Get users from localStorage
function getUsers() {
    const usersData = localStorage.getItem(STORAGE_KEY);
    return usersData ? JSON.parse(usersData) : [];
}

// Initialize demo user on page load
document.addEventListener('DOMContentLoaded', function() {
    createDemoUser();
});

// Save current user to sessionStorage
function saveCurrentUser(user) {
    // Remove password before saving to session
    const userWithoutPassword = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        imageUrl: user.imageUrl,
        registrationDate: user.registrationDate
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
}

// Validate login credentials
function validateLogin(username, password) {
    if (!username || !password) {
        return {
            valid: false,
            message: 'אנא מלא את כל השדות'
        };
    }

    const users = getUsers();
    const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
    );

    if (!user) {
        return {
            valid: false,
            message: 'שם המשתמש או הסיסמה שגויים'
        };
    }

    return {
        valid: true,
        user: user
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

    // Validate credentials
    const validationResult = validateLogin(username, password);

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

