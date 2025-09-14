// import React, { useState } from 'react';
// import { Brain } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';

// // AI Tutor Component
// export default function AITutor({ campaign, onClose }: { campaign: any; onClose: () => void }){
//     const [selectedTopic, setSelectedTopic] = useState('');
//     const [article, setArticle] = useState('');
//     const [quizzes, setQuizzes] = useState<any[]>([]);
//     const [currentQuiz, setCurrentQuiz] = useState(0);
//     const [answers, setAnswers] = useState<number[]>([]);
//     const [score, setScore] = useState(0);
//     const [isGenerating, setIsGenerating] = useState(false);
//     const [showResults, setShowResults] = useState(false);
  
//     const topics = ['Solidity', 'Celo', 'Divvi', 'Web3', 'DeFi', 'Smart Contracts'];
  
//     const generateArticle = async () => {
//       if (!selectedTopic) return;
      
//       setIsGenerating(true);
//       // Simulate API call delay
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // Mock article content - replace with actual AI generation
//       const mockArticle = `# ${selectedTopic} Fundamentals
  
//   ${selectedTopic} is a revolutionary technology that has transformed the way we think about digital systems. In this comprehensive guide, we'll explore the core concepts, practical applications, and future potential of ${selectedTopic}.
  
//   ## Key Concepts
  
//   The fundamental principles of ${selectedTopic} include decentralization, transparency, and immutability. These characteristics make it particularly suitable for applications requiring trust and security.
  
//   ## Practical Applications
  
//   ${selectedTopic} has found applications in various industries, from finance to healthcare, demonstrating its versatility and potential for widespread adoption.
  
//   ## Future Outlook
  
//   As ${selectedTopic} continues to evolve, we can expect to see even more innovative applications and use cases emerge, shaping the future of technology.
  
//   ## Getting Started
  
//   To begin your journey with ${selectedTopic}, start by understanding the basic concepts and gradually work your way up to more complex implementations.`;
  
//       setArticle(mockArticle);
//       setIsGenerating(false);
//     };
  
//     const generateQuizzes = async () => {
//       setIsGenerating(true);
//       // Simulate API call delay
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // Mock quiz data - replace with actual AI generation
//       const mockQuizzes = [
//         {
//           question: `What is the primary benefit of ${selectedTopic}?`,
//           options: ['Speed', 'Decentralization', 'Cost', 'Simplicity'],
//           correct: 1
//         },
//         {
//           question: `Which industry has ${selectedTopic} most impacted?`,
//           options: ['Agriculture', 'Finance', 'Education', 'Manufacturing'],
//           correct: 1
//         },
//         {
//           question: `What makes ${selectedTopic} secure?`,
//           options: ['Encryption', 'Immutability', 'Speed', 'Cost'],
//           correct: 1
//         },
//         {
//           question: `How does ${selectedTopic} ensure transparency?`,
//           options: ['Private keys', 'Public ledgers', 'Centralized control', 'Encryption'],
//           correct: 1
//         },
//         {
//           question: `What is a key feature of ${selectedTopic}?`,
//           options: ['Centralization', 'Trustlessness', 'High costs', 'Slow processing'],
//           correct: 1
//         }
//       ];
      
//       setQuizzes(mockQuizzes);
//       setIsGenerating(false);
//     };
  
//     const handleAnswer = (answerIndex: number) => {
//       const newAnswers = [...answers];
//       newAnswers[currentQuiz] = answerIndex;
//       setAnswers(newAnswers);
//     };
  
//     const calculateScore = () => {
//       let correct = 0;
//       quizzes.forEach((quiz, index) => {
//         if (answers[index] === quiz.correct) correct++;
//       });
//       setScore(Math.round((correct / quizzes.length) * 100));
//       setShowResults(true);
//     };
  
