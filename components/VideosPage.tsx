import React, { useState } from 'react';
import { Chapter } from '../types.ts';
import VideoSolution from './VideoSolution.tsx';
import { videoData } from '../data/videoData.ts';

const PlaceholderPage: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="mt-4 text-slate-500 dark:text-slate-400">{content}</p>
    </div>
  );
};

// Helper function to extract YouTube video ID from various URL formats
export const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- Videos Page Component ---

interface VideosPageProps {
  grade: number | null;
  chapter: Chapter | null;
}

const VideosPage: React.FC<VideosPageProps> = ({ grade, chapter }) => {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

  const handleExerciseClick = (exerciseName: string) => {
    setExpandedExercise(current => (current === exerciseName ? null : exerciseName));
  };

  if (!grade || !chapter) {
    return (
      <PlaceholderPage 
        title="Videos" 
        content="Standard-wise YouTube video links will be available here soon. Please select a grade and chapter first to see the videos." 
      />
    );
  }

  const chapterExercises = videoData[grade]?.[chapter.number];

  if (!chapterExercises || chapterExercises.length === 0) {
    return (
      <PlaceholderPage 
        title={`પ્રકરણ ${chapter.number} Videos`}
        content="Videos for this chapter will be available here soon." 
      />
    );
  }

  return (
    <div className="space-y-4">
      {chapterExercises.map((exercise) => {
        const isExpanded = expandedExercise === exercise.name;

        return (
          <div
            key={exercise.name}
            className="group block bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <button
              onClick={() => handleExerciseClick(exercise.name)}
              className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              aria-expanded={isExpanded}
              aria-controls={`exercise-videos-${exercise.name.replace(/\s/g, '-')}`}
            >
              <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate" title={exercise.name}>
                {exercise.name}
              </h3>
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-6 h-6 text-slate-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                  aria-hidden="true"
              >
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
            <div
              id={`exercise-videos-${exercise.name.replace(/\s/g, '-')}`}
              className={`transition-all duration-500 ease-in-out overflow-y-hidden ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'}`}
            >
              <div className="px-4 pt-2 pb-4 border-t border-slate-200 dark:border-slate-700">
                <ul className="space-y-4">
                  {exercise.videos.map((video) => {
                    const videoId = getYouTubeId(video.youtubeUrl);
                    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
                    const isPlaying = playingVideoUrl === video.youtubeUrl;

                    return (
                      <li key={video.name}>
                        {isPlaying ? (
                          <div className="rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                             <div className="p-3">
                               <p className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{video.name}</p>
                             </div>
                            <VideoSolution youtubeUrl={video.youtubeUrl} />
                          </div>
                        ) : (
                          <button
                            onClick={() => setPlayingVideoUrl(video.youtubeUrl)}
                            className="group w-full text-left rounded-lg overflow-hidden bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 block focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-sm"
                            aria-label={`Play video for ${video.name}`}
                          >
                            <div className="p-3">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{video.name}</p>
                            </div>
                            <div className="relative w-full aspect-video bg-slate-300 dark:bg-slate-700">
                              {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt={video.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                      </svg>
                                  </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-white">
                                    <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.84Z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VideosPage;