import React from 'react'
import { Button } from '../ui/button';
import { Badge, Loader2, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Steps } from './ArticleReading';

function TopicSelection(props : TopicSelectionProps) {
    const {
        setCurrentStep, 
        isGenerating, 
        generateArticle,
        setSelectedTopic,
        generateTopics,
        getDifficultyColor,
        generatedTopics,
        isCheckingSavedTopics = false,
    } = props;

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Choose Your Learning Topic
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Select a topic to start your learning journey
                </p>
            </div>

            {isCheckingSavedTopics && (
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Searching for available topics...
                    </p>
                </div>
            )}

            {!isCheckingSavedTopics && generatedTopics.length === 0 && (
                <div className="text-center">
                <Button 
                    onClick={generateTopics} 
                    disabled={isGenerating}
                    className="bg-primary-500 text-black hover:bg-primary-400"
                >
                    {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Topics...
                    </>
                    ) : (
                    <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Learning
                    </>
                    )}
                </Button>
                </div>
            )}

            {generatedTopics.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedTopics.map((topic) => (
                    <Card 
                    key={topic.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-neutral-200 dark:border-neutral-800"
                    onClick={() => {
                        setSelectedTopic(topic);
                        generateArticle(topic);
                        setCurrentStep('article');
                    }}
                    >
                    <CardHeader>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {topic.title}
                        </CardTitle>
                        <Badge className={getDifficultyColor(topic.difficulty)}>
                        {topic.difficulty}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-300">
                        {topic.description}
                        </p>
                    </CardContent>
                    </Card>
                ))}
                </div>
            )}
        </div>
    )
}

export default TopicSelection

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GeneratedTopic {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
}

export interface TopicSelectionProps {
    isGenerating: boolean;
    generatedTopics: GeneratedTopic[];
    setCurrentStep: (arg: Steps) => void;
    generateArticle: (topic: GeneratedTopic) => Promise<void>;
    setSelectedTopic: (topic: GeneratedTopic) => void;
    generateTopics: () => Promise<void>;
    getDifficultyColor: (arg: string) => string;
    isCheckingSavedTopics?: boolean;
}