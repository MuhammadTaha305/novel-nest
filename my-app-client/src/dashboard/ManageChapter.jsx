import { useState, useEffect } from 'react';
import { Button, Label, TextInput, Textarea, Select } from "flowbite-react";

const ManageChapter = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch all books for the dropdown
    fetch('http://localhost:3000/api/books')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBooks(data);
          if (data.length > 0) setSelectedBook(data[0]._id);
        }
      })
      .catch(err => setError('Error fetching books: ' + err.message));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess('');

    try {
      const formData = {
        bookId: selectedBook,
        chapterNumber: parseInt(e.target.chapterNumber.value),
        title: e.target.chapterTitle.value,
        content: e.target.content.value
      };

      const response = await fetch('http://localhost:3000/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Chapter created successfully!');
        e.target.reset();
      } else {
        throw new Error(data.message || 'Failed to create chapter');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='px-4 my-12 bg-black'>
      <h2 className="text-3xl font-bold text-[#5DD62C] mb-6">Manage Chapter</h2>
      <div className="bg-black rounded-lg p-8 border border-[#5DD62C]/30">
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-900/50 border border-green-500 text-green-200 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className='grid lg:grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <div>
                <Label htmlFor="book" value="Select Book" className="text-[#5DD62C] text-lg" />
                <Select
                  id="book"
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  required
                  className='w-full mt-2 bg-gray-900 border-[#5DD62C]/30 text-white focus:ring-0 focus:outline-none'
                >
                  <option value="" className="bg-gray-900 text-white">Select a book</option>
                  {books.map(book => (
                    <option key={book._id} value={book._id} className="bg-gray-900 text-white">
                      {book.book_title}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="chapterNumber" value="Chapter Number" className="text-[#5DD62C] text-lg" />
                <TextInput
                  id="chapterNumber"
                  name="chapterNumber"
                  type="number"
                  min="1"
                  required
                  placeholder="Enter chapter number"
                  className="mt-2 bg-black border-[#5DD62C]/30 text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
                />
              </div>

              <div>
                <Label htmlFor="chapterTitle" value="Chapter Title" className="text-[#5DD62C] text-lg" />
                <TextInput
                  id="chapterTitle"
                  name="chapterTitle"
                  type="text"
                  required
                  placeholder="Enter chapter title"
                  className="mt-2 bg-black border-[#5DD62C]/30 text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content" value="Chapter Content" className="text-[#5DD62C] text-lg" />
              <Textarea
                id="content"
                name="content"
                required
                placeholder="Write your chapter content..."
                className="w-full mt-2 bg-white border-[#5DD62C]/30 text-black placeholder-gray-500 focus:ring-0 focus:outline-none"
                rows={12}
              />
            </div>
          </div>          <Button 
            type="submit" 
            disabled={loading}
            className="mt-6 bg-[#5DD62C] hover:bg-[#4cc01f] text-black font-semibold py-3 transition-colors rounded"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creating Chapter...
              </div>
            ) : (
              'Create Chapter'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ManageChapter;
