import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Award, ArrowRight, ArrowLeft } from 'lucide-react';
import { Address, AnswerInput, Quiz, QuizResultInput } from '../../../types/quiz';
import { Button } from '~/components/ui/button';
import useStorage from '../hooks/useStorage';
import { Hex, hexToString } from 'viem';
import { formatTime } from '../utilities';

export const CountDown = ({quiz, handleQuizComplete}: {quiz: Quiz, handleQuizComplete?: () => void}) => {
  const [ timeLeft, setTimeLeft ] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : 0);

  // Start the ounter
  useEffect(() => {
    if (quiz && quiz.timeLimit && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, handleQuizComplete, quiz]);

  return(
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-mono font-semibold ${
      timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-brand-gradient text-white'
    }`}>
      <Clock className="w-4 h-4" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  )
}

export const QuizInterface = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerInput[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerInput | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { quiz, formattedData: { profileQuizzes }, sethash, onComplete, onBack } = useStorage();
  const [startTime] = useState(Date.now());

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  React.useEffect(() => { 
    sethash(quiz.id as Hex);
  }, [quiz, sethash]);

  // Handle select answer
  const handleAnswerSelect = (answerIndex: number, hash: Address, isUserSelected: boolean) => {
    if (!showResult) {
      setSelectedAnswer({questionHash: hash, isUserSelected, selected: answerIndex});
    }
  };

  // Search for a question using its hashed value from the list of answered questions to prevent abuse 
  // by ensure that learners don't get rewarded for the questions they've previously attempted in a week.
  const screenQuiz = (hash: Hex) => {
    let taken = false;
    if(profileQuizzes.length > 0){
      profileQuizzes.forEach(({answers: answs}) => {
        for(let i = 0; i < answs.length; i++) {
          const questionHash = hexToString(answs[i].questionHash as Hex);
          if(questionHash?.toLowerCase() === hash?.toLowerCase()){
            taken = true;
            break;
          }
        }
      })
    }
    return taken;
  }

  // Handles request to display next question
  const handleNextQuestion = () => {
    const answersCopy =  answers;
    if (selectedAnswer !== null) {
      answersCopy.push(selectedAnswer);
    } else {
      answersCopy.push({questionHash: currentQuestion?.hash, isUserSelected: false, selected: 0});
    }
  
    setAnswers(answersCopy);
    if (isLastQuestion) {
      handleQuizComplete(answersCopy);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  // Return ti view the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      const prevQuestion = quiz.questions[currentQuestionIndex - 1];
      const selected = answers.filter(({questionHash}) => questionHash.toLowerCase() === prevQuestion.hash.toLowerCase());
      setSelectedAnswer(selected[0] ?? null);
      setShowResult(false);
    }
  };

  // Finalize quiz completion
  const handleQuizComplete = (finalAnswers = answers) => {
    const score = quiz.questions.reduce((total, question) => {
      const userAnswer = finalAnswers[question.id]; 
      const attempted = screenQuiz(userAnswer?.questionHash);
      return total + (userAnswer.selected === question.correctAnswer && !attempted? question.points : 0);
    }, 0);

    const result : QuizResultInput = {
      other: {
        score: Math.ceil(score),
        totalPoints: quiz.totalPoints,
        percentage: Math.round((score / quiz.totalPoints) * 100),
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        completedAt: new Date().toString(),
        quizId: quiz.id,
        title: quiz.title,
      },
      answers
    }
    // console.log("Reult", result.other.title);
    onComplete(result);
  };

  const showAnswerResult = () => {
    setTimeout(() => {
      handleNextQuestion();
    }, 300);
  };

  // // Start the ounter
  // useEffect(() => {
  //   if (quiz && quiz.timeLimit && timeLeft > 0) {
  //     const timer = setInterval(() => {
  //       setTimeLeft(prev => {
  //         if (prev <= 1) {
  //           handleQuizComplete();
  //           return 0;
  //         }
  //         return prev - 1;
  //       });
  //     }, 1000);

  //     return () => clearInterval(timer);
  //   }
  // }, [timeLeft, handleQuizComplete, quiz]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-6 animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gradient capitalize">
                {quiz.title}
              </h1>
            </div>
            {quiz.timeLimit && <CountDown quiz={quiz} handleQuizComplete={handleQuizComplete} />}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-brand-gradient h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-card rounded-2xl p-8 animate-fade-in">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                currentQuestion?.difficulty === 'easy' ? 'bg-green-100 text-green-800 border-green-200' :
                currentQuestion?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}>
                {currentQuestion?.difficulty.charAt(0).toUpperCase() + currentQuestion?.difficulty.slice(1)}
              </span>
              <div className="flex items-center space-x-2 text-purple-600">
                <Award className="w-5 h-5" />
                <span className="font-semibold text-lg">{Math.round(currentQuestion?.points)} pts</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 leading-relaxed mb-2">
              {currentQuestion?.question}
            </h2>
            <p className="text-sm text-gray-500">{currentQuestion?.category}</p>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
            {currentQuestion?.options?.map((option, index) => {
              const isSelected = selectedAnswer?.selected === index;
              const isCorrect = index === currentQuestion?.correctAnswer;
              const isWrong = showResult && isSelected && !isCorrect;
              
              return (
                <button
                  key={option}
                  onClick={() => !showResult && handleAnswerSelect(index, currentQuestion?.hash, true)}
                  disabled={showResult}
                  className={`
                    w-full p-4 rounded-xl text-left transition-all duration-300 border-2
                    ${!showResult && !isSelected ? 'bg-white/50 border-gray-200 hover:border-purple-300 hover:bg-white/70' : ''}
                    ${!showResult && isSelected ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-transparent' : ''}
                    ${showResult && isCorrect ? 'bg-green-100 border-green-300 text-green-800' : ''}
                    ${showResult && isWrong ? 'bg-red-100 border-red-300 text-red-800' : ''}
                    ${showResult && !isSelected && !isCorrect ? 'bg-gray-100 border-gray-200 text-gray-600' : ''}
                    group relative overflow-hidden
                  `}
                  // className={`w-full h-12 flex justify-start group ${isSelected && "bg-gradient-to-r from-cyan-600 to-purple-600 text-white "} p-8 rounded-xl text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25`}
                >
                  {/* <h3 className='items-center text-lg '>{`${option.label} - `}</h3> */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {showResult && isWrong && <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && currentQuestion?.explanation && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
              <p className="text-blue-700">{currentQuestion?.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex justify-between items-center gap-4">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="w-2/4 flex items-center gap-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {!showResult && (
              <Button
                onClick={showAnswerResult}
                disabled={selectedAnswer === null}
                className="w-2/4 flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLastQuestion ? 'Complete Quiz' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};