import React from 'react';
import { EnvelopeIcon } from './icons';

const ContactPage: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex flex-col items-center text-center">
        <EnvelopeIcon className="h-20 w-20 text-indigo-500 mb-4" />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Contact Us</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">We'd love to hear from you!</p>
      </div>

      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300">
        <p className="text-center">
          Whether you have a question about the app, a suggestion for a new feature, or need support, please feel free to reach out to us.
        </p>
        
        <div className="p-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg space-y-4">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">General Inquiries & Support</h3>
            <p>For any questions or support requests, please email us at:</p>
            <a href="mailto:support@chalobhanie.com" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              support@chalobhanie.com
            </a>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Our Address</h3>
            <p>Chalo Bhaniye Education Pvt. Ltd.</p>
            <p>123 Learning Street, Education City,</p>
            <p>Gandhinagar, Gujarat - 382001</p>
          </div>
        </div>

        <p className="text-center pt-4">
          We aim to respond to all inquiries within 24-48 hours. Thank you for using <strong>Chalo ભણીએ !</strong>
        </p>
      </div>
    </div>
  );
};

export default ContactPage;