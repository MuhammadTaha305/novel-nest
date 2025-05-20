import React, { useContext } from 'react'
import { Card, Dropdown } from "flowbite-react";
import { AuthContext } from '../contects/AuthProider';

const Profile = () => {
  const {user} = useContext(AuthContext)
  return (

    <div className="flex justify-center items-center relative py-3 mr-10 sm:max-w-xl sm:mx-auto h-100vh ">
      <Card className="w-80 sm:w-96 h-auto bg-gray-300">
        <div className="flex justify-center items-center px-4 pt-4">
        
        
          <Dropdown inline label="">
            <Dropdown.Item>
              <a
                href="/shop"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Explore
              </a>
            </Dropdown.Item>
            <Dropdown.Item>
              <a
                href="/"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Home
              </a>
            </Dropdown.Item>
            <Dropdown.Item>
              <a
                href="/logout"
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
              >
               Logout
              </a>
            </Dropdown.Item>
          </Dropdown>
        </div>
        <div className="flex flex-col items-center pb-10">
        <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
        {
        user?.displayName || "Demo User"
       }
        </h5>
          <span className="text-sm text-gray-500 dark:text-gray-400">Bookworm</span>
          <div className="mt-4 flex space-x-3 lg:mt-6">
            <a
              href="/admin/dashboard/upload"
              className="inline-flex items-center rounded-lg bg-cyan-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
            >
              Add Book
            </a>
            <a
              href="/admin/dashboard/manage"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
            >
             Edit Book
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Profile
