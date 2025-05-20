import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contects/AuthProider';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns';
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookDetails, setBookDetails] = useState({});
  const [chapterTitles, setChapterTitles] = useState({});
  const [categoryStats, setCategoryStats] = useState({});
  const [totalChaptersRead, setTotalChaptersRead] = useState(0);
  const [totalBooksRead, setTotalBooksRead] = useState(0);
  const [uniqueAuthors, setUniqueAuthors] = useState(0);
  const [mostReadCategory, setMostReadCategory] = useState('');
  const [barChartData, setBarChartData] = useState({ labels: [], data: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/users/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setHistory(data.history);
        } else {
          setError(data.message || 'Failed to fetch history');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Fetch book details for all books in history
  useEffect(() => {
    const fetchBooksAndChapters = async () => {
      if (history.length === 0) return;
      const details = {};
      const chapters = {};
      await Promise.all(history.map(async (item) => {
        try {
          // Fetch book details
          const res = await fetch(`http://localhost:3000/api/books/${item.bookId}`);
          const data = await res.json();
          if (data.success && data.book) {
            details[item.bookId] = data.book;
          }
          // Fetch last chapter title
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

  useEffect(() => {
    // Calculate stats after bookDetails and history are loaded
    if (history.length > 0 && Object.keys(bookDetails).length > 0) {
      let chaptersRead = 0;
      const categoryCount = {};
      const booksReadSet = new Set();
      const authorsSet = new Set();
      const chaptersByDate = {};
      history.forEach(item => {
        chaptersRead += item.lastChapterRead ? 1 : 0;
        const book = bookDetails[item.bookId];
        if (book) {
          booksReadSet.add(item.bookId);
          if (book.category) {
            categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
          }
          if (book.authorName) {
            authorsSet.add(book.authorName);
          }
        }
        if (item.updatedAt && item.lastChapterRead) {
          const date = format(new Date(item.updatedAt), 'yyyy-MM-dd');
          chaptersByDate[date] = (chaptersByDate[date] || 0) + 1;
        }
      });
      setTotalChaptersRead(chaptersRead);
      setCategoryStats(categoryCount);
      setTotalBooksRead(booksReadSet.size);
      setUniqueAuthors(authorsSet.size);
      // Find most read category
      let maxCat = '';
      let maxVal = 0;
      Object.entries(categoryCount).forEach(([cat, val]) => {
        if (val > maxVal) {
          maxCat = cat;
          maxVal = val;
        }
      });
      setMostReadCategory(maxCat);
      // Bar chart: chapters read by date, show all days in current month
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      const allDays = eachDayOfInterval({ start, end });
      const labels = allDays.map(day => format(day, 'yyyy-MM-dd'));
      const displayLabels = allDays.map(day => format(day, 'MMM d'));
      const data = labels.map(date => chaptersByDate[date] || 0);
      setBarChartData({ labels: displayLabels, data });
    }
  }, [history, bookDetails]);

  if (loading) return <div className="text-center text-[#5DD62C]">Loading history...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <main className="flex-1">
      <div className="p-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-[#5DD62C] text-center">Your Reading Stats</h2>
        {/* Chart Section at the Top: Side by Side */}
        <div className="mb-8 flex flex-col lg:flex-row gap-8 items-center justify-center w-full">
          <div className="bg-gray-900 rounded-lg p-6 shadow w-full max-w-sm flex-shrink-0 flex items-center justify-center">
            <div className="w-full">
              <div className="text-lg text-gray-300 mb-2 text-center">Novels Read by Category</div>
              {Object.keys(categoryStats).length > 0 ? (
                <Pie
                  data={{
                    labels: Object.keys(categoryStats),
                    datasets: [
                      {
                        data: Object.values(categoryStats),
                        backgroundColor: [
                          '#5DD62C', '#FFD700', '#1E90FF', '#FF69B4', '#FF6347', '#8A2BE2', '#00CED1', '#FFA500', '#A52A2A', '#228B22', '#DC143C', '#20B2AA', '#FF4500', '#2E8B57', '#B22222', '#00BFFF', '#FF1493', '#7FFF00', '#8B008B', '#556B2F'
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: {
                        labels: {
                          color: '#5DD62C',
                        },
                      },
                    },
                  }}
                  width={300}
                  height={300}
                />
              ) : (
                <div className="text-gray-500">No data yet</div>
              )}
            </div>
          </div>
          {/* Bar Chart for Chapters Read by Date */}
          <div className="bg-gray-900 rounded-lg p-6 shadow w-full max-w-2xl flex-grow">
            <div className="text-lg text-gray-300 mb-2 text-center">Chapters Read by Date</div>
            {barChartData.labels.length > 0 ? (
              <Bar
                data={{
                  labels: barChartData.labels,
                  datasets: [
                    {
                      label: 'Chapters Read',
                      data: barChartData.data,
                      backgroundColor: '#5DD62C',
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: { color: '#5DD62C', font: { size: 11 }, maxRotation: 90, minRotation: 45, autoSkip: false },
                      grid: { color: '#333' },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { color: '#5DD62C', font: { size: 12 } },
                      grid: { color: '#333' },
                    },
                  },
                }}
                height={220}
              />
            ) : (
              <div className="text-gray-500">No data yet</div>
            )}
          </div>
        </div>
        {/* Stats Section at the Bottom */}
        <div className="mb-8 flex flex-col md:flex-row gap-8 items-center justify-center flex-wrap">
          <div className="bg-gray-900 rounded-lg p-6 shadow text-center w-full max-w-xs min-w-[220px] flex-1">
            <div className="text-4xl font-bold text-[#5DD62C]">{totalBooksRead}</div>
            <div className="text-lg text-gray-300">Books Read</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 shadow text-center w-full max-w-xs min-w-[220px] flex-1">
            <div className="text-4xl font-bold text-[#5DD62C]">{uniqueAuthors}</div>
            <div className="text-lg text-gray-300">Unique Authors</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 shadow text-center w-full max-w-xs min-w-[220px] flex-1">
            <div className="text-2xl font-bold text-[#5DD62C]">{mostReadCategory || 'N/A'}</div>
            <div className="text-lg text-gray-300">Most Read Category</div>
          </div>
        </div>
        {/* Link to full reading history */}
        <div className="text-center mt-8">
          <a href="/user/dashboard/history" className="inline-block bg-[#5DD62C] text-black px-6 py-2 rounded font-semibold hover:bg-[#4cc01f] transition">View Reading History</a>
        </div>
      </div>
    </main>
  );
};

export default UserDashboard;

// Restore the previous UserReadingHistoryTable export for use in the router
export function UserReadingHistoryTable({ history, bookDetails, chapterTitles, navigate }) {
  return (
    <main className="flex-1">
      <div className="p-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-[#5DD62C] text-center">Your Reading History</h2>
        {history.length === 0 ? (
          <p className="text-gray-400 text-center">No reading history yet.</p>
        ) : (
          <table className="w-full bg-black text-[#5DD62C] rounded-lg">
            <thead>
              <tr>
                <th className="py-2">Book</th>
                <th className="py-2">Last Chapter</th>
                <th className="py-2">Progress</th>
                <th className="py-2">Last Read</th>
                <th className="py-2">Continue</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => {
                const book = bookDetails[item.bookId];
                const chapterTitle = chapterTitles[`${item.bookId}_${item.lastChapterRead}`];
                return (
                  <tr key={item.bookId} className="border-b border-gray-700">
                    <td className="py-2 flex items-center gap-3">
                      {book && book.image_url && (
                        <img src={book.image_url} alt={book.book_title} className="w-12 h-16 object-cover rounded shadow" />
                      )}
                      <div>
                        <div className="font-bold text-[#5DD62C]">{book ? book.book_title : item.bookId}</div>
                        <div className="text-xs text-gray-400">{book ? `by ${book.authorName}` : ''}</div>
                      </div>
                    </td>
                    <td className="py-2">{item.lastChapterRead}{chapterTitle ? `: ${chapterTitle}` : ''}</td>
                    <td className="py-2">{item.percentComplete || 0}%</td>
                    <td className="py-2">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}</td>
                    <td className="py-2">                        <button
                        className="bg-[#5DD62C] text-black font-semibold px-4 py-1 rounded hover:bg-[#4cc01f] transition-colors"
                        onClick={() => navigate(`/ChapterReader/${item.bookId}/${item.lastChapterRead}`)}
                      >
                        Continue Reading
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

UserReadingHistoryTable.propTypes = {
  history: PropTypes.array.isRequired,
  bookDetails: PropTypes.object.isRequired,
  chapterTitles: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired
};
