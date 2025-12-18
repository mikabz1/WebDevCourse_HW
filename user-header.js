
// This file should be included in all pages to display user info in header
const API_BASE_URL = 'http://localhost:3000/api';
const SESSION_KEY = 'currentUser';

// Get current user from sessionStorage or API
async function getCurrentUser() {
    // First check sessionStorage
    const userData = sessionStorage.getItem(SESSION_KEY);
    if (userData) {
        return JSON.parse(userData);
    }

    // If not in sessionStorage, try to get from API
    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            credentials: 'include'
        });

        if (response.ok) {
            const user = await response.json();
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return user;
        }
    } catch (error) {
        console.error('Get current user error:', error);
    }

    return null;
}

// Check if user is logged in
async function isUserLoggedIn() {
    const user = await getCurrentUser();
    return user !== null;
}

// Display user info in header
async function displayUserHeader() {
    const user = await getCurrentUser();
    
    if (!user) {
        return;
    }

    // Create header element if it doesn't exist
    let headerElement = document.getElementById('userHeader');
    
    if (!headerElement) {
        headerElement = document.createElement('div');
        headerElement.id = 'userHeader';
        headerElement.className = 'user-header';
        headerElement.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            position: sticky;
            top: 0;
            z-index: 1000;
        `;
        
        // Insert at the beginning of body
        document.body.insertBefore(headerElement, document.body.firstChild);
    }

    // Create user info section with welcome message
    const userInfoHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            ${user.imageUrl ? `
                <img src="${user.imageUrl}" 
                     alt="${user.firstName}" 
                     style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid white;">
            ` : `
                <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user" style="font-size: 1.5rem;"></i>
                </div>
            `}
            <div>
                <div style="font-weight: bold; font-size: 1.1rem;">שלום ${user.firstName}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${user.username}</div>
            </div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button id="themeToggleBtn" onclick="toggleTheme()" class="btn btn-light btn-sm" title="עבור למצב לילה">
                <i class="fas fa-moon"></i> לילה
            </button>
            <a href="search.html" class="btn btn-light btn-sm">
                <i class="fas fa-search"></i> חיפוש
            </a>
            <a href="playlists.html" class="btn btn-light btn-sm">
                <i class="fas fa-music"></i> הפלייליסטים שלי
            </a>
            <button onclick="logout()" class="btn btn-light btn-sm">
                <i class="fas fa-sign-out-alt"></i> התנתק
            </button>
        </div>
    `;

    headerElement.innerHTML = userInfoHTML;
    
    // Update theme icon if theme toggle is available
    if (typeof updateThemeIcon === 'function') {
        const currentTheme = typeof getCurrentTheme === 'function' ? getCurrentTheme() : 'light';
        updateThemeIcon(currentTheme);
    }
}

// Logout function
async function logout() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
    }
}

// Check if user should be redirected to login
async function checkAuthAndRedirect() {
    // Get current page name
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that don't require authentication
    const publicPages = ['login.html', 'register.html', 'index.html'];
    
    // If current page requires auth and user is not logged in, redirect to login
    const loggedIn = await isUserLoggedIn();
    if (!publicPages.includes(currentPage) && !loggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Initialize header when page loads
document.addEventListener('DOMContentLoaded', async function() {
    if (await checkAuthAndRedirect()) {
        await displayUserHeader();
    }
});

// Also check on pageshow event to handle back navigation
window.addEventListener('pageshow', async function(event) {
    // If page was loaded from cache (back navigation), refresh header
    if (event.persisted) {
        await displayUserHeader();
    }
});

