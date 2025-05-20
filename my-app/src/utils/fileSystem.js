const fs = require('fs');
const path = require('path');

const setupUploadDirectory = () => {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
};

module.exports = { setupUploadDirectory };