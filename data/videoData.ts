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
