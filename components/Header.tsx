import React from 'react';
import { ArrowLeftIcon, MenuIcon } from './icons.tsx';
import NotificationBell from './NotificationBell.tsx';
import { Notification } from '../types.ts';

interface HeaderProps {
  title: string;
  showBackButton: boolean;
  onBack: () => void;
  onMenuClick: () => void;
  notifications: Notification[];
  onMarkNotificationsRead: (ids: number[] | 'all') => void;
  onNotificationClick: (notification: Notification) => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton, onBack, onMenuClick, notifications, onMarkNotificationsRead, onNotificationClick }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-center h-16">
          <div className="absolute left-0">
            {showBackButton ? (
              <button 
                onClick={onBack} 
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </button>
            ) : (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Open menu"
              >
                <MenuIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </button>
            )}
          </div>
          <div className="flex items-center">
             <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {title}
             </h1>
          </div>
          <div className="absolute right-0">
            <NotificationBell 
              notifications={notifications} 
              onMarkAsRead={onMarkNotificationsRead} 
              onNotificationClick={onNotificationClick} 
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;