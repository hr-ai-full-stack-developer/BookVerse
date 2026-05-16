import axios from 'axios';

const API_URL = '/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Task 11: Implementation to retrieve books using async/await with Axios
export const bookService = {
  // Retrieve all books
  getAllBooks: async () => {
    try {
      const response = await api.get('/books');
      return response.data.books;
    } catch (error) {
      console.error("Error fetching all books:", error);
      throw error;
    }
  },

  // Retrieve book by ISBN
  getBookByISBN: async (isbn: string) => {
    try {
      const response = await api.get(`/books/isbn/${isbn}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book with ISBN ${isbn}:`, error);
      throw error;
    }
  },

  // Retrieve books by Author
  getBooksByAuthor: async (author: string) => {
    try {
      const response = await api.get(`/books/author/${author}`);
      return response.data.books;
    } catch (error) {
      console.error(`Error fetching books by author ${author}:`, error);
      throw error;
    }
  },

  // Retrieve books by Title
  getBooksByTitle: async (title: string) => {
    try {
      const response = await api.get(`/books/title/${title}`);
      return response.data.books;
    } catch (error) {
      console.error(`Error fetching books by title ${title}:`, error);
      throw error;
    }
  },

  // Get reviews for a book
  getBookReviews: async (isbn: string) => {
    try {
      const response = await api.get(`/books/reviews/${isbn}`);
      return response.data.reviews;
    } catch (error) {
      console.error(`Error fetching reviews for ISBN ${isbn}:`, error);
      throw error;
    }
  },

  // Add or Modify review
  upsertReview: async (isbn: string, comment: string) => {
    try {
      const response = await api.put(`/auth/review/${isbn}`, { comment });
      return response.data;
    } catch (error) {
      console.error(`Error upserting review for ISBN ${isbn}:`, error);
      throw error;
    }
  },

  // Delete review
  deleteReview: async (isbn: string) => {
    try {
      const response = await api.delete(`/auth/review/${isbn}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting review for ISBN ${isbn}:`, error);
      throw error;
    }
  }
};

export const authService = {
  register: async (credentials: any) => {
    const response = await api.post('/register', credentials);
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', credentials.username);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },
  getCurrentUser: () => {
    return localStorage.getItem('username');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
