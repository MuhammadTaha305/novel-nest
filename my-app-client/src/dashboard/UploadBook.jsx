import { useState } from 'react'
import { Button, Label, Select, TextInput, Textarea } from "flowbite-react";

const UploadBook = () => {
  const bookCategories = [
    "Fiction",
    "Science Fiction",
    "Non-Fiction",
    "Mystery",
    "Programming",
    "Fantasy",
    "Horror",
    "Biography",
    "Autobiography",
    "History",
    "Self help",
    "Memoir",
    "Business",
    "Children Books",
    "Travel",
    "Philosophy",
    "Psychology",
    "Religion",
    "Art"
  ]
  const [selectedBookCategory, setSelectedBookCategory] = useState(bookCategories[0]);
  const [uploading, setUploading] = useState(false);

  const handleChangeSelectedValue = (event) => {
    setSelectedBookCategory(event.target.value);
  }

  const handleBookSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);

    const form = event.target;
    const bookData = {
      book_title: form.book_title.value,
      authorName: form.authorName.value,
      book_description: form.book_description.value,
      category: form.category.value,
      image_url: form.image_url.value
    };

    try {
      const response = await fetch("http://localhost:3000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload book');
      }

      alert("Book uploaded successfully!");
      form.reset();
    } catch (error) {
      alert("Error uploading book: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className='px-4 my-12 bg-black'>
      <h2 className="text-3xl font-bold text-[#5DD62C] mb-6">Upload New Book</h2>
      <div className="bg-black rounded-lg p-8 border border-[#5DD62C]/30">
        <form onSubmit={handleBookSubmit} className="flex flex-col gap-6">
          <div className='grid lg:grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <div>
                <Label htmlFor="book_title" value="Book Title" className="text-[#5DD62C] text-lg" />
                <TextInput 
                  id="book_title" 
                  type="text" 
                  name='book_title'
                  placeholder="Enter book title" 
                  required
                  className="mt-2 bg-gray-800 text-white border-gray-700 focus:ring-0 focus:outline-none"
                />
              </div>

              <div>
                <Label htmlFor="authorName" value="Author Name" className="text-[#5DD62C] text-lg" />
                <TextInput 
                  id="authorName" 
                  name='authorName'
                  type="text" 
                  placeholder="Enter author name" 
                  required
                  className="mt-2 bg-black border-[#5DD62C]/30 text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
                />
              </div>

              <div>
                <Label htmlFor="category" value="Book Category" className="text-[#5DD62C] text-lg" />
                <Select 
                  id="category" 
                  name="category" 
                  className='w-full mt-2 bg-gray-900 border-[#5DD62C]/30 text-white focus:ring-0 focus:outline-none' 
                  value={selectedBookCategory} 
                  onChange={handleChangeSelectedValue}
                >
                  {bookCategories.map((option) => (
                    <option key={option} value={option} className="bg-gray-900 text-white">{option}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <Label htmlFor="image_url" value="Book Cover Image URL" className="text-[#5DD62C] text-lg" />
                <TextInput 
                  id="image_url" 
                  type="text" 
                  name='image_url'
                  placeholder="Enter image URL" 
                  required
                  className="mt-2 bg-black border-[#5DD62C]/30 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="book_description" value="Book Description" className="text-[#5DD62C] text-lg" />
                <Textarea 
                  id="book_description"
                  name="book_description"
                  placeholder='Write your book description...'
                  required
                  className='w-full mt-2 bg-white border-[#5DD62C]/30 text-gray-900 placeholder-gray-500'
                  rows={5}
                />
              </div>
            </div>
          </div>          <Button 
            type="submit" 
            disabled={uploading}
            className="mt-6 bg-[#5DD62C] hover:bg-[#4cc01f] text-black font-semibold py-3 transition-colors rounded"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Uploading...
              </div>
            ) : (
              'Upload Book'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default UploadBook