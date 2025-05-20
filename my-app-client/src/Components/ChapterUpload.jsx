import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadChapters = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapters, setChapters] = useState([{ chapterNumber: 1, title: '', content: '' }]);
  const [existingChapters, setExistingChapters] = useState([]);
  const [uploadMethod, setUploadMethod] = useState('form'); // 'form' or 'file'
  const [textFile, setTextFile] = useState(null);
  const [parseOptions, setParseOptions] = useState({
    chapterDelimiter: 'Chapter',
    includeChapterWord: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch book details
        const bookRes = await axios.get(`${import.meta.env.VITE_API_URL}/book/${bookId}`);
        setBook(bookRes.data);
        
        // Fetch existing chapters
        const chaptersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/books/${bookId}/chapters`);
        setExistingChapters(chaptersRes.data.chapters);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch book details');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [bookId]);

  const handleAddChapter = () => {
    const nextNumber = chapters.length > 0 
      ? Math.max(...chapters.map(c => parseInt(c.chapterNumber))) + 1 
      : 1;
      
    setChapters([...chapters, { chapterNumber: nextNumber, title: '', content: '' }]);
  };

  const handleRemoveChapter = (index) => {
    const newChapters = [...chapters];
    newChapters.splice(index, 1);
    setChapters(newChapters);
  };

  const handleChapterChange = (index, field, value) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  const handleFileChange = (e) => {
    setTextFile(e.target.files[0]);
  };

  const parseFileContent = async () => {
    if (!textFile) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      const { chapterDelimiter, includeChapterWord } = parseOptions;
      
      // Split the content by chapter delimiter pattern
      const delimiter = includeChapterWord 
        ? new RegExp(`${chapterDelimiter}\\s+\\d+`, 'i') 
        : new RegExp(`\\d+`, 'i');
      
      let parts = content.split(delimiter);
      
      // Remove any empty parts
      parts = parts.filter(part => part.trim().length > 0);
      
      // Extract chapter titles and content
      const parsedChapters = [];
      let chapterMatches = content.match(new RegExp(`(${chapterDelimiter}\\s+\\d+[^\\n]*?)\\n`, 'gi'));
      
      if (!chapterMatches || chapterMatches.length === 0) {
        setError('Could not identify chapter structure in the file. Please adjust parsing options.');
        return;
      }
      
      for (let i = 0; i < Math.min(parts.length, chapterMatches.length); i++) {
        // Extract chapter number from the matched pattern
        const chapterMatch = chapterMatches[i].match(/\d+/);
        const chapterNumber = chapterMatch ? parseInt(chapterMatch[0]) : i + 1;
        
        // Extract title from the first line
        let title = chapterMatches[i].trim();
        
        // Extract the content (skip first line which is title)
        let chapterContent = parts[i].trim();
        
        parsedChapters.push({
          chapterNumber,
          title,
          content: chapterContent
        });
      }
      
      setChapters(parsedChapters);
    };
    
    reader.readAsText(textFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate chapters
      if (chapters.length === 0) {
        setError('Please add at least one chapter');
        setSubmitting(false);
        return;
      }
      
      for (const chapter of chapters) {
        if (!chapter.chapterNumber || !chapter.title || !chapter.content) {
          setError('All chapters must have number, title and content');
          setSubmitting(false);
          return;
        }
      }
      
      // Check for duplicate chapter numbers
      const chapterNumbers = chapters.map(c => parseInt(c.chapterNumber));
      const uniqueNumbers = new Set(chapterNumbers);
      if (uniqueNumbers.size !== chapters.length) {
        setError('Each chapter must have a unique chapter number');
        setSubmitting(false);
        return;
      }
      
      // Check for conflicts with existing chapters
      const existingNumbers = existingChapters.map(c => c.chapterNumber);
      const conflicts = chapterNumbers.filter(num => existingNumbers.includes(num));
      if (conflicts.length > 0) {
        setError(`Chapters ${conflicts.join(', ')} already exist. Please use a different number.`);
        setSubmitting(false);
        return;
      }
      
      // Submission logic
      await axios.post(`${import.meta.env.VITE_API_URL}/api/books/${bookId}/bulk-upload-chapters`, {
        chapters
      });
      
      // Update book status to have full text
      await axios.patch(`${import.meta.env.VITE_API_URL}/book/${bookId}`, {
        hasFullText: true
      });
      
      setSuccessMessage('Chapters uploaded successfully!');
      setTimeout(() => {
        navigate(`/book/${bookId}`);
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload chapters');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="btn bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Upload Chapters</h1>
      <h2 className="text-xl font-semibold mb-8">Book: {book?.title}</h2>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Upload Method Selector */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Upload Method</h3>
        <div className="flex gap-4">
          <button 
            className={`px-4 py-2 rounded ${uploadMethod === 'form' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setUploadMethod('form')}
          >
            Chapter Form
          </button>
          <button 
            className={`px-4 py-2 rounded ${uploadMethod === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setUploadMethod('file')}
          >
            Text File
          </button>
        </div>
      </div>
      
      {uploadMethod === 'file' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Upload Text File</h3>
          <div className="mb-4">
            <input 
              type="file" 
              accept=".txt" 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Parsing Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Chapter Delimiter</label>
                <input 
                  type="text" 
                  value={parseOptions.chapterDelimiter}
                  onChange={(e) => setParseOptions({...parseOptions, chapterDelimiter: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. Chapter"
                />
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="includeChapterWord" 
                  checked={parseOptions.includeChapterWord}
                  onChange={(e) => setParseOptions({...parseOptions, includeChapterWord: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="includeChapterWord">Include word &quot;Chapter&quot; in delimiter</label>
              </div>
            </div>
          </div>
          
          <button 
            onClick={parseFileContent}
            disabled={!textFile}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            Parse File
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {chapters.map((chapter, index) => (
          <div key={index} className="mb-8 p-4 border rounded shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Chapter {chapter.chapterNumber}</h3>
              <button
                type="button"
                onClick={() => handleRemoveChapter(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1">Chapter Number</label>
                <input 
                  type="number"
                  value={chapter.chapterNumber}
                  onChange={(e) => handleChapterChange(index, 'chapterNumber', e.target.value)}
                  className="w-full p-2 border rounded"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Chapter Title</label>
                <input 
                  type="text"
                  value={chapter.title}
                  onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1">Content</label>
              <textarea 
                value={chapter.content}
                onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                className="w-full p-2 border rounded min-h-[200px]"
                required
              ></textarea>
            </div>
          </div>
        ))}
        
        <div className="flex justify-between mb-8">
          <button 
            type="button"
            onClick={handleAddChapter}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            + Add Another Chapter
          </button>
          
          <button 
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
          >
            {submitting ? 'Uploading...' : 'Save All Chapters'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadChapters;