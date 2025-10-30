import React, { useState, useEffect, useRef } from 'react';
import { Notification } from '../App';
import { BellIcon } from './icons';

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead: (ids: number[] | 'all') => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAsRead, onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(prev => !prev);

  const handleMarkAllRead = () => {
    onMarkAsRead('all');
  };

  const handleItemClick = (notification: Notification) => {
    onNotificationClick(notification);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-label={`View notifications. ${unreadCount} unread.`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <BellIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800/80"></span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20 origin-top-right animate-fade-in-down"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <ul>
                {notifications.map(notification => (
                  <li
                    key={notification.id}
                    className={`border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 ${!notification.read ? 'bg-indigo-50/50 dark:bg-slate-800' : ''}`}
                  >
                    <button
                      onClick={() => handleItemClick(notification)}
                      className="w-full text-left p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        {!notification.read && (
                           <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500"></div>
                        )}
                        <div className={`flex-1 ${notification.read ? 'pl-5' : ''}`}>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{notification.title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{notification.description}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{notification.timestamp}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <p>You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;