import React from 'react';
import { TopLevelPage } from '../App';
import { HomeIcon, ArrowPathIcon, ShareIcon } from './icons';

interface BottomNavBarProps {
  onNav: (page: TopLevelPage | 'refresh' | 'share') => void;
}

const NavButton: React.FC<{
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
}> = ({ label, Icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center space-y-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors pt-2 pb-1"
    aria-label={label}
  >
    <Icon className="h-6 w-6" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNav }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 z-20">
      <div className="container mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          <NavButton label="Home" Icon={HomeIcon} onClick={() => onNav('home')} />
          <NavButton label="Refresh" Icon={ArrowPathIcon} onClick={() => onNav('refresh')} />
          <NavButton label="Share" Icon={ShareIcon} onClick={() => onNav('share')} />
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;