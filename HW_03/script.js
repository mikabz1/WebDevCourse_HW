
//--Get HTML DOM Element References 
const form = document.getElementById('songForm');
const list = document.getElementById('songList');
const cardsList = document.getElementById('cardsList');
const submitBtn = document.getElementById('submitBtn');
const searchInput = document.getElementById('search');
const sortRadios = document.querySelectorAll('input[name="sortOption"]');
const viewToggle = document.getElementById('viewToggle');
const viewToggleImg = document.getElementById('viewToggleImg');
const tableContainer = document.getElementById('tableContainer');
const cardsContainer = document.getElementById('cardsContainer');

let songs = [];
let currentView = 'table'; // 'table' or 'cards'

// This runs automatically when the page finishes loading
document.addEventListener('DOMContentLoaded', () => {
    //1) Get From Local Storage
    const storedData = localStorage.getItem('songs');
    //02) if exist
    if (storedData) {
        // If yes, turn the JSON string back into an Array
        songs = JSON.parse(storedData);
        
        // Migrate old songs that don't have videoId or thumbnail
        let needsSave = false;
        songs.forEach(song => {
            if (!song.videoId && song.url) {
                const videoId = extractYouTubeId(song.url);
                if (videoId) {
                    song.videoId = videoId;
                    song.thumbnail = getYouTubeThumbnail(videoId);
                    needsSave = true;
                }
            }
            if (!song.rating) {
                song.rating = null; // Ensure rating field exists
            }
        });
        
        if (needsSave) {
            localStorage.setItem('songs', JSON.stringify(songs));
        }
    } else {
        // If no, start with an empty array
        songs = [];
    }

    // SHOW the data
    renderSongs();

    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', () => {
        renderSongs();
    });

    // Sort functionality
    sortRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            renderSongs();
        });
    });

    // View toggle
    viewToggle.addEventListener('click', toggleView);
}

// Extract YouTube Video ID from URL
function extractYouTubeId(url) {
    if (!url) return null;
    
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

// Get YouTube thumbnail URL
function getYouTubeThumbnail(videoId) {
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Get YouTube embed URL
function getYouTubeEmbedUrl(videoId) {
    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}`;
}

// Fetch video title from YouTube (using oEmbed API)
async function fetchVideoTitle(videoId) {
    if (!videoId) return '';
    
    try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (response.ok) {
            const data = await response.json();
            return data.title;
        }
    } catch (error) {
        console.error('Error fetching video title:', error);
    }
    return '';
}

//User Click the Add/Update Button
form.addEventListener('submit', async (e) => {
    //Don't submit the form to the server yet let me handle it here
    e.preventDefault();

    //Read Forms Data
    const title = document.getElementById('title').value;
    const url = document.getElementById('url').value;
    const rating = parseInt(document.getElementById('rating').value);
    const songId = document.getElementById('songId').value;

    // Extract YouTube ID
    const videoId = extractYouTubeId(url);
    if (!videoId) {
        alert('Invalid YouTube URL');
        return;
    }

    // Fetch video title if not provided
    let videoTitle = title;
    if (!title || title.trim() === '') {
        videoTitle = await fetchVideoTitle(videoId);
    }

    if (songId) {
        // Update existing song
        const songIndex = songs.findIndex(song => song.id == songId);
        if (songIndex !== -1) {
            // If URL changed, update videoId and thumbnail
            const newVideoId = extractYouTubeId(url);
            songs[songIndex] = {
                ...songs[songIndex],
                title: videoTitle || songs[songIndex].title,
                url: url,
                rating: rating,
                videoId: newVideoId || songs[songIndex].videoId,
                thumbnail: newVideoId ? getYouTubeThumbnail(newVideoId) : songs[songIndex].thumbnail
            };
        }
        
        // Reset form to Add mode
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
        submitBtn.classList.replace('btn-warning', 'btn-success');
        document.getElementById('songId').value = '';
    } else {
        //create JSON OBJ Based on URL title
        const song = {
            id: Date.now(),  // Unique ID
            title: videoTitle,
            url: url,
            rating: rating,
            dateAdded: Date.now(),
            videoId: videoId,
            thumbnail: getYouTubeThumbnail(videoId)
        };

        songs.push(song);
    }

    saveAndRender();
    form.reset();
});

//Save to Local storage and render UI Table
function saveAndRender() {
    localStorage.setItem('songs', JSON.stringify(songs));
    renderSongs();
}

// Get filtered and sorted songs
function getFilteredAndSortedSongs() {
    let filtered = [...songs];
    
    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(song => 
            song.title.toLowerCase().includes(searchTerm) ||
            song.url.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply sort
    const sortOption = document.querySelector('input[name="sortOption"]:checked').value;
    filtered.sort((a, b) => {
        switch(sortOption) {
            case 'name':
                return a.title.localeCompare(b.title);
            case 'date':
                return b.dateAdded - a.dateAdded; // Newest first
            case 'rating':
                return (b.rating || 0) - (a.rating || 0); // Highest first
            default:
                return 0;
        }
    });
    
    return filtered;
}

//Display Song From Current Updated songs array as table Rows 
function renderSongs() {
    const filteredSongs = getFilteredAndSortedSongs();
    
    if (currentView === 'table') {
        renderTableView(filteredSongs);
    } else {
        renderCardsView(filteredSongs);
    }
}

function renderTableView(filteredSongs) {
    list.innerHTML = ''; // Clear current list

    if (filteredSongs.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">No songs found</td>';
        list.appendChild(row);
        return;
    }

    filteredSongs.forEach(song => {
        // Create table row
        const row = document.createElement('tr');

        const dateAdded = new Date(song.dateAdded).toLocaleDateString('he-IL');
        const thumbnail = song.thumbnail || getYouTubeThumbnail(song.videoId || extractYouTubeId(song.url));

        row.innerHTML = `
            <td>
                ${thumbnail ? `<img src="${thumbnail}" alt="${song.title}" class="thumbnail-img" onclick="playVideo('${song.videoId || extractYouTubeId(song.url)}', '${song.title.replace(/'/g, "\\'")}')" style="width: 120px; height: 90px; object-fit: cover; cursor: pointer;">` : 'No thumbnail'}
            </td>
            <td>${song.title}</td>
            <td>
                <span class="badge bg-primary">${song.rating || 'N/A'}/10</span>
            </td>
            <td>${dateAdded}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-info me-2" onclick="playVideo('${song.videoId || extractYouTubeId(song.url)}', '${song.title.replace(/'/g, "\\'")}')" title="Play">
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn btn-sm btn-warning me-2" onclick="editSong(${song.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSong(${song.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        list.appendChild(row);
    });
}

function renderCardsView(filteredSongs) {
    cardsList.innerHTML = ''; // Clear current list

    if (filteredSongs.length === 0) {
        cardsList.innerHTML = '<div class="col-12 text-center">No songs found</div>';
        return;
    }

    filteredSongs.forEach(song => {
        const dateAdded = new Date(song.dateAdded).toLocaleDateString('he-IL');
        const thumbnail = song.thumbnail || getYouTubeThumbnail(song.videoId || extractYouTubeId(song.url));
        const videoId = song.videoId || extractYouTubeId(song.url);

        const card = document.createElement('div');
        card.className = 'col-md-4 col-sm-6';
        card.innerHTML = `
            <div class="card video-card h-100">
                ${thumbnail ? `<img src="${thumbnail}" class="card-img-top thumbnail-img" alt="${song.title}" onclick="playVideo('${videoId}', '${song.title.replace(/'/g, "\\'")}')">` : ''}
                <div class="card-body">
                    <h5 class="card-title">${song.title}</h5>
                    <p class="card-text">
                        <span class="badge bg-primary">Rating: ${song.rating || 'N/A'}/10</span><br>
                        <small class="text-muted">Added: ${dateAdded}</small>
                    </p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-info me-2" onclick="playVideo('${videoId}', '${song.title.replace(/'/g, "\\'")}')" title="Play">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button class="btn btn-sm btn-warning me-2" onclick="editSong(${song.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSong(${song.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cardsList.appendChild(card);
    });
}

function deleteSong(id) {
    if (confirm('Are you sure you want to delete this song?')) {
        // Filter out the song with the matching ID
        songs = songs.filter(song => song.id !== id);
        saveAndRender();
    }
}

function editSong(id) {
    const songToEdit = songs.find(song => song.id === id);

    if (!songToEdit) return;

    document.getElementById('title').value = songToEdit.title;
    document.getElementById('url').value = songToEdit.url;
    document.getElementById('rating').value = songToEdit.rating || '';
    document.getElementById('songId').value = songToEdit.id; // Set Hidden ID

    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update';
    submitBtn.classList.replace('btn-success', 'btn-warning');
    
    // Scroll to form
    document.querySelector('.card.border-primary').scrollIntoView({ behavior: 'smooth' });
}

function playVideo(videoId, title) {
    if (!videoId) return;
    
    const modal = new bootstrap.Modal(document.getElementById('videoModal'));
    const embedUrl = getYouTubeEmbedUrl(videoId);
    
    document.getElementById('videoModalTitle').textContent = title || 'Video Player';
    document.getElementById('videoPlayerContainer').innerHTML = 
        `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    modal.show();
}

function toggleView() {
    if (currentView === 'table') {
        currentView = 'cards';
        tableContainer.classList.add('hidden');
        cardsContainer.classList.add('active');
        viewToggleImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'%3E%3C/path%3E%3C/svg%3E";
    } else {
        currentView = 'table';
        tableContainer.classList.remove('hidden');
        cardsContainer.classList.remove('active');
        viewToggleImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='7' height='7'%3E%3C/rect%3E%3Crect x='14' y='3' width='7' height='7'%3E%3C/rect%3E%3Crect x='14' y='14' width='7' height='7'%3E%3C/rect%3E%3Crect x='3' y='14' width='7' height='7'%3E%3C/rect%3E%3C/svg%3E";
    }
    
    renderSongs();
}
