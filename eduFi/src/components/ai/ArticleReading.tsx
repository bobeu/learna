import React from 'react'
import { Button } from '../ui/button';
import { BookOpen, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

function ArticleReading(props : ArticleReadingProps) {
    const {
        generateQuiz, 
        setCurrentStep, 
        selectedTopicTitle, 
        articleContent,
        articleTitle,
        readingTime, 
        isGenerating, 
        isArticleReady
    } = props;

    const handleStartQuiz = () => {
        generateQuiz();
        setCurrentStep('quiz');
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedTopicTitle || ''}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    {readingTime || 0} min read
                </div>
            </div>

            {isGenerating && (
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                    <p className="text-gray-600 dark:text-gray-300">Generating content...</p>
                </div>
            )}

            {isArticleReady && (
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-4 sm:p-6 overflow-x-hidden">
                        <div className="prose max-w-none text-gray-900 dark:text-white break-words overflow-x-hidden">
                            <h1 className="text-xl sm:text-2xl font-bold mb-4 break-words">{articleTitle}</h1>
                            <div className="whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                                {articleContent}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isArticleReady && (
                <div className="text-center">
                    <Button 
                        onClick={handleStartQuiz}
                        disabled={isGenerating}
                        className="bg-primary-500 text-black hover:bg-primary-400"
                    >
                        {
                            isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating Quiz...
                                </>
                            ) : (
                                <>
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Start Quiz
                                </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default ArticleReading

export type Steps = 'topics' | 'article' | 'quiz' | 'results';
export interface ArticleReadingProps {
    generateQuiz: () => void;
    setCurrentStep: (arg: Steps) => void;
    selectedTopicTitle?: string;
    readingTime?: number;
    isGenerating: boolean;
    isArticleReady: boolean;
    articleTitle?: string;
    articleContent?: string;
}