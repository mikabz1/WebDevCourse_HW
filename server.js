const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const PORT = 3000;

// ---------------- MIDDLEWARE ----------------
// CORS middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('file://'))) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Session middleware
app.use(
    session({
        secret: "your-secret-key-change-in-production",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// ---------------- DATA FILES ----------------
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PLAYLISTS_FILE = path.join(DATA_DIR, "playlists.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Create directories if they don't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ---------------- HELPERS ----------------
function readUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    } catch (err) {
        console.log("Read users error:", err.message);
        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readPlaylists() {
    try {
        if (!fs.existsSync(PLAYLISTS_FILE)) {
            console.log(`Playlists file not found at ${PLAYLISTS_FILE}, returning empty array`);
            return [];
        }
        const data = fs.readFileSync(PLAYLISTS_FILE, "utf8");
        const playlists = JSON.parse(data);
        console.log(`Playlists loaded from ${PLAYLISTS_FILE}, count: ${playlists.length}`);
        return playlists;
    } catch (err) {
        console.error("Read playlists error:", err.message);
        return [];
    }
}

function writePlaylists(playlists) {
    try {
        // Ensure data directory exists
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2), 'utf8');
        console.log(`Playlists saved to ${PLAYLISTS_FILE}, count: ${playlists.length}`);
    } catch (err) {
        console.error("Write playlists error:", err.message);
        throw err;
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    console.log('Auth check - Session:', req.session ? 'exists' : 'missing', 'UserId:', req.session?.userId);
    if (req.session && req.session.userId) {
        next();
    } else {
        console.log('Unauthorized access attempt to:', req.path);
        res.status(401).json({ error: "Unauthorized - Please login first" });
    }
}

// ---------------- FILE UPLOAD ----------------
const storage = multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "audio/mpeg" || file.mimetype === "audio/mp3") {
            cb(null, true);
        } else {
            cb(new Error("Only MP3 files are allowed"), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// ---------------- AUTH API ----------------

// Check if username exists
app.get("/api/check-username/:username", (req, res) => {
    try {
        const username = req.params.username;
        const users = readUsers();
        const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
        res.json({ exists });
    } catch (error) {
        console.error("Check username error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Register
app.post("/api/register", async (req, res) => {
    try {
        const { username, password, firstName, imageUrl } = req.body;

        if (!username || !password || !firstName || !imageUrl) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const users = readUsers();

        if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            username: username.trim(),
            password: hashedPassword,
            firstName: firstName.trim(),
            imageUrl: imageUrl.trim(),
            registrationDate: new Date().toISOString()
        };

        users.push(newUser);
        writeUsers(users);

        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            firstName: newUser.firstName,
            imageUrl: newUser.imageUrl
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Login
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Missing username or password" });
        }

        const users = readUsers();
        const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            imageUrl: user.imageUrl
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Logout
app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
    });
});

// Get current user
app.get("/api/me", requireAuth, (req, res) => {
    const users = readUsers();
    const user = users.find((u) => u.id === req.session.userId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        imageUrl: user.imageUrl
    });
});

// ---------------- PLAYLISTS API ----------------

// Get all playlists for current user
app.get("/api/playlists", requireAuth, (req, res) => {
    try {
        console.log(`Getting playlists for user ${req.session.userId}`);
        const playlists = readPlaylists();
        const userPlaylists = playlists.filter((p) => p.userId === req.session.userId);
        console.log(`Found ${userPlaylists.length} playlists for user ${req.session.userId}`);
        res.json(userPlaylists);
    } catch (error) {
        console.error("Get playlists error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get playlist by ID
app.get("/api/playlists/:id", requireAuth, (req, res) => {
    try {
        const playlists = readPlaylists();
        const playlist = playlists.find(
            (p) => p.id === parseInt(req.params.id) && p.userId === req.session.userId
        );

        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        res.json(playlist);
    } catch (error) {
        console.error("Get playlist error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create new playlist
app.post("/api/playlists", requireAuth, (req, res) => {
    try {
        const { name } = req.body;
        console.log(`Creating playlist: "${name}" for user ${req.session.userId}`);

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Playlist name is required" });
        }

        const playlists = readPlaylists();
        console.log(`Current playlists count before: ${playlists.length}`);

        const newPlaylist = {
            id: Date.now(),
            userId: req.session.userId,
            name: name.trim(),
            createdDate: new Date().toISOString(),
            videos: []
        };

        playlists.push(newPlaylist);
        console.log(`New playlist added, count after: ${playlists.length}`);
        writePlaylists(playlists);
        console.log(`Playlist saved successfully: ${newPlaylist.id}`);

        res.status(201).json(newPlaylist);
    } catch (error) {
        console.error("Create playlist error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update playlist
app.put("/api/playlists/:id", requireAuth, (req, res) => {
    try {
        const playlists = readPlaylists();
        const index = playlists.findIndex(
            (p) => p.id === parseInt(req.params.id) && p.userId === req.session.userId
        );

        if (index === -1) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        if (req.body.name) {
            playlists[index].name = req.body.name.trim();
        }

        if (req.body.videos) {
            playlists[index].videos = req.body.videos;
        }

        writePlaylists(playlists);
        res.json(playlists[index]);
    } catch (error) {
        console.error("Update playlist error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete playlist
app.delete("/api/playlists/:id", requireAuth, (req, res) => {
    try {
        const playlists = readPlaylists();
        const index = playlists.findIndex(
            (p) => p.id === parseInt(req.params.id) && p.userId === req.session.userId
        );

        if (index === -1) {
            return res.status(404).json({ error: "Playlist not found" });
        }

        const deleted = playlists.splice(index, 1)[0];
        writePlaylists(playlists);

        res.json({ deleted });
    } catch (error) {
        console.error("Delete playlist error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Add video to playlist
app.post("/api/playlists/:id/videos", requireAuth, (req, res) => {
    try {
        const { video } = req.body;
        const playlistId = parseInt(req.params.id);
        
        console.log(`Adding video to playlist ${playlistId} for user ${req.session.userId}`);
        console.log(`Video data:`, video);

        if (!video || !video.id) {
            return res.status(400).json({ error: "Video data is required" });
        }

        const playlists = readPlaylists();
        console.log(`Total playlists: ${playlists.length}`);
        
        const playlistIndex = playlists.findIndex(
            (p) => p.id === playlistId && p.userId === req.session.userId
        );

        if (playlistIndex === -1) {
            console.log(`Playlist ${playlistId} not found for user ${req.session.userId}`);
            return res.status(404).json({ error: "Playlist not found" });
        }

        const playlist = playlists[playlistIndex];
        console.log(`Found playlist: ${playlist.name}, current videos: ${playlist.videos?.length || 0}`);

        if (!playlist.videos) {
            playlist.videos = [];
        }

        if (!playlist.videos.some((v) => v.id === video.id)) {
            playlist.videos.push({
                ...video,
                addedDate: new Date().toISOString()
            });
            console.log(`Video added, new count: ${playlist.videos.length}`);
        } else {
            console.log(`Video ${video.id} already exists in playlist`);
        }

        writePlaylists(playlists);
        console.log(`Playlist saved successfully`);

        res.json(playlist);
    } catch (error) {
        console.error("Add video error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ---------------- MP3 UPLOAD API ----------------

// Upload MP3 file
app.post("/api/upload-mp3", requireAuth, upload.single("mp3"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            url: fileUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
});

// Serve uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

// ---------------- INITIALIZE DEMO USER ----------------
function initializeDemoUser() {
    const users = readUsers();
    const demoExists = users.some((u) => u.username.toLowerCase() === "demo");

    if (!demoExists) {
        bcrypt.hash("demo123", 10).then((hashedPassword) => {
            const demoUser = {
                id: Date.now(),
                username: "demo",
                password: hashedPassword,
                firstName: "משתמש",
                imageUrl: "https://via.placeholder.com/150/667eea/ffffff?text=Demo",
                registrationDate: new Date().toISOString()
            };

            users.push(demoUser);
            writeUsers(users);
            console.log("Demo user created");
        });
    }
}

// ---------------- START ----------------
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`Server running: http://localhost:${PORT}`);
    console.log(`========================================\n`);
    initializeDemoUser();
    console.log('Demo user initialized');
    console.log('Server ready to accept connections\n');
});

