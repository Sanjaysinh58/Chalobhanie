import React, { useState, useMemo } from 'react';
import { Chapter, ViewState } from '../App.js';
import { SearchIcon } from './icons.js';
import { videoData } from './SolutionDisplay.js';
import { swaadhyayData } from './WrittenSolution.js';

// --- Data ---
const std9MathChapters: Chapter[] = [
  { number: 1, name: 'સંખ્યા પદ્ધતિ' }, { number: 2, name: 'બહુપદીઓ' },
  { number: 3, name: 'યામ ભૂમિતિ' }, { number: 4, name: 'દ્વિચલ સુરેખ સમીકરણો' },
  { number: 5, name: 'યુક્લિડની ભૂમિતિનો પરિચય' }, { number: 6, name: 'રેખાઓ અને ખૂણાઓ' },
  { number: 7, name: 'ત્રિકોણ' }, { number: 8, name: 'ચતુષ્કોણ' },
  { number: 9, name: 'વર્તુળ' }, { number: 10, name: 'હેરોનનું સૂત્ર' },
  { number: 11, name: 'પૃષ્ઠફળ અને ઘનફળ' }, { number: 12, name: 'આંકડાશાસ્ત્ર' },
];

const std10MathChapters: Chapter[] = [
  { number: 1, name: 'વાસ્તવિક સંખ્યાઓ' },
  { number: 2, name: 'બહુપદીઓ' },
  { number: 3, name: 'દ્વિચલ સુરેખ સમીકરણયુગ્મ' },
  { number: 4, name: 'દ્વિઘાત સમીકરણ' },
  { number: 5, name: 'સમાંતર શ્રેણી' },
  { number: 6, name: 'ત્રિકોણ' },
  { number: 7, name: 'યામ ભૂમિતિ' },
  { number: 8, name: 'ત્રિકોણમિતિનો પરિચય' },
  { number: 9, name: 'ત્રિકોણમિતિના ઉપયોગો' },
  { number: 10, name: 'વર્તુળ' },
  { number: 11, name: 'વર્તુળ સંબંધિત ક્ષેત્રફળ' },
  { number: 12, name: 'પૃષ્ઠફળ અને ઘનફળ' },
  { number: 13, name: 'આંકડાશાસ્ત્ર' },
  { number: 14, name: 'સંભાવના' },
];

interface Video { name: string; youtubeUrl: string; }
interface SolutionResource { name: string; pdfUrl: string; }
interface UnifiedExercise {
  name: string;
  videos: Video[];
  solutions: SolutionResource[];
}

const getUnifiedExercises = (grade: number, chapterNumber: number): UnifiedExercise[] => {
    const videoExercises = videoData[grade]?.[chapterNumber] || [];
    const swaadhyayExercises = swaadhyayData[grade]?.[chapterNumber] || [];
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
};

// --- Component ---

interface ExampleSearchPageProps {
  navigate: (view: ViewState) => void;
}

const FormSection: React.FC<{title: string, step: number, children: React.ReactNode, disabled?: boolean}> = ({title, step, children, disabled = false}) => (
    <div className={`transition-opacity duration-500 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            <span className="bg-indigo-500 text-white rounded-full h-7 w-7 inline-flex items-center justify-center mr-3">{step}</span>
            {title}
        </h3>
        {children}
    </div>
);


const ExampleSearchPage: React.FC<ExampleSearchPageProps> = ({ navigate }) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exampleNumber, setExampleNumber] = useState('');

  const chapters = useMemo(() => {
    if (selectedGrade === 9) return std9MathChapters;
    if (selectedGrade === 10) return std10MathChapters;
    return [];
  }, [selectedGrade]);

  const exercises = useMemo(() => {
    if (selectedGrade && selectedChapter) {
        return getUnifiedExercises(selectedGrade, selectedChapter.number);
    }
    return [];
  }, [selectedGrade, selectedChapter]);

  const handleSearch = () => {
      if (selectedGrade && selectedChapter && selectedExercise) {
          navigate({
              page: 'chapter',
              grade: selectedGrade,
              chapter: selectedChapter,
              expandedExercise: selectedExercise
          });
      }
  };

  const commonSelectClass = "w-full p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none";

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg space-y-6 animate-fade-in">
        <FormSection title="ધોરણ પસંદ કરો" step={1}>
            <div className="grid grid-cols-2 gap-4">
                {[9, 10].map(grade => (
                    <button key={grade} onClick={() => { setSelectedGrade(grade); setSelectedChapter(null); setSelectedExercise(null); }} className={`p-4 rounded-lg font-bold text-2xl transition-all duration-200 ${selectedGrade === grade ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-500 ring-offset-slate-100 dark:ring-offset-slate-800' : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {grade}
                    </button>
                ))}
            </div>
        </FormSection>

        <FormSection title="પ્રકરણ પસંદ કરો" step={2} disabled={!selectedGrade}>
            <select
                value={selectedChapter?.number || ''}
                onChange={(e) => {
                    const chapterNum = parseInt(e.target.value, 10);
                    const chapter = chapters.find(c => c.number === chapterNum) || null;
                    setSelectedChapter(chapter);
                    setSelectedExercise(null);
                }}
                className={commonSelectClass}
            >
                <option value="" disabled>-- Select Chapter --</option>
                {chapters.map(c => <option key={c.number} value={c.number}>પ્રકરણ {c.number}: {c.name}</option>)}
            </select>
        </FormSection>

        <FormSection title="સ્વાધ્યાય પસંદ કરો" step={3} disabled={!selectedChapter}>
            <select
                value={selectedExercise || ''}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className={commonSelectClass}
            >
                <option value="" disabled>-- Select Exercise --</option>
                {exercises.map(ex => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
            </select>
        </FormSection>

        <FormSection title="દાખલા નંબર લખો" step={4} disabled={!selectedExercise}>
            <input
                type="text"
                value={exampleNumber}
                onChange={(e) => setExampleNumber(e.target.value)}
                placeholder="e.g., 5"
                className={`${commonSelectClass} placeholder-slate-400 dark:placeholder-slate-500`}
            />
        </FormSection>

        <button
            onClick={handleSearch}
            disabled={!selectedGrade || !selectedChapter || !selectedExercise || !exampleNumber}
            className="w-full flex items-center justify-center p-4 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
        >
            <SearchIcon className="h-6 w-6 mr-2" />
            Search Solution
        </button>
    </div>
  );
};

export default ExampleSearchPage;