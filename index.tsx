import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat, Type } from '@google/genai';

// Fix: Moved `declare` to top-level scope to resolve "Modifiers cannot appear here" error.
declare const pdfjsLib: any;

// --- CONSOLIDATED CODE FROM ALL MODULES ---

// From: types.ts
type TopLevelPage = 'home' | 'videos' | 'swaadhyay';
type ResourcePage = 'books' | 'swaadhyay' | 'videos' | 'old_papers' | 'mock_tests';
type SidebarPage = 'home' | 'about' | 'contact' | 'privacy' | 'disclaimer';

interface User {
  name: string;
  email: string;
  mobile: string;
  profilePicture?: string;
}

interface Chapter {
  number: number;
  name:string;
}

interface MockTestQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

type ViewState =
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
  | { page: 'google_form' }
  | { page: 'ai_mock_test' }
  | { page: 'generated_mock_test'; grade: number; chapterName: string; questions: MockTestQuestion[] };
  
interface Notification {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: ViewState;
}

// From: data/chapters.ts
const std9MathChapters: Chapter[] = [
  { number: 1, name: 'સંખ્યા પદ્ધતિ' }, { number: 2, name: 'બહુપદીઓ' }, { number: 3, name: 'યામ ભૂમિતિ' }, { number: 4, name: 'દ્વિચલ સુરેખ સમીકરણો' }, { number: 5, name: 'યુક્લિડની ભૂમિતિનો પરિચય' }, { number: 6, name: 'રેખાઓ અને ખૂણાઓ' }, { number: 7, name: 'ત્રિકોણ' }, { number: 8, name: 'ચતુષ્કોણ' }, { number: 9, name: 'વર્તુળ' }, { number: 10, name: 'હેરોનનું સૂત્ર' }, { number: 11, name: 'પૃષ્ઠફળ અને ઘનફળ' }, { number: 12, name: 'આંકડાશાસ્ત્ર' },
];
const std10MathChapters: Chapter[] = [
  { number: 1, name: 'વાસ્તવિક સંખ્યાઓ' }, { number: 2, name: 'બહુપદીઓ' }, { number: 3, name: 'દ્વિચલ સુરેખ સમીકરણયુગ્મ' }, { number: 4, name: 'દ્વિઘાત સમીકરણ' }, { number: 5, name: 'સમાંતર શ્રેણી' }, { number: 6, name: 'ત્રિકોણ' }, { number: 7, name: 'યામ ભૂમિતિ' }, { number: 8, name: 'ત્રિકોણમિતિનો પરિચય' }, { number: 9, name: 'ત્રિકોણમિતિના ઉપયોગો' }, { number: 10, name: 'વર્તુળ' }, { number: 11, name: 'વર્તુળ સંબંધિત ક્ષેત્રફળ' }, { number: 12, name: 'પૃષ્ઠફળ અને ઘનફળ' }, { number: 13, name: 'આંકડાશાસ્ત્ર' }, { number: 14, name: 'સંભાવના' },
];

// From: data/swaadhyayData.ts
interface SolutionResource { name: string; url: string; }
interface SwaadhyayExercise { name: string; solutions: SolutionResource[]; }
const createSwaadhyayChapterExercises = (exerciseNames: string[], grade: number, chapterNum: number): SwaadhyayExercise[] => {
  return exerciseNames.map(name => {
    const exerciseId = name.replace('સ્વાધ્યાય ', '').replace('.', '-');
    return {
      name,
      solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: `https://gseb-solutions-guide.com/std-${grade}-maths-chapter-${chapterNum}-exercise-${exerciseId}-solutions/` }]
    };
  });
};
const createComingSoonSwaadhyayExercises = (exerciseNames: string[]): SwaadhyayExercise[] => {
    return exerciseNames.map(name => ({
        name,
        solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'COMING_SOON' }]
    }));
};
const swaadhyayData: { [grade: number]: { [chapter: number]: SwaadhyayExercise[] } } = {
  9: {
    1: [
      { name: 'સ્વાધ્યાય 1.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2023/10/std9-sankhyapaddhati-svadhyay-1.1.html' }] },
      { name: 'સ્વાધ્યાય 1.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-sankhya-paddhati-svadhyay-1.2.html' }] },
      { name: 'સ્વાધ્યાય 1.3', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-sankhya-paddhati-svadhyay-1.3.html' }] },
      { name: 'સ્વાધ્યાય 1.4', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-sankhya-paddhati-svadhyay-1.5.html' }] },
      { name: 'સ્વાધ્યાય 1.5', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-sankhya-paddhati-svadhyay-1.6.html' }] },
    ],
    2: [
      { name: 'સ્વાધ્યાય 2.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-bahupadio-svadhyay-2.1.html' }] },
      { name: 'સ્વાધ્યાય 2.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-bahupadio-svadhyay-2.2.html' }] },
      { name: 'સ્વાધ્યાય 2.3', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-bahupadio-svadhyay-2.4.html' }] },
      { name: 'સ્વાધ્યાય 2.4', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-bahupadio-svadhyay-2.5.html' }] },
    ],
    3: [
        { name: 'સ્વાધ્યાય 3.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-yaam-bhumiti-svadhyay-3.1.html' }] },
        { name: 'સ્વાધ્યાય 3.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-yaam-bhumiti-svadhyay-3.2.html' }] },
    ],
    4: [
        { name: 'સ્વાધ્યાય 4.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2023/10/Std9-dvichal-surekh-samikaran-svadhyay.html' }] },
        { name: 'સ્વાધ્યાય 4.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2021/01/standard-9-dvichal-surekh-samikaran-svadhyay-4.2.html' }] },
    ],
    5: [
        { name: 'સ્વાધ્યાય 5.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2021/01/standard-9-yuklidni-bhumitino-parichay-svadhyay-5.1.html' }] },
    ],
    6: [
        { name: 'સ્વાધ્યાય 6.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2023/10/blog-post.html' }] },
        { name: 'સ્વાધ્યાય 6.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2023/10/std9-rekhao-ane-khunao-svadhyay-6.2.html' }] },
    ],
    7: [
        { name: 'સ્વાધ્યાય 7.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-trikon-svadhyay-7.1.html' }] },
        { name: 'સ્વાધ્યાય 7.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-trikon-svadhyay-7.2.html' }] },
        { name: 'સ્વાધ્યાય 7.3', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2020/12/standard-9-trikon-svadhyay-7.3.html' }] },
    ],
    8: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 8.1', 'સ્વાધ્યાય 8.2']), 9: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 9.1', 'સ્વાધ્યાય 9.2', 'સ્વાધ્યાય 9.3']), 10: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 10.1']), 11: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 11.1', 'સ્વાધ્યાય 11.2', 'સ્વાધ્યાય 11.3', 'સ્વાધ્યાય 11.4']), 12: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 12.1']),
  },
  10: {
    1: [
        { name: 'સ્વાધ્યાય 1.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2023/10/Std10-vastaviksankhyao-svadhyay1.1.html' }] },
        { name: 'સ્વાધ્યાય 1.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2023/10/Std10-vastaviksankhyao-svadhyay1.2.html' }] }
    ],
    2: [
        { name: 'સ્વાધ્યાય 2.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2023/10/Std10-bahupadio-svadhyay-2.1.html' }] },
        { name: 'સ્વાધ્યાય 2.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2023/10/Std10-bahupadio-svadhyay-2.2.html' }] }
    ],
    3: [
        { name: 'સ્વાધ્યાય 3.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2025/09/Std10chap3.1.html' }] },
        { name: 'સ્વાધ્યાય 3.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2025/09/Std10chap3.2.html' }] },
        { name: 'સ્વાધ્યાય 3.3', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2025/09/Std10chap3.3.html' }] }
    ],
    4: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 4.1', 'સ્વાધ્યાય 4.2', 'સ્વાધ્યાય 4.3']),
    5: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 5.1', 'સ્વાધ્યાય 5.2', 'સ્વાધ્યાય 5.3', 'સ્વાધ્યાય 5.4']),
    6: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 6.1', 'સ્વાધ્યાય 6.2', 'સ્વાધ્યાય 6.3']),
    7: [
        { name: 'સ્વાધ્યાય 7.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2025/09/Std10chap7.1.html' }] },
        { name: 'સ્વાધ્યાય 7.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2025/09/Std10chap7.2.html' }] }
    ],
    8: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 8.1', 'સ્વાધ્યાય 8.2', 'સ્વાધ્યાય 8.3']),
    9: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 9.1']),
    10: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 10.1', 'સ્વાધ્યાય 10.2']),
    11: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 11.1']),
    12: createComingSoonSwaadhyayExercises(['સ્વાધ્યાય 12.1', 'સ્વાધ્યાય 12.2']),
    13: [
        { name: 'સ્વાધ્યાય 13.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2025/09/Std10chap13.1.html' }] },
        { name: 'સ્વાધ્યાય 13.2', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2025/09/Std10chap13.2.html' }] },
        { name: 'સ્વાધ્યાય 13.3', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2025/09/Std10chap13.3.html' }] }
    ],
    14: [
      { name: 'સ્વાધ્યાય 14.1', solutions: [{ name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', url: 'https://chalobhanie.blogspot.com/2025/09/Std10chap14.1.html' }] }
    ],
  }
};

// From: data/videoData.ts
interface Video { name: string; youtubeUrl: string; }
interface Exercise { name: string; videos: Video[]; }
const std9Chapter1Exercises: Exercise[] = [
  { name: 'સ્વાધ્યાય 1.1', videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/yuzpwMpdlFo' }] }, 
  { 
    name: 'સ્વાધ્યાય 1.2', 
    videos: [
        { name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/DuZkRhBXj1E' }
    ] 
  }, 
  { name: 'સ્વાધ્યાય 1.3', videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://www.youtube.com/watch?v=s7_a-iL3_eE' }] }, 
  { 
    name: 'સ્વાધ્યાય 1.4', 
    videos: [
      { name: 'દા. નં - 1, 2', youtubeUrl: 'https://youtu.be/6qrUTJsIvUM?si=-_ODmFxWVmYzb2N9' },
      { name: 'દા. નં - 5', youtubeUrl: 'https://youtu.be/FtKHvbnuWbU?si=n0GBfK_BFDMVE_XH' }
    ] 
  }, 
  { name: 'સ્વાધ્યાય 1.5', videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/qhu6wEE9Iwo?si=gDuR2AbQyEWOovM2' }] },
];
const std9Chapter2Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 2.1', videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/uNexOIbVE3c?si=mvqGYYU025xi9y9F' }] },
    { name: 'સ્વાધ્યાય 2.2', videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/2JKZIBLM7JE' }] },
    {
        name: 'સ્વાધ્યાય 2.3',
        videos: [
            { name: 'દા. નં. - 1', youtubeUrl: 'https://youtu.be/LBKGiMf5jTo' },
            { name: 'દા. નં. - 2', youtubeUrl: 'https://youtu.be/lTL2OzH-iDU' },
            { name: 'દા. નં. - 3', youtubeUrl: 'https://youtu.be/cbi2PMVCJbA' },
            { name: 'દા. નં. - 4', youtubeUrl: 'https://youtu.be/saLsCCX1gbI' },
            { name: 'દા. નં. - 5', youtubeUrl: 'https://youtu.be/Ko8L_HuVL8Q' },
        ]
    },
    {
        name: 'સ્વાધ્યાય 2.4',
        videos: [
            { name: 'દા. નં.- 1', youtubeUrl: 'https://youtu.be/oLtzwMZopjM' },
            { name: 'દા. નં.- 2', youtubeUrl: 'https://youtu.be/oLtzwMZopjM' },
            { name: 'દા. નં.- 3', youtubeUrl: 'https://youtu.be/_Gial0Ifxw8' },
            { name: 'દા. નં.- 4', youtubeUrl: 'https://youtu.be/INrBf7JaaCY' },
            { name: 'દા. નં.- 5', youtubeUrl: 'https://youtu.be/HH0vtTItS5I' },
            { name: 'દા. નં.- 6', youtubeUrl: 'https://youtu.be/KOSzCg0sMtA' },
            { name: 'દા. નં.- 7', youtubeUrl: 'https://youtu.be/RFS4G8KLEK8' },
            { name: 'દા. નં.- 8', youtubeUrl: 'https://youtu.be/gjnM9-kEhNs' },
            { name: 'દા. નં.- 9', youtubeUrl: 'https://youtu.be/7EfCG8-Mbt4' },
            { name: 'દા. નં.- 10', youtubeUrl: 'https://youtu.be/1pcSaOa0gEA' },
            { name: 'દા. નં.- 11, 12', youtubeUrl: 'https://youtu.be/os8ST6vgXsA' },
            { name: 'દા. નં.- 13, 14', youtubeUrl: 'https://youtu.be/vY487sZFHd0' },
            { name: 'દા. નં.- 15, 16', youtubeUrl: 'https://youtu.be/U53gq0Cer9w' },
        ]
    }
];
const std9Chapter3Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 3.1', videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/DfBLP9GXAnE' }] },
    { name: 'સ્વાધ્યાય 3.2', videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/-oIZviyiY6o' }] }
];
const std9Chapter4Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 4.1', videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/GSWPJ6ZtM14' }] },
    { 
        name: 'સ્વાધ્યાય 4.2', 
        videos: [
            { name: 'દા. નં. - 1, 2', youtubeUrl: 'https://youtu.be/258bhW0wZ7Y' },
            { name: 'દા. નં. - 3, 4', youtubeUrl: 'https://youtu.be/Xw8VQML0NhI' }
        ] 
    }
];
const std9Chapter5Exercises: Exercise[] = [
    { 
        name: 'સ્વાધ્યાય 5.1', 
        videos: [
            { name: 'દા. નં. - 1, 2', youtubeUrl: 'https://youtu.be/gV2GG5zfbfg?si=90ixEWap6o-R7hWP' },
            { name: 'દા. નં. - 3 થી 7', youtubeUrl: 'https://youtu.be/rg-O802v7Ow?si=7U6UjzpiZrDPzK7l' },
            { name: 'દા. નં. - 4, 5, 6', youtubeUrl: 'https://youtu.be/ssAwzMf4Lr0?si=AcV4e9Nq9JEBJggM' }
        ] 
    }
];
const std9Chapter6Exercises: Exercise[] = [
    { 
        name: 'સ્વાધ્યાય 6.1', 
        videos: [
            { name: 'દા. નં. - 1', youtubeUrl: 'https://youtu.be/XPdPOsI8BNI?si=xwG5yRwRi2OyBlsF' },
            { name: 'દા. નં. - 2', youtubeUrl: 'https://youtu.be/DO3hD4Qmw5w?si=ih099T5QLGinio3M' },
            { name: 'દા. નં. - 3', youtubeUrl: 'https://youtu.be/wIGllo_vX7A?si=z8PHQ7E3nFYXVIFL' },
            { name: 'દા. નં. - 4', youtubeUrl: 'https://youtu.be/vWe4BgJ0V-s?si=T5ot8a8u4QfJeW01' },
            { name: 'દા. નં. - 5', youtubeUrl: 'https://youtu.be/P6HJSb9Pf6I?si=gnQk8EynPXnAheRs' },
            { name: 'દા. નં. - 6', youtubeUrl: 'https://youtu.be/7FB5Rn9tDFs?si=YB-WV0WeIzCKwRsr' }
        ] 
    }, 
    { 
        name: 'સ્વાધ્યાય 6.2', 
        videos: [
            { name: 'દા. નં. - 1', youtubeUrl: 'https://youtu.be/BKcBegDDDQM?si=5rbhrAGAZuAiIi82' },
            { name: 'દા. નં. - 2', youtubeUrl: 'https://youtu.be/pdpBZvTlBcA?si=53-tFJPnxF102KZH' },
            { name: 'દા. નં. - 3', youtubeUrl: 'https://youtu.be/IGZPTH6hFF8?si=ElUO5tJGd_U0eXTQ' },
            { name: 'દા. નં. - 4', youtubeUrl: 'https://youtu.be/ukNxkdGNjXY?si=pxy085Jh2pmN2RC3' },
            { name: 'દા. નં. - 5', youtubeUrl: 'https://youtu.be/ev4MSU90d2c?si=FzokX13xqwSyJGHf' }
        ] 
    }
];
const std9Chapter7Exercises: Exercise[] = [ { name: 'સ્વાધ્યાય 7.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=s7_a-iL3_eE' }] }, { name: 'સ્વાધ્યાય 7.2', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=rEx_y8iBStQ' }] }];
const std9Chapter8Exercises: Exercise[] = [ { name: 'સ્વાધ્યાય 8.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=videoseries' }] }];
const std9Chapter9Exercises: Exercise[] = [ { name: 'સ્વાધ્યાય 9.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=3S-a_gJA8-c' }] }, { name: 'સ્વાધ્યાય 9.2', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=s7_a-iL3_eE' }] }];
const std9Chapter10Exercises: Exercise[] = [ { name: 'સ્વાધ્યાય 10.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=rEx_y8iBStQ' }] }];
const std9Chapter11Exercises: Exercise[] = [ { name: 'સ્વાધ્યાય 11.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=videoseries' }] }];
const std9Chapter12Exercises: Exercise[] = [ { name: 'સ્વાધ્યાય 12.1', videos: [{ name: 'संपूर्ण स्वाध्याय', youtubeUrl: 'https://www.youtube.com/watch?v=3S-a_gJA8-c' }] }];

const std10Chapter1Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 1.1', videos: [
        { name: 'દા. નં. - 1, 2, 3', youtubeUrl: 'https://youtu.be/UUXZSXW1Ulw' },
        { name: 'દા. નં. - 4, 5, 6, 7', youtubeUrl: 'https://youtu.be/3zIAtpcPQow' }
    ] },
    { name: 'સ્વાધ્યાય 1.2', videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/ynPdbczs9JY' }] },
];

const std10Chapter2Exercises: Exercise[] = [
    { name: 'સ્વાધ્યાય 2.1', videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://youtu.be/Mvl8qwWvql4?si=vxuEsHBKz1s6CHYj' }] },
    { name: 'સ્વાધ્યાય 2.2', videos: [
        { name: 'દા. નં. - 1 (i, ii)', youtubeUrl: 'https://youtu.be/vLeEH1JIN6s?si=nDDRIPtdyALG6Xtl' },
        { name: 'દા. નં. - 1 (iii, iv, v, vi)', youtubeUrl: 'https://youtu.be/fLuCQGBcSDI?si=CmddAtNNVxSTRSq5' },
        { name: 'દા. નં. - 2', youtubeUrl: 'https://youtu.be/FcIKg7-26-I?si=wiyfo6wBkYROOCkh' }
    ] },
];

const std10Chapter3Exercises: Exercise[] = [
    {
        name: 'સ્વાધ્યાય 3.1',
        videos: [
            { name: 'દા. નં. - 3 (i)', youtubeUrl: 'https://youtu.be/K3DoZBVQ3CQ' },
            { name: 'દા. નં. - 3 (ii)', youtubeUrl: 'https://youtu.be/AxmG8Fpp3n8' },
            { name: 'દા. નં. - 2', youtubeUrl: 'https://youtu.be/W-Fu3B4Js7Y' },
            { name: 'દા. નં. - 3 (i, ii, iii)', youtubeUrl: 'https://youtu.be/V7vaLh_T30Q' },
            { name: 'દા. નં. - 3 (iv, v)', youtubeUrl: 'https://youtu.be/ciKzQBuX9wU' },
            { name: 'દા. નં. - 4 (i)', youtubeUrl: 'https://youtu.be/opwIoRjsUhA' },
            { name: 'દા. નં. - 4 (ii)', youtubeUrl: 'https://youtu.be/jxXVY8Eyu-o' },
            { name: 'દા. નં. - 4 (iii)', youtubeUrl: 'https://youtu.be/hAy0zfZanWw' },
            { name: 'દા. નં. - 4 (iv)', youtubeUrl: 'https://youtu.be/t7wRV4wZ-KM' },
            { name: 'દા. નં. - 5', youtubeUrl: 'https://youtu.be/t70zmKptHI4' },
            { name: 'દા. નં. - 6', youtubeUrl: 'https://youtu.be/TIlcIVokNr8' },
            { name: 'દા. નં. - 7', youtubeUrl: 'https://youtu.be/mOlNXHZ0Ewg' }
        ]
    },
    {
        name: 'સ્વાધ્યાય 3.2',
        videos: [
            { name: 'દા. નં. - 1 (i)', youtubeUrl: 'https://youtu.be/JTPaIHcKCqo' },
            { name: 'દા. નં. - 1 (ii)', youtubeUrl: 'https://youtu.be/epyNzcqqrog' },
            { name: 'દા. નં. - 1 (iii)', youtubeUrl: 'https://youtu.be/ddWnlBKSEvQ' },
            { name: 'દા. નં. - 1 (iv)', youtubeUrl: 'https://youtu.be/wPSEMlrG5Mo' },
            { name: 'દા. નં. - 1 (v)', youtubeUrl: 'https://youtu.be/uTplL1uqbuA' },
            { name: 'દા. નં. - 1 (vi)', youtubeUrl: 'https://youtu.be/2Ra8Ln6bVvQ' },
            { name: 'દા. નં. - 2', youtubeUrl: 'https://youtu.be/JVjTP4bszXQ' },
            { name: 'દા. નં. - 3 (i)', youtubeUrl: 'https://youtu.be/j9JUaJsZkTs' },
            { name: 'દા. નં. - 3 (ii)', youtubeUrl: 'https://youtu.be/fMjTVTcickM' },
            { name: 'દા. નં. - 3 (iii)', youtubeUrl: 'https://youtu.be/chgouX48esc' },
            { name: 'દા. નં. - 3 (iv)', youtubeUrl: 'https://youtu.be/RkGE84Sx8kw' },
            { name: 'દા. નં. - 3 (v)', youtubeUrl: 'https://youtu.be/rjQurc-eUtI' },
            { name: 'દા. નં. - 3 (vi)', youtubeUrl: 'https://youtu.be/nNrG_AYaVnE' }
        ]
    },
    {
        name: 'સ્વાધ્યાય 3.3',
        videos: [
            { name: 'દા. નં. - 1 (i, ii)', youtubeUrl: 'https://youtu.be/948Qi4mBuXg' },
            { name: 'દા. નં. - 1 (iii, iv)', youtubeUrl: 'https://youtu.be/xi-9mUtnxH4' },
            { name: 'દા. નં. - 2 (i)', youtubeUrl: 'https://youtu.be/-dwvf_5QoNA' },
            { name: 'દા. નં. - 2 (ii)', youtubeUrl: 'https://youtu.be/M58lUysnsWw' },
            { name: 'દા. નં. - 2 (iii)', youtubeUrl: 'https://youtu.be/CKqnCfdIxxw' },
            { name: 'દા. નં. - 2 (iv)', youtubeUrl: 'https://youtu.be/K-k3aFZmYLk' },
            { name: 'દા. નં. - 2 (v)', youtubeUrl: 'https://youtu.be/Fibo3hIcOKw' }
        ]
    }
];

const std10Chapter7Exercises: Exercise[] = [
    {
        name: 'સ્વાધ્યાય 7.1',
        videos: [
            { name: 'દા. નં. - 1', youtubeUrl: 'https://youtu.be/wTpmtIE0eV0' },
            { name: 'દા. નં. - 2', youtubeUrl: 'https://youtu.be/xE8Q2IEoe_A' },
            { name: 'દા. નં. - 3, 4', youtubeUrl: 'https://youtu.be/1AN5b3_MaV4' },
            { name: 'દા. નં. - 5', youtubeUrl: 'https://youtu.be/jT6bX8Drfi8' },
            { name: 'દા. નં. - 6 (i)', youtubeUrl: 'https://youtu.be/zmNtkk95LJk' },
            { name: 'દા. નં. - 6 (ii)', youtubeUrl: 'https://youtu.be/p7zcVvv-bnc' },
            { name: 'દા. નં. - 6 (iii)', youtubeUrl: 'https://youtu.be/x4-Pwt_ikVw' },
            { name: 'દા. નં. - 7, 8, 9, 10', youtubeUrl: 'https://youtu.be/6iyeUgtqAEM' }
        ]
    },
    {
        name: 'સ્વાધ્યાય 7.2',
        videos: [
            { name: 'દા. નં. - 1, 2', youtubeUrl: 'https://youtu.be/y9w2SEOsKWY' },
            { name: 'દા. નં. - 3', youtubeUrl: 'https://youtu.be/C8mhUHlLxWY' },
            { name: 'દા. નં. - 4, 5', youtubeUrl: 'https://youtu.be/9HaY7badzfg' },
            { name: 'દા. નં. - 6, 7, 8', youtubeUrl: 'https://youtu.be/3KFst3kD2V0' },
            { name: 'દા. નં. - 9, 10', youtubeUrl: 'https://youtu.be/47KtQ5RhEhk' }
        ]
    }
];

const std10Chapter13Exercises: Exercise[] = [
    {
        name: 'સ્વાધ્યાય 13.1',
        videos: [
            { name: 'દા. નં. - 1, 2', youtubeUrl: 'https://youtu.be/f87aJXi_8iA' },
            { name: 'દા. નં. - 3, 4', youtubeUrl: 'https://youtu.be/lAnLKg2bTlY' },
            { name: 'દા. નં. - 5, 6', youtubeUrl: 'https://youtu.be/K3tLhAM6POc' },
            { name: 'દા. નં. - 7, 8, 9', youtubeUrl: 'https://youtu.be/tRZxGdRWvKA' }
        ]
    },
    {
        name: 'સ્વાધ્યાય 13.2',
        videos: [
            { name: 'દા. નં. - 1, 2, 3', youtubeUrl: 'https://youtu.be/kohj-6iJXsg' },
            { name: 'દા. નં. - 4, 5, 6', youtubeUrl: 'https://youtu.be/87zxkniJ6Vs' }
        ]
    },
    {
        name: 'સ્વાધ્યાય 13.3',
        videos: [
            { name: 'દા. નં. - 1, 2', youtubeUrl: 'https://youtu.be/3sb68CeI5DM' },
            { name: 'દા. નં. - 3', youtubeUrl: 'https://youtu.be/mh197CbtyFw' },
            { name: 'દા. નં. - 4, 5', youtubeUrl: 'https://youtu.be/Q14H1MP2sRY' },
            { name: 'દા. નં. - 6, 7', youtubeUrl: 'https://youtu.be/siB1CalT-eo' }
        ]
    }
];

const std10Chapter14Exercises: Exercise[] = [
    {
        name: 'સ્વાધ્યાય 14.1',
        videos: [
            { name: 'દા. નં. - 1, 2, 3', youtubeUrl: 'https://youtu.be/YIW5-Fyw-6k?si=1z6u6D-t50VWkNoM' },
            { name: 'દા. નં. - 4, 5, 6', youtubeUrl: 'https://youtu.be/ATRbgW69kvY?si=JGw656U3fpXlWvd5' },
            { name: 'દા. નં. - 7, 8, 9', youtubeUrl: 'https://youtu.be/TKwqasGUah4?si=ttLJFtrasM7_aqfH' },
            { name: 'દા. નં. - 10, 11', youtubeUrl: 'https://youtu.be/ZSSCA7aCS8E?si=MpPtG6BJ7bEvQ5Gq' },
            { name: 'દા. નં. - 12, 13', youtubeUrl: 'https://youtu.be/Xj5a2kbvaJQ?si=IL8ksSeV6e6jPfOb' },
            { name: 'દા. નં. - 14', youtubeUrl: 'https://youtu.be/GnBn7TTZnlw?si=PJchDicoMzc4FyNc' },
            { name: 'દા. નં. - 15, 16', youtubeUrl: 'https://youtu.be/cp6dSBfqQ4g?si=ExSu9w0P0RcEKDBK' },
            { name: 'દા. નં. - 17, 18, 19', youtubeUrl: 'https://youtu.be/ABUHQ-WTiYQ?si=xKaas5_iHwbSmux2' },
            { name: 'દા. નં. - 21, 22', youtubeUrl: 'https://youtu.be/F3I3vGG0HGE?si=R10Wq2uZxFAUCpml' },
            { name: 'દા. નં. - 23, 24, 25', youtubeUrl: 'https://youtu.be/jDZkqyhxcjk?si=CE6YlkD4KlPA97C8' }
        ]
    }
];

const createVideoExercises = (exerciseNames: string[]): Exercise[] => {
  return exerciseNames.map(name => ({
    name, videos: [{ name: 'સંપૂર્ણ સ્વાધ્યાય', youtubeUrl: 'https://www.youtube.com/watch?v=videoseries' }]
  }));
};
const videoData: { [grade: number]: { [chapter: number]: Exercise[] } } = {
  9: {
    1: std9Chapter1Exercises, 2: std9Chapter2Exercises, 3: std9Chapter3Exercises, 4: std9Chapter4Exercises, 5: std9Chapter5Exercises, 6: std9Chapter6Exercises, 7: std9Chapter7Exercises, 8: std9Chapter8Exercises, 9: std9Chapter9Exercises, 10: std9Chapter10Exercises, 11: std9Chapter11Exercises, 12: std9Chapter12Exercises,
  },
  10: {
    1: std10Chapter1Exercises,
    2: std10Chapter2Exercises,
    3: std10Chapter3Exercises,
    4: createVideoExercises(['સ્વાધ્યાય 4.1', 'સ્વાધ્યાય 4.2', 'સ્વાધ્યાય 4.3']),
    5: createVideoExercises(['સ્વાધ્યાય 5.1', 'સ્વાધ્યાય 5.2', 'સ્વાધ્યાય 5.3', 'સ્વાધ્યાય 5.4']),
    6: createVideoExercises(['સ્વાધ્યાય 6.1', 'સ્વાધ્યાય 6.2', 'સ્વાધ્યાય 6.3']),
    7: std10Chapter7Exercises,
    8: createVideoExercises(['સ્વાધ્યાય 8.1', 'સ્વાધ્યાય 8.2', 'સ્વાધ્યાય 8.3']),
    9: createVideoExercises(['સ્વાધ્યાય 9.1']),
    10: createVideoExercises(['સ્વાધ્યાય 10.1', 'સ્વાધ્યાય 10.2']),
    11: createVideoExercises(['સ્વાધ્યાય 11.1']),
    12: createVideoExercises(['સ્વાધ્યાય 12.1', 'સ્વાધ્યાય 12.2']),
    13: std10Chapter13Exercises,
    14: std10Chapter14Exercises,
  }
};


// From: services/geminiService.ts
const generateMockTest = async (grade: number, chapterName: string): Promise<MockTestQuestion[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a 5-question multiple-choice mock test for a student in Gujarati language.
    - Subject: Math
    - Standard: ${grade}
    - Chapter: "${chapterName}" ${chapterName === 'All Chapters' ? '(This means you should create questions covering various chapters from the standard).' : ''}
    - Language: Gujarati (The entire JSON output, including questions, options, and correct answers, must be in Gujarati script).
    - Each question must have exactly 4 options.
    - The 'correct_answer' field must exactly match one of the strings in the 'options' array.
    - Ensure the questions are relevant to the Gujarat Education Board (GSEB) curriculum.
    `;
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correct_answer: { type: Type.STRING }
                    },
                    required: ["question", "options", "correct_answer"]
                }
            }
        },
        required: ["questions"]
    };
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.questions || [];
};


// From: components/icons.tsx
const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V21" />
  </svg>
);
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);
const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);
const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);
const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0c3.221-3.221 3.221-8.455 0-11.667a8.25 8.25 0 0 0-11.667 0c-1.182 1.182-1.99 2.753-2.345 4.416" />
  </svg>
);
const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.186 2.25 2.25 0 0 0-3.933 2.186Z" />
  </svg>
);
const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);
const VideoCameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
  </svg>
);
const AcademicCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
  </svg>
);
const ClipboardDocumentCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
    </svg>
);
const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const LoginIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);
const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
  </svg>
);
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);
const SchoolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);
const InformationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);
const EnvelopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25-2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);
const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.53-.388A5.863 5.863 0 0 1 5.12 21.03a.75.75 0 0 1-.625.375c-.26-.02-.505-.136-.688-.338a.75.75 0 0 1-.26-1.034l1.53-3.059A9.76 9.76 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
);
const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
);
const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008h-.008v-.008Z" />
    </svg>
);
const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);
const WhatsappIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M16.75 13.96c.25.01 1.6-.28 1.83-.8.22-.52-.33-.84-.58-1.12-.25-.28-1.5-1.03-1.5-1.03s-.43-.45-.73-.78c0 0-.2-.23-.42-.48 0 0-.15-.18-.3-.23-.22-.08-.47-.03-.47-.03s-.43.1-.66.33c-.23.23-.78.73-.78.73s-.23.23-.43.48c-.2.25-.38.45-.5.53 0 0 0 0-.03.03l-.1.08c-.03.03-.03.03-.05.05h0s-.2.2-.23.23c-.03.03-.05.05-.08.08l-.12.15-.03.03c-.1.13-.15.2-.15.25s.1.42.33.63c.23.2.43.4.75.73.32.32.9.84 1.45 1.12.55.28 1.13.43 1.7.43.5 0 1.2-.18 1.55-.9ZM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Zm0 18.13a8.13 8.13 0 1 1 8.13-8.13 8.14 8.14 0 0 1-8.13 8.13Z"/>
  </svg>
);
const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8A10 10 0 0 0 22 12z"/>
  </svg>
);
const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M11.999,7.377c-2.554,0-4.623,2.07-4.623,4.623c0,2.554,2.069,4.624,4.623,4.624c2.552,0,4.623-2.07,4.623-4.624 C16.622,9.447,14.551,7.377,11.999,7.377L11.999,7.377z M11.999,15.004c-1.659,0-3.004-1.345-3.004-3.003 c0-1.659,1.345-3.003,3.004-3.003s3.003,1.344,3.003,3.003C15.002,13.659,13.658,15.004,11.999,15.004L11.999,15.004z"></path>
    <path d="M16.802,7.257c-0.276,0-0.5,0.224-0.5,0.5s0.224,0.5,0.5,0.5c0.275,0,0.5-0.224,0.5-0.5S17.077,7.257,16.802,7.257z"></path>
    <path d="M12,0.847c-3.15,0-3.522,0.012-4.753,0.07C2.902,1.13,1.13,2.902,0.917,7.241C0.86,8.472,0.848,8.844,0.848,12 c0,3.156,0.012,3.528,0.069,4.759c0.213,4.34,1.984,6.111,6.325,6.324c1.231,0.058,1.603,0.069,4.758,0.069 s3.527-0.011,4.758-0.069c4.341-0.213,6.112-1.984,6.325-6.324c0.056-1.231,0.068-1.603,0.068-4.759 c0-3.156-0.012-3.528-0.068-4.759C22.87,2.902,21.099,1.13,16.759,0.917C15.528,0.86,15.156,0.847,12,0.847L12,0.847z M12,2.37c3.078,0,3.447,0.012,4.655,0.068c3.272,0.162,4.825,1.714,4.986,4.986c0.056,1.208,0.068,1.577,0.068,4.655 c0,3.078-0.012,3.447-0.068,4.655c-0.161,3.272-1.714,4.825-4.986,4.986c-1.208,0.056-1.577,0.068-4.655,0.068 c-3.078,0-3.447-0.012-4.655-0.068c-3.272-0.161-4.825-1.714-4.986-4.986c-0.056-1.208-0.068-1.577-0.068-4.655 c0-3.078,0.012-3.447,0.068-4.655c0.161-3.272,1.714-4.825,4.986-4.986C8.553,2.382,8.922,2.37,12,2.37L12,2.37z"></path>
  </svg>
);
const TelegramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="m9.417 15.181-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L23.43 3.693c.343-1.452-.586-2.09-1.527-1.714L2.4 8.788c-1.447.581-1.44 1.39- .248 1.724l5.298 1.658 12.104-7.552c.576-.356 1.091-.168.624.231Z"/>
  </svg>
);


// --- All Components ---

const PlaceholderPage: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="mt-4 text-slate-500 dark:text-slate-400">{content}</p>
    </div>
  );
};

const AboutPage: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex flex-col items-center text-center">
        <SchoolIcon className="h-20 w-20 text-indigo-500 mb-4" />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">About Chalo ભણીએ !</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Your companion for Gujarat Board education.</p>
      </div>
      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300 text-justify">
        <p><strong>Chalo ભણીએ !</strong> is a dedicated educational platform designed to empower students of the Gujarat Secondary and Higher Secondary Education Board (GSEB). Our mission is to make quality education accessible, engaging, and convenient for every student, right at their fingertips.</p>
        <p>We understand the challenges students face, from finding reliable study materials to getting clear explanations of complex topics. That's why we've brought together a comprehensive collection of resources, all tailored to the GSEB curriculum.</p>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 text-center">Our Features</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>Video Solutions:</strong> Detailed chapter-wise and exercise-wise video tutorials to help you visualize and understand concepts better.</li>
            <li><strong>Digital Textbooks:</strong> Access all your GSEB textbooks in PDF format, anytime, anywhere.</li>
            <li><strong>Written Solutions (સ્વાધ્યાય):</strong> Step-by-step solutions for all textbook exercises to help you practice and verify your answers.</li>
            <li><strong>Old Question Papers:</strong> Practice with previous years' question papers to understand the exam pattern and improve your time management.</li>
            <li><strong>Mock Tests:</strong> Test your knowledge and prepare for exams with our curated mock tests.</li>
          </ul>
        </div>
        <p className="text-center font-medium text-indigo-600 dark:text-indigo-400 pt-4">Happy Learning!</p>
      </div>
    </div>
  );
};

const BottomNavBar: React.FC<{ onNav: (page: TopLevelPage | 'refresh' | 'share') => void; }> = ({ onNav }) => {
  const NavButton: React.FC<{ label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>>; onClick: () => void; }> = ({ label, Icon, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center space-y-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors pt-2 pb-1" aria-label={label}>
      <Icon className="h-6 w-6" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
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

const BooksPage: React.FC = () => (<PlaceholderPage title="Books" content="PDF files of all standard Gujarat board books will be available for download here." />);

const ChatBox: React.FC<{ isOpen: boolean; onClose: () => void; onNavigate: (view: ViewState) => void; }> = ({ isOpen, onClose, onNavigate }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  interface Message { id: number; text: string; sender: 'user' | 'bot'; quickReplies?: string[]; }
  const systemInstruction = `You are a friendly and helpful AI assistant for an educational app named 'Chalo ભણીએ !'. Your purpose is to help students navigate and use the app. You must only answer questions based on the information provided below. **App Content and Features:** 1. **Supported Standards (Grades):** Standard 9, Standard 10. 2. **Supported Subject:** Math. 3. **Available Resources for Math (for each chapter):** Video Solutions, Written PDF Solutions, Textbooks. 4. **Other App Features:** Old Papers (Coming Soon), Mock Tests (Coming Soon), Search Example (દાખલો શોધો). **List of Math Chapters:** *   **Standard 9 Chapters:** 1. સંખ્યા પદ્ધતિ, 2. બહુપદીઓ, 3. યામ ભૂમિતિ, 4. દ્વિચલ સુરેખ સમੀકરણો, 5. યુક્લિડની ભૂમિતિનો પરિચય, 6. રેખાઓ અને ખૂણાઓ, 7. ત્રિકોણ, 8. ચતુષ્કોણ, 9. વર્તુળ, 10. હેરોનનું સૂત્ર, 11. પૃષ્ઠફળ અને ઘનફળ, 12. આંકડાશાસ્ત્ર. *   **Standard 10 Chapters:** 1. વાસ્તવિક સંખ્યાઓ, 2. બહુપદીઓ, 3. દ્વિચલ સુરેખ સમીકરણયુગ્મ, 4. દ્વિઘાત સમીકરણ, 5. સમાંતર શ્રેણી, 6. ત્રિકોણ, 7. યામ ભૂમિતિ, 8. ત્રિકોણમિતિનો પરિચય, 9. ત્રિકોણમિતિના ઉપયોગો, 10. વર્તુળ, 11. વર્તુળ સંબંધિત ક્ષેત્રફળ, 12. પૃષ્ઠફળ અને ઘનફળ, 13. આંકડાશાસ્ત્ર, 14. સંભાવના. **Your Behavior:** *   **Stick to the Information:** Do not invent features. *   **Handle Out-of-Scope Questions:** Politely state that it's not currently available. For example: "હાલમાં, અમારી પાસે ફક્ત ધોરણ 9 અને 10 માટે ગણિત વિષય જ ઉપલબ્ધ છે. અમે ટૂંક સમયમાં વધુ વિષયો અને ધોરણો ઉમેરવા માટે કામ કરી રહ્યા છીએ!". *   **Be Concise and Helpful.** *   **Language:** Communicate primarily in Gujarati. *   **Do not provide URLs or links.** Guide the user on how to navigate within the app. *   **Quick Replies:** Provide clickable suggestions. Format: QUICK_REPLIES:[Option 1],[Option 2]. *   **Navigation:** When a user wants to see a solution, first ask for confirmation. e.g., "મારી પાસે [Standard], [Chapter], [Exercise] માટે ઉકેલ છે. શું તમે ત્યાં જવા માંગો છો? QUICK_REPLIES:[હા],[ના]". Navigate ONLY if the user says "Yes" ("હા") using this exact format: \`NAVIGATE:{"page":"chapter","grade":<GRADE_NUMBER>,"chapterNumber":<CHAPTER_NUMBER>,"chapterName":"<CHAPTER_NAME_GUJARATI>","exercise":"<EXERCISE_NAME_GUJARATI>"}\`.`;
  const TypingIndicator: React.FC = () => (<div className="flex justify-start"><div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl rounded-bl-none bg-slate-200 dark:bg-slate-700"><div className="flex items-center justify-center space-x-1"><div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce-dot bounce-1"></div><div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce-dot bounce-2"></div><div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce-dot bounce-3"></div></div></div></div>);
  const initialMessage: Message = { id: 0, text: "નમસ્કાર! હું 'Chalo ભણીએ !' એપ માટે AI સહાયક છું. તમને શું શોધવામાં મદદ કરી શકું?", sender: 'bot', quickReplies: ["ધોરણ 9", "ધોરણ 10", "દાખલો શોધો"] };
  const [conversation, setConversation] = useState<Message[]>([initialMessage]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);
  const messageIdCounter = useRef(1);
    useEffect(() => {
        const initializeChat = async () => {
            if (isOpen && !chatRef.current) {
                try {
                    if ((window as any).aistudio?.hasSelectedApiKey) {
                        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                        if (!hasKey) {
                            await (window as any).aistudio.openSelectKey();
                        }
                    }

                    if (!process.env.API_KEY) {
                        throw new Error("API key is not configured.");
                    }

                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    chatRef.current = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction: systemInstruction } });
                } catch (error) {
                    console.error("Failed to initialize Gemini Chat:", error);
                    const message = error instanceof Error ? error.message : String(error);
                    let errorMessage = "માફ કરશો, ચેટ સેવા શરૂ કરવામાં ભૂલ આવી છે.";

                    if (message.includes('API key is not configured')) {
                        errorMessage = "ચેટ સુવિધા માટે API કી જરૂરી છે. કૃપા કરીને ચેટ બંધ કરો અને ફરીથી ખોલો.";
                    } else if (message.includes('API key not valid') || message.includes('permission to access') || message.includes("Requested entity was not found")) {
                        errorMessage = "તમે પસંદ કરેલી API કી માન્ય નથી. કૃપા કરીને ચેટ બંધ કરો, ફરીથી ખોલો અને બીજી કી પસંદ કરો.";
                    }
                    setConversation(prev => [...prev, { id: messageIdCounter.current++, text: errorMessage, sender: 'bot' }]);
                }
            }
        };

        if (isOpen) {
            initializeChat();
        } else {
            chatRef.current = null;
        }
    }, [isOpen]);
  const performClose = () => { setIsClosing(true); setTimeout(() => { onClose(); setIsClosing(false); setConversation([initialMessage]); messageIdCounter.current = 1; }, 300); };
  const handleClose = () => { performClose(); };
  const parseResponse = (responseText: string): { text: string; quickReplies?: string[], navigation?: any } => {
    const replyRegex = /QUICK_REPLIES:\[(.*?)\]$/; const navigateRegex = /NAVIGATE:({.*?})$/; let text = responseText; let quickReplies: string[] | undefined; let navigation: any | undefined;
    const navMatch = text.match(navigateRegex);
    if (navMatch && navMatch[1]) { text = text.replace(navigateRegex, '').trim(); try { navigation = JSON.parse(navMatch[1]); } catch (e) { console.error("Failed to parse navigation JSON:", e); } }
    const replyMatch = text.match(replyRegex);
    if (replyMatch && replyMatch[1]) { text = text.replace(replyRegex, '').trim(); quickReplies = replyMatch[1].split(',').map(r => r.trim().replace(/^\[|\]$/g, '').trim()); }
    return { text, quickReplies, navigation };
  };
    const sendMessage = async (textToSend: string) => {
        if (textToSend.trim() === '') return;

        setConversation(prev => prev.map((msg, index) => index === prev.length - 1 ? { ...msg, quickReplies: undefined } : msg));
        const userMessage: Message = { id: messageIdCounter.current++, text: textToSend, sender: 'user' };
        setConversation(prev => [...prev, userMessage]); 
        setMessage(''); 
        setIsTyping(true);
        
        try {
            if (!chatRef.current) {
                throw new Error("Chat not initialized. Please close and reopen the chat.");
            }
            const response = await chatRef.current.sendMessage({ message: textToSend });
            const { text, quickReplies, navigation } = parseResponse(response.text);
            const botReply: Message = { id: messageIdCounter.current++, text: text || "તમને ત્યાં લઈ જાઉં છું...", sender: 'bot', quickReplies };
            setConversation(prev => [...prev, botReply]);
            if (navigation && onNavigate) {
                const chapter: Chapter = { number: navigation.chapterNumber, name: navigation.chapterName };
                const viewState: ViewState = { page: 'chapter', grade: navigation.grade, chapter: chapter, expandedExercise: navigation.exercise };
                setTimeout(() => { onNavigate(viewState); handleClose(); }, 100);
            }
        } catch (error) {
            console.error("Gemini API error:", error);
            let errorMessage = "માફ કરશો, મને અત્યારે કનેક્ટ કરવામાં મુશ્કેલી પડી રહી છે. કૃપા કરીને પછીથી ફરી પ્રયાસ કરો.";
            const message = error instanceof Error ? error.message : String(error);

            if (message.includes('API key not valid') || message.includes('permission to access') || message.includes("Requested entity was not found")) {
                 errorMessage = "તમે પસંદ કરેલી API કી માન્ય નથી. કૃપા કરીને ચેટ બંધ કરો, ફરીથી ખોલો અને બીજી કી પસંદ કરો.";
            } else if (message.includes("Chat not initialized")) {
                errorMessage = "ચેટ શરૂ કરી શકાઈ નથી. કૃપા કરીને ચેટ બંધ કરીને ફરીથી ખોલો.";
            }
            const errorReply: Message = { id: messageIdCounter.current++, text: errorMessage, sender: 'bot' };
            setConversation(prev => [...prev, errorReply]);
        } finally { 
            setIsTyping(false); 
        }
    };
  const handleSend = () => sendMessage(message);
  const handleQuickReplyClick = (replyText: string) => { sendMessage(replyText); };
  useEffect(() => { if (chatContainerRef.current) { chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; } }, [conversation, isTyping]);
  useEffect(() => { const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { handleClose(); } }; if (isOpen) { window.addEventListener('keydown', handleKeyDown); } return () => { window.removeEventListener('keydown', handleKeyDown); }; }, [isOpen]);
  useEffect(() => { if (isOpen) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; } return () => { document.body.style.overflow = ''; }; }, [isOpen]);
  if (!isOpen) { return null; }
  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-end justify-center animate-fade-in" onClick={handleClose} aria-modal="true" role="dialog">
      <div className={`w-full max-w-lg h-[70vh] flex flex-col bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl ${isClosing ? 'animate-slide-out-to-bottom' : 'animate-slide-in-from-bottom'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700"><h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Chalo ભણીએ !</h3><button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="ચેટ બંધ કરો"><CloseIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" /></button></div>
        <div ref={chatContainerRef} className="flex-1 p-4 space-y-2 overflow-y-auto">
          {conversation.map((msg, index) => (
            <div key={msg.id}>
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'}`}><p className="whitespace-pre-wrap">{msg.text}</p></div></div>
                {msg.quickReplies && msg.quickReplies.length > 0 && index === conversation.length - 1 && (
                     <div className="flex flex-wrap gap-2 mt-3 justify-start">{msg.quickReplies.map((reply, i) => (<button key={i} onClick={() => handleQuickReplyClick(reply)} className="px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/50 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-colors">{reply}</button>))}</div>
                )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
        </div>
        <div className="flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="તમારો સંદેશ લખો..." rows={1} className="flex-1 w-full p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" />
            <button onClick={handleSend} disabled={message.trim() === '' || isTyping} className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-110" aria-label="સંદેશ મોકલો"><PaperAirplaneIcon className="h-6 w-6" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactPage: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex flex-col items-center text-center"><EnvelopeIcon className="h-20 w-20 text-indigo-500 mb-4" /><h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Contact Us</h1><p className="text-lg text-slate-600 dark:text-slate-300">We'd love to hear from you!</p></div>
      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300">
        <p className="text-center">Whether you have a question about the app, a suggestion for a new feature, or need support, please feel free to reach out to us.</p>
        <div className="p-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg space-y-4">
          <div><h3 className="font-semibold text-slate-800 dark:text-slate-100">General Inquiries & Support</h3><p>For any questions or support requests, please email us at:</p><a href="mailto:support@chalobhanie.com" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">support@chalobhanie.com</a></div>
          <div><h3 className="font-semibold text-slate-800 dark:text-slate-100">Our Address</h3><p>Chalo Bhaniye Education Pvt. Ltd.</p><p>123 Learning Street, Education City,</p><p>Gandhinagar, Gujarat - 382001</p></div>
        </div>
        <p className="text-center pt-4">We aim to respond to all inquiries within 24-48 hours. Thank you for using <strong>Chalo ભણીએ !</strong></p>
      </div>
    </div>
  );
};

const DisclaimerPage: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex flex-col items-center text-center"><ExclamationTriangleIcon className="h-20 w-20 text-indigo-500 mb-4" /><h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Disclaimer</h1><p className="text-lg text-slate-600 dark:text-slate-300">Information provided on this app.</p></div>
      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300 text-justify">
        <p>The information provided by Chalo ભણીએ ! on our mobile application is for general informational purposes only. All information on the app is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the app.</p>
        <p>The educational content, including video solutions and written materials, is intended to supplement, not replace, official curriculum and classroom instruction. While we strive to ensure accuracy, errors may occur. We are not liable for any academic outcomes resulting from the use of our app.</p>
        <p>External links to other websites or content belonging to or originating from third parties are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.</p>
      </div>
    </div>
  );
};

const GoogleFormPage: React.FC = () => {
  const GOOGLE_FORM_EMBED_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfzJ4QQIJMui-le2fu9Q_6CnAMnyVFjvzuECLItlrvPbrCTlg/viewform?embedded=true';
  return (
    <div className="w-full h-[calc(100vh-9rem)] bg-white dark:bg-slate-800">
      <iframe src={GOOGLE_FORM_EMBED_URL} width="100%" height="100%" frameBorder="0" marginHeight={0} marginWidth={0} title="Comment Form" style={{ border: 'none' }}>Loading…</iframe>
    </div>
  );
};

