import { useContext, useState } from 'react';
import { Card, Dropdown, Modal } from "flowbite-react";
import { AuthContext } from '../contects/AuthProider';
import userImg from "../assets/profile.jpg";

const AdminProfile = () => {
  const { user } = useContext(AuthContext);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('profilePic', selectedFile);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users/profile-pic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setShowImageModal(false);
        setSelectedFile(null);
        window.location.reload();
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-3 px-4">
      <Card className="w-80 sm:w-96 h-auto bg-black border border-[#5DD62C]/30">
        <div className="flex justify-end px-4 pt-4">
          <Dropdown inline label="">
            <Dropdown.Item>
              <a href="/" className="block px-4 py-2 text-sm text-[#5DD62C] hover:bg-gray-900">
                Home
              </a>
            </Dropdown.Item>
            <Dropdown.Item>
              <a href="/logout" className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-900">
                Logout
              </a>
            </Dropdown.Item>
          </Dropdown>
        </div>
        <div className="flex flex-col items-center pb-10">
          <h3 className="text-[#5DD62C] text-2xl font-bold mb-6">Admin Profile</h3>
          <div className="relative cursor-pointer" onClick={handleImageClick}>
            <img
              src={user?.profilePic || userImg}
              alt="profile"
              className="w-24 h-24 rounded-full border-2 border-[#5DD62C]/30 mb-4 hover:opacity-80"
            />
            <div className="absolute bottom-4 right-0 text-[#5DD62C] text-xs bg-black px-2 py-1 rounded">
              Click to view
            </div>
          </div>
          <h5 className="mb-1 text-xl font-medium text-[#5DD62C]">
            {user?.displayName || user?.name || "Admin"}
          </h5>
          <span className="text-gray-400">{user?.role}</span>
          <div className="mt-6 flex space-x-3">
            <a
              href="/admin/dashboard/upload"
              className="inline-flex items-center rounded-lg bg-[#5DD62C] px-4 py-2 text-sm font-medium text-black hover:bg-[#4cb824]"
            >
              Add Book
            </a>
            <a
              href="/admin/dashboard/manage"
              className="inline-flex items-center rounded-lg border border-[#5DD62C]/30 px-4 py-2 text-sm font-medium text-[#5DD62C] hover:bg-gray-900"
            >
              Manage Books
            </a>
          </div>
        </div>
        {/* Modal for image upload */}
        <Modal show={showImageModal} onClose={() => setShowImageModal(false)}>
          <Modal.Header>Update Profile Picture</Modal.Header>
          <Modal.Body>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button
              className="mt-4 bg-[#5DD62C] text-black px-4 py-2 rounded hover:bg-[#4cb824]"
              onClick={handleUploadImage}
              disabled={!selectedFile}
            >
              Upload
            </button>
          </Modal.Body>
        </Modal>
      </Card>
    </div>
  );
};

export default AdminProfile;
