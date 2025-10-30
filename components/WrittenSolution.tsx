import React, { useState } from 'react';
import { Chapter } from '../types.ts';
import PdfViewer from './PdfViewer.tsx';
import { DocumentTextIcon } from './icons.tsx';

const PlaceholderPage: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="mt-4 text-slate-500 dark:text-slate-400">{content}</p>
    </div>
  );
};

// --- Swaadhyay Data ---

interface SolutionResource {
  name: string;
  pdfUrl: string;
}

interface SwaadhyayExercise {
  name: string;
  solutions: SolutionResource[];
}

const createChapterExercises = (exerciseNames: string[]): SwaadhyayExercise[] => {
  return exerciseNames.map(name => ({
    name,
    solutions: [
      { name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ]
  }));
};

export const swaadhyayData: { [grade: number]: { [chapter: number]: SwaadhyayExercise[] } } = {
  9: { // Grade 9
    1: createChapterExercises(['સ્વાધ્યાય 1.1', 'સ્વાધ્યાય 1.2', 'સ્વાધ્યાય 1.3', 'સ્વાધ્યાય 1.4', 'સ્વાધ્યાય 1.5']),
    2: createChapterExercises(['સ્વાધ્યાય 2.1', 'સ્વાધ્યાય 2.2', 'સ્વાધ્યાય 2.3', 'સ્વાધ્યાય 2.4', 'સ્વાધ્યાય 2.5']),
    3: createChapterExercises(['સ્વાધ્યાય 3.1', 'સ્વાધ્યાય 3.2', 'સ્વાધ્યાય 3.3']),
    4: createChapterExercises(['સ્વાધ્યાય 4.1', 'સ્વાધ્યાય 4.2', 'સ્વાધ્યાય 4.3', 'સ્વાધ્યાય 4.4']),
    5: createChapterExercises(['સ્વાધ્યાય 5.1', 'સ્વાધ્યાય 5.2']),
    6: createChapterExercises(['સ્વાધ્યાય 6.1', 'સ્વાધ્યાય 6.2', 'સ્વાધ્યાય 6.3']),
    7: createChapterExercises(['સ્વાધ્યાય 7.1', 'સ્વાધ્યાય 7.2', 'સ્વાધ્યાય 7.3', 'સ્વાધ્યાય 7.4', 'સ્વાધ્યાય 7.5']),
    8: createChapterExercises(['સ્વાધ્યાય 8.1', 'સ્વાધ્યાય 8.2']),
    9: createChapterExercises(['સ્વાધ્યાય 9.1', 'સ્વાધ્યાય 9.2', 'સ્વાધ્યાય 9.3', 'સ્વાધ્યાય 9.4']),
    10: createChapterExercises(['સ્વાધ્યાય 10.1', 'સ્વાધ્યાય 10.2', 'સ્વાધ્યાય 10.3', 'સ્વાધ્યાય 10.4', 'સ્વાધ્યાય 10.5', 'સ્વાધ્યાય 10.6']),
    11: createChapterExercises(['સ્વાધ્યાય 11.1', 'સ્વાધ્યાય 11.2']),
    12: createChapterExercises(['સ્વાધ્યાય 12.1', 'સ્વાધ્યાય 12.2']),
  },
  10: { // Grade 10
    1: createChapterExercises(['સ્વાધ્યાય 1.1', 'સ્વાધ્યાય 1.2', 'સ્વાધ્યાય 1.3', 'સ્વાધ્યાય 1.4']),
    2: createChapterExercises(['સ્વાધ્યાય 2.1', 'સ્વાધ્યાય 2.2', 'સ્વાધ્યાય 2.3']),
    3: createChapterExercises(['સ્વાધ્યાય 3.1', 'સ્વાધ્યાય 3.2', 'સ્વાધ્યાય 3.3', 'સ્વાધ્યાય 3.4', 'સ્વાધ્યાય 3.5', 'સ્વાધ્યાય 3.6']),
    4: createChapterExercises(['સ્વાધ્યાય 4.1', 'સ્વાધ્યાય 4.2', 'સ્વાધ્યાય 4.3', 'સ્વાધ્યાય 4.4']),
    5: createChapterExercises(['સ્વાધ્યાય 5.1', 'સ્વાધ્યાય 5.2', 'સ્વાધ્યાય 5.3', 'સ્વાધ્યાય 5.4']),
    6: createChapterExercises(['સ્વાધ્યાય 6.1', 'સ્વાધ્યાય 6.2', 'સ્વાધ્યાય 6.3', 'સ્વાધ્યાય 6.4', 'સ્વાધ્યાય 6.5']),
    7: createChapterExercises(['સ્વાધ્યાય 7.1', 'સ્વાધ્યાય 7.2', 'સ્વાધ્યાય 7.3', 'સ્વાધ્યાય 7.4']),
    8: createChapterExercises(['સ્વાધ્યાય 8.1', 'સ્વાધ્યાય 8.2', 'સ્વાધ્યાય 8.3', 'સ્વાધ્યાય 8.4']),
    9: createChapterExercises(['સ્વાધ્યાય 9.1', 'સ્વાધ્યાય 9.2']),
    10: createChapterExercises(['સ્વાધ્યાય 10.1', 'સ્વાધ્યાય 10.2']),
    11: createChapterExercises(['સ્વાધ્યાય 11.1', 'સ્વાધ્યાય 11.2', 'સ્વાધ્યાય 11.3']),
    12: createChapterExercises(['સ્વાધ્યાય 12.1', 'સ્વાધ્યાય 12.2', 'સ્વાધ્યાય 12.3', 'સ્વાધ્યાય 12.4', 'સ્વાધ્યાય 12.5']),
    13: createChapterExercises(['સ્વાધ્યાય 13.1', 'સ્વાધ્યાય 13.2', 'સ્વાધ્યાય 13.3', 'સ્વાધ્યાય 13.4']),
    14: createChapterExercises(['સ્વાધ્યાય 14.1', 'સ્વાધ્યાય 14.2']),
  },
};


// --- Swaadhyay Page Component ---

interface WrittenSolutionProps {
  grade: number | null;
  chapter: Chapter | null;
}

const WrittenSolution: React.FC<WrittenSolutionProps> = ({ grade, chapter }) => {
    const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
    const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);

    const handleExerciseClick = (exerciseName: string) => {
      setExpandedExercise(current => (current === exerciseName ? null : exerciseName));
    };

    if (!grade || !chapter) {
      return (
        <PlaceholderPage 
          title="સ્વાધ્યાય" 
          content="Standard-wise exercise solutions will be available here soon. Please select a grade and chapter first." 
        />
      );
    }
    
    const chapterSwaadhyay = swaadhyayData[grade]?.[chapter.number];

    if (!chapterSwaadhyay || chapterSwaadhyay.length === 0) {
      return (
        <PlaceholderPage 
          title={`પ્રકરણ ${chapter.number} સ્વાધ્યાય`}
          content="Solutions for this chapter will be available here soon." 
        />
      );
    }

    return (
      <>
        <div className="space-y-4">
          {chapterSwaadhyay.map((exercise) => {
            const isExpanded = expandedExercise === exercise.name;
            return (
              <div
                key={exercise.name}
                className="group block bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => handleExerciseClick(exercise.name)}
                  className="w-full text-left p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 flex justify-between items-center"
                  aria-expanded={isExpanded}
                  aria-controls={`exercise-solutions-${exercise.name.replace(/\s/g, '-')}`}
                >
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate" title={exercise.name}>
                      {exercise.name}
                    </h3>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-6 h-6 text-slate-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    >
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </button>
                {isExpanded && (
                  <div 
                    id={`exercise-solutions-${exercise.name.replace(/\s/g, '-')}`}
                    className="p-4 border-t border-slate-200 dark:border-slate-700"
                  >
                    <div className="space-y-2 mt-2">
                      {exercise.solutions.map((solution, index) => (
                        <button 
                            key={index}
                            onClick={() => setViewingPdf({ url: solution.pdfUrl, title: `${exercise.name} - ${solution.name}` })}
                            className="w-full flex items-center justify-between text-left p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-3 text-slate-500 dark:text-slate-400" />
                            <p className="font-medium text-slate-700 dark:text-slate-200">{solution.name}</p>
                          </div>
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">View Solution</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {viewingPdf && (
            <PdfViewer
                pdfUrl={viewingPdf.url}
                title={viewingPdf.title}
                onClose={() => setViewingPdf(null)}
            />
        )}
      </>
    );
};

export default WrittenSolution;