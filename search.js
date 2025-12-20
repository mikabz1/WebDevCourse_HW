
// מפתח YouTube API
const YOUTUBE_API_KEY = 'AIzaSyDmjz9a4UPb65kCDUOrak9XZj9VMa4bGJY';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const PLAYLISTS_STORAGE_KEY = 'playlists';

// Current video being added to playlist
let currentVideoToAdd = null;

// Get form and elements - will be initialized on DOMContentLoaded
let searchForm;
let searchInput;
let resultsContainer;
let loadingDiv;

// Get current user ID
function getCurrentUserId() {
    const userData = sessionStorage.getItem('currentUser');
    if (userData) {
        const user = JSON.parse(userData);
        return user.id;
    }
    return null;
}

// Get playlists from localStorage for current user
function getPlaylists() {
    const userId = getCurrentUserId();
    if (!userId) return [];
    
    const playlistsData = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    if (!playlistsData) return [];
    
    const allPlaylists = JSON.parse(playlistsData);
    return allPlaylists.filter(p => p.userId === userId) || [];
}

// Save playlists to localStorage
function savePlaylists(playlists) {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    // Get all playlists from storage
    const allPlaylistsData = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    let allPlaylists = allPlaylistsData ? JSON.parse(allPlaylistsData) : [];
    
    // Remove old playlists for this user
    allPlaylists = allPlaylists.filter(p => p.userId !== userId);
    
    // Add updated playlists
    allPlaylists = allPlaylists.concat(playlists);
    
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(allPlaylists));
}

// Check if video is in any playlist
function isVideoInPlaylist(videoId) {
    const playlists = getPlaylists();
    return playlists.some(playlist => 
        playlist.videos && playlist.videos.some(v => v.id === videoId)
    );
}

// Get playlist name that contains the video
function getPlaylistNameForVideo(videoId) {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => 
        p.videos && p.videos.some(v => v.id === videoId)
    );
    return playlist ? playlist.name : null;
}

// Format duration (ISO 8601 to readable format)
function formatDuration(duration) {
    if (!duration) return 'לא זמין';
    
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    let result = '';
    if (hours) result += hours + ':';
    if (minutes) result += (minutes.length === 1 ? '0' : '') + minutes + ':';
    else if (hours) result += '00:';
    result += (seconds.length === 1 ? '0' : '') + seconds;
    
    return result;
}

// Format view count
function formatViewCount(count) {
    if (!count) return '0 צפיות';
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M צפיות';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K צפיות';
    }
    return count + ' צפיות';
}

// Get video details (including duration and view count)
async function getVideoDetails(videoId) {
    try {
        // Skip if API key is not set
        if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
            return { duration: null, viewCount: 0 };
        }

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return {
                duration: data.items[0].contentDetails.duration,
                viewCount: parseInt(data.items[0].statistics.viewCount)
            };
        }
    } catch (error) {
        console.error('Error fetching video details:', error);
    }
    return { duration: null, viewCount: 0 };
}

// Save search state to sessionStorage
function saveSearchState(query, videos, videoDetails) {
    const searchState = {
        query: query,
        videos: videos,
        videoDetails: videoDetails,
        timestamp: Date.now()
    };
    sessionStorage.setItem('searchState', JSON.stringify(searchState));
}

// Load search state from sessionStorage
function loadSearchState() {
    const savedState = sessionStorage.getItem('searchState');
    if (savedState) {
        try {
            return JSON.parse(savedState);
        } catch (error) {
            console.error('Error loading search state:', error);
            return null;
        }
    }
    return null;
}

// Clear search state from sessionStorage
function clearSearchState() {
    sessionStorage.removeItem('searchState');
}

