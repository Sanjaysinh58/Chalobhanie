import React from 'react';

const PlaceholderPage: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="mt-4 text-slate-500 dark:text-slate-400">{content}</p>
    </div>
  );
};

const OldPapersPage: React.FC = () => (
  <PlaceholderPage 
    title="Old Papers" 
    content="Previous years' question papers will be available here soon." 
  />
);

export default OldPapersPage;
