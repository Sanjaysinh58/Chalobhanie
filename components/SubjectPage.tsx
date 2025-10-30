import React from 'react';
import { Chapter } from '../types.ts';
import { std9MathChapters, std10MathChapters } from '../data/chapters.ts';

interface SubjectPageProps {
  grade: number | null;
  onChapterSelect: (chapter: Chapter) => void;
}

const SubjectPage: React.FC<SubjectPageProps> = ({ grade, onChapterSelect }) => {
  const chapters = grade === 9 ? std9MathChapters : grade === 10 ? std10MathChapters : [];

  if (chapters.length === 0) {
      return (
          <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Solutions</h2>
              <p className="mt-4 text-slate-500 dark:text-slate-400">Chapter-wise solutions for this grade will be available soon.</p>
          </div>
      );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {chapters.map((chapter) => (
        <button
          key={chapter.number}
          onClick={() => onChapterSelect(chapter)}
          className="w-full flex items-center p-4 text-left bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-300 font-bold text-lg">
            {chapter.number}
          </div>
          <div className="ml-4 flex-grow">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              પ્રકરણ {chapter.number}
            </p>
            <p className="text-md text-slate-600 dark:text-slate-300">
              {chapter.name}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default SubjectPage;