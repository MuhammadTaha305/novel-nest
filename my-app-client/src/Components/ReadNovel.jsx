import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contects/AuthProider';

const ReadNovel = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [bookDetails, setBookDetails] = useState({});
  const [chapterTitles, setChapterTitles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Check for token first
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your library.');
          setLoading(false);
          return;
        }

        // Then check for user in context
        if (!user || !user.id) {
          console.log("User not found in context, attempting with token anyway");
        }

        const res = await fetch('http://localhost:3000/api/users/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
          } else {
            setError(`Error fetching library: ${res.status}`);
          }
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        if (data.success) {
          setHistory(data.history);
        } else {
          setError(data.message || 'Failed to fetch history');
        }
      } catch (err) {
        console.error('Library fetch error:', err);
        setError(err.message || 'An error occurred while fetching your library');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [user]);

  useEffect(() => {
    const fetchBooksAndChapters = async () => {
      if (history.length === 0) return;
      const details = {};
      const chapters = {};
      await Promise.all(history.map(async (item) => {
        try {
          const res = await fetch(`http://localhost:3000/api/books/${item.bookId}`);
          const data = await res.json();
          if (data.success && data.book) {
            details[item.bookId] = data.book;
          }
          if (item.lastChapterRead) {
            const chapRes = await fetch(`http://localhost:3000/api/books/${item.bookId}/chapters/${item.lastChapterRead}`);
            const chapData = await chapRes.json();
            if (chapData.success && chapData.chapter) {
              chapters[`${item.bookId}_${item.lastChapterRead}`] = chapData.chapter.title;
            }
          }
        } catch (e) { /* ignore individual errors */ }
      }));
      setBookDetails(details);
      setChapterTitles(chapters);
    };
    fetchBooksAndChapters();
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-[#5DD62C] border-r-transparent border-b-[#5DD62C] border-l-transparent"></div>
          <p className="mt-4 text-lg text-[#5DD62C]">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-red-50 text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Only show books that are in progress (not 100% complete)
  const inProgress = history.filter(item => (item.percentComplete || 0) < 100);

  return (
    <div className="min-h-screen bg-black py-20 px-4 lg:px-24">
      <h1 className="text-4xl font-bold text-[#5DD62C] mb-8 text-center">My Library</h1>
      {inProgress.length === 0 ? (
        <p className="text-gray-400 text-center">No novels in progress. Start reading from the Library!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {inProgress.map((item) => {
            const book = bookDetails[item.bookId];
            const chapterTitle = chapterTitles[`${item.bookId}_${item.lastChapterRead}`];
            if (!book) return null;
            return (
              <div key={item.bookId} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col">
                <img 
                  src={book.image_url} 
                  alt={book.book_title} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">{book.book_title}</h2>
                  <p className="text-gray-300 mb-2">by {book.authorName}</p>
                  <p className="text-gray-400 mb-4 text-sm">Last read: Chapter {item.lastChapterRead}{chapterTitle ? `: ${chapterTitle}` : ''}</p>                  <button
                    className="mt-auto block w-full text-center bg-[#5DD62C] text-black font-semibold py-2 px-4 rounded hover:bg-[#4cc01f] transition-colors"
                    onClick={() => navigate(`/ChapterReader/${item.bookId}/${item.lastChapterRead}`)}
                  >
                    Continue Reading
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReadNovel;