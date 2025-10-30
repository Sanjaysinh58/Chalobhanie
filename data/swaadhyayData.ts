interface SolutionResource {
  name: string;
  pdfUrl: string;
}

interface SwaadhyayExercise {
  name: string;
  solutions: SolutionResource[];
}

const createChapterExercises = (exerciseNames: string[]): SwaadhyayExercise[] => {
  return exerciseNames.map(name => ({
    name,
    solutions: [
      { name: 'સંપૂર્ણ સ્વાધ્યાય ઉકેલ', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ]
  }));
};

export const swaadhyayData: { [grade: number]: { [chapter: number]: SwaadhyayExercise[] } } = {
  9: { // Grade 9
    1: createChapterExercises(['સ્વાધ્યાય 1.1', 'સ્વાધ્યાય 1.2', 'સ્વાધ્યાય 1.3', 'સ્વાધ્યાય 1.4', 'સ્વાધ્યાય 1.5']),
    2: createChapterExercises(['સ્વાધ્યાય 2.1', 'સ્વાધ્યાય 2.2', 'સ્વાધ્યાય 2.3', 'સ્વાધ્યાય 2.4', 'સ્વાધ્યાય 2.5']),
    3: createChapterExercises(['સ્વાધ્યાય 3.1', 'સ્વાધ્યાય 3.2', 'સ્વાધ્યાય 3.3']),
    4: createChapterExercises(['સ્વાધ્યાય 4.1', 'સ્વાધ્યાય 4.2', 'સ્વાધ્યાય 4.3', 'સ્વાધ્યાય 4.4']),
    5: createChapterExercises(['સ્વાધ્યાય 5.1', 'સ્વાધ્યાય 5.2']),
    6: createChapterExercises(['સ્વાધ્યાય 6.1', 'સ્વાધ્યાય 6.2', 'સ્વાધ્યાય 6.3']),
    7: createChapterExercises(['સ્વાધ્યાય 7.1', 'સ્વાધ્યાય 7.2', 'સ્વાધ્યાય 7.3', 'સ્વાધ્યાય 7.4', 'સ્વાધ્યાય 7.5']),
    8: createChapterExercises(['સ્વાધ્યાય 8.1', 'સ્વાધ્યાય 8.2']),
    9: createChapterExercises(['સ્વાધ્યાય 9.1', 'સ્વાધ્યાય 9.2', 'સ્વાધ્યાય 9.3', 'સ્વાધ્યાય 9.4']),
    10: createChapterExercises(['સ્વાધ્યાય 10.1', 'સ્વાધ્યાય 10.2', 'સ્વાધ્યાય 10.3', 'સ્વાધ્યાય 10.4', 'સ્વાધ્યાય 10.5', 'સ્વાધ્યાય 10.6']),
    11: createChapterExercises(['સ્વાધ્યાય 11.1', 'સ્વાધ્યાય 11.2']),
    12: createChapterExercises(['સ્વાધ્યાય 12.1', 'સ્વાધ્યાય 12.2']),
  },
  10: { // Grade 10
    1: createChapterExercises(['સ્વાધ્યાય 1.1', 'સ્વાધ્યાય 1.2', 'સ્વાધ્યાય 1.3', 'સ્વાધ્યાય 1.4']),
    2: createChapterExercises(['સ્વાધ્યાય 2.1', 'સ્વાધ્યાય 2.2', 'સ્વાધ્યાય 2.3']),
    3: createChapterExercises(['સ્વાધ્યાય 3.1', 'સ્વાધ્યાય 3.2', 'સ્વાધ્યાય 3.3', 'સ્વાધ્યાય 3.4', 'સ્વાધ્યાય 3.5', 'સ્વાધ્યાય 3.6']),
    4: createChapterExercises(['સ્વાધ્યાય 4.1', 'સ્વાધ્યાય 4.2', 'સ્વાધ્યાય 4.3', 'સ્વાધ્યાય 4.4']),
    5: createChapterExercises(['સ્વાધ્યાય 5.1', 'સ્વાધ્યાય 5.2', 'સ્વાધ્યાય 5.3', 'સ્વાધ્યાય 5.4']),
    6: createChapterExercises(['સ્વાધ્યાય 6.1', 'સ્વાધ્યાય 6.2', 'સ્વાધ્યાય 6.3', 'સ્વાધ્યાય 6.4', 'સ્વાધ્યાય 6.5']),
    7: createChapterExercises(['સ્વાધ્યાય 7.1', 'સ્વાધ્યાય 7.2', 'સ્વાધ્યાય 7.3', 'સ્વાધ્યાય 7.4']),
    8: createChapterExercises(['સ્વાધ્યાય 8.1', 'સ્વાધ્યાય 8.2', 'સ્વાધ્યાય 8.3', 'સ્વાધ્યાય 8.4']),
    9: createChapterExercises(['સ્વાધ્યાય 9.1', 'સ્વાધ્યાય 9.2']),
    10: createChapterExercises(['સ્વાધ્યાય 10.1', 'સ્વાધ્યાય 10.2']),
    11: createChapterExercises(['સ્વાધ્યાય 11.1', 'સ્વાધ્યાય 11.2', 'સ્વાધ્યાય 11.3']),
    12: createChapterExercises(['સ્વાધ્યાય 12.1', 'સ્વાધ્યાય 12.2', 'સ્વાધ્યાય 12.3', 'સ્વાધ્યાય 12.4', 'સ્વાધ્યાય 12.5']),
    13: createChapterExercises(['સ્વાધ્યાય 13.1', 'સ્વાધ્યાય 13.2', 'સ્વાધ્યાય 13.3', 'સ્વાધ્યાય 13.4']),
    14: createChapterExercises(['સ્વાધ્યાય 14.1', 'સ્વાધ્યાય 14.2']),
  },
};
