import React from 'react'
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '@/components/ui/progress';
import { Steps } from './ArticleReading';

function Quiz(props : QuizProps) {
    const {
        setCurrentQuizIndex,
        setUserAnswers,
        generateQuiz, 
        setCurrentStep, 
        calculateResults,
        currentQuizIndex,
        quizzes,
        userAnswers,
    } = props;

    return (
       <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Knowledge Test
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    {currentQuizIndex + 1} of {quizzes.length}
                </span>
            </div>

            <Progress 
                value={((currentQuizIndex + 1) / quizzes.length) * 100} 
                className="w-full"
            />

            <Card className="border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {quizzes[currentQuizIndex].question}
                    </h4>
                    <div className="space-y-2">
                        {quizzes[currentQuizIndex].options.map((option, index) => (
                            <Button
                                key={index}
                                variant={userAnswers[currentQuizIndex] === index ? "default" : "outline"}
                                onClick={() => {
                                    const newAnswers = [...userAnswers];
                                    newAnswers[currentQuizIndex] = index;
                                    setUserAnswers(newAnswers);
                                }}
                                className="w-full justify-start text-left"
                            >
                                {String.fromCharCode(65 + index)}. {option}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => setCurrentQuizIndex(Math.max(0, currentQuizIndex - 1))}
                    disabled={currentQuizIndex === 0}
                    className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600"
                >
                    Previous
                </Button>
                
                <Button
                    onClick={() => {
                        if (currentQuizIndex < quizzes.length - 1) {
                            setCurrentQuizIndex(currentQuizIndex + 1);
                        } else {
                            calculateResults();
                        }
                    }}
                    disabled={userAnswers[currentQuizIndex] === undefined}
                    className="bg-primary-500 text-black hover:bg-primary-400"
                >
                    {currentQuizIndex < quizzes.length - 1 ? 'Next' : 'Finish Quiz'}
                </Button>
            </div>
        </div>
    )
}

export default Quiz

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizProps {
    setUserAnswers: (arg: number[]) => void;
    generateQuiz: () => void;
    setCurrentStep: (arg: Steps) => void;
    setCurrentQuizIndex: (ar: number) => void;
    calculateResults: () => void;
    currentQuizIndex: number;
    quizzes: QuizQuestion[];
    userAnswers: number[];

}