import React, { useState } from 'react';
import { SearchIcon, ChatBubbleIcon, PencilIcon } from './icons.tsx';
import ChatBox from './ChatBox.tsx';
import { ViewState } from '../App.tsx';

interface HomePageProps {
  onGradeSelect: (grade: number) => void;
  onExampleSearchSelect: () => void;
  onNavigate: (view: ViewState) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGradeSelect, onExampleSearchSelect, onNavigate }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const menuItems: { grade: number; gradeText: string; gradeNumber: string; }[] = [
    { grade: 9, gradeText: 'ધોરણ', gradeNumber: '9' },
    { grade: 10, gradeText: 'ધોરણ', gradeNumber: '10' },
  ];
  
  const actionButtonClass = "group w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900";


  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        {menuItems.map(item => (
          <button
            key={item.grade}
            onClick={() => onGradeSelect(item.grade)}
            className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
          >
            <div className="text-center font-bold text-slate-700 dark:text-slate-200">
              <span className="block text-xl -mb-1">{item.gradeText}</span>
              <span className="block text-7xl font-extrabold leading-tight">{item.gradeNumber}</span>
            </div>
          </button>
        ))}
        <div className="sm:col-span-2 grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
           <button
            onClick={onExampleSearchSelect}
            className={actionButtonClass}
          >
            <SearchIcon className="h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3 text-indigo-500 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-center text-lg sm:text-2xl font-bold text-slate-700 dark:text-slate-200">
              દાખલો શોધો
            </span>
          </button>
          <button
            onClick={() => onNavigate({ page: 'google_form' })}
            className={actionButtonClass}
          >
            <PencilIcon className="h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3 text-indigo-500 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-center text-lg sm:text-2xl font-bold text-slate-700 dark:text-slate-200">
              Comment લખો
            </span>
          </button>
        </div>
      </div>

      {/* Chat with us Floating Action Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        aria-label="Chat with us"
        className="fixed bottom-24 right-6 bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-110"
      >
        <ChatBubbleIcon className="w-8 h-8" />
      </button>

      {/* Render ChatBox modal */}
      <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onNavigate={onNavigate} />
    </>
  );
};

export default HomePage;