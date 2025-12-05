
const THEME_STORAGE_KEY = 'theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

// Get current theme
function getCurrentTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme || THEME_LIGHT;
}

// Set theme
function setTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

// Toggle theme
function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    setTheme(newTheme);
}

// Update theme icon
function updateThemeIcon(theme) {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        if (theme === THEME_DARK) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> יום';
            themeToggleBtn.title = 'עבור למצב יום';
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> לילה';
            themeToggleBtn.title = 'עבור למצב לילה';
        }
    }
}

// Initialize theme on page load
function initTheme() {
    const theme = getCurrentTheme();
    setTheme(theme);
}

// Make functions globally available
window.toggleTheme = toggleTheme;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

