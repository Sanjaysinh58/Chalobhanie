// FIX: Implemented the main App component to manage application state and view routing, resolving numerous 'file not a module' and 'cannot find name' errors across the project.
import React, { useState, useCallback, useMemo, useEffect } from 'react';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNavBar from './components/BottomNavBar';
import HomePage from './components/MathInput';
import GradePage from './components/GradePage';
import SubjectPage from './components/SubjectPage';
import BooksPage from './components/BooksPage';
import OldPapersPage from './components/OldPapersPage';
import MockTestPage from './components/LoadingSpinner';
import ChapterDetailPage from './components/ChapterDetailPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import ExampleSearchPage from './components/ChapterPage';
import GoogleFormPage from './components/GoogleFormPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import DisclaimerPage from './components/DisclaimerPage';


// Type definitions
export type TopLevelPage = 'home' | 'videos' | 'swaadhyay' | 'news';
export type ResourcePage = 'books' | 'swaadhyay' | 'videos' | 'old_papers' | 'mock_tests';
export type SidebarPage = 'home' | 'about' | 'contact' | 'privacy' | 'disclaimer';

export interface User {
  name: string;
  email: string;
  mobile: string;
  profilePicture?: string;
}

export interface Chapter {
  number: number;
  name:string;
}

export type ViewState =
  | { page: 'home' }
  | { page: 'grade'; grade: number }
  | { page: 'subject'; grade: number }
  | { page: 'resource'; grade: number; resource: ResourcePage }
  | { page: 'chapter'; grade: number; chapter: Chapter; expandedExercise?: string }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'privacy' }
  | { page: 'disclaimer' }
  | { page: 'example_search' }
  | { page: 'google_form' };
  
export interface Notification {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: ViewState;
}