const GradePage: React.FC<{ grade: number; onTextbookSelect: () => void; onSolutionsSelect: () => void; }> = ({ grade, onTextbookSelect, onSolutionsSelect }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [viewingExternalUrl, setViewingExternalUrl] = useState<{ url: string; title: string } | null>(null);
  const toggleDropdown = () => { setDropdownOpen(prev => !prev); };

  const handleTextbookClick = () => {
    let textbookUrl = '';
    if (grade === 9) {
      // ધોરણ 9, ગણિત
      textbookUrl = "https://drive.google.com/file/d/11459suGwctvXxcaKNyknIDh73DU1YjvB/preview";
    } else if (grade === 10) {
      // ધોરણ 10, ગણિત
      textbookUrl = "https://drive.google.com/file/d/1cBlHvd1Ew4ct_2neA5ZkxlOs4iuwJlTH/preview";
    }
    
    if (textbookUrl) {
        setViewingExternalUrl({ url: textbookUrl, title: `ધોરણ ${grade} ગણિત Textbook` });
        setDropdownOpen(false);
    }
  };
  
  return (
    <>
      <div className="relative grid grid-cols-1 gap-6 md:gap-8">
        <button onClick={toggleDropdown} className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900" aria-haspopup="true" aria-expanded={isDropdownOpen}>
          <span className="text-3xl font-bold text-slate-700 dark:text-slate-200">ગણિત</span>
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 grid grid-cols-2 gap-4 animate-fade-in-down z-10">
            <button onClick={handleTextbookClick} className="group flex items-center justify-center p-4 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"><span className="text-xl font-bold">Textbook</span></button>
            <button onClick={onSolutionsSelect} className="group flex items-center justify-center p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"><span className="text-xl font-bold">સ્વાધ્યાય</span></button>
          </div>
        )}
      </div>
      {viewingExternalUrl && (<IframeViewer url={viewingExternalUrl.url} onClose={() => setViewingExternalUrl(null)} title={viewingExternalUrl.title} />)}
    </>
  );
};

const MockTestPage: React.FC = () => (<PlaceholderPage title="Mock Tests" content="Chapter-wise, subject-wise, and standard-wise tests will be available here soon." />);
const OldPapersPage: React.FC = () => (<PlaceholderPage title="Old Papers" content="Previous years' question papers will be available here soon." />);
const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex flex-col items-center text-center"><ShieldCheckIcon className="h-20 w-20 text-indigo-500 mb-4" /><h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Privacy Policy</h1><p className="text-lg text-slate-600 dark:text-slate-300">Your privacy is important to us.</p></div>
      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300 text-justify">
        <p>This Privacy Policy explains how Chalo ભણીએ ! ("we," "us," or "our") collects, uses, and discloses information about you when you use our mobile application and related services (collectively, the "Services").</p>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 text-left">Information We Collect</h2><p>We may collect personal information that you provide to us, such as your name, email address, and mobile number when you register for an account. We also collect information about your usage of the app, such as the content you view and your progress.</p>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 text-left">How We Use Your Information</h2><p>We use the information we collect to provide, maintain, and improve our Services, including to personalize your learning experience, communicate with you, and for analytics purposes.</p>
        <p className="text-center font-medium pt-4">This policy is effective as of {new Date().toLocaleDateString()}.</p>
      </div>
    </div>
  );
};

