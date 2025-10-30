import React from 'react';
import { ExclamationTriangleIcon } from './icons.js';

const DisclaimerPage: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex flex-col items-center text-center">
        <ExclamationTriangleIcon className="h-20 w-20 text-indigo-500 mb-4" />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Disclaimer</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Information provided on this app.</p>
      </div>

      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300 text-justify">
        <p>
          The information provided by Chalo ભણીએ ! on our mobile application is for general informational purposes only. All information on the app is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the app.
        </p>
        <p>
          The educational content, including video solutions and written materials, is intended to supplement, not replace, official curriculum and classroom instruction. While we strive to ensure accuracy, errors may occur. We are not liable for any academic outcomes resulting from the use of our app.
        </p>
        <p>
          External links to other websites or content belonging to or originating from third parties are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
        </p>
      </div>
    </div>
  );
};

export default DisclaimerPage;