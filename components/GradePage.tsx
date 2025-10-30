import React, { useState } from 'react';
import PdfViewer from './PdfViewer.js';

interface GradePageProps {
  grade: number;
  onTextbookSelect: () => void;
  onSolutionsSelect: () => void;
}

const GradePage: React.FC<GradePageProps> = ({ grade, onTextbookSelect, onSolutionsSelect }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  const textbookUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  const handleTextbookClick = () => {
    setViewingPdf({ url: textbookUrl, title: `ધોરણ ${grade} ગણિત Textbook` });
    setDropdownOpen(false);
  };
  
  return (
    <>
      <div className="relative grid grid-cols-1 gap-6 md:gap-8">
        <button
          onClick={toggleDropdown}
          className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
        >
          <span className="text-3xl font-bold text-slate-700 dark:text-slate-200">
            ગણિત
          </span>
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 grid grid-cols-2 gap-4 animate-fade-in-down z-10">
            <button
              onClick={handleTextbookClick}
              className="group flex items-center justify-center p-4 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
            >
              <span className="text-xl font-bold">Textbook</span>
            </button>
            <button
              onClick={onSolutionsSelect}
              className="group flex items-center justify-center p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
            >
              <span className="text-xl font-bold">સ્વાધ્યાય</span>
            </button>
          </div>
        )}
      </div>

      {viewingPdf && (
        <PdfViewer 
          pdfUrl={viewingPdf.url} 
          onClose={() => setViewingPdf(null)} 
          title={viewingPdf.title} 
        />
      )}
    </>
  );
};

export default GradePage;