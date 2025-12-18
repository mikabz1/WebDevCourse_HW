
const API_BASE_URL = 'http://localhost:3000/api';

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

// Check if username exists via API
async function usernameExists(username) {
    try {
        const response = await fetch(`${API_BASE_URL}/check-username/${encodeURIComponent(username)}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            return data.exists;
        }
        return false;
    } catch (error) {
        console.error('Username check error:', error);
        return false;
    }
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
async function validateField(field, validator) {
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
        const result = await validator(value);
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
async function validateUsername(value) {
    if (!value) {
        return { valid: false, message: 'שדה זה חובה' };
    }
    
    const exists = await usernameExists(value);
    if (exists) {
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
usernameInput.addEventListener('blur', async () => {
    await validateField(usernameInput, validateUsername);
});

passwordInput.addEventListener('blur', async () => {
    await validateField(passwordInput, validatePassword);
});

confirmPasswordInput.addEventListener('input', async () => {
    if (passwordInput.value) {
        await validateField(confirmPasswordInput, validatePasswordConfirmation);
    }
});

confirmPasswordInput.addEventListener('blur', async () => {
    await validateField(confirmPasswordInput, validatePasswordConfirmation);
});

firstNameInput.addEventListener('blur', async () => {
    await validateField(firstNameInput);
});

imageUrlInput.addEventListener('blur', async () => {
    await validateField(imageUrlInput, validateImageUrl);
});

// Form submission
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();

    // Validate all fields
    const isUsernameValid = await validateField(usernameInput, validateUsername);
    const isPasswordValid = await validateField(passwordInput, validatePassword);
    const isConfirmPasswordValid = await validateField(confirmPasswordInput, validatePasswordConfirmation);
    const isFirstNameValid = await validateField(firstNameInput);
    const isImageUrlValid = await validateField(imageUrlInput, validateImageUrl);

    // Check if all fields are valid
    if (isUsernameValid && isPasswordValid && isConfirmPasswordValid && isFirstNameValid && isImageUrlValid) {
        try {
            // Register user via API
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: usernameInput.value.trim(),
                    password: passwordInput.value,
                    firstName: firstNameInput.value.trim(),
                    imageUrl: imageUrlInput.value.trim()
                })
            });

            if (response.ok) {
                // Show success message
                alert('ההרשמה בוצעה בהצלחה! מעביר לדף ההתחברות...');

                // Redirect to login page
                window.location.href = 'login.html';
            } else {
                const error = await response.json();
                alert('שגיאה בהרשמה: ' + (error.error || 'שגיאה לא ידועה'));
            }
        } catch (error) {
            console.error('Register error:', error);
            alert('שגיאה בחיבור לשרת');
        }
    } else {
        // Mark form as validated to show all error messages
        form.classList.add('was-validated');
    }
});

