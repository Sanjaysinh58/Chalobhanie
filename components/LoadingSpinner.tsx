import React from 'https://aistudiocdn.com/react@^19.2.0';

const PlaceholderPage: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="mt-4 text-slate-500 dark:text-slate-400">{content}</p>
    </div>
  );
};

const MockTestPage: React.FC = () => (
  <PlaceholderPage 
    title="Mock Tests" 
    content="Chapter-wise, subject-wise, and standard-wise tests will be available here soon." 
  />
);

export default MockTestPage;