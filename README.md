# BookVerse: Express Book Reviews

A comprehensive book review platform built with **Express (Node.js)** and **React (Vite/TypeScript)**. This application allows users to browse a collection of books, search by ISBN, Author, or Title, and manage book reviews with secure JWT authentication.

## 🚀 Features

- **Full REST API** for book and review management.
- **JWT Authentication** for secure user registration and login.
- **Search Capabilities**: Query books by ISBN, Author, or Title.
- **Interactive UI**: A polished React frontend with `motion` animations and `lucide-react` icons.
- **Async Implementation**: Backend logic uses `async/await` for database-like operations.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs.
- **Frontend**: React 19, Vite, Tailwind CSS, Motion.
- **HTTP Client**: Axios (used for all API communications).

---

## 📋 Task Submission Commands

Below are the cURL commands and instructions for satisfying the project requirements. Replace `[APP_URL]` with your live application URL.

### Task 1: GitHub Repository Info
*Shows that the repository is forked from the base project.*
```bash
# Replace <USERNAME> with your GitHub username
curl -s https://api.github.com/repos/<USERNAME>/expressBookReview | grep -E "name|parent|source"
```

### Task 2: Get All Books
```bash
curl -X GET [APP_URL]/api/books
```

### Task 3: Get Books by ISBN
```bash
curl -X GET [APP_URL]/api/books/isbn/12345
```

### Task 4: Get Books by Author
```bash
curl -X GET [APP_URL]/api/books/author/Achebe
```

### Task 5: Get Books by Title
```bash
curl -X GET [APP_URL]/api/books/title/Things
```

### Task 6: Get Book Review
```bash
curl -X GET [APP_URL]/api/books/reviews/12345
```

### Task 7: Register User
```bash
curl -X POST [APP_URL]/api/register \
     -H "Content-Type: application/json" \
     -d '{"username": "newUser", "password": "password123"}'
```

### Task 8: Login User
```bash
curl -X POST [APP_URL]/api/login \
     -H "Content-Type: application/json" \
     -d '{"username": "newUser", "password": "password123"}'
```

### Task 9: Add/Modify Review
*Note: Requires valid JWT Token from Login step.*
```bash
curl -X PUT [APP_URL]/api/auth/review/12345 \
     -H "Authorization: Bearer [YOUR_TOKEN]" \
     -H "Content-Type: application/json" \
     -d '{"comment": "Amazing book, definitely a must-read!"}'
```

### Task 10: Delete Review
```bash
curl -X DELETE [APP_URL]/api/auth/review/12345 \
     -H "Authorization: Bearer [YOUR_TOKEN]"
```

### Task 11: Implementation Details
The code implementation for retrieving all books and their details using `async/await` with **Axios** can be found in:
- `src/services/api.ts`

This file contains the `bookService` module which utilizes `axios.create()` and interceptors to manage authenticated requests and fetch data asynchronously.

---

## 🔧 Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables in `.env`:
   ```bash
   JWT_SECRET=your_jwt_secret
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```

Developed as part of the IBM Full Stack Developer Professional Certificate.
