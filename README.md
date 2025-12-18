# Web Development Course - Playlist Management System

A client-side web application for managing YouTube playlists with MP3 upload support. Built with vanilla JavaScript and localStorage for data persistence.

## Features

- 🔐 User authentication (register, login, logout)
- 📋 Playlist management (create, read, update, delete)
- 🎵 YouTube video search and playlist integration
- 🎧 MP3 file upload support (stored as base64 in localStorage)
- 🌙 Dark mode toggle
- 💾 Client-side data persistence with localStorage

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- YouTube Data API v3 key (for video search) - optional

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd WebDevCourse_HW
```

2. Configure YouTube API (optional, for video search):
   - Get a YouTube Data API v3 key from [Google Cloud Console](https://console.cloud.google.com/)
   - Update the `YOUTUBE_API_KEY` constant in `search.js`

## Running the Application

Simply open `index.html` in your web browser. The application runs entirely client-side with no server required.

### Demo User

A demo user is automatically created on first use:
- **Username:** demo
- **Password:** demo123

## Project Structure

```
WebDevCourse_HW/
├── index.html            # Home page
├── login.html            # Login page
├── register.html         # Registration page
├── search.html           # YouTube video search
├── playlists.html        # Playlist management
├── playlist.html         # Playlist view
├── login.js              # Login logic
├── register.js           # Registration logic
├── search.js             # YouTube search logic
├── playlists.js          # Playlist management logic
├── playlist.js           # Playlist display logic
├── user-header.js        # User header component
└── theme-toggle.js       # Dark mode toggle
```

## Data Storage

All data is stored in the browser's localStorage:
- **Users:** Stored under the key `users`
- **Playlists:** Stored under the key `playlists`
- **Current User:** Stored in sessionStorage under the key `currentUser`

## Key Features

1. **Client-Side Only** - No server required, runs entirely in the browser
2. **LocalStorage Persistence** - All data persists between browser sessions
3. **MP3 Support** - MP3 files are converted to base64 and stored in localStorage
4. **YouTube Integration** - Search and add YouTube videos to playlists
5. **User Management** - Register, login, and manage multiple users

## Technologies Used

- **Frontend:**
  - Vanilla JavaScript
  - Bootstrap 5
  - Font Awesome
  - YouTube Data API v3
  - localStorage/sessionStorage

## Development Notes

- All data is stored locally in the browser
- MP3 files are stored as base64 data URLs (limited by browser storage capacity)
- Demo user is automatically created on first use
- No dependencies required - just open in browser

## Troubleshooting

### Can't login
- Check browser console for errors
- Verify localStorage is enabled in your browser
- Try clearing browser cache and localStorage

### Playlists not loading
- Check browser console for errors
- Verify you're logged in
- Check localStorage in browser DevTools

### MP3 upload fails
- Verify file size is reasonable (localStorage has size limits)
- Check browser console for errors
- Try a smaller MP3 file

### YouTube search not working
- Verify YouTube API key is set in `search.js`
- Check browser console for API errors
- Ensure you have internet connection

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## License

ISC

## Author

Michael Benzekri - Student ID: 315262329
