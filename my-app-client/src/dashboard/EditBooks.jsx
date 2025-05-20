import React, { useState } from 'react'
import { Button, Label, Select, TextInput, Textarea } from "flowbite-react";
import {useParams, useLoaderData} from 'react-router-dom'

const EditBooks = () => {
  const {id} = useParams();
  const {book_title, authorName, image_url, book_description, category} = useLoaderData()
  const bookCategories = [
    "Fiction",
    "Non-Fiction",
    "Mistory",
    "Programming",
    "Science Fiction",
    "Fantasy",
    "Horror",
    "Bibliography",
    "Autobiography",
    "History",
    "Self help",
    "Memoir",
    "Business",
    "Children Books",
    "Travel",
    "Philosophy",
    "Psycology",
    "Religion",
    "Art"
  ]
  const [selectedBookCategory, setSelectedBookCategory] = useState(category || bookCategories[0]);
  
  const handleChangeSelectedValue = (event) => {
    setSelectedBookCategory(event.target.value);
  }
  const handleUpdate = (event) => {
    event.preventDefault();
    const form = event.target;

    const updatebBookObj = {
      book_title: form.book_title.value,
      authorName: form.authorName.value,
      image_url: form.image_url.value,
      book_description: form.book_description.value,
      category: form.category.value
    }

    fetch(`http://localhost:3000/book/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatebBookObj)
    }).then(res => res.json()).then(data => {
      alert("Book Updated successfully!")
    })
  }

  return (
    <div className='px-4 my-12 bg-black'>
      <h2 className="text-3xl font-bold text-[#5DD62C] mb-6">Update Book</h2>
      <div className="bg-black rounded-lg p-8 border border-[#5DD62C]/30">
        <form onSubmit={handleUpdate} className="flex flex-col gap-6">
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
                  defaultValue={book_title}
                  className="mt-2 bg-black border-[#5DD62C]/30 text-white placeholder-gray-400"
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
                  defaultValue={authorName}
                  className="mt-2 bg-black border-[#5DD62C]/30 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="category" value="Book Category" className="text-[#5DD62C] text-lg" />
                <Select 
                  id="category" 
                  name="category" 
                  className='w-full mt-2 bg-gray-900 border-[#5DD62C]/30 text-white' 
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
                  defaultValue={image_url}
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
                  defaultValue={book_description}
                  className='w-full mt-2 bg-white border-[#5DD62C]/30 text-gray-900 placeholder-gray-500'
                  rows={5}
                />
              </div>
            </div>
          </div>          <Button 
            type="submit"
            className="mt-6 bg-[#5DD62C] hover:bg-[#4cc01f] text-black font-semibold py-3 transition-colors rounded"
          >
            Update Book
          </Button>
        </form>
      </div>
    </div>
  )
}

export default EditBooks