// Search YouTube videos
async function searchVideos(query) {
    console.log('searchVideos called with query:', query);
    
    if (!resultsContainer || !loadingDiv) {
        console.error('Search elements not initialized', { resultsContainer, loadingDiv });
        alert('שגיאה בטעינת הדף. אנא רענן את הדף.');
        return;
    }
    
    try {
        // Check if API key is set
        if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
            console.log('YouTube API key not set');
            loadingDiv.style.display = 'none';
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-key fa-3x mb-3 text-warning"></i>
                    <h5>מפתח YouTube API לא הוגדר</h5>
                    <p>כדי להשתמש בחיפוש, יש להגדיר מפתח YouTube API.</p>
                    <div class="mt-3">
                        <p><strong>הוראות:</strong></p>
                        <ol class="text-start" style="display: inline-block;">
                            <li>עבור ל-<a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
                            <li>צור פרויקט חדש או בחר קיים</li>
                            <li>הפעל את YouTube Data API v3</li>
                            <li>צור מפתח API תחת Credentials</li>
                            <li>החלף את המפתח בקובץ search.js</li>
                        </ol>
                    </div>
                </div>
            `;
            return;
        }

        console.log('Starting search, showing loading...');
        loadingDiv.style.display = 'block';
        resultsContainer.innerHTML = '';

        const searchUrl = `${YOUTUBE_SEARCH_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=12&key=${YOUTUBE_API_KEY}`;
        console.log('Fetching from YouTube API...', searchUrl);

        const response = await fetch(searchUrl);
        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        // Check for API errors
        if (data.error) {
            let errorMessage = 'שגיאה בחיפוש. ';
            if (data.error.errors && data.error.errors.length > 0) {
                const error = data.error.errors[0];
                if (error.reason === 'keyInvalid') {
                    errorMessage += 'מפתח API לא תקין. אנא בדוק את המפתח בקובץ search.js';
                } else if (error.reason === 'quotaExceeded') {
                    errorMessage += 'חרגת ממכסת השימוש ב-API. נסה שוב מאוחר יותר.';
                } else {
                    errorMessage += error.message || 'אנא נסה שוב מאוחר יותר.';
                }
            }
            loadingDiv.style.display = 'none';
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                    <p>${errorMessage}</p>
                </div>
            `;
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (!data.items || data.items.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results"><i class="fas fa-search fa-3x mb-3"></i><p>לא נמצאו תוצאות</p></div>';
            loadingDiv.style.display = 'none';
            return;
        }

        // Fetch details for each video (duration and view count)
        const videoDetailsPromises = data.items.map(video => 
            getVideoDetails(video.id.videoId)
        );
        const videoDetails = await Promise.all(videoDetailsPromises);

        // Save search state
        saveSearchState(query, data.items, videoDetails);

        // Display results
        await displayResults(data.items, videoDetails);
        loadingDiv.style.display = 'none';

    } catch (error) {
        console.error('Error searching videos:', error);
        loadingDiv.style.display = 'none';
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                <h5>שגיאה בחיפוש</h5>
                <p>${error.message || 'אנא נסה שוב מאוחר יותר.'}</p>
                <p class="text-muted mt-2">ודא שיש לך חיבור לאינטרנט ומפתח API תקין.</p>
            </div>
        `;
    }
}

// Display search results
async function displayResults(videos, videoDetails) {
    if (!resultsContainer) {
        console.error('Results container not initialized');
        return;
    }
    
    resultsContainer.innerHTML = '';

    // Get all playlists once
    const playlists = getPlaylists();

    videos.forEach((video, index) => {
        const details = videoDetails[index];
        const videoId = video.id.videoId;
        const isInPlaylist = playlists.some(playlist => 
            playlist.videos && playlist.videos.some(v => v.id === videoId)
        );
        const duration = formatDuration(details.duration);
        const viewCount = formatViewCount(details.viewCount);

        const card = document.createElement('div');
        card.className = 'video-card';
        
        // Escape HTML to prevent XSS and syntax errors
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        const safeTitle = escapeHtml(video.snippet.title);
        const safeChannelTitle = escapeHtml(video.snippet.channelTitle);
        const safeThumbnail = escapeHtml(video.snippet.thumbnails.medium.url);
        
        card.innerHTML = `
            <div class="thumbnail-container">
                ${isInPlaylist ? '<div class="in-playlist-icon" title="נמצא בפלייליסט"><i class="fas fa-check"></i></div>' : ''}
                <img src="${safeThumbnail}" 
                     alt="${safeTitle}"
                     class="video-thumbnail"
                     style="cursor: pointer;">
                <span class="duration-badge">${duration}</span>
            </div>
            <div class="video-info">
                <div class="video-title" 
                     title="${safeTitle}"
                     style="cursor: pointer;">
                    ${safeTitle}
                </div>
                <div class="video-details">
                    <span><i class="fas fa-eye"></i> ${viewCount}</span>
                    <span><i class="fas fa-user"></i> ${safeChannelTitle}</span>
                </div>
                <div class="video-actions">
                    <button class="btn btn-primary btn-sm btn-action play-video-btn">
                        <i class="fas fa-play"></i> נגן
                    </button>
                    <button class="btn ${isInPlaylist ? 'btn-secondary' : 'btn-outline-warning'} btn-sm btn-action add-to-playlist-btn"
                            ${isInPlaylist ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i> ${isInPlaylist ? 'בפלייליסט' : 'הוסף לפלייליסט'}
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners instead of inline onclick
        const thumbnail = card.querySelector('.video-thumbnail');
        const titleElement = card.querySelector('.video-title');
        const playBtn = card.querySelector('.play-video-btn');
        const addBtn = card.querySelector('.add-to-playlist-btn');
        
        const playHandler = () => playVideo(videoId, video.snippet.title);
        const addHandler = () => openAddToPlaylistModal(
            videoId, 
            video.snippet.title, 
            video.snippet.thumbnails.medium.url, 
            video.snippet.channelTitle
        );
        
        thumbnail.addEventListener('click', playHandler);
        titleElement.addEventListener('click', playHandler);
        playBtn.addEventListener('click', playHandler);
        
        if (!isInPlaylist) {
            addBtn.addEventListener('click', addHandler);
        }
        
        resultsContainer.appendChild(card);
    });
}

// Play video in modal
function playVideo(videoId, title) {
    const modal = new bootstrap.Modal(document.getElementById('videoModal'));
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    
    document.getElementById('videoModalTitle').textContent = title || 'נגן וידאו';
    document.getElementById('videoPlayerContainer').innerHTML = 
        `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 400px;"></iframe>`;
    
    modal.show();
}

// Open add to playlist modal
function openAddToPlaylistModal(videoId, title, thumbnail, channelTitle) {
    currentVideoToAdd = {
        id: videoId,
        title: title,
        thumbnail: thumbnail,
        channelTitle: channelTitle
    };
    
    // Populate playlists dropdown
    const playlists = getPlaylists();
    const select = document.getElementById('playlistSelect');
    select.innerHTML = '<option value="">-- בחר פלייליסט --</option>';
    
    playlists.forEach(playlist => {
        const option = document.createElement('option');
        option.value = playlist.id;
        option.textContent = playlist.name;
        select.appendChild(option);
    });
    
    // Clear new playlist name
    document.getElementById('newPlaylistName').value = '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('playlistModal'));
    modal.show();
}

// Confirm add to playlist
function confirmAddToPlaylist() {
    if (!currentVideoToAdd) return;
    
    const selectedPlaylistId = document.getElementById('playlistSelect').value;
    const newPlaylistName = document.getElementById('newPlaylistName').value.trim();
    
    if (!selectedPlaylistId && !newPlaylistName) {
        alert('אנא בחר פלייליסט קיים או צור פלייליסט חדש');
        return;
    }
    
    let playlistName = '';
    let playlistId = null;
    
    const playlists = getPlaylists();
    const userId = getCurrentUserId();
    
    if (!userId) {
        alert('אנא התחבר תחילה');
        window.location.href = 'login.html';
        return;
    }
    
    if (selectedPlaylistId) {
        // Add to existing playlist
        const playlist = playlists.find(p => p.id == selectedPlaylistId);
        if (playlist) {
            if (!playlist.videos) {
                playlist.videos = [];
            }
            if (!playlist.videos.some(v => v.id === currentVideoToAdd.id)) {
                playlist.videos.push({
                    ...currentVideoToAdd,
                    addedDate: new Date().toISOString()
                });
                playlistName = playlist.name;
                playlistId = playlist.id;
            }
        }
    } else if (newPlaylistName) {
        // Create new playlist
        const newPlaylist = {
            id: Date.now(),
            userId: userId,
            name: newPlaylistName,
            createdDate: new Date().toISOString(),
            videos: [{
                ...currentVideoToAdd,
                addedDate: new Date().toISOString()
            }]
        };
        
        playlists.push(newPlaylist);
        playlistId = newPlaylist.id;
        playlistName = newPlaylistName;
    }
    
    // Save playlists
    savePlaylists(playlists);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('playlistModal'));
    if (modal) {
        modal.hide();
    }
    
    // Show toast notification with link to playlists page
    if (playlistName && playlistId) {
        showToast(`הסרטון נוסף בהצלחה לפלייליסט "${playlistName}"`, playlistName, playlistId);
    }
    
    // Refresh results to update UI
    const query = searchInput.value.trim();
    if (query) {
        searchVideos(query);
    }
}

