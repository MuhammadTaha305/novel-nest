import {
  createBrowserRouter
} from "react-router-dom";
import App from '../App';
import Home from "../home/Home";
import Shop from "../shop/Shop";
import ChapterReader from "../Components/ChapterReader";
import SingleBook from "../shop/SingleBook";
import DashboradLayout from "../dashboard/DashboradLayout";
import Dashboard from "../dashboard/Dashboard";
import UploadBook from "../dashboard/UploadBook";
import ManageBooks from "../dashboard/ManageBooks";
import EditBooks from "../dashboard/EditBooks";
import Signup from "../Components/Signup";
import Login from "../Components/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Logout from "../Components/Logout";
import Profile from "../dashboard/Profile";
import Details from "../dashboard/Details";
import ChapterManagement from "../dashboard/ChapterManagement";
import ReadNovel from "../Components/ReadNovel";
import PDFViewer from "../Components/PDFViewer";
import UserDashboard, { UserReadingHistoryTable } from '../dashboard/UserDashboard';
import AdminProfile from "../dashboard/AdminProfile";
import Bookmarks from '../dashboard/Bookmarks';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contects/AuthProider';
import { useNavigate } from 'react-router-dom';
import ManageChapter from "../dashboard/ManageChapter";

function UserReadingHistoryTableWrapper() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookDetails, setBookDetails] = useState({});
  const [chapterTitles, setChapterTitles] = useState({});
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
        } catch (e) {}
      }));
      setBookDetails(details);
      setChapterTitles(chapters);
    };
    fetchBooksAndChapters();
  }, [history]);
  if (loading) return <div className="text-center text-[#5DD62C]">Loading history...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  return <UserReadingHistoryTable history={history} bookDetails={bookDetails} chapterTitles={chapterTitles} navigate={navigate} />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children : [
      {
        path: '/',
        element: <Home />
      },
      {
        path: "/shop",
        element: <Shop />
      },
      // Updated routes for reading novels
      {
        path: "/ChapterReader",
        element: <ReadNovel />
      },
      {
        path: "/ChapterReader/:bookId",
        element: <ChapterReader />
      },
      {
        path: "/ChapterReader/:bookId/:chapterNumber",
        element: <ChapterReader />
      },
      {
        path: "/book/:id",
        element: <SingleBook />,
        loader: ({params}) => fetch(`http://localhost:3000/api/books/${params.id}`)
      },
      {
        path: "/book/:id/pdf",
        element: <PDFViewer />,
        loader: ({params}) => fetch(`http://localhost:3000/api/books/${params.id}`)
      }
    ]
  },
  {
    path: '/admin/dashboard',
    element: <DashboradLayout />,
    children: [
      {
        path: "/admin/dashboard",
        element: <PrivateRoute><Dashboard /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/upload",
        element: <PrivateRoute role="admin"><UploadBook /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/manage",
        element: <PrivateRoute role="admin"><ManageBooks /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/edit-books/:id",
        element: <EditBooks />,
        loader: ({params}) => fetch(`http://localhost:3000/book/${params.id}`)
      },
      {
        path: "/admin/dashboard/profile",
        element: <PrivateRoute><Profile /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/profile-admin",
        element: <PrivateRoute role="admin"><AdminProfile /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/details",
        element: <Details />
      },
      {
        path: "/admin/dashboard/chapters",
        element: <PrivateRoute><ChapterManagement /></PrivateRoute>
      },
      {
        path: "/admin/dashboard/manage-chapters",
        element: <PrivateRoute role="admin"><ManageChapter /></PrivateRoute>
      }
    ]
  },
  {
    path: '/user/dashboard',
    element: <DashboradLayout />,
    children: [
      {
        path: "/user/dashboard",
        element: <PrivateRoute role="user"><UserDashboard /></PrivateRoute>
      },
      {
        path: "/user/dashboard/history",
        element: <PrivateRoute role="user"><UserReadingHistoryTableWrapper /></PrivateRoute>
      },
      {
        path: "/user/dashboard/bookmarks",
        element: <PrivateRoute role="user"><Bookmarks /></PrivateRoute>
      },
      {
        path: "/user/dashboard/profile",
        element: <PrivateRoute role="user"><Profile /></PrivateRoute>
      }
    ]
  },
  {
    path: "sign-up",
    element: <Signup />
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "logout",
    element: <Logout />
  }
]);

export default router;