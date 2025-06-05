import React from 'react';
import { categories, difficultyLevels, QuizData, quizData, QuizDatum } from '~/dummyData';
import { Button } from './ui/Button';

export default function DisplayCategories(
    {handleStart, setCategory, selectedCategory, setDifficultyLevel, difficultyLevel} : {handleStart: ()=> void, selectedCategory: string, difficultyLevel: string,  setCategory: (arg: {category: string, data: QuizDatum}) => void, setDifficultyLevel: (arg: string) => void}
) {
    const filterCatgeory = React.useCallback(
        (selected: string) => {
            const filtered = quizData.filter(({category}) => category === selected);
            setCategory({category: selected, data:filtered?.[0]});
        }
        ,[setCategory, quizData]
    );

    return( 
        <div className='space-y-6'>
            <div className='bg-green-300 p-4 rounded-lg space-y-2'>
                <h1 className='text-center font-semibold'>{`To start the quiz, please choose your preferences`}</h1>
                <div className='w-full flex justify-around items-center'>
                    <h3 className=''>Pick a category</h3>
                    <h3>Set difficulty level</h3>
                </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                    {
                        categories.map((category) => (
                            <div className='place-items-center' key={category}>
                                <Button 
                                    onClick={() => filterCatgeory(category)}
                                    className={`${selectedCategory === category? 'bg-green-300' : ''} hover:opac`}
                                    >
                                        {category}
                                    </Button>
                            </div>
                        ))
                    }
                </div>
                <div className='space-y-2'>
                    {
                        difficultyLevels.map((level) => (
                            <Button className={`${difficultyLevel === level? 'bg-green-300' : ''}`} onClick={() => setDifficultyLevel(level)} key={level}>{level}</Button>
                        ))
                    }
                </div>
            </div>
            <Button onClick={handleStart}>Start</Button>
        </div>
    )
}