// Show toast notification
function showToast(message, playlistName, playlistId) {
    const toastElement = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const toastLink = document.getElementById('toastLink');
    const toastLinkText = document.getElementById('toastLinkText');
    
    if (!toastElement || !toastMessage || !toastLink || !toastLinkText) {
        console.error('Toast elements not found');
        // Fallback to alert if toast elements are missing
        const linkText = playlistId ? `\n\nלחץ כאן לעבור לפלייליסט: playlists.html?id=${playlistId}` : '';
        alert(message + linkText);
        return;
    }
    
    // Update message
    toastMessage.textContent = message;
    
    // Update link
    if (playlistId) {
        toastLink.href = `playlists.html?id=${playlistId}`;
        toastLinkText.textContent = `עבור לפלייליסט "${playlistName}"`;
    } else {
        toastLink.href = 'playlists.html';
        toastLinkText.textContent = 'עבור לפלייליסטים';
    }
    
    // Hide any existing toast instance first
    const existingToast = bootstrap.Toast.getInstance(toastElement);
    if (existingToast) {
        existingToast.dispose();
    }
    
    // Create and show new toast
    try {
        const toast = new bootstrap.Toast(toastElement, {
            delay: 5000,
            autohide: true
        });
        
        toast.show();
    } catch (error) {
        console.error('Error showing toast:', error);
        // Fallback to alert if toast fails
        const linkText = playlistId ? `\n\nלחץ כאן לעבור לפלייליסט: playlists.html?id=${playlistId}` : '';
        alert(message + linkText);
    }
}

// Restore search state on page load
async function restoreSearchState() {
    const savedState = loadSearchState();
    if (savedState && savedState.query && savedState.videos && savedState.videoDetails) {
        // Restore query in input field
        searchInput.value = savedState.query;
        
        // Restore results display
        await displayResults(savedState.videos, savedState.videoDetails);
    }
}


// Initialize elements and restore search state when page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize elements
    searchForm = document.getElementById('searchForm');
    searchInput = document.getElementById('searchInput');
    resultsContainer = document.getElementById('resultsContainer');
    loadingDiv = document.getElementById('loading');
    
    // Check if elements exist
    if (!searchForm || !searchInput || !resultsContainer || !loadingDiv) {
        console.error('Search page elements not found!');
        return;
    }
    
    // Form submission
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        const query = searchInput.value.trim();
        
        console.log('Form submitted, query:', query);
        
        if (query) {
            console.log('Calling searchVideos...');
            try {
                await searchVideos(query);
                console.log('searchVideos completed');
            } catch (error) {
                console.error('Error in searchVideos:', error);
                alert('שגיאה בחיפוש: ' + error.message);
            }
        } else {
            console.log('Empty query, not searching');
        }
    });
    
    // Restore search state
    await restoreSearchState();
});

// Make functions globally available
window.playVideo = playVideo;
window.openAddToPlaylistModal = openAddToPlaylistModal;
window.confirmAddToPlaylist = confirmAddToPlaylist;
