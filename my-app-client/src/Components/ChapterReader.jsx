import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contects/AuthProider';
import BookmarkIcon from './BookmarkIcon';

const ChapterReader = () => {
  const { bookId, chapterNumber = 1 } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('white'); // 'white', 'black', 'sepia'
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/books/${bookId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        const data = await response.json();
        if (data.success && data.book) {
          setBook(data.book);
        } else {
          throw new Error(data.message || 'Book not found');
        }
      } catch (err) {
        setError(err.message);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  // Fetch chapter content
  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/books/${bookId}/chapters/${chapterNumber}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chapter content');
        }
        const data = await response.json();
        setChapter(data.chapter);
        setLoading(false);
        // Log reading progress if user is logged in and is a regular user
        if (user && user.role === 'user') {
          const token = localStorage.getItem('token');
          fetch('http://localhost:3000/api/users/history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              bookId,
              chapterNumber: parseInt(chapterNumber),
              // percentComplete can be calculated if book.totalChapters is available
              percentComplete: book && book.totalChapters ? Math.round((parseInt(chapterNumber) / book.totalChapters) * 100) : 0
            })
          });
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (bookId && chapterNumber) {
      fetchChapter();
    }
  }, [bookId, chapterNumber]);

  // Check bookmark state on load
  useEffect(() => {
    if (user && bookId && chapterNumber) {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '{}');
      const userBookmarks = bookmarks[user.email] || [];
      setIsBookmarked(userBookmarks.some(b => b.bookId === bookId && b.chapterNumber === parseInt(chapterNumber)));
    }
  }, [user, bookId, chapterNumber]);

  // Toggle bookmark
  const handleBookmark = () => {
    if (!user) return;
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '{}');
    const userBookmarks = bookmarks[user.email] || [];
    const idx = userBookmarks.findIndex(b => b.bookId === bookId && b.chapterNumber === parseInt(chapterNumber));
    let updated;
    if (idx > -1) {
      updated = [...userBookmarks.slice(0, idx), ...userBookmarks.slice(idx + 1)];
      setIsBookmarked(false);
    } else {
      updated = [...userBookmarks, {
        bookId,
        chapterNumber: parseInt(chapterNumber),
        bookTitle: book?.book_title,
        authorName: book?.authorName,
        image_url: book?.image_url,
        chapterTitle: chapter?.title
      }];
      setIsBookmarked(true);
    }
    bookmarks[user.email] = updated;
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  };

  // Navigate to next chapter
  const goToNextChapter = () => {
    if (book && parseInt(chapterNumber) < book.totalChapters) {
      navigate(`/ChapterReader/${bookId}/${parseInt(chapterNumber) + 1}`);
    }
  };

  // Navigate to previous chapter
  const goToPreviousChapter = () => {
    if (parseInt(chapterNumber) > 1) {
      navigate(`/ChapterReader/${bookId}/${parseInt(chapterNumber) - 1}`);
    }
  };

  // Handle font size change
  const changeFontSize = (size) => {
    setFontSize(size);
  };

  // Handle theme change
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Update the theme classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'black':
        return 'bg-black text-[#5DD62C]';
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#5DD62C]';
      default: // white
        return 'bg-white text-[#5DD62C]';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-red-50 text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading || !book || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-[#5DD62C] border-r-transparent border-b-[#5DD62C] border-l-transparent"></div>
          <p className="mt-4 text-lg text-[#5DD62C]">Loading chapter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeClasses()}`}>
      {/* Reader Header */}
      <header className="sticky top-0 z-10 bg-black text-[#5DD62C] shadow-[0_4px_15px_0_rgba(93,214,44,0.5)]">
        <div className="container mx-auto p-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl font-bold">{book.book_title}</h1>
            <p className="text-sm">by {book.authorName}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Bookmark Banner Icon */}
            <BookmarkIcon isBookmarked={isBookmarked} onClick={handleBookmark} />
            {/* Chapter Navigation */}
            <div className="flex gap-2">              <button
                onClick={goToPreviousChapter}
                disabled={parseInt(chapterNumber) <= 1}
                className={`px-3 py-1 rounded ${
                  parseInt(chapterNumber) <= 1 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-[#5DD62C] text-black font-semibold hover:bg-[#4cc01f] transition-colors'
                }`}
              >
                Previous
              </button>
              
              <span className="px-3 py-1 bg-gray-800 rounded">
                {chapterNumber} / {book.totalChapters}
              </span>
                <button
                onClick={goToNextChapter}
                disabled={parseInt(chapterNumber) >= book.totalChapters}
                className={`px-3 py-1 rounded ${
                  parseInt(chapterNumber) >= book.totalChapters 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-[#5DD62C] text-black font-semibold hover:bg-[#4cc01f] transition-colors'
                }`}
              >
                Next
              </button>
            </div>
            
            {/* Reader Controls */}
            <div className="flex gap-2">
              {/* Font Size */}
              <div className="flex gap-1 items-center border border-gray-700 rounded p-1">
                <button 
                  onClick={() => changeFontSize(Math.max(12, fontSize - 2))}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded"
                >
                  A-
                </button>
                <button 
                  onClick={() => changeFontSize(Math.min(24, fontSize + 2))}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded"
                >
                  A+
                </button>
              </div>
              
              {/* Theme Toggle */}
              <div className="flex gap-1 border border-gray-700 rounded p-1">
                <button 
                  onClick={() => changeTheme('white')}
                  className={`w-7 h-6 rounded ${theme === 'white' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  title="White Mode"
                >
                  ☀️
                </button>
                <button 
                  onClick={() => changeTheme('black')}
                  className={`w-7 h-6 rounded ${theme === 'black' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  title="Black Mode"
                >
                  🌙
                </button>
                <button 
                  onClick={() => changeTheme('sepia')}
                  className={`w-7 h-6 rounded ${theme === 'sepia' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  title="Sepia Mode"
                >
                  📜
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Chapter Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">{chapter.title}</h2>
        
        <div 
          className="chapter-content leading-relaxed"
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />
        
        {/* Chapter Navigation Buttons */}
        <div className="mt-10 flex justify-between">          <button
            onClick={goToPreviousChapter}
            disabled={parseInt(chapterNumber) <= 1}
            className={`px-4 py-2 rounded ${
              parseInt(chapterNumber) <= 1 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#5DD62C] text-black font-semibold hover:bg-[#4cc01f] transition-colors'
            }`}
          >
            ← Previous Chapter
          </button>
          
          <button
            onClick={goToNextChapter}
            disabled={parseInt(chapterNumber) >= book.totalChapters}
            className={`px-4 py-2 rounded ${
              parseInt(chapterNumber) >= book.totalChapters 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#5DD62C] text-black font-semibold hover:bg-[#4cc01f] transition-colors'
            }`}
          >
            Next Chapter →
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChapterReader;