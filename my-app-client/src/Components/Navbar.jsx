import { useContext, useEffect, useState } from 'react'
import { FaBarsStaggered, FaBlog, FaXmark } from "react-icons/fa6";
import {Link} from 'react-router-dom';
import { AuthContext } from '../contects/AuthProider';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {user} = useContext(AuthContext);
  console.log(user);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }
    useEffect(() => {
      const handleScroll = () => {};
      window.addEventListener("scroll",handleScroll);

      return () => {
        window.addEventListener("scroll", handleScroll);
      }
    }, []);
  
  // nav items
  const navItems = [
    {link: "Home",path: '/'},
    {link: "Library",path: '/shop'},
    {link: "My Library",path: '/ChapterReader'}
  ];

  // Handler for dashboard navigation
  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = '/user/dashboard';
    }
  };

  return (
    <header className='w-full bg-black fixed top-0 left-0 right-0 z-50 transition-all ease-in duration-300'>
      <nav className='py-4 lg:px-24 px-4 bg-black'>
        {/* logo */}
        <div className='flex justify-between items-center text-base gap-8 w-full'>
          <Link to="/" className='text-2xl font-bold text-[#5DD62C] flex items-center gap-2'><FaBlog  className='inline-block'/></Link>

          {/* Centered nav items for large devices */}
          <div className="flex-1 flex justify-center">
            <ul className='md:flex space-x-12 hidden items-center'>
              {navItems.filter(item => item.link !== "Sell Your Book").map(({link,path}) => (
                <Link key={path} to={path} className='block text-base text-[#5DD62C] uppercase cursor-pointer hover:text-blue-700'>{link}</Link>
              ))}
            </ul>
          </div>

          {/* Login/dashboard button at the right end */}
          <div className='hidden md:flex items-center'>
            {!user ? (              <button
                className="bg-[#5DD62C] text-black px-4 py-2 rounded hover:bg-[#4cc01f] transition-colors uppercase font-semibold ml-4"
                onClick={() => window.location.href = '/login'}
              >
                Login
              </button>
            ) : (
              <button
                className="bg-transparent text-[#5DD62C] px-2 py-2 rounded hover:bg-gray-700 transition-colors ml-4"
                onClick={handleDashboardClick}
                title="Open Dashboard"
              >
                <FaBarsStaggered className="w-7 h-7 text-[#5DD62C]" />
              </button>
            )}
          </div>

          {/* menu btn for the mobile devices */}
          <div className='md:hidden'>
            <button  onClick={toggleMenu} className='text-[#5DD62C] focus:outline-none'>
              {isMenuOpen ? <FaXmark className='h-5 w-5 text-[#5DD62C]'/> : <FaBarsStaggered className='h-5 w-5 text-[#5DD62C]'/>}
            </button>
          </div>
        </div> 
        {/*navItems for small devices*/}
        <div className={`space-y-4 px-4 mt-0 py-7 bg-black ${isMenuOpen ? "block fixed top-16 right-0 left-0 border-t border-[#5DD62C]" : "hidden"}`}>
          {
            navItems.filter(item => item.link !== "Sell Your Book").map(({link,path}) => (
              <Link key={path} to={path} className='block text-base text-[#5DD62C] uppercase cursor-pointer hover:bg-gray-800 p-2 rounded'>{link}</Link>
            ))
          }
          {/* Conditional button for login or dashboard (mobile) */}
          {!user ? (            <button
              className="bg-[#5DD62C] text-black px-4 py-2 rounded w-full hover:bg-[#4cc01f] transition-colors uppercase font-semibold"
              onClick={() => window.location.href = '/login'}
            >
              Login
            </button>
          ) : (
            <button
              className="bg-transparent text-[#5DD62C] px-2 py-2 rounded w-full hover:bg-gray-700 transition-colors flex items-center justify-center"
              onClick={handleDashboardClick}
              title="Open Dashboard"
            >
              <FaBarsStaggered className="w-7 h-7 text-[#5DD62C]" />
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar