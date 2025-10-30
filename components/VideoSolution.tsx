import React from 'react';

interface VideoSolutionProps {
  youtubeUrl?: string | null;
}

// Helper function to extract YouTube video ID from various URL formats
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};


const VideoSolution: React.FC<VideoSolutionProps> = ({ youtubeUrl }) => {
  if (!youtubeUrl) {
    return (
      <div className="aspect-video w-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
        <p className="text-slate-500 dark:text-slate-400">No video provided.</p>
      </div>
    );
  }
  
  const videoId = getYouTubeId(youtubeUrl);

  if (!videoId) {
    return (
       <div className="aspect-video w-full flex items-center justify-center bg-red-100 dark:bg-red-900/50">
        <p className="text-red-700 dark:text-red-300">Invalid YouTube URL.</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoSolution;