import React from 'react'
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge, CheckCircle, Loader2, Trophy } from 'lucide-react';

function Results(props : ResultsProps) {
    const {
       handleStoreOnChain,
       isPending,
       onClose,
       quizScore,
       quizSize,
       performanceRating,
       performanceValue
    } = props;

    return (
       <div className="space-y-6">
            <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Quiz Complete!
                </h3>
                <div className="text-4xl font-bold text-primary-500 mb-2">
                    {quizScore}%
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                    You answered {Math.round((quizScore / 100) * quizSize)} out of {quizSize} questions correctly
                </p>
            </div>

            <Card className="border-neutral-200 dark:border-neutral-800">
                <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Performance Rating</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {performanceRating}
                    </span>
                    <Badge className="bg-primary-100 text-primary-800 border-primary-200">
                        {performanceValue}/5
                    </Badge>
                </div>
                </CardContent>
            </Card>

            <div className="flex justify-center gap-3">
                <Button
                    onClick={handleStoreOnChain}
                    disabled={isPending}
                    className="bg-primary-500 text-black hover:bg-primary-400"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Storing...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Store Proof on Chain
                        </>
                    )}
                </Button>
                
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600"
                >
                    Close
                </Button>
            </div>
        </div>
    )
}

export default Results;

export interface ResultsProps {
    onClose: () => void;
    handleStoreOnChain: () => void;
    isPending: boolean;
    quizScore: number;
    quizSize: number;
    performanceRating: string;
    performanceValue: number;

}