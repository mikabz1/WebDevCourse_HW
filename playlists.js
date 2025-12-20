
const PLAYLISTS_STORAGE_KEY = 'playlists';
let currentPlaylistId = null;
let currentVideos = [];
let sortOrder = 'name'; // 'name' or 'rating'
let allPlaylists = []; // Cache playlists

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

// Get playlist by ID
function getPlaylistById(playlistId) {
    return allPlaylists.find(p => p.id == playlistId);
}

// Save playlist to localStorage
function savePlaylist(playlist) {
    const index = allPlaylists.findIndex(p => p.id === playlist.id);
    if (index !== -1) {
        allPlaylists[index] = playlist;
    } else {
        allPlaylists.push(playlist);
    }
    savePlaylists(allPlaylists);
    return playlist;
}

// Initialize page
function initPage() {
    console.log('Initializing playlists page...');
    
    // Load playlists from localStorage
    allPlaylists = getPlaylists();
    console.log('After getPlaylists, allPlaylists:', allPlaylists.length);
    
    // Check for playlist ID in URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const playlistIdParam = urlParams.get('id');
    
    console.log('Displaying playlists sidebar...');
    displayPlaylistsSidebar();
    
    if (playlistIdParam) {
        const playlistId = parseInt(playlistIdParam);
        const playlist = getPlaylistById(playlistId);
        
        // If playlist exists, select it; otherwise fall back to first playlist
        if (playlist) {
            selectPlaylist(playlistId);
        } else {
            // Playlist not found, load first playlist by default
            if (allPlaylists.length > 0) {
                selectPlaylist(allPlaylists[0].id);
            } else {
                showEmptyState();
            }
        }
    } else {
        // No ID in URL, load first playlist by default
        if (allPlaylists.length > 0) {
            selectPlaylist(allPlaylists[0].id);
        } else {
            showEmptyState();
        }
    }
}

// Display playlists in sidebar
function displayPlaylistsSidebar() {
    const container = document.getElementById('playlistsList');
    if (!container) {
        console.error('playlistsList container not found');
        return;
    }
    
    console.log('Displaying playlists sidebar, count:', allPlaylists.length);
    console.log('Current playlists:', allPlaylists);
    
    const playlists = allPlaylists;
    
    if (playlists.length === 0) {
        console.log('No playlists to display');
        container.innerHTML = '<p class="text-muted text-center">אין פלייליסטים</p>';
        return;
    }
    
    container.innerHTML = '';
    playlists.forEach(playlist => {
        console.log('Adding playlist to sidebar:', playlist.name, playlist.id);
        const item = document.createElement('div');
        item.className = `playlist-item ${currentPlaylistId === playlist.id ? 'active' : ''}`;
        item.onclick = () => selectPlaylist(playlist.id);
        item.innerHTML = `
            <span class="playlist-item-name">${playlist.name}</span>
            <button class="playlist-delete-btn" onclick="deletePlaylist(${playlist.id}, event)" title="מחק פלייליסט">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(item);
    });
    console.log('Playlists sidebar displayed');
}

// Select playlist
function selectPlaylist(playlistId) {
    currentPlaylistId = playlistId;
    const playlist = getPlaylistById(playlistId);
    
    if (!playlist) {
        showEmptyState();
        return;
    }
    
    // Update URL without reload
    const newUrl = window.location.pathname + '?id=' + playlistId;
    window.history.pushState({}, '', newUrl);
    
    // Update sidebar active state
    displayPlaylistsSidebar();
    
    // Show content area
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('contentArea').style.display = 'block';
    document.getElementById('playPlaylistBtn').style.display = 'block';
    
    // Display playlist content
    document.getElementById('selectedPlaylistName').textContent = playlist.name;
    currentVideos = playlist.videos || [];
    displayVideos(currentVideos);
}

// Show empty state
function showEmptyState() {
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('contentArea').style.display = 'none';
    document.getElementById('playPlaylistBtn').style.display = 'none';
    currentPlaylistId = null;
}

// Display videos
function displayVideos(videos) {
    const container = document.getElementById('videosList');
    
    if (!videos || videos.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">אין סרטונים בפלייליסט זה</p>';
        return;
    }
    
    container.innerHTML = '';
    
    videos.forEach((video, index) => {
        const row = document.createElement('div');
        row.className = 'video-row';
        const isMp3 = video.isMp3 || false;
        
        // Escape special characters for safe HTML insertion
        const safeTitle = video.title.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
        const safeId = String(video.id).replace(/'/g, "&#39;");
        const safeMp3Url = (video.mp3Url || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
        
        // Create click handler function
        const playHandler = () => {
            if (isMp3 && video.mp3Url) {
                playVideo(video.id, video.title, true, video.mp3Url);
            } else {
                playVideo(video.id, video.title);
            }
        };
        
        row.innerHTML = `
            <img src="${video.thumbnail}" 
                 alt="${safeTitle}" 
                 class="video-thumbnail"
                 style="cursor: pointer;">
            <div class="video-info">
                <div class="video-title" style="cursor: pointer;">
                    ${isMp3 ? '<i class="fas fa-music me-2"></i>' : ''}${safeTitle}
                </div>
                <div class="video-channel">${video.channelTitle || ''}</div>
            </div>
            <div class="video-rating">
                <label class="form-label mb-0">דירוג:</label>
                <input type="number" 
                       class="form-control form-control-sm rating-input" 
                       min="1" 
                       max="10" 
                       value="${video.rating || ''}"
                       onchange="updateVideoRating(${index}, this.value)"
                       placeholder="1-10">
            </div>
            <div class="video-actions">
                <button class="btn btn-sm btn-danger" onclick="deleteVideo(${index})" title="מחק סרטון">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners instead of inline onclick
        const thumbnail = row.querySelector('.video-thumbnail');
        const titleElement = row.querySelector('.video-title');
        
        thumbnail.addEventListener('click', playHandler);
        titleElement.addEventListener('click', playHandler);
        
        container.appendChild(row);
    });
}

