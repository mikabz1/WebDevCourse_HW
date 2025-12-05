
const PLAYLISTS_STORAGE_KEY = 'playlists';
let currentPlaylistId = null;
let currentVideos = [];
let sortOrder = 'name'; // 'name' or 'rating'

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
    
    const allPlaylistsData = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    let allPlaylists = allPlaylistsData ? JSON.parse(allPlaylistsData) : [];
    
    allPlaylists = allPlaylists.filter(p => p.userId !== userId);
    allPlaylists = allPlaylists.concat(playlists);
    
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(allPlaylists));
}

// Get playlist by ID
function getPlaylistById(playlistId) {
    const playlists = getPlaylists();
    return playlists.find(p => p.id == playlistId);
}

// Initialize page
function initPage() {
    // Check for playlist ID in URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const playlistIdParam = urlParams.get('id');
    
    displayPlaylistsSidebar();
    
    if (playlistIdParam) {
        selectPlaylist(parseInt(playlistIdParam));
    } else {
        // Load first playlist by default
        const playlists = getPlaylists();
        if (playlists.length > 0) {
            selectPlaylist(playlists[0].id);
        } else {
            showEmptyState();
        }
    }
}

// Display playlists in sidebar
function displayPlaylistsSidebar() {
    const playlists = getPlaylists();
    const container = document.getElementById('playlistsList');
    
    if (playlists.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">אין פלייליסטים</p>';
        return;
    }
    
    container.innerHTML = '';
    playlists.forEach(playlist => {
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
        row.innerHTML = `
            <img src="${video.thumbnail}" 
                 alt="${video.title}" 
                 class="video-thumbnail"
                 onclick="playVideo('${video.id}', '${video.title.replace(/'/g, "\\'")}')">
            <div class="video-info">
                <div class="video-title" onclick="playVideo('${video.id}', '${video.title.replace(/'/g, "\\'")}')">
                    ${video.title}
                </div>
                <div class="video-channel">${video.channelTitle}</div>
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
        container.appendChild(row);
    });
}

// Update video rating
function updateVideoRating(videoIndex, rating) {
    const ratingValue = parseInt(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 10) {
        return;
    }
    
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === currentPlaylistId);
    
    if (playlist && playlist.videos && playlist.videos[videoIndex]) {
        playlist.videos[videoIndex].rating = ratingValue;
        savePlaylists(playlists);
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
    
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === currentPlaylistId);
    
    if (playlist && playlist.videos) {
        playlist.videos.splice(videoIndex, 1);
        savePlaylists(playlists);
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
    
    const playlists = getPlaylists();
    const filtered = playlists.filter(p => p.id !== playlistId);
    savePlaylists(filtered);
    
    // If deleted playlist was selected, select first one or show empty state
    if (currentPlaylistId === playlistId) {
        const remaining = getPlaylists();
        if (remaining.length > 0) {
            selectPlaylist(remaining[0].id);
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

// Play video
function playVideo(videoId, title) {
    const modal = new bootstrap.Modal(document.getElementById('videoModal'));
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    
    document.getElementById('videoModalTitle').textContent = title || 'נגן וידאו';
    document.getElementById('videoPlayerContainer').innerHTML = 
        `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 400px;"></iframe>`;
    
    modal.show();
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

// Open new playlist modal
function openNewPlaylistModal() {
    document.getElementById('newPlaylistNameInput').value = '';
    const modal = new bootstrap.Modal(document.getElementById('newPlaylistModal'));
    modal.show();
}

// Create new playlist
function createNewPlaylist() {
    const name = document.getElementById('newPlaylistNameInput').value.trim();
    
    if (!name) {
        alert('אנא הכנס שם לפלייליסט');
        return;
    }
    
    const playlists = getPlaylists();
    const newPlaylist = {
        id: Date.now(),
        userId: getCurrentUserId(),
        name: name,
        createdDate: new Date().toISOString(),
        videos: []
    };
    
    playlists.push(newPlaylist);
    savePlaylists(playlists);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('newPlaylistModal'));
    modal.hide();
    
    // Select new playlist
    selectPlaylist(newPlaylist.id);
}

// Initialize search input listener
document.addEventListener('DOMContentLoaded', function() {
    initPage();
    
    // Search input listener
    document.getElementById('searchInput').addEventListener('input', searchVideos);
});

// Make functions globally available
window.selectPlaylist = selectPlaylist;
window.deleteVideo = deleteVideo;
window.deletePlaylist = deletePlaylist;
window.updateVideoRating = updateVideoRating;
window.sortVideos = sortVideos;
window.playVideo = playVideo;
window.playPlaylist = playPlaylist;
window.openNewPlaylistModal = openNewPlaylistModal;
window.createNewPlaylist = createNewPlaylist;

