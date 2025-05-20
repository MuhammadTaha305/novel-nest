import { useState, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Button, Spinner } from 'flowbite-react';

const SingleBook = () => {
  const data = useLoaderData();
  const book = data.book || data; // fallback for legacy data
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  if (!book) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
        <p className="ml-2">Loading book details...</p>
      </div>
    );
  }

  const { _id, book_title, image_url, authorName, book_description, category } = book;

  // Function to handle read navigation
  const handleRead = async () => {
    // Redirect to the first chapter of the book
    navigate(`/ChapterReader/${_id}/1`);
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-10 items-center justify-center bg-gray-900/30 p-8 rounded-lg shadow-lg border border-[#5DD62C]/20">
          {/* Book Image - Larger size */}
          <div className="lg:w-1/3 flex justify-center">
            <img 
              src={image_url} 
              alt={book_title} 
              className="max-h-96 w-auto object-contain rounded-lg shadow-xl border-2 border-[#5DD62C]/30"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-book.png'; // Fallback image
              }}
            />
          </div>

          {/* Book Details - Larger text */}
          <div className="lg:w-2/3 flex flex-col">
            <h2 className="text-3xl font-bold mb-4 text-[#5DD62C] text-center lg:text-left">{book_title}</h2>
            <p className="text-gray-300 mb-3 text-lg">
              <span className="text-[#5DD62C] font-medium">Author:</span> {authorName}
            </p>
            <p className="text-gray-300 mb-3 text-lg">
              <span className="text-[#5DD62C] font-medium">Category:</span> {category}
            </p>
            <div className="mt-4 mb-6">
              <h3 className="text-xl font-semibold mb-3 text-[#5DD62C]">Description</h3>
              <p className="text-gray-300 text-base leading-relaxed">{book_description}</p>
            </div>
            
            {/* Error message */}
            {pdfError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {pdfError}
              </div>
            )}
              {/* Read Button - Larger and more prominent */}
            <div className="mt-6 flex justify-center lg:justify-start">
              <button 
                onClick={handleRead}
                disabled={isVerifying}
                className="bg-[#5DD62C] text-black font-semibold py-2 px-8 rounded hover:bg-[#4cc01f] transition-colors text-lg"
              >
                {isVerifying ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-r-transparent border-b-2 border-l-transparent border-black mr-3"></div>
                    Loading...
                  </>
                ) : (
                  'Read Now'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBook;