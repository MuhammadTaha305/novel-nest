import { FaRegBookmark, FaBookmark } from 'react-icons/fa';

const BookmarkIcon = ({ isBookmarked, onClick }) => (
  <button
    aria-label={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
    onClick={onClick}
    className="focus:outline-none"
    style={{ background: 'none', border: 'none', padding: 0 }}
  >
    {isBookmarked ? (
      <FaBookmark className="w-7 h-7 text-yellow-400 drop-shadow" />
    ) : (
      <FaRegBookmark className="w-7 h-7 text-yellow-400 drop-shadow" />
    )}
  </button>
);

export default BookmarkIcon;
