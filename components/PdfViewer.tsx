import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CloseIcon } from './icons.tsx';

// Icons for navigation
const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L8.85 10l3.94 3.71a.75.75 0 1 1-1.06 1.06l-4.5-4.25a.75.75 0 0 1 0-1.06l4.5-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
  </svg>
);

// Loading Spinner
const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <div className="w-12 h-12 border-4 border-slate-400 border-t-slate-100 rounded-full animate-spin"></div>
    </div>
);

// Let TypeScript know about the global pdfjsLib from the CDN script
declare const pdfjsLib: any;

interface PdfViewerProps {
  pdfUrl: string;
  onClose: () => void;
  title: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, onClose, title }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStartRef = useRef<number>(0);
  const SWIPE_THRESHOLD = 50;

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        if (typeof pdfjsLib === 'undefined') {
            console.error('pdf.js is not loaded.');
            setIsLoading(false);
            return;
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const doc = await loadingTask.promise;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setPageNum(1); // Reset to first page on new PDF
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPdf();
  }, [pdfUrl]);
  
  const renderPage = useCallback(async (num: number) => {
    if (!pdfDoc) return;

    try {
      const page = await pdfDoc.getPage(num);
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Render at a higher resolution for better quality, then scale down with CSS
      const desiredWidth = canvas.parentElement?.clientWidth || 1024;
      const viewport = page.getViewport({ scale: 1 });
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale * 2 }); // x2 for HiDPI

      const context = canvas.getContext('2d');
      if (!context) return;
      
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      canvas.style.width = "100%";
      canvas.style.height = "auto";

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };
      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }, [pdfDoc]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum);
    }
  }, [pdfDoc, pageNum, renderPage]);

  const goToPrevPage = useCallback(() => {
    setPageNum(p => Math.max(1, p - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNum(p => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchEnd = e.changedTouches[0].clientX;
    const deltaX = touchEnd - touchStartRef.current;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) { // Swipe left
        goToNextPage();
      } else { // Swipe right
        goToPrevPage();
      }
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };
  
  const NavButton: React.FC<{onClick: () => void, disabled: boolean, children: React.ReactNode, ariaLabel: string}> = 
  ({onClick, disabled, children, ariaLabel}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className="p-2 rounded-full bg-slate-900/50 text-white hover:bg-slate-900/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
        {children}
    </button>
  );

  return (
    <div
      className={`fixed inset-0 bg-black/80 z-50 flex flex-col ${isClosing ? 'animate-slide-out-to-right' : 'animate-slide-in-from-right'}`}
      role="dialog"
      aria-modal="true"
    >
      <header className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-900 text-white shadow-md">
        <h2 className="text-xl font-bold truncate">{title}</h2>
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-slate-700 transition-colors"
          aria-label="Close PDF viewer"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </header>
      <main 
        className="flex-grow flex-1 relative overflow-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <div key={pageNum} className="w-full h-full flex justify-center p-2 animate-page-fade-in">
             <canvas ref={canvasRef} />
          </div>
        )}
      </main>
       <footer className="flex-shrink-0 flex items-center justify-center p-4 bg-slate-900/80 text-white space-x-6">
            <NavButton onClick={goToPrevPage} disabled={pageNum <= 1} ariaLabel="Previous page">
                <ChevronLeftIcon className="h-6 w-6" />
            </NavButton>
            <span className="font-semibold text-lg tabular-nums">
                {pageNum} / {totalPages}
            </span>
            <NavButton onClick={goToNextPage} disabled={pageNum >= totalPages} ariaLabel="Next page">
                <ChevronRightIcon className="h-6 w-6" />
            </NavButton>
        </footer>
    </div>
  );
};

export default PdfViewer;