
// This file should be included in all pages to display user info in header
const SESSION_KEY = 'currentUser';

// Get current user from sessionStorage
function getCurrentUser() {
    const userData = sessionStorage.getItem(SESSION_KEY);
    return userData ? JSON.parse(userData) : null;
}

// Check if user is logged in
function isUserLoggedIn() {
    return getCurrentUser() !== null;
}

// Display user info in header
function displayUserHeader() {
    const user = getCurrentUser();
    
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
function logout() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
    }
}

// Check if user should be redirected to login
function checkAuthAndRedirect() {
    // Get current page name
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that don't require authentication
    const publicPages = ['login.html', 'register.html', 'index.html'];
    
    // If current page requires auth and user is not logged in, redirect to login
    if (!publicPages.includes(currentPage) && !isUserLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Initialize header when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (checkAuthAndRedirect()) {
        displayUserHeader();
    }
});

// Also check on pageshow event to handle back navigation
window.addEventListener('pageshow', function(event) {
    // If page was loaded from cache (back navigation), refresh header
    if (event.persisted) {
        displayUserHeader();
    }
});