const SubjectPage: React.FC<{ grade: number | null; onChapterSelect: (chapter: Chapter) => void; }> = ({ grade, onChapterSelect }) => {
  const chapters = grade === 9 ? std9MathChapters : grade === 10 ? std10MathChapters : [];
  if (chapters.length === 0) {
      return (<div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in"><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Solutions</h2><p className="mt-4 text-slate-500 dark:text-slate-400">Chapter-wise solutions for this grade will be available soon.</p></div>);
  }
  return (
    <div className="space-y-4 animate-fade-in">
      {chapters.map((chapter) => (
        <button key={chapter.number} onClick={() => onChapterSelect(chapter)} className="w-full flex items-center p-4 text-left bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-300 font-bold text-lg">{chapter.number}</div>
          <div className="ml-4 flex-grow"><p className="text-lg font-semibold text-slate-800 dark:text-slate-100">પ્રકરણ {chapter.number}</p><p className="text-md text-slate-600 dark:text-slate-300">{chapter.name}</p></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" /></svg>
        </button>
      ))}
    </div>
  );
};

const VideoSolution: React.FC<{ youtubeUrl?: string | null; }> = ({ youtubeUrl }) => {
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  if (!youtubeUrl) { return (<div className="aspect-video w-full flex items-center justify-center bg-slate-200 dark:bg-slate-700"><p className="text-slate-500 dark:text-slate-400">No video provided.</p></div>); }
  const videoId = getYouTubeId(youtubeUrl);
  if (!videoId) { return (<div className="aspect-video w-full flex items-center justify-center bg-red-100 dark:bg-red-900/50"><p className="text-red-700 dark:text-red-300">Invalid YouTube URL.</p></div>); }
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  return (<div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}><iframe className="absolute top-0 left-0 w-full h-full" src={embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>);
};

const NotificationBell: React.FC<{ notifications: Notification[]; onMarkAsRead: (ids: number[] | 'all') => void; onNotificationClick: (notification: Notification) => void; }> = ({ notifications, onMarkAsRead, onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => setIsOpen(prev => !prev);
  const handleMarkAllRead = () => { onMarkAsRead('all'); };
  const handleItemClick = (notification: Notification) => { onNotificationClick(notification); setIsOpen(false); };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) { setIsOpen(false); } };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label={`View notifications. ${unreadCount} unread.`} aria-haspopup="true" aria-expanded={isOpen}>
        <BellIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (<span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800/80"></span>)}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20 origin-top-right animate-fade-in-down" role="menu">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"><h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Notifications</h3>{unreadCount > 0 && (<button onClick={handleMarkAllRead} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Mark all as read</button>)}</div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (<ul>{notifications.map(notification => (<li key={notification.id} className={`border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 ${!notification.read ? 'bg-indigo-50/50 dark:bg-slate-800' : ''}`}><button onClick={() => handleItemClick(notification)} className="w-full text-left p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="flex items-start space-x-3">{!notification.read && (<div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500"></div>)}<div className={`flex-1 ${notification.read ? 'pl-5' : ''}`}><p className="font-semibold text-slate-800 dark:text-slate-200">{notification.title}</p><p className="text-sm text-slate-500 dark:text-slate-400">{notification.description}</p><p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{notification.timestamp}</p></div></div></button></li>))}</ul>) : (<div className="p-8 text-center text-slate-500 dark:text-slate-400"><p>You're all caught up!</p></div>)}
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onLogin: (user: User) => void;
    onLogout: () => void;
    onUserUpdate: (updatedUser: User) => void;
    onSidebarNav: (page: SidebarPage) => void;
}> = ({ isOpen, onClose, user, onLogin, onLogout, onUserUpdate, onSidebarNav }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isLoginDropdownOpen, setLoginDropdownOpen] = useState(false);
    const [loginName, setLoginName] = useState('');
    const [loginContact, setLoginContact] = useState('');
    const [loginError, setLoginError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { handleClose(); }
        };
        if (isOpen) { document.body.style.overflow = 'hidden'; window.addEventListener('keydown', handleKeyDown); } 
        else { document.body.style.overflow = ''; }
        return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKeyDown); };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => { onClose(); setIsClosing(false); setIsAboutOpen(false); setLoginDropdownOpen(false); setLoginError(''); }, 200);
    };

    const handleNav = (page: SidebarPage) => { onSidebarNav(page); handleClose(); };
    
    const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && user) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const updatedUser: User = { ...user, profilePicture: e.target?.result as string };
                onUserUpdate(updatedUser);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateContact = (contact: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[0-9]{10,14}$/;
        return emailRegex.test(contact) || phoneRegex.test(contact);
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        if (!validateContact(loginContact.trim())) {
            setLoginError('Please enter a valid email or phone number.');
            return;
        }

        if (loginName.trim() && loginContact.trim()) {
            const isEmail = loginContact.includes('@');
            onLogin({
                name: loginName.trim(),
                email: isEmail ? loginContact.trim() : '',
                mobile: !isEmail ? loginContact.trim() : '',
            });
            setLoginName('');
            setLoginContact('');
            setLoginDropdownOpen(false);
        }
    };
    
    const aboutPages: { page: SidebarPage; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>>; }[] = [
        { page: 'about', label: 'About Us', Icon: SchoolIcon },
        { page: 'contact', label: 'Contact Us', Icon: EnvelopeIcon },
        { page: 'privacy', label: 'Privacy Policy', Icon: ShieldCheckIcon },
        { page: 'disclaimer', label: 'Disclaimer', Icon: ExclamationTriangleIcon },
    ];
    
    const NavButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; }> = ({ onClick, children, className = '' }) => (
        <button onClick={onClick} className={`w-full flex items-center p-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium ${className}`}>
            {children}
        </button>
    );

    return (
      <>
        {isOpen && (
            <div className="fixed inset-0 z-30" role="dialog" aria-modal="true" onClick={handleClose}>
                <div className={`absolute inset-0 bg-black/60 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}></div>
                <div 
                    className={`relative h-full w-72 sm:w-80 bg-white dark:bg-slate-800 shadow-xl flex flex-col ${isClosing ? 'animate-slide-out-to-left' : 'animate-slide-in-from-left'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex-shrink-0 flex items-start p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex-grow">
                            {user ? (
                                <div>
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <input type="file" ref={fileInputRef} onChange={handleProfilePictureChange} accept="image/*" className="hidden" />
                                            <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800" aria-label="Change profile picture">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <UserCircleIcon className="h-12 w-12 text-slate-500" />
                                                )}
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <PencilIcon className="h-6 w-6 text-white" />
                                                </div>
                                            </button>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{user.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={onLogout} className="w-full flex items-center justify-center mt-4 p-2 rounded-lg text-sm bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                                        <LogoutIcon className="h-5 w-5 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <button 
                                        className="w-full flex items-center justify-center p-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors" 
                                        onClick={() => setLoginDropdownOpen(prev => !prev)}
                                        aria-expanded={isLoginDropdownOpen}
                                    >
                                        <LoginIcon className="h-5 w-5 mr-2" />
                                        Login
                                    </button>
                                    {isLoginDropdownOpen && (
                                        <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3 animate-fade-in-down">
                                            <input
                                                type="text"
                                                value={loginName}
                                                onChange={(e) => setLoginName(e.target.value)}
                                                required
                                                className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                placeholder="Full Name"
                                            />
                                            <div>
                                                <input
                                                    type="text"
                                                    value={loginContact}
                                                    onChange={(e) => {
                                                        setLoginContact(e.target.value);
                                                        if (loginError) setLoginError('');
                                                    }}
                                                    required
                                                    className={`w-full p-2 bg-white dark:bg-slate-700 border ${loginError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-md text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors`}
                                                    placeholder="Email or Phone"
                                                />
                                                {loginError && <p className="mt-1 text-xs text-red-500">{loginError}</p>}
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={!loginName.trim() || !loginContact.trim()}
                                                className="w-full p-2 rounded-md bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:bg-slate-400 disabled:dark:bg-slate-500"
                                            >
                                                Submit
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto">
                        <nav className="space-y-1">
                            <NavButton onClick={() => handleNav('home')}>
                                <HomeIcon className="h-6 w-6 mr-4 text-slate-500" />
                                Home
                            </NavButton>

                            <div>
                                <button onClick={() => setIsAboutOpen(!isAboutOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium" aria-expanded={isAboutOpen}>
                                    <div className="flex items-center">
                                        <InformationCircleIcon className="h-6 w-6 mr-4 text-slate-500" />
                                        About
                                    </div>
                                    <ChevronDownIcon className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${isAboutOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isAboutOpen && (
                                    <div className="pl-8 mt-1 space-y-1 animate-fade-in-down">
                                        {aboutPages.map(({ page, label, Icon }) => (
                                            <button key={page} onClick={() => handleNav(page)} className="w-full flex items-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                <Icon className="h-5 w-5 mr-3 text-slate-400" />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>

                    <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
                        <div className="text-center text-xs text-slate-400 dark:text-slate-500">
                            <p>Chalo ભણીએ ! v1.0.0</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </>
    );
};


const Header: React.FC<{ title: string; showBackButton: boolean; onBack: () => void; onMenuClick: () => void; notifications: Notification[]; onMarkNotificationsRead: (ids: number[] | 'all') => void; onNotificationClick: (notification: Notification) => void; }> = ({ title, showBackButton, onBack, onMenuClick, notifications, onMarkNotificationsRead, onNotificationClick }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-center h-16">
          <div className="absolute left-0">{showBackButton ? (<button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Go back"><ArrowLeftIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" /></button>) : (<button onClick={onMenuClick} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Open menu"><MenuIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" /></button>)}</div>
          <div className="flex items-center"><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h1></div>
          <div className="absolute right-0"><NotificationBell notifications={notifications} onMarkAsRead={onMarkNotificationsRead} onNotificationClick={onNotificationClick} /></div>
        </div>
      </div>
    </header>
  );
};

const HomePage: React.FC<{ onGradeSelect: (grade: number) => void; onNavigate: (view: ViewState) => void; }> = ({ onGradeSelect, onNavigate }) => {
  const menuItems: { grade: number; gradeText: string; gradeNumber: string; }[] = [ { grade: 9, gradeText: 'ધોરણ', gradeNumber: '9' }, { grade: 10, gradeText: 'ધોરણ', gradeNumber: '10' }];
  const actionButtonClass = "group w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900";
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        {menuItems.map(item => (<button key={item.grade} onClick={() => onGradeSelect(item.grade)} className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"><div className="text-center font-bold text-slate-700 dark:text-slate-200"><span className="block text-xl -mb-1">{item.gradeText}</span><span className="block text-7xl font-extrabold leading-tight">{item.gradeNumber}</span></div></button>))}
        <div className="sm:col-span-2 grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
           <button onClick={() => onNavigate({ page: 'example_search' })} className={actionButtonClass}>
                <SearchIcon className="h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3 text-indigo-500 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-center text-lg sm:text-2xl font-bold text-slate-700 dark:text-slate-200">દાખલો શોધો</span>
            </button>
          <button onClick={() => onNavigate({ page: 'google_form' })} className={actionButtonClass}>
            <PencilIcon className="h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3 text-indigo-500 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-center text-lg sm:text-2xl font-bold text-slate-700 dark:text-slate-200">તમારા reviews જણાવો</span>
          </button>
        </div>
      </div>
      <div className="mt-12 text-center">
        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-4">Follow Us On</h3>
        <div className="flex justify-center items-center space-x-6">
          <a href="#" aria-label="Whatsapp" className="text-slate-500 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400 transition-colors duration-300 transform hover:scale-110">
            <WhatsappIcon className="h-8 w-8" />
          </a>
          <a href="#" aria-label="Instagram" className="text-slate-500 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 transform hover:scale-110">
            <InstagramIcon className="h-8 w-8" />
          </a>
          <a href="#" aria-label="Facebook" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors duration-300 transform hover:scale-110">
            <FacebookIcon className="h-8 w-8" />
          </a>
          <a href="#" aria-label="Telegram" className="text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-300 transform hover:scale-110">
            <TelegramIcon className="h-8 w-8" />
          </a>
          <a href="#" aria-label="X (formerly Twitter)" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 transform hover:scale-110">
            <XIcon className="h-7 w-7" />
          </a>
        </div>
      </div>
    </>
  );
};

const PdfViewer: React.FC<{ pdfUrl: string; onClose: () => void; title: string; }> = ({ pdfUrl, onClose, title }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStartRef = useRef<number>(0);
  const SWIPE_THRESHOLD = 50;
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        if (typeof pdfjsLib === 'undefined') { console.error('pdf.js is not loaded.'); setIsLoading(false); return; }
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const doc = await loadingTask.promise;
        setPdfDoc(doc); setTotalPages(doc.numPages); setPageNum(1);
      } catch (error) { console.error('Error loading PDF:', error); } finally { setIsLoading(false); }
    };
    loadPdf();
  }, [pdfUrl]);
  const renderPage = useCallback(async (num: number) => {
    if (!pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(num);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const desiredWidth = canvas.parentElement?.clientWidth || 1024;
      const viewport = page.getViewport({ scale: 1 });
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale * 2 });
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.height = scaledViewport.height; canvas.width = scaledViewport.width; canvas.style.width = "100%"; canvas.style.height = "auto";
      const renderContext = { canvasContext: context, viewport: scaledViewport };
      await page.render(renderContext).promise;
    } catch (error) { console.error('Error rendering page:', error); }
  }, [pdfDoc]);
  useEffect(() => { if (pdfDoc) { renderPage(pageNum); } }, [pdfDoc, pageNum, renderPage]);
  const goToPrevPage = useCallback(() => { setPageNum(p => Math.max(1, p - 1)); }, []);
  const goToNextPage = useCallback(() => { setPageNum(p => Math.min(totalPages, p + 1)); }, [totalPages]);
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => { touchStartRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchEnd = e.changedTouches[0].clientX;
    const deltaX = touchEnd - touchStartRef.current;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) { if (deltaX < 0) { goToNextPage(); } else { goToPrevPage(); } }
  };
  const handleClose = () => { setIsClosing(true); setTimeout(() => onClose(), 300); };
  const NavButton: React.FC<{onClick: () => void, disabled: boolean, children: React.ReactNode, ariaLabel: string}> = ({onClick, disabled, children, ariaLabel}) => (<button onClick={onClick} disabled={disabled} aria-label={ariaLabel} className="p-2 rounded-full bg-slate-900/50 text-white hover:bg-slate-900/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">{children}</button>);
  const Spinner: React.FC = () => (<div className="flex justify-center items-center h-full"><div className="w-12 h-12 border-4 border-slate-400 border-t-slate-100 rounded-full animate-spin"></div></div>);
  const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L8.85 10l3.94 3.71a.75.75 0 1 1-1.06 1.06l-4.5-4.25a.75.75 0 0 1 0-1.06l4.5-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>);
  const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" /></svg>);
  return (
    <div className={`fixed inset-0 bg-black/80 z-50 flex flex-col ${isClosing ? 'animate-slide-out-to-right' : 'animate-slide-in-from-right'}`} role="dialog" aria-modal="true">
      <header className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-900 text-white shadow-md"><h2 className="text-xl font-bold truncate">{title}</h2><button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Close PDF viewer"><CloseIcon className="h-6 w-6" /></button></header>
      <main className="flex-grow flex-1 relative overflow-auto" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>{isLoading ? (<Spinner />) : (<div key={pageNum} className="w-full h-full flex justify-center p-2 animate-page-fade-in"><canvas ref={canvasRef} /></div>)}</main>
       <footer className="flex-shrink-0 flex items-center justify-center p-4 bg-slate-900/80 text-white space-x-6">
            <NavButton onClick={goToPrevPage} disabled={pageNum <= 1} ariaLabel="Previous page"><ChevronLeftIcon className="h-6 w-6" /></NavButton>
            <span className="font-semibold text-lg tabular-nums">{pageNum} / {totalPages}</span>
            <NavButton onClick={goToNextPage} disabled={pageNum >= totalPages} ariaLabel="Next page"><ChevronRightIcon className="h-6 w-6" /></NavButton>
        </footer>
    </div>
  );
};

const IframeViewer: React.FC<{ url: string; onClose: () => void; title: string; }> = ({ url, onClose, title }) => {
  const [isClosing, setIsClosing] = useState(false);
  const handleClose = () => { setIsClosing(true); setTimeout(() => onClose(), 300); };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') { handleClose(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`fixed inset-0 bg-black/80 z-50 flex flex-col ${isClosing ? 'animate-slide-out-to-right' : 'animate-slide-in-from-right'}`} role="dialog" aria-modal="true">
      <header className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-900 text-white shadow-md">
        <h2 className="text-xl font-bold truncate">{title}</h2>
        <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Close viewer">
          <CloseIcon className="h-6 w-6" />
        </button>
      </header>
      <main className="flex-grow bg-white">
        <iframe
          src={url}
          className="w-full h-full border-none"
          title={title}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        ></iframe>
      </main>
    </div>
  );
};

const ChapterDetailPage: React.FC<{ grade: number; chapter: Chapter; expandedExercise?: string; }> = ({ grade, chapter, expandedExercise: defaultExpandedExercise }) => {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(defaultExpandedExercise || null);
  const [selectedContent, setSelectedContent] = useState<{ [key: string]: 'videos' | 'solution_coming_soon' | undefined }>({});
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [viewingExternalUrl, setViewingExternalUrl] = useState<{ url: string; title: string } | null>(null);
  
  interface UnifiedExercise { name: string; videos: Video[]; solutions: SolutionResource[]; videosComingSoon?: boolean; }
  const unifiedExercises = useMemo((): UnifiedExercise[] => {
    const videoExercises = videoData[grade]?.[chapter.number] || [];
    const swaadhyayExercises = swaadhyayData[grade]?.[chapter.number] || [];

    const videosComingSoonChapters: { [grade: number]: number[] } = {
        9: [7, 8, 9, 10, 11, 12],
        10: [4, 5, 6, 8, 9, 10, 11, 12]
    };
    const isChapterComingSoon = videosComingSoonChapters[grade]?.includes(chapter.number);

    const exerciseMap = new Map<string, Partial<UnifiedExercise>>();

    const allExerciseNames = new Set([...swaadhyayExercises.map(e => e.name), ...videoExercises.map(e => e.name)]);

    allExerciseNames.forEach(name => {
        const swaadhyayEx = swaadhyayExercises.find(e => e.name === name);
        const videoEx = videoExercises.find(e => e.name === name);
        
        exerciseMap.set(name, {
            name: name,
            solutions: swaadhyayEx?.solutions || [],
            videos: videoEx?.videos || [],
            videosComingSoon: isChapterComingSoon
        });
    });

    return Array.from(exerciseMap.values()).map(ex => ({
        name: ex.name!,
        videos: ex.videos || [],
        solutions: ex.solutions || [],
        videosComingSoon: !!ex.videosComingSoon
    })).sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
  }, [grade, chapter]);

  const handleExerciseClick = (exerciseName: string) => { setExpandedExercise(current => (current === exerciseName ? null : exerciseName)); setPlayingVideoUrl(null); };
  const handleContentSelect = (exerciseName: string, contentType: 'videos') => { setSelectedContent(prev => { if (prev[exerciseName] === contentType) { return { ...prev, [exerciseName]: undefined }; } return { ...prev, [exerciseName]: contentType }; }); setPlayingVideoUrl(null); };
  if (unifiedExercises.length === 0) { return (<div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{chapter.name}</h2><p className="mt-4 text-slate-500 dark:text-slate-400">Content for this chapter will be available here soon.</p></div>); }
  return (
    <>
      <div className="space-y-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">{chapter.name}</h2></div>
        {unifiedExercises.map((exercise) => {
          const isExpanded = expandedExercise === exercise.name;
          const currentContent = selectedContent[exercise.name];
          return (
            <div key={exercise.name} className="bg-white dark:bg-slate-800 shadow-lg overflow-hidden rounded-2xl">
              <button onClick={() => handleExerciseClick(exercise.name)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded={isExpanded}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{exercise.name}</h3>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-6 h-6 text-slate-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
              </button>
              {isExpanded && (
                <div className="py-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                  <div className="px-4">
                    <div className="flex gap-4 mb-4">
                       <button onClick={() => handleContentSelect(exercise.name, 'videos')} className={`flex-1 p-3 rounded-lg font-bold transition-colors shadow-sm text-center ${currentContent === 'videos' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 hover:bg-rose-200 dark:hover:bg-rose-800/60'}`}>Videos</button>
                      {exercise.solutions.length > 0 && (
                          <button 
                            onClick={() => {
                                const solution = exercise.solutions[0];
                                if (solution.url === 'COMING_SOON') {
                                    setSelectedContent(prev => {
                                        if (prev[exercise.name] === 'solution_coming_soon') {
                                            return { ...prev, [exercise.name]: undefined };
                                        }
                                        return { ...prev, [exercise.name]: 'solution_coming_soon' };
                                    });
                                    setPlayingVideoUrl(null);
                                } else {
                                    setViewingExternalUrl({ url: solution.url, title: `${exercise.name} - ${solution.name}` });
                                }
                            }} 
                            className={`flex-1 p-3 rounded-lg font-bold transition-colors shadow-sm text-center ${currentContent === 'solution_coming_soon' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800/60'}`}
                          >
                            Solution
                          </button>
                      )}
                    </div>
                  </div>
                  {currentContent === 'videos' && (
                    <div className="px-4 animate-fade-in">
                        {exercise.videosComingSoon ? (
                           <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                                વિડિઓ ટૂંક સમયમાં ઉપલબ્ધ થશે
                            </p>
                        ) : exercise.videos.length > 0 ? (
                        <div className="space-y-4">
                            <select
                                value={playingVideoUrl || ''}
                                onChange={(e) => setPlayingVideoUrl(e.target.value || null)}
                                className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                aria-label="Select a video"
                            >
                            <option value="">-- વિડિઓ પસંદ કરો --</option>
                            {exercise.videos.map((video, index) => (
                                <option key={`${video.youtubeUrl}-${index}`} value={video.youtubeUrl}>
                                    {video.name}
                                </option>
                            ))}
                            </select>
                            
                            {playingVideoUrl && (
                                <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
                                    <VideoSolution youtubeUrl={playingVideoUrl} />
                                </div>
                            )}
                        </div>
                        ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                            No videos available for this exercise.
                        </p>
                        )}
                    </div>
                  )}
                  {currentContent === 'solution_coming_soon' && (
                    <div className="px-4 animate-fade-in">
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                            સ્વાધ્યાય ટૂંક સમયમાં ઉપલબ્ધ થશે
                        </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {viewingExternalUrl && (<IframeViewer url={viewingExternalUrl.url} title={viewingExternalUrl.title} onClose={() => setViewingExternalUrl(null)} />)}
    </>
  );
};

const ExampleSearchPage: React.FC<{ navigate: (view: ViewState) => void; }> = ({ navigate }) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exampleNumber, setExampleNumber] = useState('');
  interface UnifiedExercise { name: string; videos: Video[]; solutions: SolutionResource[]; }
  const getUnifiedExercises = (grade: number, chapterNumber: number): UnifiedExercise[] => {
      const videoExercises = videoData[grade]?.[chapterNumber] || [];
      const swaadhyayExercises = swaadhyayData[grade]?.[chapterNumber] || [];
      const exerciseMap = new Map<string, Partial<UnifiedExercise>>();
      swaadhyayExercises.forEach(ex => { exerciseMap.set(ex.name, { name: ex.name, solutions: ex.solutions }); });
      videoExercises.forEach(ex => { if (exerciseMap.has(ex.name)) { exerciseMap.get(ex.name)!.videos = ex.videos; } else { exerciseMap.set(ex.name, { name: ex.name, videos: ex.videos }); } });
      return Array.from(exerciseMap.values()).map(ex => ({ name: ex.name!, videos: ex.videos || [], solutions: ex.solutions || [] })).sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
  };
  const chapters = useMemo(() => { if (selectedGrade === 9) return std9MathChapters; if (selectedGrade === 10) return std10MathChapters; return []; }, [selectedGrade]);
  const exercises = useMemo(() => { if (selectedGrade && selectedChapter) { return getUnifiedExercises(selectedGrade, selectedChapter.number); } return []; }, [selectedGrade, selectedChapter]);
  const handleSearch = () => { if (selectedGrade && selectedChapter && selectedExercise) { navigate({ page: 'chapter', grade: selectedGrade, chapter: selectedChapter, expandedExercise: selectedExercise }); } };
  const commonSelectClass = "w-full p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none";
  const FormSection: React.FC<{title: string, step: number, children: React.ReactNode, disabled?: boolean}> = ({title, step, children, disabled = false}) => (<div className={`transition-opacity duration-500 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}><h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3"><span className="bg-indigo-500 text-white rounded-full h-7 w-7 inline-flex items-center justify-center mr-3">{step}</span>{title}</h3>{children}</div>);
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg space-y-6 animate-fade-in">
        <FormSection title="ધોરણ પસંદ કરો" step={1}><div className="grid grid-cols-2 gap-4">{[9, 10].map(grade => (<button key={grade} onClick={() => { setSelectedGrade(grade); setSelectedChapter(null); setSelectedExercise(null); }} className={`p-4 rounded-lg font-bold text-2xl transition-all duration-200 ${selectedGrade === grade ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-500 ring-offset-slate-100 dark:ring-offset-slate-800' : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{grade}</button>))}</div></FormSection>
        <FormSection title="પ્રકરણ પસંદ કરો" step={2} disabled={!selectedGrade}><select value={selectedChapter?.number || ''} onChange={(e) => { const chapterNum = parseInt(e.target.value, 10); const chapter = chapters.find(c => c.number === chapterNum) || null; setSelectedChapter(chapter); setSelectedExercise(null); }} className={commonSelectClass}><option value="" disabled>-- Select Chapter --</option>{chapters.map(c => <option key={c.number} value={c.number}>પ્રકરણ {c.number}: {c.name}</option>)}</select></FormSection>
        <FormSection title="સ્વાધ્યાય પસંદ કરો" step={3} disabled={!selectedChapter}><select value={selectedExercise || ''} onChange={(e) => setSelectedExercise(e.target.value)} className={commonSelectClass}><option value="" disabled>-- Select Exercise --</option>{exercises.map(ex => <option key={ex.name} value={ex.name}>{ex.name}</option>)}</select></FormSection>
        <FormSection title="દાખલા નંબર લખો" step={4} disabled={!selectedExercise}><input type="text" value={exampleNumber} onChange={(e) => setExampleNumber(e.target.value)} placeholder="e.g., 5" className={`${commonSelectClass} placeholder-slate-400 dark:placeholder-slate-500`} /></FormSection>
        <button onClick={handleSearch} disabled={!selectedGrade || !selectedChapter || !selectedExercise || !exampleNumber} className="w-full flex items-center justify-center p-4 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"><SearchIcon className="h-6 w-6 mr-2" />Search Solution</button>
    </div>
  );
};

const AiMockTestPage: React.FC<{ navigate: (view: ViewState) => void; }> = ({ navigate }) => {
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    const [selectedChapterName, setSelectedChapterName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chapters = useMemo(() => {
        const baseChapters = selectedGrade === 9 ? std9MathChapters : selectedGrade === 10 ? std10MathChapters : [];
        if (baseChapters.length > 0) {
            return [{ number: 0, name: 'All Chapters' }, ...baseChapters];
        }
        return [];
    }, [selectedGrade]);

    const handleGenerateTest = async () => {
        if (!selectedGrade || !selectedChapterName) return;

        setIsLoading(true);
        setError(null);

        try {
            if ((window as any).aistudio?.hasSelectedApiKey) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await (window as any).aistudio.openSelectKey();
                }
            }

            const questions = await generateMockTest(selectedGrade, selectedChapterName);
            if (questions && questions.length > 0) {
                navigate({ page: 'generated_mock_test', grade: selectedGrade, chapterName: selectedChapterName, questions });
            } else {
                setError("Sorry, I couldn't generate a test for this topic. Please try another one.");
            }
        } catch (err) {
            console.error("Error generating mock test:", err);
            let errorMessage = "An error occurred while generating the test. Please check your connection and try again.";
            const message = err instanceof Error ? err.message : String(err);

            if (message.includes('API key not valid') || message.includes('permission to access')) {
                errorMessage = "The selected API key is not valid. Please click 'Generate Test' again to select a different key.";
            } else if (message.includes('API key is not configured')) {
                errorMessage = "An API key is required for this feature. Please click 'Generate Test' again to select a key.";
            } else if (message.includes("Requested entity was not found")) {
                errorMessage = "The resource was not found. This can happen with an invalid API key. Please click 'Generate Test' again to select a different key.";
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const commonSelectClass = "w-full p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none";
    const FormSection: React.FC<{title: string, step: number, children: React.ReactNode, disabled?: boolean}> = ({title, step, children, disabled = false}) => (<div className={`transition-opacity duration-500 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}><h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3"><span className="bg-indigo-500 text-white rounded-full h-7 w-7 inline-flex items-center justify-center mr-3">{step}</span>{title}</h3>{children}</div>);

    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">Mock Test Generator</h2>
            <FormSection title="ધોરણ પસંદ કરો" step={1}>
                <div className="grid grid-cols-2 gap-4">{[9, 10].map(grade => (<button key={grade} onClick={() => { setSelectedGrade(grade); setSelectedChapterName(''); }} className={`p-4 rounded-lg font-bold text-2xl transition-all duration-200 ${selectedGrade === grade ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-500 ring-offset-slate-100 dark:ring-offset-slate-800' : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{grade}</button>))}</div>
            </FormSection>
            <FormSection title="પ્રકરણ પસંદ કરો" step={2} disabled={!selectedGrade}>
                <select value={selectedChapterName} onChange={(e) => setSelectedChapterName(e.target.value)} className={commonSelectClass}>
                    <option value="" disabled>-- Select Chapter --</option>
                    {chapters.map(c => <option key={c.number} value={c.name}>{c.name === 'All Chapters' ? 'બધા પ્રકરણ' : `પ્રકરણ ${c.number}: ${c.name}`}</option>)}
                </select>
            </FormSection>
            
            {error && <div className="p-3 text-center bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg">{error}</div>}

            <button onClick={handleGenerateTest} disabled={!selectedGrade || !selectedChapterName || isLoading} className="w-full flex items-center justify-center p-4 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none">
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Generating Test...
                    </>
                ) : (
                    <>
                        <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2" />
                        Generate Test
                    </>
                )}
            </button>
        </div>
    );
};

const MockTestResultPopup: React.FC<{
    isOpen: boolean;
    score: number;
    totalQuestions: number;
    onClose: () => void;
    onNewTest: () => void;
}> = ({ isOpen, score, totalQuestions, onClose, onNewTest }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleNewTest = () => {
        setIsClosing(true);
        setTimeout(() => {
            onNewTest();
            setIsClosing(false);
        }, 300);
    };

    if (!isOpen) {
        return null;
    }

    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    const resultMessage = percentage >= 80 ? "Excellent Work!" : percentage >= 50 ? "Good Job!" : "Keep Practicing!";

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" 
            aria-modal="true" 
            role="dialog"
            onClick={handleClose}
        >
            <div 
                className={`w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 text-center transform ${isClosing ? 'animate-fade-out animate-slide-out-to-bottom' : 'animate-fade-in-down'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <AcademicCapIcon className="h-20 w-20 text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Test Result</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mt-2">{resultMessage}</p>

                <div className="my-6">
                    <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-300">
                        {score} 
                        <span className="text-3xl font-semibold text-slate-500 dark:text-slate-400">/ {totalQuestions}</span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={handleClose} 
                        className="w-full p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        Review Answers
                    </button>
                    <button 
                        onClick={handleNewTest} 
                        className="w-full p-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                    >
                        Create New Test
                    </button>
                </div>
            </div>
        </div>
    );
};

const GeneratedMockTestPage: React.FC<{
    grade: number;
    chapterName: string;
    questions: MockTestQuestion[];
    onBack: () => void;
}> = ({ grade, chapterName, questions, onBack }) => {
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showResultPopup, setShowResultPopup] = useState(false);

    const score = useMemo(() => {
        if (!isSubmitted) return 0;
        return questions.reduce((acc, question, index) => {
            return userAnswers[index] === question.correct_answer ? acc + 1 : acc;
        }, 0);
    }, [isSubmitted, userAnswers, questions]);

    const handleSelectAnswer = (questionIndex: number, answer: string) => {
        if (isSubmitted) return;
        setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmit = () => {
        if(Object.keys(userAnswers).length !== questions.length) {
            alert("Please answer all questions before submitting.");
            return;
        }
        setIsSubmitted(true);
        setShowResultPopup(true);
    };

    const getOptionClass = (questionIndex: number, option: string) => {
        if (!isSubmitted) {
            return userAnswers[questionIndex] === option 
                ? 'bg-indigo-200 dark:bg-indigo-900 ring-2 ring-indigo-500' 
                : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700';
        }
        const isCorrect = option === questions[questionIndex].correct_answer;
        const isSelected = userAnswers[questionIndex] === option;
        if(isCorrect) return 'bg-emerald-200 dark:bg-emerald-900 ring-2 ring-emerald-500';
        if(isSelected && !isCorrect) return 'bg-red-200 dark:bg-red-900 ring-2 ring-red-500';
        return 'bg-slate-100 dark:bg-slate-700/50 opacity-70';
    };

    return (
        <>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg space-y-6 animate-fade-in">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {isSubmitted ? 'Review Your Answers' : 'Mock Test'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">ધોરણ {grade} - {chapterName}</p>
                </div>

                <div className="space-y-8">
                    {questions.map((q, index) => (
                        <div key={index} className="border-t border-slate-200 dark:border-slate-700 pt-6">
                            <p className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">{index + 1}. {q.question}</p>
                            <div className="space-y-3">
                                {q.options.map((option, optionIndex) => (
                                    <button
                                        key={optionIndex}
                                        onClick={() => handleSelectAnswer(index, option)}
                                        disabled={isSubmitted}
                                        className={`w-full text-left p-3 rounded-lg font-medium transition-all duration-200 ${getOptionClass(index, option)}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    {isSubmitted ? (
                        <button onClick={onBack} className="w-full flex items-center justify-center p-4 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">
                            <ArrowPathIcon className="h-6 w-6 mr-2"/>
                            Create New Test
                        </button>
                    ) : (
                         <button onClick={handleSubmit} className="w-full flex items-center justify-center p-4 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors">
                            <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2"/>
                            Submit Test
                        </button>
                    )}
                </div>
            </div>
            <MockTestResultPopup
                isOpen={showResultPopup}
                score={score}
                totalQuestions={questions.length}
                onClose={() => setShowResultPopup(false)}
                onNewTest={onBack}
            />
        </>
    );
};


// --- Main App Component (from App.tsx) ---
const App: React.FC = () => {
    const [history, setHistory] = useState<ViewState[]>([{ page: 'home' }]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, title: 'New Mock Test!', description: 'A new mock test for "સંખ્યા પદ્ધતિ" is now available.', timestamp: '5m ago', read: false, link: { page: 'resource', grade: 9, resource: 'mock_tests' } },
        { id: 2, title: 'Video Solution added', description: 'Check out the new video solution for સ્વાધ્યાય 1.3.', timestamp: '1h ago', read: false, link: { page: 'chapter', grade: 9, chapter: { number: 1, name: 'સંખ્યા પદ્ધતિ' } } },
        { id: 3, title: 'Welcome!', description: 'Welcome to Chalo ભણીએ! Explore and learn.', timestamp: '1d ago', read: true },
    ]);
    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) { try { setUser(JSON.parse(loggedInUser)); } catch (e) { console.error("Failed to parse logged in user from localStorage", e); localStorage.removeItem('loggedInUser'); } }
    }, []);
    const currentView = history[history.length - 1];
    const navigate = useCallback((view: ViewState) => { setHistory(prev => [...prev, view]); }, []);
    const goBack = useCallback(() => { if (history.length > 1) { setHistory(prev => prev.slice(0, -1)); } }, [history.length]);
    const resetToHome = useCallback(() => { setHistory([{ page: 'home' }]); }, []);
    const handleShare = useCallback(() => {
        let shareData = { title: 'Chalo ભણીએ !', text: 'Hey! I found this amazing educational app for Gujarat board students called "Chalo ભણીએ !". It has videos, solutions, books, and more. Check it out!', url: window.location.href };
        if (currentView) {
            switch (currentView.page) {
                case 'grade': shareData.title = `ધોરણ ${currentView.grade} Resources | Chalo ભણીએ !`; shareData.text = `Check out the study materials for ધોરણ ${currentView.grade} on Chalo ભણીએ!`; break;
                case 'subject': shareData.title = `ધોરણ ${currentView.grade} ગણિત | Chalo ભણીએ !`; shareData.text = `Check out the math resources for ધોરણ ${currentView.grade} on Chalo ભણીએ!`; break;
                case 'chapter': shareData.title = `પ્રકરણ ${currentView.chapter.number}: ${currentView.chapter.name} | Chalo ભણીએ !`; shareData.text = `Check out the study materials for '${currentView.chapter.name}' on Chalo ભણીએ!`; break;
                case 'resource': const resourceTitle = currentView.resource.charAt(0).toUpperCase() + currentView.resource.slice(1).replace('_', ' '); shareData.title = `${resourceTitle} for ધોરણ ${currentView.grade} | Chalo ભણીએ !`; shareData.text = `Find ${resourceTitle.toLowerCase()} for ધોરણ ${currentView.grade} on the Chalo ભણીએ! app.`; break;
            }
        }
        if (navigator.share) { navigator.share(shareData).catch((error) => console.error('Error sharing:', error)); } else { navigator.clipboard.writeText(shareData.url).then(() => { alert('Link copied to clipboard! You can now share it.'); }).catch(err => { console.error('Failed to copy: ', err); alert('Share feature is not supported on this device or browser.'); }); }
    }, [currentView]);
    const handleGradeSelect = (grade: number) => navigate({ page: 'grade', grade });
    const handleTextbookSelect = () => { if (currentView.page === 'grade') { navigate({ page: 'resource', grade: currentView.grade, resource: 'books' }); } };
    const handleSolutionsSelect = () => { if (currentView.page === 'grade') { navigate({ page: 'subject', grade: currentView.grade }); } };
    const handleChapterSelect = (chapter: Chapter) => { if (currentView.page === 'subject') { navigate({ page: 'chapter', grade: currentView.grade, chapter }); } };
    const handleBottomNav = (navItem: TopLevelPage | 'refresh' | 'share') => {
        switch(navItem) {
            case 'home': resetToHome(); break;
            case 'refresh': window.location.reload(); break;
            case 'share': handleShare(); break;
            case 'videos': navigate({ page: 'chapter', grade: 9, chapter: { number: 1, name: 'સંખ્યા પદ્ધતિ' } }); break;
            case 'swaadhyay': navigate({ page: 'chapter', grade: 9, chapter: { number: 1, name: 'સંખ્યા પદ્ધતિ' } }); break;
        }
    };
    const handleSidebarNav = (page: SidebarPage) => { if (page === 'home') { resetToHome(); } else { navigate({ page }); } setSidebarOpen(false); };
    const handleLogin = (userToLogin: User) => { setUser(userToLogin); localStorage.setItem('loggedInUser', JSON.stringify(userToLogin)); };
    const handleLogout = () => { setUser(null); localStorage.removeItem('loggedInUser'); };
    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = users.findIndex((u: any) => (updatedUser.email && u.email === updatedUser.email) || (updatedUser.mobile && u.mobile === updatedUser.mobile));
        if (userIndex > -1) { const oldUser = users[userIndex]; users[userIndex] = { ...oldUser, ...updatedUser }; localStorage.setItem('registeredUsers', JSON.stringify(users)); }
    };
    const handleMarkNotificationsRead = useCallback((ids: number[] | 'all') => { setNotifications(prev => prev.map(n => (ids === 'all' || ids.includes(n.id)) ? { ...n, read: true } : n)); }, []);
    const handleNotificationClick = useCallback((notification: Notification) => { handleMarkNotificationsRead([notification.id]); if (notification.link) { navigate(notification.link); } }, [handleMarkNotificationsRead, navigate]);
    const { title, showBackButton } = useMemo(() => {
        switch(currentView.page) {
            case 'home': return { title: 'Chalo ભણીએ !', showBackButton: false };
            case 'grade': return { title: `ધોરણ ${currentView.grade}`, showBackButton: true };
            case 'subject': return { title: `ધોરણ ${currentView.grade} ગણિત`, showBackButton: true };
            case 'resource': const resourceTitle = currentView.resource.charAt(0).toUpperCase() + currentView.resource.slice(1); return { title: `${resourceTitle}`, showBackButton: true };
            case 'chapter': return { title: `પ્રકરણ ${currentView.chapter.number}`, showBackButton: true };
            case 'about': return { title: 'About Us', showBackButton: true };
            case 'contact': return { title: 'Contact Us', showBackButton: true };
            case 'privacy': return { title: 'Privacy Policy', showBackButton: true };
            case 'disclaimer': return { title: 'Disclaimer', showBackButton: true };
            case 'example_search': return { title: 'દાખલો શોધો', showBackButton: true };
            case 'google_form': return { title: 'તમારા reviews જણાવો', showBackButton: true };
            case 'ai_mock_test': return { title: 'Mock Test', showBackButton: true };
            case 'generated_mock_test': return { title: 'Mock Test', showBackButton: true };
            default: return { title: 'Chalo ભણીએ !', showBackButton: false };
        }
    }, [currentView]);
    const renderContent = () => {
        switch(currentView.page) {
            case 'home': return <HomePage onGradeSelect={handleGradeSelect} onNavigate={navigate} />;
            case 'grade': return <GradePage grade={currentView.grade} onTextbookSelect={handleTextbookSelect} onSolutionsSelect={handleSolutionsSelect} />;
            case 'subject': return <SubjectPage grade={currentView.grade} onChapterSelect={handleChapterSelect} />;
            case 'resource':
                switch(currentView.resource) {
                    case 'books': return <BooksPage />;
                    case 'old_papers': return <OldPapersPage />;
                    case 'mock_tests': return <MockTestPage />;
                    default: return <HomePage onGradeSelect={handleGradeSelect} onNavigate={navigate} />;
                }
            case 'chapter': return <ChapterDetailPage grade={currentView.grade} chapter={currentView.chapter} expandedExercise={currentView.expandedExercise} />;
            case 'about': return <AboutPage />;
            case 'contact': return <ContactPage />;
            case 'privacy': return <PrivacyPolicyPage />;
            case 'disclaimer': return <DisclaimerPage />;
            case 'example_search': return <ExampleSearchPage navigate={navigate} />;
            case 'google_form': return <GoogleFormPage />;
            case 'ai_mock_test': return <AiMockTestPage navigate={navigate} />;
            case 'generated_mock_test': return <GeneratedMockTestPage grade={currentView.grade} chapterName={currentView.chapterName} questions={currentView.questions} onBack={goBack} />;
            default: return <HomePage onGradeSelect={handleGradeSelect} onNavigate={navigate} />;
        }
    };
    const isFullWidthResourcePage = currentView.page === 'chapter' || currentView.page === 'google_form';
    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen font-sans text-slate-900 dark:text-slate-200">
            <Header title={title} showBackButton={showBackButton} onBack={goBack} onMenuClick={() => setSidebarOpen(true)} notifications={notifications} onMarkNotificationsRead={handleMarkNotificationsRead} onNotificationClick={handleNotificationClick} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} user={user} onLogin={handleLogin} onLogout={handleLogout} onUserUpdate={handleUserUpdate} onSidebarNav={handleSidebarNav} />
            <main className={`pb-24 ${isFullWidthResourcePage ? 'pt-4' : 'container mx-auto p-4'}`}>
                {renderContent()}
            </main>
            <BottomNavBar onNav={handleBottomNav} />
        </div>
    );
};


// --- App Initialization ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);