const App: React.FC = () => {
    // State management
    const [history, setHistory] = useState<ViewState[]>([{ page: 'home' }]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, title: 'New Mock Test!', description: 'A new mock test for "સંખ્યા પદ્ધતિ" is now available.', timestamp: '5m ago', read: false, link: { page: 'resource', grade: 9, resource: 'mock_tests' } },
        { id: 2, title: 'Video Solution added', description: 'Check out the new video solution for સ્વાધ્યાય 1.3.', timestamp: '1h ago', read: false, link: { page: 'chapter', grade: 9, chapter: { number: 1, name: 'સંખ્યા પદ્ધતિ' } } },
        { id: 3, title: 'Welcome!', description: 'Welcome to Chalo ભણીએ! Explore and learn.', timestamp: '1d ago', read: true },
    ]);


    // Effect for persisting login
    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            try {
                setUser(JSON.parse(loggedInUser));
            } catch (e) {
                console.error("Failed to parse logged in user from localStorage", e);
                localStorage.removeItem('loggedInUser');
            }
        }
    }, []);

    const currentView = history[history.length - 1];
    
    // Navigation handlers
    const navigate = useCallback((view: ViewState) => {
        setHistory(prev => [...prev, view]);
    }, []);

    const goBack = useCallback(() => {
        if (history.length > 1) {
            setHistory(prev => prev.slice(0, -1));
        }
    }, [history.length]);

    const resetToHome = useCallback(() => {
        setHistory([{ page: 'home' }]);
    }, []);

    const handleShare = useCallback(() => {
        let shareData = {
            title: 'Chalo ભણીએ !',
            text: 'Hey! I found this amazing educational app for Gujarat board students called "Chalo ભણીએ !". It has videos, solutions, books, and more. Check it out!',
            url: window.location.href,
        };

        if (currentView) {
            switch (currentView.page) {
                case 'grade':
                    shareData.title = `ધોરણ ${currentView.grade} Resources | Chalo ભણીએ !`;
                    shareData.text = `Check out the study materials for ધોરણ ${currentView.grade} on Chalo ભણીએ!`;
                    break;
                case 'subject':
                    shareData.title = `ધોરણ ${currentView.grade} ગણિત | Chalo ભણીએ !`;
                    shareData.text = `Check out the math resources for ધોરણ ${currentView.grade} on Chalo ભણીએ!`;
                    break;
                case 'chapter':
                    shareData.title = `પ્રકરણ ${currentView.chapter.number}: ${currentView.chapter.name} | Chalo ભણીએ !`;
                    shareData.text = `Check out the study materials for '${currentView.chapter.name}' on Chalo ભણીએ!`;
                    break;
                case 'resource':
                     const resourceTitle = currentView.resource.charAt(0).toUpperCase() + currentView.resource.slice(1).replace('_', ' ');
                     shareData.title = `${resourceTitle} for ધોરણ ${currentView.grade} | Chalo ભણીએ !`;
                     shareData.text = `Find ${resourceTitle.toLowerCase()} for ધોરણ ${currentView.grade} on the Chalo ભણીએ! app.`;
                    break;
            }
        }

        if (navigator.share) {
            navigator.share(shareData)
                .catch((error) => console.error('Error sharing:', error));
        } else {
            // Fallback for browsers that do not support the Web Share API
            navigator.clipboard.writeText(shareData.url).then(() => {
                alert('Link copied to clipboard! You can now share it.');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Share feature is not supported on this device or browser.');
            });
        }
    }, [currentView]);


    // Event Handlers
    const handleGradeSelect = (grade: number) => navigate({ page: 'grade', grade });
    const handleExampleSearchSelect = () => navigate({ page: 'example_search' });
    
    const handleTextbookSelect = () => {
        if (currentView.page === 'grade') {
            navigate({ page: 'resource', grade: currentView.grade, resource: 'books' });
        }
    };

    const handleSolutionsSelect = () => {
        if (currentView.page === 'grade') {
            navigate({ page: 'subject', grade: currentView.grade });
        }
    };
    
    const handleChapterSelect = (chapter: Chapter) => {
        if (currentView.page === 'subject') {
            navigate({ page: 'chapter', grade: currentView.grade, chapter });
        }
    };

    const handleBottomNav = (navItem: TopLevelPage | 'refresh' | 'share') => {
        switch(navItem) {
            case 'home':
                resetToHome();
                break;
            case 'refresh':
                window.location.reload();
                break;
            case 'share':
                handleShare();
                break;
            // Assuming grade 9 is default for direct navigation
            case 'videos':
                navigate({ page: 'chapter', grade: 9, chapter: { number: 1, name: 'સંખ્યા પદ્ધતિ' } });
                break;
            case 'swaadhyay':
                navigate({ page: 'chapter', grade: 9, chapter: { number: 1, name: 'સંખ્યા પદ્ધતિ' } });
                break;
        }
    };

    const handleSidebarNav = (page: SidebarPage) => {
        if (page === 'home') {
            resetToHome();
        } else {
            navigate({ page });
        }
        setSidebarOpen(false);
    };
    
    const handleLogin = (userToLogin: User) => {
      setUser(userToLogin);
      localStorage.setItem('loggedInUser', JSON.stringify(userToLogin));
    };
    
    const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('loggedInUser');
    };

    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = users.findIndex((u: any) =>
            (updatedUser.email && u.email === updatedUser.email) ||
            (updatedUser.mobile && u.mobile === updatedUser.mobile)
        );

        if (userIndex > -1) {
            const oldUser = users[userIndex];
            // Merge new details (like profile picture) with old record
            users[userIndex] = { ...oldUser, ...updatedUser };
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
    };
    
    const handleMarkNotificationsRead = useCallback((ids: number[] | 'all') => {
        setNotifications(prev =>
            prev.map(n =>
                (ids === 'all' || ids.includes(n.id)) ? { ...n, read: true } : n
            )
        );
    }, []);

    const handleNotificationClick = useCallback((notification: Notification) => {
      handleMarkNotificationsRead([notification.id]);
      if (notification.link) {
          navigate(notification.link);
      }
    }, [handleMarkNotificationsRead, navigate]);

    // Title and content rendering logic
    const { title, showBackButton } = useMemo(() => {
        switch(currentView.page) {
            case 'home': return { title: 'Chalo ભણીએ !', showBackButton: false };
            case 'grade': return { title: `ધોરણ ${currentView.grade}`, showBackButton: true };
            case 'subject': return { title: `ધોરણ ${currentView.grade} ગણિત`, showBackButton: true };
            case 'resource':
                const resourceTitle = currentView.resource.charAt(0).toUpperCase() + currentView.resource.slice(1);
                return { title: `${resourceTitle}`, showBackButton: true };
            case 'chapter':
                return { title: `પ્રકરણ ${currentView.chapter.number}`, showBackButton: true };
            case 'about': return { title: 'About Us', showBackButton: true };
            case 'contact': return { title: 'Contact Us', showBackButton: true };
            case 'privacy': return { title: 'Privacy Policy', showBackButton: true };
            case 'disclaimer': return { title: 'Disclaimer', showBackButton: true };
            case 'example_search': return { title: 'દાખલો શોધો', showBackButton: true };
            case 'google_form': return { title: 'Comment લખો', showBackButton: true };
            default: return { title: 'Chalo ભણીએ !', showBackButton: false };
        }
    }, [currentView]);

    const renderContent = () => {
        switch(currentView.page) {
            case 'home':
                return <HomePage onGradeSelect={handleGradeSelect} onExampleSearchSelect={handleExampleSearchSelect} onNavigate={navigate} />;
            case 'grade':
                return <GradePage grade={currentView.grade} onTextbookSelect={handleTextbookSelect} onSolutionsSelect={handleSolutionsSelect} />;
            case 'subject':
                return <SubjectPage grade={currentView.grade} onChapterSelect={handleChapterSelect} />;
            case 'resource':
                switch(currentView.resource) {
                    case 'books':
                        return <BooksPage />;
                    case 'old_papers':
                        return <OldPapersPage />;
                    case 'mock_tests':
                         return <MockTestPage />;
                    default:
                        return <HomePage onGradeSelect={handleGradeSelect} onExampleSearchSelect={handleExampleSearchSelect} onNavigate={navigate} />;
                }
            case 'chapter':
                return <ChapterDetailPage grade={currentView.grade} chapter={currentView.chapter} expandedExercise={currentView.expandedExercise} />;
            case 'about':
                return <AboutPage />;
            case 'contact':
                return <ContactPage />;
            case 'privacy':
                return <PrivacyPolicyPage />;
            case 'disclaimer':
                return <DisclaimerPage />;
            case 'example_search':
                return <ExampleSearchPage navigate={navigate} />;
            case 'google_form':
                return <GoogleFormPage />;
            default:
                return <HomePage onGradeSelect={handleGradeSelect} onExampleSearchSelect={handleExampleSearchSelect} onNavigate={navigate} />;
        }
    };
    
    const isFullWidthResourcePage = currentView.page === 'chapter' || currentView.page === 'google_form';

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen font-sans text-slate-900 dark:text-slate-200">
            <Header
                title={title}
                showBackButton={showBackButton}
                onBack={goBack}
                onMenuClick={() => setSidebarOpen(true)}
                notifications={notifications}
                onMarkNotificationsRead={handleMarkNotificationsRead}
                onNotificationClick={handleNotificationClick}
            />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onUserUpdate={handleUserUpdate}
                onSidebarNav={handleSidebarNav}
            />
            <main className={`pb-24 ${isFullWidthResourcePage ? 'pt-4' : 'container mx-auto p-4'}`}>
                {renderContent()}
            </main>
            <BottomNavBar onNav={handleBottomNav} />
        </div>
    );
};

export default App;
