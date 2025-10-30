import React from 'react';
import { ShieldCheckIcon } from './icons.tsx';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex flex-col items-center text-center">
        <ShieldCheckIcon className="h-20 w-20 text-indigo-500 mb-4" />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Privacy Policy</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Your privacy is important to us.</p>
      </div>
      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300 text-justify">
        <p>
          This Privacy Policy explains how Chalo ભણીએ ! ("we," "us," or "our") collects, uses, and discloses information about you when you use our mobile application and related services (collectively, the "Services").
        </p>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 text-left">Information We Collect</h2>
        <p>
          We may collect personal information that you provide to us, such as your name, email address, and mobile number when you register for an account. We also collect information about your usage of the app, such as the content you view and your progress.
        </p>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 text-left">How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our Services, including to personalize your learning experience, communicate with you, and for analytics purposes.
        </p>
        <p className="text-center font-medium pt-4">
          This policy is effective as of {new Date().toLocaleDateString()}.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;