//     return (
//       <Dialog open={true} onOpenChange={onClose}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <Brain className="w-6 h-6 text-purple-600" />
//               AI Tutor - {campaign.name}
//             </DialogTitle>
//             <DialogDescription>
//               Learn with our intelligent AI tutor and test your knowledge
//             </DialogDescription>
//           </DialogHeader>
  
//           <div className="space-y-6">
//             {!selectedTopic && (
//               <div>
//                 <Label className="text-lg font-semibold mb-4 block">Choose a topic to learn:</Label>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                   {topics.map((topic) => (
//                     <Button
//                       key={topic}
//                       variant={selectedTopic === topic ? "default" : "outline"}
//                       onClick={() => setSelectedTopic(topic)}
//                       className="h-12"
//                     >
//                       {topic}
//                     </Button>
//                   ))}
//                 </div>
//               </div>
//             )}
  
//             {selectedTopic && !article && (
//               <div className="text-center">
//                 <Button onClick={generateArticle} disabled={isGenerating} className="mb-4">
//                   {isGenerating ? 'Generating Article...' : 'Generate Article'}
//                 </Button>
//               </div>
//             )}
  
//             {article && (
//               <div>
//                 <div className="prose max-w-none mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                   <div dangerouslySetInnerHTML={{ __html: article.replace(/\n/g, '<br/>') }} />
//                 </div>
//                 <Button onClick={generateQuizzes} disabled={isGenerating}>
//                   {isGenerating ? 'Generating Quizzes...' : 'Take Quiz'}
//                 </Button>
//               </div>
//             )}
  
//             {quizzes.length > 0 && !showResults && (
//               <div>
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-lg font-semibold">Quiz Progress</h3>
//                   <span>{currentQuiz + 1} of {quizzes.length}</span>
//                 </div>
//                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
//                   <div 
//                     className="bg-purple-600 h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${((currentQuiz + 1) / quizzes.length) * 100}%` }}
//                   ></div>
//                 </div>
                
//                 <div className="space-y-4">
//                   <h4 className="text-lg font-medium">{quizzes[currentQuiz].question}</h4>
//                   <div className="space-y-2">
//                     {quizzes[currentQuiz].options.map((option: string, index: number) => (
//                       <Button
//                         key={index}
//                         variant={answers[currentQuiz] === index ? "default" : "outline"}
//                         onClick={() => handleAnswer(index)}
//                         className="w-full justify-start"
//                       >
//                         {String.fromCharCode(65 + index)}. {option}
//                       </Button>
//                     ))}
//                   </div>
                  
//                   <div className="flex justify-between">
//                     <Button
//                       variant="outline"
//                       onClick={() => setCurrentQuiz(Math.max(0, currentQuiz - 1))}
//                       disabled={currentQuiz === 0}
//                     >
//                       Previous
//                     </Button>
//                     <Button
//                       onClick={() => {
//                         if (currentQuiz < quizzes.length - 1) {
//                           setCurrentQuiz(currentQuiz + 1);
//                         } else {
//                           calculateScore();
//                         }
//                       }}
//                     >
//                       {currentQuiz < quizzes.length - 1 ? 'Next' : 'Finish Quiz'}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             )}
  
//             {showResults && (
//               <div className="text-center space-y-4">
//                 <div className="text-6xl">🎉</div>
//                 <h3 className="text-2xl font-bold">Quiz Complete!</h3>
//                 <div className="text-4xl font-bold text-green-600">{score}%</div>
//                 <p className="text-gray-600 dark:text-gray-300">
//                   You answered {score > 0 ? Math.round((score / 100) * quizzes.length) : 0} out of {quizzes.length} questions correctly
//                 </p>
//                 <div className="flex gap-2 justify-center">
//                   <Button onClick={() => {
//                     setShowResults(false);
//                     setCurrentQuiz(0);
//                     setAnswers([]);
//                     setScore(0);
//                   }}>
//                     Retake Quiz
//                   </Button>
//                   <Button onClick={onClose}>
//                     Close
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
// };
  