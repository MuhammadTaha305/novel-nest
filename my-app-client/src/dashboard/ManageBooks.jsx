import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const ManageBooks = () => {
  const [allBooks, setAllBooks] = useState([])
  
  useEffect(() => {
    fetch("http://localhost:3000/all-books").then(res => res.json()).then(data => setAllBooks(data))
  },[])
  
  const handleDelete = (id) => {
    console.log(id);
    fetch(`http://localhost:3000/book/${id}`,{
      method: "DELETE",
    }).then(res => res.json()).then(() => {
      alert("Book is deleted successfully")
      // Refresh books list after deletion
      fetch("http://localhost:3000/all-books").then(res => res.json()).then(data => setAllBooks(data))
    })
  }
  
  return (
    <div className='px-4 my-12 text-center'>
      <h2 className='mb-8 text-3xl text-[#5DD62C] font-bold'>Manage Your Books</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full lg:w-[930px] mx-auto border-collapse">
          {/* Table Header */}
          <thead className="bg-black border-b-2 border-[#5DD62C]">
            <tr>
              <th className="py-4 px-6 text-[#5DD62C] font-bold text-left">N.o</th>
              <th className="py-4 px-6 text-[#5DD62C] font-bold text-left">Book name</th>
              <th className="py-4 px-6 text-[#5DD62C] font-bold text-left">Author Name</th>
              <th className="py-4 px-6 text-[#5DD62C] font-bold text-left">Category</th>
              <th className="py-4 px-6 text-[#5DD62C] font-bold text-center">
                <span>Edit or Manage</span>
              </th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {allBooks.map((book, index) => (
              <tr 
                key={book._id} 
                className="bg-black hover:bg-gray-900 border-b border-gray-800"
              >
                <td className="py-3 px-6 text-[#5DD62C]">{index + 1}</td>
                <td className="py-3 px-6 text-[#5DD62C] font-medium">{book.book_title}</td>
                <td className="py-3 px-6 text-[#5DD62C]">{book.authorName}</td>
                <td className="py-3 px-6 text-[#5DD62C]">{book.category}</td>
                <td className="py-3 px-6 flex justify-center gap-3">
                  <Link
                    className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
                    to={`/admin/dashboard/edit-books/${book._id}`}
                  >
                    Edit
                  </Link>
                  <button
                    className='bg-red-600 px-4 py-1 font-semibold text-white rounded-sm hover:bg-red-500'
                    onClick={() => handleDelete(book._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageBooks