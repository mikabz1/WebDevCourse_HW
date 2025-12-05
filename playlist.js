
const PLAYLISTS_STORAGE_KEY = 'playlists';

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

// Display playlists
function displayPlaylists() {
    const playlists = getPlaylists();
    const container = document.getElementById('playlistsContainer');
    
    if (playlists.length === 0) {
        container.innerHTML = `
            <div class="no-playlists">
                <i class="fas fa-music fa-3x mb-3"></i>
                <p>אין לך פלייליסטים עדיין</p>
                <p class="text-muted">עבור לדף החיפוש והוסף סרטונים לפלייליסטים</p>
                <a href="search.html" class="btn btn-primary mt-3">
                    <i class="fas fa-search"></i> עבור לחיפוש
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    playlists.forEach(playlist => {
        const playlistCard = document.createElement('div');
        playlistCard.className = 'playlist-card';
        
        const videosCount = playlist.videos ? playlist.videos.length : 0;
        const createdDate = new Date(playlist.createdDate).toLocaleDateString('he-IL');
        
        playlistCard.innerHTML = `
            <div class="playlist-header">
                <div>
                    <div class="playlist-name">${playlist.name}</div>
                    <small class="text-muted">נוצר ב-${createdDate} | ${videosCount} סרטונים</small>
                </div>
            </div>
            ${videosCount > 0 ? `
                <div class="videos-grid">
                    ${playlist.videos.map(video => `
                        <div class="video-item" onclick="playVideo('${video.id}', '${video.title.replace(/'/g, "\\'")}')">
                            <img src="${video.thumbnail}" alt="${video.title}">
                            <div class="video-item-info">
                                <div class="video-item-title" title="${video.title}">${video.title}</div>
                                <small class="text-muted">${video.channelTitle}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="text-muted">אין סרטונים בפלייליסט זה</p>'}
        `;
        
        container.appendChild(playlistCard);
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayPlaylists();
});

// Make function globally available
window.playVideo = playVideo;

