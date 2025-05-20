import { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../contects/AuthProider';
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
import { format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryStats, setCategoryStats] = useState({});
  const [totalBooks, setTotalBooks] = useState(0);
  const [mostPopularCategory, setMostPopularCategory] = useState('');
  const [barChartData, setBarChartData] = useState({ labels: [], data: [] });
  const [topBooks, setTopBooks] = useState([]);
  const [userCount, setUserCount] = useState(0);

  // Demo data function for fallback when API calls fail
  const getDemoBooks = useCallback(() => {
    const authorName = user?.name || user?.displayName || 'Demo Author';
    const authorId = user?.id || user?.uid || user?._id || 'demo-author-id';
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    // Create realistic sample data with the expected structure
    return [
      {
        _id: 'demo1',
        book_title: 'The Fantasy Quest',
        category: 'Fantasy',
        authorId: authorId,
        authorName: authorName,
        book_description: 'An epic adventure in a magical world filled with danger and mystery.',
        reads: 120,
        image_url: 'https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb',
        createdAt: oneMonthAgo.toISOString(),
        updatedAt: now.toISOString(),
        chapters: Array(15).fill().map((_, i) => ({
          _id: `ch${i+1}-demo1`,
          chapterNumber: i + 1,
          bookId: 'demo1',
          title: `Chapter ${i + 1}: The ${i === 0 ? 'Beginning' : i === 14 ? 'Final Battle' : 'Journey Continues'}`,
          content: 'Sample chapter content would appear here...',
          createdAt: new Date(oneMonthAgo.getTime() + (i * 2 * 24 * 60 * 60 * 1000)).toISOString()
        }))
      },
      {
        _id: 'demo2',
        book_title: 'Mystery of the Ancient Runes',
        category: 'Mystery',
        authorId: authorId,
        authorName: authorName,
        book_description: 'A detective story uncovering secrets hidden for centuries.',
        reads: 85,
        image_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e',
        createdAt: new Date(oneMonthAgo.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
        chapters: Array(12).fill().map((_, i) => ({
          _id: `ch${i+1}-demo2`,
          chapterNumber: i + 1,
          bookId: 'demo2',
          title: `Chapter ${i + 1}: The ${i === 0 ? 'Discovery' : i === 11 ? 'Revelation' : 'Investigation'}`,
          content: 'Sample chapter content would appear here...',
          createdAt: new Date(oneMonthAgo.getTime() + (i * 2 * 24 * 60 * 60 * 1000)).toISOString()
        }))
      },
      {
        _id: 'demo3',
        book_title: 'Science Fiction Adventure',
        category: 'Sci-Fi',
        authorId: authorId,
        authorName: authorName,
        book_description: 'Explore new worlds and advanced technology in this futuristic tale.',
        reads: 67,
        image_url: 'https://images.unsplash.com/photo-1506703719100-a0b3fb7fb421',
        createdAt: new Date(oneMonthAgo.getTime() - (14 * 24 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
        chapters: Array(10).fill().map((_, i) => ({
          _id: `ch${i+1}-demo3`,
          chapterNumber: i + 1,
          bookId: 'demo3',
          title: `Chapter ${i + 1}: The ${i === 0 ? 'Launch' : i === 9 ? 'Return' : 'Exploration'}`,
          content: 'Sample chapter content would appear here...',
          createdAt: new Date(oneMonthAgo.getTime() + (i * 3 * 24 * 60 * 60 * 1000)).toISOString()
        }))
      }
    ];
  }, [user]);

  useEffect(() => {
    const fetchAuthorBooks = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Current user:", user);
        
        // Check for user ID from multiple possible sources
        const authorId = user?.uid || user?.id || user?._id;
        
        if (!authorId) {
          console.error("No author ID available in user object");
          setError("User ID not available. Please log in again.");
          setLoading(false);
          return;
        }
        
        console.log("Fetching books for author:", authorId);
        
        // Try the endpoint that worked (fifth approach)
        let response = await fetch('http://localhost:3000/api/books', {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Fallback to other approaches if needed
        if (!response.ok) {
          // Additional fetch attempts would go here
        }
        
        console.log("Final API response status:", response.status);
        
        let booksList = [];
        let usingDemoData = false;
        let foundBooksInSystem = false;
        
        // Fetch users and user login data for the graph
        let usersList = [];
        let userLoginData = [];
        
        try {
          // Attempt to fetch all users
          const usersResponse = await fetch('http://localhost:3000/api/users', {
            headers: { 
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            usersList = Array.isArray(usersData) ? usersData : (usersData.users || []);
            console.log("Fetched users:", usersList.length);
          } else {
            console.error("Failed to fetch users:", usersResponse.status);
          }
          
          // Attempt to fetch user login data
          try {
            const loginResponse = await fetch('http://localhost:3000/api/user-logins', {
              headers: { 
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (loginResponse.ok) {
              const loginData = await loginResponse.json();
              userLoginData = Array.isArray(loginData) ? loginData : (loginData.logins || []);
              console.log("Fetched user logins:", userLoginData.length);
            } else {
              console.error("Failed to fetch user logins:", loginResponse.status);
            }
          } catch (loginErr) {
            console.error("Error fetching login data:", loginErr);
          }
        } catch (userErr) {
          console.error("Error fetching users:", userErr);
        }
        
        try {
          if (response.ok) {
            const data = await response.json();
            console.log("API response data:", data);
            
            // Handle both cases: direct books array or books nested in a response object
            const allBooks = Array.isArray(data) ? data : (data.books || []);
            
            // Check if the system has any books at all
            foundBooksInSystem = allBooks.length > 0;
            
            // For admin users, show all books in the library
            if (user?.role === 'admin') {
              console.log("User is admin, showing all library books");
              booksList = allBooks;
              
              // If no books in system, use demo data
              if (booksList.length === 0) {
                console.log("No books found in library, using demo data");
                booksList = getDemoBooks();
                usingDemoData = true;
              }
            } else {
              // For regular users, filter books by author ID
              if (allBooks.length > 0 && response.url.indexOf('authorId') === -1) {
                console.log("Filtering books by author ID for regular user:", authorId);
                booksList = allBooks.filter(book => 
                  book.authorId === authorId || 
                  book.author_id === authorId || 
                  (book.author && (book.author.id === authorId || book.author._id === authorId))
                );
              } else {
                booksList = allBooks;
              }
              
              if (booksList.length === 0) {
                console.log("No books found for this author, using demo data");
                booksList = getDemoBooks(); // Use demo data if no real data
                usingDemoData = true;
              }
            }
          } else {
            console.log("All API attempts failed, using demo data");
            booksList = getDemoBooks(); // Use demo data if API calls fail
            usingDemoData = true;
          }
        } catch (jsonErr) {
          console.error("Error parsing JSON response:", jsonErr);
          console.log("Using demo data due to parsing error");
          booksList = getDemoBooks(); // Use demo data if parsing fails
          usingDemoData = true;
        }
        
        // Process the books data regardless of source
        setBooks(booksList);
        
        // Store the fetched users for use in the chart
        // If we couldn't fetch real users, create some demo users
        if (usersList.length === 0) {
          console.log("No users fetched, creating demo users");
          // Create some demo users with random creation dates
          const now = new Date();
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          
          usersList = Array(10).fill().map((_, i) => {
            // Random date between sixMonthsAgo and now
            const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
            return {
              _id: `demo-user-${i}`,
              name: `Demo User ${i}`,
              role: i < 2 ? 'admin' : 'user',
              createdAt: new Date(randomTime).toISOString()
            };
          });
        }
        
        // Store login data in window for easy access by chart
        window.userLoginData = userLoginData;
        window.allUsers = usersList;
        
        // Set appropriate error message
        if (usingDemoData) {
          if (user?.role === 'admin') {
            if (foundBooksInSystem) {
              setError(null); // No error for admin if using demo data with books in system
            } else {
              setError("No books in the library yet. Add some books to see real analytics.");
            }
          } else if (foundBooksInSystem) {
            setError("You haven&apos;t created any books yet. This is demo data for preview purposes. Your books will appear here once added.");
          } else {
            setError("Using demo data for preview purposes. Your actual books will appear here when added.");
          }
        } else {
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching author books:", err);
        setError("Error connecting to server. Using demo data for preview.");
        setBooks(getDemoBooks()); // Use demo data on error
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchAuthorBooks();
    }
  }, [user, getDemoBooks]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Fetch books (existing logic)
        // ...existing code...
        // Fetch user logins for the bar chart
        const loginResponse = await fetch('http://localhost:3000/api/user-logins', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let logins = [];
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          logins = loginData.logins || [];
        }
        // Prepare bar chart data for the last 30 days
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        const allDays = eachDayOfInterval({ start, end });
        const loginsByDate = {};
        allDays.forEach(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          loginsByDate[dateKey] = 0;
        });
        logins.forEach(({ date, count }) => {
          if (loginsByDate[date] !== undefined) {
            loginsByDate[date] = count;
          }
        });
        const labels = allDays.map(day => format(day, 'MMM d'));
        const dateKeys = allDays.map(day => format(day, 'yyyy-MM-dd'));
        const data = dateKeys.map(dateKey => loginsByDate[dateKey] || 0);
        setBarChartData({ labels, data });
        // ...existing code for books, users, etc...
      } catch (err) {
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (books.length > 0) {
      // Calculate category stats
      const categoryCount = {};
      const bookReadCounts = {};
      
      // Generate chart data for current month only
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      const allDays = eachDayOfInterval({ start, end });
      
      // Initialize login count by date for current month
      const loginsByDate = {};
      allDays.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        loginsByDate[dateKey] = 0;
      });
      
      // Get all login data from the window object
      const loginData = window.userLoginData || [];
      const allUsers = window.allUsers || [];
      
      // Count logins by date - only for current month
      if (loginData.length > 0) {
        console.log(`Processing ${loginData.length} login events for the chart`);
        
        // Filter logins from the current month
        const currentMonthLogins = loginData.filter(login => {
          if (login.timestamp) {
            try {
              const loginDate = parseISO(login.timestamp);
              return isValid(loginDate) && isSameMonth(loginDate, now);
            } catch (e) {
              console.error("Error parsing login date:", e, login);
              return false;
            }
          }
          return false;
        });
        
        console.log(`Found ${currentMonthLogins.length} login events this month`);
        
        // Count logins by date
        currentMonthLogins.forEach(login => {
          if (login.timestamp) {
            try {
              const loginDate = parseISO(login.timestamp);
              if (isValid(loginDate)) {
                const dateKey = format(loginDate, 'yyyy-MM-dd');
                // Increment login count for this date
                if (loginsByDate[dateKey] !== undefined) {
                  loginsByDate[dateKey] += 1;
                }
              }
            } catch (e) {
              console.error("Error parsing login date:", e, login);
            }
          }
        });
      }
      
      books.forEach(book => {
        if (book.category) {
          categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
        }
        
        // Track book popularity for admin dashboard
        if (book.reads) {
          bookReadCounts[book._id] = {
            id: book._id,
            title: book.book_title || book.title,
            reads: book.reads,
            category: book.category,
            image: book.image_url
          };
        }
      });

      // Get top 5 books by reads
      const topBooksList = Object.values(bookReadCounts)
        .sort((a, b) => b.reads - a.reads)
        .slice(0, 5);
        
      // Set user count from actual users if available or to default 10
      const estimatedUserCount = allUsers.length > 0 ? allUsers.length : 10;

      setCategoryStats(categoryCount);
      setTotalBooks(books.length);
      setTopBooks(topBooksList);
      setUserCount(estimatedUserCount);

      // Find most popular category
      let maxCat = '';
      let maxVal = 0;
      Object.entries(categoryCount).forEach(([cat, val]) => {
        if (val > maxVal) {
          maxCat = cat;
          maxVal = val;
        }
      });
      setMostPopularCategory(maxCat);

      // Prepare data for bar chart - just for current month
      const labels = allDays.map(day => format(day, 'MMM d'));
      const dateKeys = allDays.map(day => format(day, 'yyyy-MM-dd'));
      const data = dateKeys.map(dateKey => loginsByDate[dateKey] || 0);
      
      setBarChartData({ labels, data });
    }
  }, [books]);

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchBooksUploaded = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          // Fetch books uploaded per day for the current month
          const response = await fetch('http://localhost:3000/api/admin/books-uploaded', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          let booksUploaded = [];
          if (response.ok) {
            const data = await response.json();
            booksUploaded = data.booksUploaded || [];
          }
          // Prepare bar chart data for the current month
          const now = new Date();
          const start = startOfMonth(now);
          const end = endOfMonth(now);
          const allDays = eachDayOfInterval({ start, end });
          const booksByDate = {};
          allDays.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            booksByDate[dateKey] = 0;
          });
          booksUploaded.forEach(({ date, count }) => {
            if (booksByDate[date] !== undefined) {
              booksByDate[dateKey] = count;
            }
          });
          const labels = allDays.map(day => format(day, 'MMM d'));
          const dateKeys = allDays.map(day => format(day, 'yyyy-MM-dd'));
          const data = dateKeys.map(dateKey => booksByDate[dateKey] || 0);
          setBarChartData({ labels, data });
        } catch (err) {
          setError('Error loading admin books uploaded stats');
        } finally {
          setLoading(false);
        }
      };
      fetchBooksUploaded();
    }
  }, [user]);

  if (loading) return <div className="text-center text-[#5DD62C]">Loading dashboard...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <main className="flex-1">
      <div className="p-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-[#5DD62C] text-center">Author Analytics</h2>
        
        {/* Notification banner */}
        {error && (
          <div className="bg-[#5DD62C]/10 border border-[#5DD62C] text-[#5DD62C] px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Note: </strong>
            <span className="block sm:inline">{error}</span>
            {error.includes("demo data") && (
              <div className="mt-2 text-sm">
                {error.includes("haven&apos;t created any books") ? (
                  <>
                    <p>The platform already has books, but you need to add your own to see your analytics:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Click &ldquo;Start Adding Books Now&rdquo; below to begin</li>
                      <li>Once you add books, they&apos;ll replace this demo data</li>
                    </ul>
                  </>
                ) : (
                  <>
                    To add your own books and see real analytics:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Click &ldquo;Add New Book&rdquo; below to create your first book</li>
                      <li>Use &ldquo;Manage Chapters&rdquo; to add content to your books</li>
                      <li>Analytics will update as readers engage with your content</li>
                    </ul>
                  </>
                )}
                <div className="mt-3">
                  <a href="/admin/dashboard/upload" className="bg-[#5DD62C] text-black px-4 py-2 rounded font-semibold hover:bg-[#4cc01f] transition inline-block">
                    Start Adding Books Now
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Chart Section at the Top: Centered Pie Chart */}
        <div className="mb-8 flex flex-col items-center justify-center w-full">
          <div className="bg-gray-900 rounded-lg p-6 shadow w-full max-w-sm flex-shrink-0 flex items-center justify-center">
            <div className="w-full">
              <div className="text-lg text-gray-300 mb-2 text-center">Books by Category</div>
              {Object.keys(categoryStats).length > 0 ? (
                <Pie
                  data={{
                    labels: Object.keys(categoryStats),
                    datasets: [
                      {
                        data: Object.values(categoryStats),
                        backgroundColor: [
                          '#5DD62C', '#FFD700', '#1E90FF', '#FF69B4', '#FF6347', '#8A2BE2', '#00CED1', '#FFA500', '#A52A2A', '#228B22'
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
        </div>
        
        {/* Stats Section: Content Creation Stats */}
        <div className="mb-8 flex flex-col md:flex-row gap-8 items-center justify-center flex-wrap">
          <div className="bg-gray-900 rounded-lg p-6 shadow text-center w-full max-w-xs min-w-[220px] flex-1">
            <div className="text-4xl font-bold text-[#5DD62C]">{totalBooks}</div>
            <div className="text-lg text-gray-300">Total Books</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 shadow text-center w-full max-w-xs min-w-[220px] flex-1">
            <div className="text-4xl font-bold text-[#5DD62C]">{userCount}</div>
            <div className="text-lg text-gray-300">Total Users</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 shadow text-center w-full max-w-xs min-w-[220px] flex-1">
            <div className="text-2xl font-bold text-[#5DD62C]">{mostPopularCategory || 'N/A'}</div>
            <div className="text-lg text-gray-300">Most Popular Category</div>
          </div>
        </div>
        
        {/* Admin Library Summary */}
        {user?.role === 'admin' && (
          <div className="mb-8 bg-gray-900 rounded-lg p-6 shadow">
            <h3 className="text-xl font-bold mb-4 text-[#5DD62C]">Library Performance Summary</h3>
            <div className="text-gray-300">
              <p>Your library currently has <span className="text-[#5DD62C] font-semibold">{totalBooks} books</span> across <span className="text-[#5DD62C] font-semibold">{Object.keys(categoryStats).length} categories</span>.</p>
              <p className="mt-3">Your library is serving approximately <span className="text-[#5DD62C] font-semibold">{userCount} active users</span>, and the most popular category is <span className="text-[#5DD62C] font-semibold">{mostPopularCategory || 'N/A'}</span>.</p>
            </div>
          </div>
        )}

        {/* Top Books Section (Admin Only) */}
        {user?.role === 'admin' && topBooks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-[#5DD62C] text-center">Top Books by Reads</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {topBooks.map(book => (
                <div key={book.id} className="bg-gray-900 rounded-lg overflow-hidden shadow flex flex-col">
                  <div className="w-full h-40 overflow-hidden">
                    <img 
                      src={book.image || 'https://via.placeholder.com/300x200/1a1a1a/5DD62C?text=Book+Cover'} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="text-[#5DD62C] font-semibold truncate mb-1">{book.title}</h4>
                    <div className="text-gray-400 text-sm mb-2">{book.category}</div>
                    <div className="mt-auto">
                      <span className="text-xl font-bold text-[#5DD62C]">{book.reads}</span>
                      <span className="text-gray-400 text-sm"> reads</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;