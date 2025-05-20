import { useContext, useState } from 'react';
import { Card, Dropdown, Modal } from "flowbite-react";
import { AuthContext } from '../contects/AuthProider';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
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

      if (response.ok && data.profilePic) {
        // Refetch user profile to get updated profilePicData
        const token = localStorage.getItem('token');
        const profileRes = await fetch('http://localhost:3000/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success) {
            setUser && setUser(profileData.user);
          }
        }
        setShowImageModal(false);
        setSelectedFile(null);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    }
  };

  // Helper to get profile image src
  const getProfileImageSrc = () => {
    if (user?.profilePicData && user?._id) {
      // If profilePicData exists, fetch from backend endpoint
      return `http://localhost:3000/api/users/profile-pic/${user._id}`;
    }
    // Fallback to URL or default
    return user?.profilePic || "/profile.jpg";
  };

  if (!user) return <div className="text-center text-red-500 mt-10">Please log in to view your profile.</div>;

  return (
    <div className="flex min-h-screen bg-black">
      <main className="flex-1 flex justify-center items-center py-3 px-4">
        <Card className="w-80 sm:w-96 h-auto bg-black border border-[#5DD62C]/30">
          <div className="flex justify-end px-4 pt-4">
            <Dropdown inline label="">
              <Dropdown.Item>
                <a href="/shop" className="block px-4 py-2 text-sm text-[#5DD62C] hover:bg-gray-900">
                  Explore
                </a>
              </Dropdown.Item>
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
            <h3 className="text-[#5DD62C] text-2xl font-bold mb-6">User Profile</h3>
            <div className="relative cursor-pointer" onClick={handleImageClick}>
              <img
                src={getProfileImageSrc()}
                alt="profile"
                className="w-24 h-24 rounded-full border-2 border-[#5DD62C]/30 mb-4 hover:opacity-80"
              />
              <div className="absolute bottom-4 right-0 text-[#5DD62C] text-xs bg-black px-2 py-1 rounded">
                Click to view
              </div>
            </div>
            <h5 className="mb-1 text-xl font-medium text-[#5DD62C]">
              {user?.displayName || user?.name || "Demo User"}
            </h5>
            <span className="text-gray-400">{user?.role}</span>
          </div>
          <div className="px-4 pb-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#5DD62C] text-sm">Username</label>
                <p className="text-white text-lg">{user?.name || "Not Set"}</p>
              </div>
              
              <div>
                <label className="text-[#5DD62C] text-sm">Email Address</label>
                <p className="text-white text-lg">{user?.email}</p>
              </div>

              <div>
                <label className="text-[#5DD62C] text-sm">Role</label>
                <p className="text-white text-lg capitalize">{user?.role}</p>
              </div>

              <div>
                <label className="text-[#5DD62C] text-sm">Account Status</label>
                <p className="text-white text-lg capitalize">
                  {user?.status || 'Active'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Modal show={showImageModal} onClose={() => setShowImageModal(false)} size="md">
          <Modal.Header className="bg-black border-b border-[#5DD62C]/30">
            <h3 className="text-[#5DD62C]">Profile Picture</h3>
          </Modal.Header>
          <Modal.Body className="bg-black">
            <div className="flex flex-col items-center gap-4">
              <img
                src={getProfileImageSrc()}
                alt="profile"
                className="w-64 h-64 object-cover rounded-lg border-2 border-[#5DD62C]/30"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-[#5DD62C] file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#5DD62C] file:text-black"
              />
              {selectedFile && (
                <button
                  onClick={handleUploadImage}
                  className="bg-[#5DD62C] text-black px-4 py-2 rounded hover:bg-[#4cb824]"
                >
                  Upload New Picture
                </button>
              )}
            </div>
          </Modal.Body>
        </Modal>
      </main>
    </div>
  );
};

export default Profile;
