# הוראות הפעלה - צד שרת

## התקנה

1. התקן את כל ה-dependencies:
```bash
npm install
```

## הפעלה

הפעל את השרת:
```bash
npm start
```

או עם nodemon (לפיתוח):
```bash
npm run dev
```

השרת יעבוד על: `http://localhost:3000`

## מבנה הפרויקט

### קבצי שרת:
- `server.js` - השרת הראשי עם כל ה-API endpoints
- `package.json` - תלויות הפרויקט
- `data/users.json` - קבצי משתמשים (נוצר אוטומטית)
- `data/playlists.json` - קבצי פלייליסטים (נוצר אוטומטית)
- `uploads/` - תיקיית העלאת קבצי MP3

### API Endpoints:

#### Authentication:
- `POST /api/register` - הרשמה
- `POST /api/login` - התחברות
- `POST /api/logout` - התנתקות
- `GET /api/me` - קבלת משתמש נוכחי

#### Playlists:
- `GET /api/playlists` - קבלת כל הפלייליסטים של המשתמש
- `GET /api/playlists/:id` - קבלת פלייליסט ספציפי
- `POST /api/playlists` - יצירת פלייליסט חדש
- `PUT /api/playlists/:id` - עדכון פלייליסט
- `DELETE /api/playlists/:id` - מחיקת פלייליסט
- `POST /api/playlists/:id/videos` - הוספת וידאו לפלייליסט

#### Upload:
- `POST /api/upload-mp3` - העלאת קובץ MP3
- `GET /uploads/:filename` - קבלת קובץ MP3 שהועלה

## שינויים מהגרסה הקודמת:

1. **Authentication** - כל ההתחברות וההרשמה עוברים דרך השרת עם sessions
2. **Playlists** - כל הפלייליסטים נשמרים בשרת בקובץ JSON
3. **MP3 Upload** - תמיכה בהעלאת קבצי MP3 לפלייליסטים
4. **Security** - כל ה-endpoints מוגנים עם authentication middleware

## הערות:

- השרת משתמש ב-sessions לניהול התחברות
- קבצי MP3 מוגבלים ל-10MB
- כל הנתונים נשמרים בקבצי JSON (לא database)
- משתמש דמו נוצר אוטומטית בעת הפעלת השרת

