import React from 'https://aistudiocdn.com/react@^19.2.0';

const PlaceholderPage: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="mt-4 text-slate-500 dark:text-slate-400">{content}</p>
    </div>
  );
};

const BooksPage: React.FC = () => (
  <PlaceholderPage 
    title="Books" 
    content="PDF files of all standard Gujarat board books will be available for download here." 
  />
);

export default BooksPage;