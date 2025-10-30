import React, { useState, useMemo } from 'react';
import { Chapter } from '../types.ts';
import { videoData, getYouTubeId } from './SolutionDisplay.tsx';
import { swaadhyayData } from './WrittenSolution.tsx';
import VideoSolution from './VideoSolution.tsx';
import PdfViewer from './PdfViewer.tsx';
import { DocumentTextIcon } from './icons.tsx';

interface Video { name: string; youtubeUrl: string; }
interface SolutionResource { name: string; pdfUrl: string; }
interface UnifiedExercise {
  name: string;
  videos: Video[];
  solutions: SolutionResource[];
}

interface ChapterDetailPageProps {
  grade: number;
  chapter: Chapter;
  expandedExercise?: string;
}

const ChapterDetailPage: React.FC<ChapterDetailPageProps> = ({ grade, chapter, expandedExercise: defaultExpandedExercise }) => {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(defaultExpandedExercise || null);
  const [selectedContent, setSelectedContent] = useState<{ [key: string]: 'videos' | 'solutions' | undefined }>({});
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);

  const unifiedExercises = useMemo((): UnifiedExercise[] => {
    const videoExercises = videoData[grade]?.[chapter.number] || [];
    const swaadhyayExercises = swaadhyayData[grade]?.[chapter.number] || [];

    const exerciseMap = new Map<string, Partial<UnifiedExercise>>();

    swaadhyayExercises.forEach(ex => {
        exerciseMap.set(ex.name, { name: ex.name, solutions: ex.solutions });
    });

    videoExercises.forEach(ex => {
        if (exerciseMap.has(ex.name)) {
            exerciseMap.get(ex.name)!.videos = ex.videos;
        } else {
            exerciseMap.set(ex.name, { name: ex.name, videos: ex.videos });
        }
    });
    
    return Array.from(exerciseMap.values()).map(ex => ({
        name: ex.name!,
        videos: ex.videos || [],
        solutions: (ex.solutions as any) || []
    })).sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true}));

  }, [grade, chapter]);

  const handleExerciseClick = (exerciseName: string) => {
    setExpandedExercise(current => (current === exerciseName ? null : exerciseName));
    setPlayingVideoUrl(null); // Close video when collapsing/expanding
  };

  const handleContentSelect = (exerciseName: string, contentType: 'videos' | 'solutions') => {
    setSelectedContent(prev => {
        if (prev[exerciseName] === contentType) {
            return { ...prev, [exerciseName]: undefined };
        }
        return { ...prev, [exerciseName]: contentType };
    });
    setPlayingVideoUrl(null); // Close video when switching content
  };
  
  if (unifiedExercises.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{chapter.name}</h2>
        <p className="mt-4 text-slate-500 dark:text-slate-400">Content for this chapter will be available here soon.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">{chapter.name}</h2>
        </div>
        {unifiedExercises.map((exercise) => {
          const isExpanded = expandedExercise === exercise.name;
          const currentContent = selectedContent[exercise.name];

          return (
            <div key={exercise.name} className="bg-white dark:bg-slate-800 shadow-lg overflow-hidden rounded-2xl">
              <button
                onClick={() => handleExerciseClick(exercise.name)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded={isExpanded}
              >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{exercise.name}</h3>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-6 h-6 text-slate-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true">
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>

              {isExpanded && (
                <div className="py-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                  <div className="px-4">
                    <div className="flex gap-4 mb-4">
                      <button onClick={() => handleContentSelect(exercise.name, 'videos')} className={`flex-1 p-3 rounded-lg font-bold transition-colors shadow-sm text-center ${currentContent === 'videos' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 hover:bg-rose-200 dark:hover:bg-rose-800/60'}`}>
                        Videos
                      </button>
                      <button onClick={() => handleContentSelect(exercise.name, 'solutions')} className={`flex-1 p-3 rounded-lg font-bold transition-colors shadow-sm text-center ${currentContent === 'solutions' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800/60'}`}>
                        Solution
                      </button>
                    </div>
                  </div>
                  
                  {currentContent === 'videos' && (
                    <div className="space-y-4 animate-fade-in">
                      {exercise.videos.length > 0 ? exercise.videos.map(video => {
                         const isPlaying = playingVideoUrl === video.youtubeUrl;
                         if (isPlaying) {
                             return <div key={video.name} className="bg-white dark:bg-slate-800"><div className="p-3"><p className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{video.name}</p></div><VideoSolution youtubeUrl={video.youtubeUrl} /></div>
                         }
                         const videoId = getYouTubeId(video.youtubeUrl);
                         const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
                         return <button key={video.name} onClick={() => setPlayingVideoUrl(video.youtubeUrl)} className="group w-full text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 block focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"><div className="p-3"><p className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{video.name}</p></div><div className="relative w-full aspect-video bg-slate-300 dark:bg-slate-700">{thumbnailUrl ? <img src={thumbnailUrl} alt={video.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg></div>}<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-white"><path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.84Z" /></svg></div></div></div></button>
                      }) : <p className="text-center text-slate-500 dark:text-slate-400 p-4">No videos available for this exercise.</p>}
                    </div>
                  )}

                  {currentContent === 'solutions' && (
                    <div className="space-y-4 animate-fade-in px-4">
                      {exercise.solutions.length > 0 ? exercise.solutions.map((solution, index) => (
                        <button 
                            key={index}
                            onClick={() => setViewingPdf({ url: solution.pdfUrl, title: `${exercise.name} - ${solution.name}` })}
                            className="w-full flex items-center justify-between text-left p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-3 text-slate-500 dark:text-slate-400" />
                            <p className="font-medium text-slate-700 dark:text-slate-200">{solution.name}</p>
                          </div>
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">View Solution</span>
                        </button>
                      )) : <p className="text-center text-slate-500 dark:text-slate-400 p-4">No solutions available for this exercise.</p>}
                    </div>
                  )}
                  
                </div>
              )}
            </div>
          )
        })}
      </div>

      {viewingPdf && (
          <PdfViewer
              pdfUrl={viewingPdf.url}
              title={viewingPdf.title}
              onClose={() => setViewingPdf(null)}
          />
      )}
    </>
  );
};

export default ChapterDetailPage;