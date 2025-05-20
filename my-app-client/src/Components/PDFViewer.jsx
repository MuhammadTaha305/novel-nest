import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useParams, useNavigate } from 'react-router-dom';

const PDFViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookDetails, setBookDetails] = useState(null);

  // URL for the PDF file
  const pdfUrl = `/api/books/${id}/pdf`;

  // Fetch book details to display title
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`/api/books/${id}`);
        if (response.ok) {
          const data = await response.json();
          setBookDetails(data.book || data);
        } else {
          console.error('Failed to fetch book details');
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [id]);

  function onDocumentLoadSuccess({ numPages }) {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setError(null);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try again later.');
    setLoading(false);
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 2.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));

  const goBack = () => {
    navigate(`/book/${id}`);
  };

  return (
    <div className="flex flex-col items-center p-4 mt-20">
      {/* Book title if available */}
      {bookDetails && (
        <h1 className="text-2xl font-bold mb-4">{bookDetails.book_title}</h1>
      )}

      {/* Back button */}
      <button
        onClick={goBack}
        className="self-start mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        ← Back to Book
      </button>

      {loading && (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4">Loading PDF...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
            <button
              onClick={zoomIn}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Zoom In
            </button>
            <button
              onClick={zoomOut}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Zoom Out
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <span>
              Page {pageNumber} of {numPages || '?'}
            </span>
            <span>
              Scale: {Math.round(scale * 100)}%
            </span>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-auto max-w-full">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="p-4 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2">Loading PDF...</p>
                </div>
              }
              error={
                <div className="p-4 text-red-500">
                  Error loading PDF! Please try again.
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>

          <a href={pdfUrl} download className="mt-4 text-blue-500 hover:underline">
            Download PDF
          </a>
        </>
      )}
    </div>
  );
};

export default PDFViewer;