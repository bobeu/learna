import { Quiz } from '../types/quiz';

export const quizzes: Quiz[] = [
  {
    id: '1',
    title: 'General Knowledge Challenge',
    description: 'Test your knowledge across various topics including science, history, geography, and current events.',
    difficulty: 'medium',
    category: 'General Knowledge',
    imageUrl: 'https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=800',
    timeLimit: 15,
    totalPoints: 100,
    createdAt: new Date(),
    questions: [
      {
        id: '1',
        question: 'What is the capital of Australia?',
        options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
        correctAnswer: 2,
        difficulty: 'medium',
        category: 'Geography',
        points: 20,
        explanation: 'Canberra is the capital city of Australia, located in the Australian Capital Territory.'
      },
      {
        id: '2',
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 1,
        difficulty: 'easy',
        category: 'Science',
        points: 20,
        explanation: 'Mars is called the Red Planet due to iron oxide (rust) on its surface.'
      },
      {
        id: '3',
        question: 'Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
        correctAnswer: 2,
        difficulty: 'easy',
        category: 'Art',
        points: 20,
        explanation: 'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.'
      },
      {
        id: '4',
        question: 'What is the largest ocean on Earth?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correctAnswer: 3,
        difficulty: 'easy',
        category: 'Geography',
        points: 20,
        explanation: 'The Pacific Ocean is the largest ocean, covering about 46% of the water surface.'
      },
      {
        id: '5',
        question: 'In which year did World War II end?',
        options: ['1944', '1945', '1946', '1947'],
        correctAnswer: 1,
        difficulty: 'medium',
        category: 'History',
        points: 20,
        explanation: 'World War II ended in 1945 with the surrender of Japan in September.'
      }
    ]
  },
  {
    id: '2',
    title: 'Science & Technology',
    description: 'Explore the fascinating world of science, technology, and innovation with challenging questions.',
    difficulty: 'hard',
    category: 'Science',
    imageUrl: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800',
    timeLimit: 20,
    totalPoints: 150,
    createdAt: new Date(),
    questions: [
      {
        id: '6',
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctAnswer: 2,
        difficulty: 'medium',
        category: 'Chemistry',
        points: 30,
        explanation: 'Au comes from the Latin word "aurum" meaning gold.'
      },
      {
        id: '7',
        question: 'Which programming language was created by Guido van Rossum?',
        options: ['Java', 'Python', 'C++', 'JavaScript'],
        correctAnswer: 1,
        difficulty: 'medium',
        category: 'Technology',
        points: 30,
        explanation: 'Python was created by Guido van Rossum and first released in 1991.'
      },
      {
        id: '8',
        question: 'What is the speed of light in vacuum?',
        options: ['299,792,458 m/s', '300,000,000 m/s', '299,000,000 m/s', '301,000,000 m/s'],
        correctAnswer: 0,
        difficulty: 'hard',
        category: 'Physics',
        points: 30,
        explanation: 'The speed of light in vacuum is exactly 299,792,458 meters per second.'
      },
      {
        id: '9',
        question: 'Which organ in the human body produces insulin?',
        options: ['Liver', 'Kidney', 'Pancreas', 'Stomach'],
        correctAnswer: 2,
        difficulty: 'medium',
        category: 'Biology',
        points: 30,
        explanation: 'The pancreas produces insulin to regulate blood sugar levels.'
      },
      {
        id: '10',
        question: 'What does DNA stand for?',
        options: ['Deoxyribonucleic Acid', 'Deoxyribose Nucleic Acid', 'Deoxy Nucleic Acid', 'Deoxyribonuclear Acid'],
        correctAnswer: 0,
        difficulty: 'medium',
        category: 'Biology',
        points: 30,
        explanation: 'DNA stands for Deoxyribonucleic Acid, which carries genetic information.'
      }
    ]
  },
  {
    id: '3',
    title: 'History & Culture',
    description: 'Journey through time and explore different cultures, civilizations, and historical events.',
    difficulty: 'medium',
    category: 'History',
    imageUrl: 'https://images.pexels.com/photos/1166644/pexels-photo-1166644.jpeg?auto=compress&cs=tinysrgb&w=800',
    timeLimit: 18,
    totalPoints: 120,
    createdAt: new Date(),
    questions: [
      {
        id: '11',
        question: 'Which ancient wonder of the world was located in Alexandria?',
        options: ['Hanging Gardens', 'Lighthouse of Alexandria', 'Colossus of Rhodes', 'Temple of Artemis'],
        correctAnswer: 1,
        difficulty: 'medium',
        category: 'Ancient History',
        points: 24,
        explanation: 'The Lighthouse of Alexandria was one of the Seven Wonders of the Ancient World.'
      },
      {
        id: '12',
        question: 'Who was the first person to walk on the moon?',
        options: ['Buzz Aldrin', 'Neil Armstrong', 'John Glenn', 'Alan Shepard'],
        correctAnswer: 1,
        difficulty: 'easy',
        category: 'Space History',
        points: 24,
        explanation: 'Neil Armstrong was the first person to walk on the moon on July 20, 1969.'
      },
      {
        id: '13',
        question: 'Which empire was ruled by Julius Caesar?',
        options: ['Greek Empire', 'Roman Empire', 'Persian Empire', 'Byzantine Empire'],
        correctAnswer: 1,
        difficulty: 'easy',
        category: 'Ancient History',
        points: 24,
        explanation: 'Julius Caesar was a Roman general and statesman who ruled the Roman Empire.'
      },
      {
        id: '14',
        question: 'In which year did the Berlin Wall fall?',
        options: ['1987', '1988', '1989', '1990'],
        correctAnswer: 2,
        difficulty: 'medium',
        category: 'Modern History',
        points: 24,
        explanation: 'The Berlin Wall fell on November 9, 1989, marking the end of the Cold War era.'
      },
      {
        id: '15',
        question: 'Which civilization built Machu Picchu?',
        options: ['Aztec', 'Maya', 'Inca', 'Olmec'],
        correctAnswer: 2,
        difficulty: 'medium',
        category: 'Ancient Civilizations',
        points: 24,
        explanation: 'Machu Picchu was built by the Inca civilization in the 15th century.'
      }
    ]
  },
  {
    id: '4',
    title: 'Sports & Entertainment',
    description: 'Test your knowledge of sports, movies, music, and popular culture from around the world.',
    difficulty: 'easy',
    category: 'Entertainment',
    imageUrl: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800',
    timeLimit: 12,
    totalPoints: 80,
    createdAt: new Date(),
    questions: [
      {
        id: '16',
        question: 'How many players are on a basketball team on the court at one time?',
        options: ['4', '5', '6', '7'],
        correctAnswer: 1,
        difficulty: 'easy',
        category: 'Sports',
        points: 16,
        explanation: 'Each basketball team has 5 players on the court at any given time.'
      },
      {
        id: '17',
        question: 'Which movie won the Academy Award for Best Picture in 2020?',
        options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
        correctAnswer: 2,
        difficulty: 'medium',
        category: 'Movies',
        points: 16,
        explanation: 'Parasite won the Academy Award for Best Picture in 2020.'
      },
      {
        id: '18',
        question: 'Which sport is known as "The Beautiful Game"?',
        options: ['Basketball', 'Tennis', 'Football/Soccer', 'Baseball'],
        correctAnswer: 2,
        difficulty: 'easy',
        category: 'Sports',
        points: 16,
        explanation: 'Football (Soccer) is often referred to as "The Beautiful Game".'
      },
      {
        id: '19',
        question: 'Who composed "The Four Seasons"?',
        options: ['Mozart', 'Beethoven', 'Vivaldi', 'Bach'],
        correctAnswer: 2,
        difficulty: 'medium',
        category: 'Music',
        points: 16,
        explanation: 'Antonio Vivaldi composed "The Four Seasons" in 1723.'
      },
      {
        id: '20',
        question: 'Which streaming platform created the series "Stranger Things"?',
        options: ['Amazon Prime', 'Netflix', 'Hulu', 'Disney+'],
        correctAnswer: 1,
        difficulty: 'easy',
        category: 'TV Shows',
        points: 16,
        explanation: 'Netflix created and produced the popular series "Stranger Things".'
      }
    ]
  }
];