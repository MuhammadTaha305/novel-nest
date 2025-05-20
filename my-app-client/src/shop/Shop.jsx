import React, { useState, useEffect } from 'react'
import { Card } from "flowbite-react";
import { useLocation, Link } from 'react-router-dom';

const Shop = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Get search query from URL
  const params = new URLSearchParams(location.search);
  const search = params.get('search')?.toLowerCase() || '';

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3000/all-books")
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching books:", err);
        setLoading(false);
      });
  },[])

  // Filter books if search query is present
  const filteredBooks = search
    ? books.filter(book =>
        book.book_title?.toLowerCase().includes(search) ||
        book.category?.toLowerCase().includes(search)
      )
    : books;

  return (
    <div className='min-h-screen bg-black px-4 lg:px-24 flex flex-col pb-10'>
      <h1 className='text-5xl mt-16 mb-6 font-bold text-center text-[#5DD62C]'>
        {search ? `Search Results for "${search}"` : 'All Books'}
      </h1>
      
      {search && (
        <div className='mb-6 flex justify-center'>
          <Link to="/shop" className="text-sm text-[#5DD62C] hover:underline">
            ← Back to all books
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5DD62C]"></div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400">No books found matching "{search}"</p>
          <Link to="/shop" className="text-[#5DD62C] mt-4 inline-block hover:underline">
            View all books instead
          </Link>
        </div>
      ) : (
        <div className='grid gap-8 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 pb-6'>
          {filteredBooks.map(book => (
            <Card 
              className='bg-gray-900 text-white border border-gray-800 overflow-hidden flex flex-col' 
              key={book._id}
              style={{ height: '360px' }} // Fixed height for all cards
            >
              <div className="h-48 flex items-center justify-center bg-black p-2">
                <img 
                  src={book.image_url} 
                  alt={book.book_title} 
                  className='h-full w-auto object-contain max-w-full'
                />
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h5 className="text-lg font-bold tracking-tight text-[#5DD62C] text-center line-clamp-2 mb-1">
                  {book.book_title}
                </h5>
                <p className="text-gray-400 text-sm text-center mb-2">
                  {book.authorName || 'Unknown Author'}
                </p>
                  <div className="flex-1 flex flex-col justify-end mt-auto">
                  <button
                    className='bg-[#5DD62C] text-black font-semibold py-2 px-4 rounded hover:bg-[#4cc01f] transition-colors w-full'
                    onClick={() => window.location.href = `/ChapterReader/${book._id}/1`}
                  >
                    Read Now
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Shop