// Update video rating
function updateVideoRating(videoIndex, rating) {
    const ratingValue = parseInt(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 10) {
        return;
    }
    
    const playlist = getPlaylistById(currentPlaylistId);
    
    if (playlist && playlist.videos && playlist.videos[videoIndex]) {
        playlist.videos[videoIndex].rating = ratingValue;
        savePlaylist(playlist);
        currentVideos = playlist.videos;
        
        // Re-sort if sorting by rating
        if (sortOrder === 'rating') {
            sortVideos('rating');
        }
    }
}

// Delete video from playlist
function deleteVideo(videoIndex) {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הסרטון הזה?')) {
        return;
    }
    
    const playlist = getPlaylistById(currentPlaylistId);
    
    if (playlist && playlist.videos) {
        playlist.videos.splice(videoIndex, 1);
        savePlaylist(playlist);
        currentVideos = playlist.videos;
        displayVideos(currentVideos);
    }
}

// Delete entire playlist
function deletePlaylist(playlistId, event) {
    event.stopPropagation();
    
    if (!confirm('האם אתה בטוח שברצונך למחוק את הפלייליסט הזה? כל הסרטונים יימחקו.')) {
        return;
    }
    
    allPlaylists = allPlaylists.filter(p => p.id !== playlistId);
    savePlaylists(allPlaylists);
    
    // If deleted playlist was selected, select first one or show empty state
    if (currentPlaylistId === playlistId) {
        if (allPlaylists.length > 0) {
            selectPlaylist(allPlaylists[0].id);
        } else {
            showEmptyState();
        }
    } else {
        displayPlaylistsSidebar();
    }
}

// Sort videos
function sortVideos(order) {
    sortOrder = order;
    
    if (!currentVideos || currentVideos.length === 0) return;
    
    const sorted = [...currentVideos];
    
    if (order === 'name') {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (order === 'rating') {
        sorted.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            return ratingB - ratingA; // Highest first
        });
    }
    
    displayVideos(sorted);
}

// Search videos
function searchVideos() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayVideos(currentVideos);
        return;
    }
    
    const filtered = currentVideos.filter(video => 
        video.title.toLowerCase().includes(searchTerm)
    );
    
    displayVideos(filtered);
}

// Play video or MP3
function playVideo(videoId, title, isMp3, mp3Url) {
    try {
        const modalElement = document.getElementById('videoModal');
        if (!modalElement) {
            console.error('Video modal not found');
            alert('שגיאה: לא נמצא נגן מדיה');
            return;
        }
        
        const modal = new bootstrap.Modal(modalElement);
        
        const titleElement = document.getElementById('videoModalTitle');
        if (titleElement) {
            titleElement.textContent = title || 'נגן מדיה';
        }
        
        const containerElement = document.getElementById('videoPlayerContainer');
        if (!containerElement) {
            console.error('Video player container not found');
            alert('שגיאה: לא נמצא מיכל נגן');
            return;
        }
        
        if (isMp3 && mp3Url) {
            // Play MP3
            containerElement.innerHTML = 
                `<audio controls style="width: 100%;">
                    <source src="${mp3Url}" type="audio/mpeg">
                    הדפדפן שלך לא תומך בנגן אודיו.
                </audio>`;
        } else {
            // Play YouTube video
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            containerElement.innerHTML = 
                `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 400px;"></iframe>`;
        }
        
        modal.show();
    } catch (error) {
        console.error('Error playing video:', error);
        alert('שגיאה בפתיחת הנגן: ' + error.message);
    }
}

