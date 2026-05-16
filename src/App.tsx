/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Book as BookIcon, 
  User, 
  LogOut, 
  Star, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  BookOpen,
  Info,
  X,
  MessageSquare
} from 'lucide-react';
import { bookService, authService } from './services/api.ts';

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

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"title" | "author" | "isbn">("title");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(data);
    } catch (error) {
      console.error(error);
      setMessage({ text: "Failed to load books", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      loadBooks();
      return;
    }

    try {
      setLoading(true);
      let results;
      if (searchType === "title") {
        results = await bookService.getBooksByTitle(searchQuery);
      } else if (searchType === "author") {
        results = await bookService.getBooksByAuthor(searchQuery);
      } else {
        const book = await bookService.getBookByISBN(searchQuery);
        results = book ? [book] : [];
      }
      setBooks(results);
    } catch (error) {
      console.error(error);
      setBooks([]);
      setMessage({ text: "No books found for this search", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === "login") {
        const res = await authService.login(authForm);
        setMessage({ text: res.message, type: "success" });
        setIsAuthenticated(true);
        setCurrentUser(authForm.username);
        setIsAuthModalOpen(false);
      } else {
        const res = await authService.register(authForm);
        setMessage({ text: res.message, type: "success" });
        setAuthMode("login");
      }
      setAuthForm({ username: "", password: "" });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || "Auth failed", type: "error" });
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMessage({ text: "Logged out successfully", type: "success" });
  };

  const handleAddReview = async () => {
    if (!selectedBook || !reviewText.trim()) return;
    try {
      const res = await bookService.upsertReview(selectedBook.isbn, reviewText);
      setMessage({ text: res.message, type: "success" });
      setReviewText("");
      // Refresh local data
      const updatedBook = { ...selectedBook, reviews: res.reviews };
      setSelectedBook(updatedBook);
      setBooks(books.map(b => b.isbn === selectedBook.isbn ? updatedBook : b));
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || "Failed to add review", type: "error" });
    }
  };

  const handleDeleteReview = async (isbn: string) => {
    try {
      const res = await bookService.deleteReview(isbn);
      setMessage({ text: res.message, type: "success" });
      if (selectedBook && selectedBook.isbn === isbn) {
        const updatedReviews = selectedBook.reviews.filter(r => r.username !== currentUser);
        const updatedBook = { ...selectedBook, reviews: updatedReviews };
        setSelectedBook(updatedBook);
        setBooks(books.map(b => b.isbn === isbn ? updatedBook : b));
      }
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || "Failed to delete review", type: "error" });
    }
  };

  // UI Components
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedBook(null); loadBooks(); }}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BookIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                BookVerse
              </span>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium text-slate-700">{currentUser}</span>
                    <span className="text-xs text-slate-500">Member</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-600 transition-colors bg-slate-100 rounded-full"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setAuthMode("login"); setIsAuthModalOpen(true); }}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border ${
                message.type === "success" 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {message.type === "success" ? <ShieldCheck className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              <span className="font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero & Search (only show if no book selected) */}
        {!selectedBook && (
          <div className="space-y-12">
            <header className="relative py-16 overflow-hidden rounded-3xl bg-indigo-900">
               <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400 rounded-full blur-[100px]" />
                  <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-400 rounded-full blur-[100px]" />
               </div>
               <div className="relative text-center space-y-6 max-w-2xl mx-auto px-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl font-extrabold text-white leading-tight"
                  >
                    Discover your next favorite story
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-indigo-100 text-lg"
                  >
                    Browse thousands of critiques, share your thoughts, and join a community of book lovers.
                  </motion.p>
               </div>
            </header>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder={`Search by ${searchType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-600 font-medium cursor-pointer"
                >
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="isbn">ISBN</option>
                </select>
                <button 
                  onClick={() => handleSearch()}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Book Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-4">
                    <div className="h-64 bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                ))
              ) : books.length > 0 ? (
                books.map((book) => (
                  <motion.div
                    key={book.isbn}
                    layoutId={book.isbn}
                    onClick={() => setSelectedBook(book)}
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-3xl p-5 border border-slate-200 cursor-pointer transition-all hover:shadow-2xl hover:shadow-indigo-100/50"
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 mb-5 border border-slate-100">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="h-full flex items-center justify-center">
                         <BookOpen className="w-16 h-16 text-indigo-100" />
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold text-slate-700">{book.reviews.length}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">{book.author}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>ISBN: {book.isbn}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="bg-slate-100 p-4 rounded-full w-max mx-auto">
                    <Info className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">No books found</h3>
                  <p className="text-slate-500">Try adjusting your search or search type.</p>
                  <button 
                    onClick={loadBooks}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Show all books
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed View */}
        <AnimatePresence>
          {selectedBook && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedBook(null)}
            >
              <motion.div 
                layoutId={selectedBook.isbn}
                className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row"
                onClick={e => e.stopPropagation()}
              >
                {/* Book Info Panel */}
                <div className="w-full md:w-2/5 p-8 md:p-12 bg-slate-50 border-r border-slate-100 space-y-8">
                  <button 
                    onClick={() => setSelectedBook(null)}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="aspect-[3/4] bg-white rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center border border-slate-200">
                    <BookOpen className="w-32 h-32 text-indigo-100" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                      {selectedBook.title}
                    </h2>
                    <div className="flex items-center gap-2 text-indigo-600">
                      <User className="w-5 h-5" />
                      <span className="text-lg font-medium">{selectedBook.author}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>ISBN: {selectedBook.isbn}</span>
                    </div>
                  </div>
                </div>

                {/* Reviews Panel */}
                <div className="flex-1 flex flex-col p-8 md:p-12 h-full overflow-hidden">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Reviews ({selectedBook.reviews.length})
                      </h3>
                   </div>

                   <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                      {selectedBook.reviews.length > 0 ? (
                        selectedBook.reviews.map((review, i) => (
                          <div key={i} className="bg-slate-50 p-5 rounded-2xl relative group border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                  {review.username[0].toUpperCase()}
                                </div>
                                <span className="font-bold text-slate-700 text-sm">{review.username}</span>
                              </div>
                              {currentUser === review.username && (
                                <button 
                                  onClick={() => handleDeleteReview(selectedBook.isbn)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                                  title="Delete your review"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm">"{review.comment}"</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-400 italic">
                          No reviews yet. Be the first to share your thoughts!
                        </div>
                      )}
                   </div>

                   {/* Add Review Action */}
                   <div className="mt-8 pt-8 border-t border-slate-100">
                      {isAuthenticated ? (
                         <div className="space-y-4">
                            <textarea 
                              placeholder="Write a review..."
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm resize-none h-24"
                            />
                            <div className="flex justify-end">
                              <button 
                                onClick={handleAddReview}
                                disabled={!reviewText.trim()}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Review
                              </button>
                            </div>
                         </div>
                      ) : (
                        <div className="bg-indigo-50 p-4 rounded-2xl flex items-center justify-between gap-4">
                           <p className="text-sm text-indigo-700 font-medium">Log in to share your thoughts about this book.</p>
                           <button 
                             onClick={() => { setAuthMode("login"); setIsAuthModalOpen(true); }}
                             className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs whitespace-nowrap hover:bg-indigo-700"
                           >
                             Log In
                           </button>
                        </div>
                      )}
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsAuthModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md p-8 sm:p-12 rounded-[2rem] shadow-2xl space-y-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center space-y-2">
                <div className="bg-indigo-100 p-3 rounded-2xl w-max mx-auto text-indigo-600 mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800">
                  {authMode === "login" ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-slate-500">
                  {authMode === "login" ? "Enter your details to continue" : "Start your reading journey with us"}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                  <input 
                    type="text" 
                    required
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-slate-700"
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                  <input 
                    type="password" 
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-slate-700"
                    placeholder="Enter password"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                  {authMode === "login" ? "Sign In" : "Register"}
                </button>
              </form>

              <p className="text-center text-slate-500 font-medium">
                {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
                {" "}
                <button 
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  {authMode === "login" ? "Register" : "Sign In"}
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-400 border-t border-slate-200 mt-12 mb-20 md:mb-0">
        <p className="font-medium">© 2026 BookVerse. Built with Express and React.</p>
        <p className="text-xs mt-2 font-mono">Exploring human knowledge, one page at a time.</p>
      </footer>
    </div>
  );
}

