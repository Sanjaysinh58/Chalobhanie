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
