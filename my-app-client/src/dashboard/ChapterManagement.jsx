import { useState, useEffect } from 'react'
import { Button, Label, TextInput, Textarea, Select } from "flowbite-react";


const ChapterManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');


  useEffect(() => {
    // Fetch all books for the dropdown
    fetch('http://localhost:3000/all-books')
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        if (data.length > 0) {
          setSelectedBook(data[0]._id);
        }
      })
      .catch(err => {
        setError('Error fetching books: ' + err.message);
      });
  }, []);

  const handleChapterSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedBook) {
      setError('Please select a book first');
      setLoading(false);
      return;
    }

    const form = event.target;
    const chapterObj = {
      bookId: selectedBook,
      chapterNumber: parseInt(form.chapterNumber.value),
      title: form.chapterTitle.value,
      content: form.content.value
    }

    try {
      const response = await fetch("http://localhost:3000/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chapterObj)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload chapter');
      }

      alert("Chapter uploaded successfully!");
      form.reset();
    } catch (err) {
      setError(err.message);
      alert("Error uploading chapter: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='px-4 flex flex-col justify-center min-h-[calc(100vh-100px)]'>
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleChapterSubmit} className="flex lg:w-[930px] flex-col flex-wrap gap-4">
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="book" value="Select Book" />
            </div>
            <Select 
              id="book" 
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              required
            >
              {books.map(book => (
                <option key={book._id} value={book._id}>
                  {book.book_title}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="chapterTitle" value="Chapter Title" />
            </div>
            <TextInput 
              id="chapterTitle" 
              type="text" 
              name='chapterTitle'
              placeholder="Enter chapter title" 
              required
            />
          </div>

          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="chapterNumber" value="Chapter Number" />
            </div>
            <TextInput 
              id="chapterNumber" 
              type="number" 
              name='chapterNumber'
              placeholder="Enter chapter number" 
              required
              min="1"
            />
          </div>
        </div>

        <div>
          <div className='mb-2 block'>
            <Label htmlFor="content" value="Chapter Content" />
          </div>
          <Textarea 
            id="content"
            name="content"
            placeholder='Write your chapter content here...'
            required
            className='w-full'
            rows={10}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Chapter'}
        </Button>
      </form>
    </div>
  )
}

export default ChapterManagement 