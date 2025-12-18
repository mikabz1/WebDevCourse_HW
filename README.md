# Web Development Course - Playlist Management System

A full-stack web application for managing YouTube playlists with MP3 upload support. Built with Node.js, Express, and vanilla JavaScript.

## Features

- 🔐 User authentication (register, login, logout)
- 📋 Playlist management (create, read, update, delete)
- 🎵 YouTube video search and playlist integration
- 🎧 MP3 file upload support
- 🌙 Dark mode toggle
- 💾 Server-side data persistence with JSON files

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- YouTube Data API v3 key (for video search)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd WebDevCourse_HW
```

2. Install dependencies:
```bash
npm install
```

3. Configure YouTube API (optional, for video search):
   - Get a YouTube Data API v3 key from [Google Cloud Console](https://console.cloud.google.com/)
   - Update the `YOUTUBE_API_KEY` constant in `search.js`

## Running the Application

### Start the Server

Run the server using npm:
```bash
npm start
```

Or use nodemon for development (auto-restart on file changes):
```bash
npm run dev
```

The server will start on: `http://localhost:3000`

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### Demo User

A demo user is automatically created when the server starts:
- **Username:** demo
- **Password:** demo123

## Project Structure

```
WebDevCourse_HW/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── data/                  # Data storage (auto-created)
│   ├── users.json        # User data
│   └── playlists.json    # Playlist data
├── uploads/              # MP3 file uploads (auto-created)
├── index.html            # Home page
├── login.html            # Login page
├── register.html         # Registration page
├── search.html           # YouTube video search
├── playlists.html        # Playlist management
└── *.js                  # Client-side JavaScript files
```

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
  - Body: `{ username, password, firstName, imageUrl }`
  
- `POST /api/login` - Login user
  - Body: `{ username, password }`
  
- `POST /api/logout` - Logout current user
  
- `GET /api/me` - Get current user info
  - Requires authentication

### Playlists

- `GET /api/playlists` - Get all playlists for current user
  - Requires authentication
  
- `GET /api/playlists/:id` - Get specific playlist
  - Requires authentication
  
- `POST /api/playlists` - Create new playlist
  - Body: `{ name }`
  - Requires authentication
  
- `PUT /api/playlists/:id` - Update playlist
  - Body: `{ name?, videos? }`
  - Requires authentication
  
- `DELETE /api/playlists/:id` - Delete playlist
  - Requires authentication
  
- `POST /api/playlists/:id/videos` - Add video to playlist
  - Body: `{ video: { id, title, thumbnail, channelTitle } }`
  - Requires authentication

### File Upload

- `POST /api/upload-mp3` - Upload MP3 file
  - Form data: `mp3` (file), `title`, `artist`
  - Requires authentication
  - Max file size: 10MB

## Key Changes from Previous Version

1. **Server-Side Architecture** - Moved from client-side localStorage to server-side JSON storage
2. **Authentication** - Server-side session management with express-session
3. **Data Persistence** - All data stored in JSON files on the server
4. **MP3 Support** - Added MP3 file upload functionality with multer
5. **Security** - All API endpoints protected with authentication middleware
6. **CORS** - Configured CORS for frontend-backend communication

## Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - express-session (session management)
  - bcryptjs (password hashing)
  - multer (file uploads)

- **Frontend:**
  - Vanilla JavaScript
  - Bootstrap 5
  - Font Awesome
  - YouTube Data API v3

## Development Notes

- The server uses sessions for user authentication
- MP3 files are limited to 10MB
- All data is stored in JSON files (no database)
- Demo user is automatically created on server start
- Server logs all operations for debugging

## Troubleshooting

### Server won't start
- Make sure port 3000 is not already in use
- Check that all dependencies are installed (`npm install`)
- Verify Node.js version is 14 or higher

### Can't login
- Make sure the server is running
- Check browser console for errors
- Verify session cookies are enabled

### Playlists not loading
- Check server console for errors
- Verify you're logged in
- Check browser console for API errors

### MP3 upload fails
- Verify file size is under 10MB
- Check that `uploads/` directory exists
- Check server console for errors

## License

ISC

## Author

Michael Benzekri - Student ID: 315262329

