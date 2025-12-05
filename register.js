
const STORAGE_KEY = 'users';

// Get form and input elements
const form = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const firstNameInput = document.getElementById('firstName');
const imageUrlInput = document.getElementById('imageUrl');
const imagePreview = document.getElementById('imagePreview');

// Image preview functionality
imageUrlInput.addEventListener('input', function() {
    const url = this.value.trim();
    if (url && isValidUrl(url)) {
        imagePreview.src = url;
        imagePreview.style.display = 'block';
        imagePreview.onerror = function() {
            imagePreview.style.display = 'none';
        };
    } else {
        imagePreview.style.display = 'none';
    }
});

// Check if URL is valid
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Get users from localStorage
function getUsers() {
    const usersData = localStorage.getItem(STORAGE_KEY);
    return usersData ? JSON.parse(usersData) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Check if username exists
function usernameExists(username) {
    const users = getUsers();
    return users.some(user => user.username.toLowerCase() === username.toLowerCase());
}

// Validate password strength
function validatePassword(password) {
    if (password.length < 6) {
        return {
            valid: false,
            message: 'הסיסמה חייבת להכיל לפחות 6 תווים'
        };
    }

    const hasLetter = /[a-zA-Zא-ת]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9א-ת]/.test(password);

    if (!hasLetter) {
        return {
            valid: false,
            message: 'הסיסמה חייבת להכיל לפחות אות אחת'
        };
    }

    if (!hasNumber) {
        return {
            valid: false,
            message: 'הסיסמה חייבת להכיל לפחות מספר אחד'
        };
    }

    if (!hasSpecialChar) {
        return {
            valid: false,
            message: 'הסיסמה חייבת להכיל לפחות תו מיוחד אחד (לא אלפאנומרי)'
        };
    }

    return { valid: true };
}

// Validate form field
function validateField(field, validator) {
    const value = field.value.trim();
    const feedbackElement = document.getElementById(field.id + 'Feedback');
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        feedbackElement.textContent = 'שדה זה חובה';
        return false;
    }

    // Run custom validator if provided
    if (validator) {
        const result = validator(value);
        if (!result.valid) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
            feedbackElement.textContent = result.message;
            return false;
        }
    }

    // Field is valid
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    feedbackElement.textContent = '';
    return true;
}

// Validate username
function validateUsername(value) {
    if (!value) {
        return { valid: false, message: 'שדה זה חובה' };
    }
    
    if (usernameExists(value)) {
        return { valid: false, message: 'שם המשתמש כבר קיים במערכת' };
    }
    
    return { valid: true };
}

// Validate password confirmation
function validatePasswordConfirmation(value) {
    if (!value) {
        return { valid: false, message: 'שדה זה חובה' };
    }
    
    if (value !== passwordInput.value) {
        return { valid: false, message: 'הסיסמאות אינן תואמות' };
    }
    
    return { valid: true };
}

// Validate image URL
function validateImageUrl(value) {
    if (!value) {
        return { valid: false, message: 'שדה זה חובה' };
    }
    
    if (!isValidUrl(value)) {
        return { valid: false, message: 'כתובת URL לא תקינה' };
    }
    
    return { valid: true };
}

// Real-time validation
usernameInput.addEventListener('blur', () => {
    validateField(usernameInput, validateUsername);
});

passwordInput.addEventListener('blur', () => {
    validateField(passwordInput, validatePassword);
});

confirmPasswordInput.addEventListener('input', () => {
    if (passwordInput.value) {
        validateField(confirmPasswordInput, validatePasswordConfirmation);
    }
});

confirmPasswordInput.addEventListener('blur', () => {
    validateField(confirmPasswordInput, validatePasswordConfirmation);
});

firstNameInput.addEventListener('blur', () => {
    validateField(firstNameInput);
});

imageUrlInput.addEventListener('blur', () => {
    validateField(imageUrlInput, validateImageUrl);
});

// Form submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // Validate all fields
    const isUsernameValid = validateField(usernameInput, validateUsername);
    const isPasswordValid = validateField(passwordInput, validatePassword);
    const isConfirmPasswordValid = validateField(confirmPasswordInput, validatePasswordConfirmation);
    const isFirstNameValid = validateField(firstNameInput);
    const isImageUrlValid = validateField(imageUrlInput, validateImageUrl);

    // Check if all fields are valid
    if (isUsernameValid && isPasswordValid && isConfirmPasswordValid && isFirstNameValid && isImageUrlValid) {
        // Create user object
        const newUser = {
            id: Date.now(),
            username: usernameInput.value.trim(),
            password: passwordInput.value,
            firstName: firstNameInput.value.trim(),
            imageUrl: imageUrlInput.value.trim(),
            registrationDate: new Date().toISOString()
        };

        // Get existing users and add new user
        const users = getUsers();
        users.push(newUser);
        saveUsers(users);

        // Show success message
        alert('ההרשמה בוצעה בהצלחה! מעביר לדף ההתחברות...');

        // Redirect to login page
        window.location.href = 'login.html';
    } else {
        // Mark form as validated to show all error messages
        form.classList.add('was-validated');
    }
});

