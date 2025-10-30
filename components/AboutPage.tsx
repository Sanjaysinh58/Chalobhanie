import React from 'react';
import { SchoolIcon } from './icons';

const AboutPage: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex flex-col items-center text-center">
        <SchoolIcon className="h-20 w-20 text-indigo-500 mb-4" />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">About Chalo ભણીએ !</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Your companion for Gujarat Board education.</p>
      </div>

      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300 text-justify">
        <p>
          <strong>Chalo ભણીએ !</strong> is a dedicated educational platform designed to empower students of the Gujarat Secondary and Higher Secondary Education Board (GSEB). Our mission is to make quality education accessible, engaging, and convenient for every student, right at their fingertips.
        </p>
        <p>
          We understand the challenges students face, from finding reliable study materials to getting clear explanations of complex topics. That's why we've brought together a comprehensive collection of resources, all tailored to the GSEB curriculum.
        </p>

        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 text-center">Our Features</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>Video Solutions:</strong> Detailed chapter-wise and exercise-wise video tutorials to help you visualize and understand concepts better.</li>
            <li><strong>Digital Textbooks:</strong> Access all your GSEB textbooks in PDF format, anytime, anywhere.</li>
            <li><strong>Written Solutions (સ્વાધ્યાય):</strong> Step-by-step solutions for all textbook exercises to help you practice and verify your answers.</li>
            <li><strong>Old Question Papers:</strong> Practice with previous years' question papers to understand the exam pattern and improve your time management.</li>
            <li><strong>Mock Tests:</strong> Test your knowledge and prepare for exams with our curated mock tests.</li>
          </ul>
        </div>
        
        <p className="text-center font-medium text-indigo-600 dark:text-indigo-400 pt-4">
          Happy Learning!
        </p>
      </div>
    </div>
  );
};

export default AboutPage;