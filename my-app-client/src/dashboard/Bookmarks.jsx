import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contects/AuthProider';
import { useNavigate } from 'react-router-dom';

const Bookmarks = () => {
  const { user } = useContext(AuthContext);
  const [bookmarks, setBookmarks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const all = JSON.parse(localStorage.getItem('bookmarks') || '{}');
      setBookmarks(all[user.email] || []);
    }
  }, [user]);

  if (!user) return <div className="text-center text-red-500 mt-10">Please log in to view bookmarks.</div>;

  return (
    <div className="flex min-h-screen bg-black">
      <main className="flex-1">
        <div className="p-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-[#5DD62C] text-center">Bookmarked Chapters</h2>
          {bookmarks.length === 0 ? (
            <p className="text-gray-400 text-center">No bookmarks yet.</p>
          ) : (
            <table className="w-full bg-black text-[#5DD62C] rounded-lg">
              <thead>
                <tr>
                  <th className="py-2">Book</th>
                  <th className="py-2">Chapter</th>
                  <th className="py-2">Go to</th>
                </tr>
              </thead>
              <tbody>
                {bookmarks.map((b, i) => (
                  <tr key={b.bookId + '-' + b.chapterNumber} className="border-b border-gray-700">
                    <td className="py-2 flex items-center gap-3">
                      {b.image_url && (
                        <img src={b.image_url} alt={b.bookTitle} className="w-12 h-16 object-cover rounded shadow" />
                      )}
                      <div>
                        <div className="font-bold">{b.bookTitle}</div>
                        <div className="text-xs text-gray-400">by {b.authorName}</div>
                      </div>
                    </td>
                    <td className="py-2">{b.chapterNumber}: {b.chapterTitle}</td>
                    <td className="py-2">                      <button
                        className="bg-[#5DD62C] text-black font-semibold px-4 py-1 rounded hover:bg-[#4cc01f] transition-colors"
                        onClick={() => navigate(`/ChapterReader/${b.bookId}/${b.chapterNumber}`)}
                      >
                        Read Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Bookmarks;
