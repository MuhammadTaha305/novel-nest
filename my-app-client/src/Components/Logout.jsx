import React from 'react';

const Logout = ({ onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onCancel}
    >
      <div
        className="backdrop-blur-lg bg-white/10 border border-white/30 p-6 rounded-2xl shadow-xl text-center text-white max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
        <p className="mb-6 text-sm text-gray-300">Are you sure you want to log out?</p>
        <div className="flex justify-center space-x-4">
          <button
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            onClick={onConfirm}
          >
            Log Out
          </button>
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
