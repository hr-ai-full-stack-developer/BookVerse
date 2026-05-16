import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"; 

app.use(cors());
app.use(express.json());

// Mock Database
interface Review {
  username: string;
  comment: string;
}

interface Book {
  isbn: string;
  author: string;
  title: string;
  reviews: Review[];
}

let books: Book[] = [
  { isbn: "12345", author: "Chinua Achebe", title: "Things Fall Apart", reviews: [{ username: "user1", comment: "Excellent classic!" }] },
  { isbn: "23456", author: "Hans Christian Andersen", title: "Fairy tales", reviews: [] },
  { isbn: "34567", author: "Dante Alighieri", title: "The Divine Comedy", reviews: [] },
  { isbn: "45678", author: "Jane Austen", title: "Pride and Prejudice", reviews: [] },
  { isbn: "56789", author: "Honoré de Balzac", title: "Le Père Goriot", reviews: [] },
  { isbn: "67890", author: "Samuel Beckett", title: "Molloy, Malone Dies, The Unnamable, the trilogy", reviews: [] },
  { isbn: "78901", author: "Giovanni Boccaccio", title: "The Decameron", reviews: [] },
  { isbn: "89012", author: "Jorge Luis Borges", title: "Ficciones", reviews: [] },
  { isbn: "90123", author: "Emily Brontë", title: "Wuthering Heights", reviews: [] },
  { isbn: "01234", author: "Albert Camus", title: "The Stranger", reviews: [] }
];

let users: any[] = [];

// Middleware for auth
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

// Task 2: Get all books
app.get("/api/books", (req, res) => {
  res.json({ books });
});

// Task 3: Get books by ISBN
app.get("/api/books/isbn/:isbn", (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 4: Get books by author
app.get("/api/books/author/:author", (req, res) => {
  const filteredBooks = books.filter(b => b.author.toLowerCase().includes(req.params.author.toLowerCase()));
  res.json({ books: filteredBooks });
});

// Task 5: Get books by title
app.get("/api/books/title/:title", (req, res) => {
  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(req.params.title.toLowerCase()));
  res.json({ books: filteredBooks });
});

// Task 6: Get book review
app.get("/api/books/reviews/:isbn", (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);
  if (book) {
    res.json({ reviews: book.reviews });
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 7: Register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });
  
  const existingUser = users.find(u => u.username === username);
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.json({ message: "User successfully registered. Now you can login" });
});

// Task 8: Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: "User not found" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username: user.username }, JWT_SECRET);
  res.json({ message: "User successfully logged in", token });
});

// Task 9: Add or Modify a book review
app.put("/api/auth/review/:isbn", authenticateToken, (req: any, res) => {
  const { isbn } = req.params;
  const { comment } = req.body;
  const username = req.user.username;

  const bookIndex = books.findIndex(b => b.isbn === isbn);
  if (bookIndex === -1) return res.status(404).json({ message: "Book not found" });

  const reviewIndex = books[bookIndex].reviews.findIndex(r => r.username === username);

  if (reviewIndex > -1) {
    // Modify existing review
    books[bookIndex].reviews[reviewIndex].comment = comment;
  } else {
    // Add new review
    books[bookIndex].reviews.push({ username, comment });
  }

  res.json({ message: `The review for the book with ISBN ${isbn} has been added/updated.`, reviews: books[bookIndex].reviews });
});

// Task 10: Delete a book review
app.delete("/api/auth/review/:isbn", authenticateToken, (req: any, res) => {
  const { isbn } = req.params;
  const username = req.user.username;

  const bookIndex = books.findIndex(b => b.isbn === isbn);
  if (bookIndex === -1) return res.status(404).json({ message: "Book not found" });

  const initialReviewCount = books[bookIndex].reviews.length;
  books[bookIndex].reviews = books[bookIndex].reviews.filter(r => r.username !== username);

  if (books[bookIndex].reviews.length < initialReviewCount) {
    res.json({ message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.` });
  } else {
    res.status(404).json({ message: "Review not found for this user" });
  }
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
