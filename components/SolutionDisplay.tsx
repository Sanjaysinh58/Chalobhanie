import React, { useState } from 'react';
import { Chapter } from '../types.ts';
import VideoSolution from './VideoSolution.tsx';

const PlaceholderPage: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="mt-4 text-slate-500 dark:text-slate-400">{content}</p>
    </div>
  );
};

// --- Video Data ---

interface Video {
  name: string;
  youtubeUrl: string;
}

interface Exercise {
  name: string;
  videos: Video[];
}

const std9Chapter1Exercises: Exercise[] = [
  { 
    name: 'સ્વાધ્યાય 1.1', 
    videos: [
        { name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/yuzpwMpdlFo?si=6c0qk_92mmzilbT1' },
    ]
  },
  { 
    name: 'સ્વાધ્યાય 1.2', 
    videos: [
        { name: 'પ્રશ્ન 1-4 (संपूर्ण स्वाध्याय)', youtubeUrl: 'https://www.youtube.com/watch?v=videoseries' },
    ]
  },
  { 
    name: 'સ્વાધ્યાય 1.3', 
    videos: [
        { name: 'પ્રશ્ન 1-9 (संपूर्ण स्वाध्याय)', youtubeUrl: 'https://www.youtube.com/watch?v=s7_a-iL3_eE' },
    ]
  },
  { 
    name: 'સ્વાધ્યાય 1.4', 
    videos: [
        { name: 'પ્રશ્ન 1-2 (संपूर्ण स्वाध्याय)', youtubeUrl: 'https://www.youtube.com/watch?v=videoseries' },
    ]
  },
  { 
    name: 'સ્વાધ્યાય 1.5', 
    videos: [
        { name: 'પ્રશ્ન 1-5 (संपूर्ण स्वाध्याय)', youtubeUrl: 'https://www.youtube.com/watch?v=rEx_y8iBStQ' },
    ]
  },
];

const std9Chapter2Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 2.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=3S-a_gJA8-c' }] },
    { name: 'સ્વાધ્યાય 2.2', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=s7_a-iL3_eE' }] },
];
const std9Chapter3Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 3.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=rEx_y8iBStQ' }] },
    { name: 'સ્વાધ્યાય 3.2', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=videoseries' }] },
];
const std9Chapter4Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 4.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=3S-a_gJA8-c' }] },
    { name: 'સ્વાધ્યાય 4.2', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=s7_a-iL3_eE' }] },
];
const std9Chapter5Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 5.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=rEx_y8iBStQ' }] },
];
const std9Chapter6Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 6.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=videoseries' }] },
    { name: 'સ્વાધ્યાય 6.2', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=3S-a_gJA8-c' }] },
];
const std9Chapter7Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 7.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=s7_a-iL3_eE' }] },
    { name: 'સ્વાધ્યાય 7.2', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=rEx_y8iBStQ' }] },
];
const std9Chapter8Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 8.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=videoseries' }] },
];
const std9Chapter9Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 9.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=3S-a_gJA8-c' }] },
    { name: 'સ્વાધ્યાય 9.2', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=s7_a-iL3_eE' }] },
];
const std9Chapter10Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 10.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=rEx_y8iBStQ' }] },
];
const std9Chapter11Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 11.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=videoseries' }] },
];
const std9Chapter12Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 12.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=3S-a_gJA8-c' }] },
];

const createVideoExercises = (exerciseNames: string[]): Exercise[] => {
  return exerciseNames.map(name => ({
    name,
    videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://www.youtube.com/watch?v=videoseries' }]
  }));
};

export const videoData: { [grade: number]: { [chapter: number]: Exercise[] } } = {
  9: { // Grade 9
    1: std9Chapter1Exercises,
    2: std9Chapter2Exercises,
    3: std9Chapter3Exercises,
    4: std9Chapter4Exercises,
    5: std9Chapter5Exercises,
    6: std9Chapter6Exercises,
    7: std9Chapter7Exercises,
    8: std9Chapter8Exercises,
    9: std9Chapter9Exercises,
    10: std9Chapter10Exercises,
    11: std9Chapter11Exercises,
    12: std9Chapter12Exercises,
  },
  10: { // Grade 10
    1: createVideoExercises(['સ્વાધ્યાય 1.1', 'સ્વાધ્યાય 1.2', 'સ્વાધ્યાય 1.3', 'સ્વાધ્યાય 1.4']),
    2: createVideoExercises(['સ્વાધ્યાય 2.1', 'સ્વાધ્યાય 2.2', 'સ્વાધ્યાય 2.3']),
    3: createVideoExercises(['સ્વાધ્યાય 3.1', 'સ્વાધ્યાય 3.2', 'સ્વાધ્યાય 3.3', 'સ્વાધ્યાય 3.4', 'સ્વાધ્યાય 3.5', 'સ્વાધ્યાય 3.6']),
    4: createVideoExercises(['સ્વાધ્યાય 4.1', 'સ્વાધ્યાય 4.2', 'સ્વાધ્યાય 4.3', 'સ્વાધ્યાય 4.4']),
    5: createVideoExercises(['સ્વાધ્યાય 5.1', 'સ્વાધ્યાય 5.2', 'સ્વાધ્યાય 5.3', 'સ્વાધ્યાય 5.4']),
    6: createVideoExercises(['સ્વાધ્યાય 6.1', 'સ્વાધ્યાય 6.2', 'સ્વાધ્યાય 6.3', 'સ્વાધ્યાય 6.4', 'સ્વાધ્યાય 6.5']),
    7: createVideoExercises(['સ્વાધ્યાય 7.1', 'સ્વાધ્યાય 7.2', 'સ્વાધ્યાય 7.3', 'સ્વાધ્યાય 7.4']),
    8: createVideoExercises(['સ્વાધ્યાય 8.1', 'સ્વાધ્યાય 8.2', 'સ્વાધ્યાય 8.3', 'સ્વાધ્યાય 8.4']),
    9: createVideoExercises(['સ્વાધ્યાય 9.1', 'સ્વાધ્યાય 9.2']),
    10: createVideoExercises(['સ્વાધ્યાય 10.1', 'સ્વાધ્યાય 10.2']),
    11: createVideoExercises(['સ્વાધ્યાય 11.1', 'સ્વાધ્યાય 11.2', 'સ્વાધ્યાય 11.3']),
    12: createVideoExercises(['સ્વાધ્યાય 12.1', 'સ્વાધ્યાય 12.2', 'સ્વાધ્યાય 12.3', 'સ્વાધ્યાય 12.4', 'સ્વાધ્યાય 12.5']),
    13: createVideoExercises(['સ્વાધ્યાય 13.1', 'સ્વાધ્યાય 13.2', 'સ્વાધ્યાય 13.3', 'સ્વાધ્યાય 13.4']),
    14: createVideoExercises(['સ્વાધ્યાય 14.1', 'સ્વાધ્યાય 14.2']),
  },
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