// Play entire playlist
function playPlaylist() {
    if (!currentVideos || currentVideos.length === 0) {
        alert('אין סרטונים בפלייליסט זה');
        return;
    }
    
    // Play first video
    const firstVideo = currentVideos[0];
    playVideo(firstVideo.id, firstVideo.title);
}

// Open new playlist modal - defined as global function immediately
window.openNewPlaylistModal = function() {
    const input = document.getElementById('newPlaylistNameInput');
    if (input) {
        input.value = '';
    }
    const modalElement = document.getElementById('newPlaylistModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

// Create new playlist
function createNewPlaylist() {
    const nameInput = document.getElementById('newPlaylistNameInput');
    if (!nameInput) {
        console.error('newPlaylistNameInput not found');
        return;
    }
    
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('אנא הכנס שם לפלייליסט');
        return;
    }
    
    console.log('Creating playlist:', name);
    
    const userId = getCurrentUserId();
    if (!userId) {
        alert('אנא התחבר תחילה');
        window.location.href = 'login.html';
        return;
    }
    
    const newPlaylist = {
        id: Date.now(),
        userId: userId,
        name: name.trim(),
        createdDate: new Date().toISOString(),
        videos: []
    };
    
    allPlaylists.push(newPlaylist);
    savePlaylists(allPlaylists);
    
    // Refresh sidebar
    displayPlaylistsSidebar();
    
    // Close modal
    const modalElement = document.getElementById('newPlaylistModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    
    // Select new playlist
    selectPlaylist(newPlaylist.id);
}

// Make createNewPlaylist available immediately
window.createNewPlaylist = createNewPlaylist;

// Open upload MP3 modal
function openUploadMp3Modal() {
    if (!currentPlaylistId) {
        alert('אנא בחר פלייליסט תחילה');
        return;
    }
    
    document.getElementById('uploadMp3Form').reset();
    const modal = new bootstrap.Modal(document.getElementById('uploadMp3Modal'));
    modal.show();
}

// Upload MP3 file
function uploadMp3() {
    const title = document.getElementById('mp3Title').value.trim();
    const artist = document.getElementById('mp3Artist').value.trim();
    const fileInput = document.getElementById('mp3File');
    const file = fileInput.files[0];

    if (!title || !artist || !file) {
        alert('אנא מלא את כל השדות');
        return;
    }

    if (!currentPlaylistId) {
        alert('אנא בחר פלייליסט תחילה');
        return;
    }

    // Convert file to base64 data URL
    const reader = new FileReader();
    reader.onload = function(e) {
        const mp3DataUrl = e.target.result;
        
        // Add to playlist as video-like object
        const mp3Video = {
            id: `mp3_${Date.now()}`,
            title: title,
            channelTitle: artist,
            thumbnail: 'https://via.placeholder.com/320x180/667eea/ffffff?text=MP3',
            mp3Url: mp3DataUrl,
            isMp3: true
        };

        const playlist = getPlaylistById(currentPlaylistId);
        if (playlist) {
            if (!playlist.videos) {
                playlist.videos = [];
            }
            playlist.videos.push({
                ...mp3Video,
                addedDate: new Date().toISOString()
            });
            
            savePlaylist(playlist);
            currentVideos = playlist.videos;
            displayVideos(currentVideos);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('uploadMp3Modal'));
            if (modal) {
                modal.hide();
            }

            alert('הקובץ הועלה בהצלחה והוסף לפלייליסט');
        }
    };
    
    reader.onerror = function() {
        alert('שגיאה בקריאת הקובץ');
    };
    
    reader.readAsDataURL(file);
}

// Make functions globally available immediately
window.selectPlaylist = selectPlaylist;
window.deleteVideo = deleteVideo;
window.deletePlaylist = deletePlaylist;
window.updateVideoRating = updateVideoRating;
window.sortVideos = sortVideos;
window.playVideo = playVideo;
window.playPlaylist = playPlaylist;
window.openNewPlaylistModal = openNewPlaylistModal;
window.createNewPlaylist = createNewPlaylist;
window.openUploadMp3Modal = openUploadMp3Modal;
window.uploadMp3 = uploadMp3;

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - initializing playlists page');
    initPage();
    
    // Search input listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchVideos);
    }
});
