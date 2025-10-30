import React, { useState, useRef } from 'react';
import { User, SidebarPage } from '../App.tsx';
import { CloseIcon, UserCircleIcon, LoginIcon, LogoutIcon, PencilIcon, HomeIcon, InformationCircleIcon, EnvelopeIcon, ShieldCheckIcon, ExclamationTriangleIcon, WhatsappIcon, FacebookIcon, XIcon, InstagramIcon, TelegramIcon } from './icons.tsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
  onSidebarNav: (page: SidebarPage) => void;
}

const SidebarButton: React.FC<{
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
}> = ({ Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center p-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
  >
    <Icon className="h-6 w-6 mr-3 text-slate-500" />
    <span className="font-semibold">{label}</span>
  </button>
);


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user, onLogin, onLogout, onUserUpdate, onSidebarNav }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State to manage the sign-in form visibility
  const [showSignInForm, setShowSignInForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);

  const socialLinks = [
    { Icon: WhatsappIcon, label: 'WhatsApp', href: '#', color: 'text-[#25D366]' },
    { Icon: FacebookIcon, label: 'Facebook', href: '#', color: 'text-[#1877F2]' },
    { Icon: XIcon, label: 'X', href: '#', color: 'text-slate-800 dark:text-white' },
    { Icon: InstagramIcon, label: 'Instagram', href: '#', color: 'text-[#E4405F]' },
    { Icon: TelegramIcon, label: 'Telegram', href: '#', color: 'text-[#26A5E4]' },
  ];

  const resetForms = () => {
      setName('');
      setContactInfo('');
  };

  const handleClose = () => {
      onClose();
      // Reset forms and view when sidebar is closed, after transition
      setTimeout(() => {
          resetForms();
          setShowSignInForm(false);
          setIsAboutDropdownOpen(false);
      }, 300);
  };
  
  const handleSignIn = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !contactInfo) {
          alert('Please fill all fields.');
          return;
      }
      
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const isEmail = contactInfo.includes('@');
      
      const existingUser = users.find((u: any) =>
        (isEmail && u.email === contactInfo) ||
        (!isEmail && u.mobile === contactInfo)
      );
      
      const userToLogin: User = { 
        name, 
        email: isEmail ? contactInfo : '', 
        mobile: !isEmail ? contactInfo : '',
        profilePicture: existingUser?.profilePicture // Preserve photo if user already exists
      };

      if (existingUser) {
          // Update existing user's details if name changed
          const userIndex = users.findIndex((u: any) =>
            (isEmail && u.email === contactInfo) ||
            (!isEmail && u.mobile === contactInfo)
          );
          users[userIndex] = { ...existingUser, name };
      } else {
          // Add new user to our "database"
          users.push({ name, email: userToLogin.email, mobile: userToLogin.mobile });
      }
      localStorage.setItem('registeredUsers', JSON.stringify(users));

      onLogin(userToLogin);
      handleClose();
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedUser = { ...user, profilePicture: base64String };
        onUserUpdate(updatedUser);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const renderLoggedInView = () => (
     <div className="space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                className="hidden"
                accept="image/*"
            />
            {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-indigo-200 dark:border-indigo-700" />
            ) : (
                <UserCircleIcon className="h-24 w-24 text-slate-500 dark:text-slate-400" />
            )}
            <button 
                onClick={triggerFileUpload}
                className="absolute -bottom-1 -right-1 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full border-2 border-white dark:border-slate-800 transition-transform hover:scale-110"
                aria-label="Change profile picture"
            >
                <PencilIcon className="h-4 w-4"/>
            </button>
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Welcome,</p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{user?.name}</p>
          </div>
        </div>
         <button
          onClick={onLogout}
          className="w-full flex items-center justify-center p-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
        >
          <LogoutIcon className="h-5 w-5 mr-2" />
          Logout
        </button>
      </div>
  );
  
  const renderLoggedOutView = () => {
    if (showSignInForm) {
      // Show the actual form
      return (
        <form onSubmit={handleSignIn} className="space-y-3">
            <div>
                <label htmlFor="signin-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                    type="text"
                    id="signin-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <div>
                <label htmlFor="signin-contact" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email or Phone Number</label>
                <input
                    type="text"
                    id="signin-contact"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full flex items-center justify-center p-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
            >
                <LoginIcon className="h-5 w-5 mr-2" />
                Sign In
            </button>
        </form>
      );
    }
    
    // Show the initial "Sign In" prompt
    return (
      <div className="flex flex-col items-center text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chalo ભણીએ !</h3>
        <p className="text-slate-500 dark:text-slate-400">Sign in to sync your progress and get a personalized experience.</p>
        <button
          onClick={() => setShowSignInForm(true)}
          className="w-full flex items-center justify-center p-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
        >
          <LoginIcon className="h-5 w-5 mr-2" />
          Sign In
        </button>
      </div>
    );
  };


  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-20 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-slate-800 shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 id="sidebar-title" className="text-xl font-bold text-slate-800 dark:text-slate-100 flex-grow">
              {user ? 'My Profile' : (showSignInForm ? 'Sign In' : 'Chalo ભણીએ !')}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close menu"
            >
              <CloseIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-grow p-4 overflow-y-auto">
            {user ? renderLoggedInView() : renderLoggedOutView()}
            <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>
              <nav className="space-y-2">
                 <SidebarButton Icon={HomeIcon} label="Home" onClick={() => onSidebarNav('home')} />
                 <div>
                    <button
                        onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                        className="w-full flex items-center justify-between p-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-expanded={isAboutDropdownOpen}
                        aria-controls="about-submenu"
                    >
                        <div className="flex items-center">
                            <InformationCircleIcon className="h-6 w-6 mr-3 text-slate-500" />
                            <span className="font-semibold">About</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isAboutDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true">
                            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {isAboutDropdownOpen && (
                        <div id="about-submenu" className="pl-6 pt-2 space-y-1 animate-fade-in-down">
                            <SidebarButton Icon={InformationCircleIcon} label="About Us" onClick={() => onSidebarNav('about')} />
                            <SidebarButton Icon={EnvelopeIcon} label="Contact Us" onClick={() => onSidebarNav('contact')} />
                            <SidebarButton Icon={ShieldCheckIcon} label="Privacy Policy" onClick={() => onSidebarNav('privacy')} />
                            <SidebarButton Icon={ExclamationTriangleIcon} label="Disclaimer" onClick={() => onSidebarNav('disclaimer')} />
                        </div>
                    )}
                 </div>
              </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="mb-4 text-center">
              <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Follow Us</h4>
              <div className="flex justify-center space-x-4">
                {socialLinks.map(({ Icon, label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${label}`}
                    className={`${color} transition-opacity hover:opacity-80`}
                  >
                    <Icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Chalo ભણીએ ! &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;