import React from 'react';
import { Button } from './ui/button';
import CategoryAndLevel from './CategoryAndLevel';
import Image from 'next/image';
import { MotionDisplayWrapper } from './MotionDisplayWrapper';

export default function DisplayCategories({handleStart, setSelectedQuizData} : {handleStart: () => void, setSelectedQuizData: (category:string, level: string) => void}) {
    const [selectedCategory, setSelectedCategory] = React.useState<string>('');
    const [difficultyLevel, setLevel] = React.useState<string>('');

    const start = () => {
        if(selectedCategory === '') return alert('Please pick a category');
        if(difficultyLevel === '') return alert('Please pick a level');
        handleStart();
    }

    // Update the category when user selects one
    const filterCatgeory = React.useCallback(
        (selected: string) => {
            // console.log("Selected", selected)
            setSelectedCategory(selected);
        }
        ,[setSelectedCategory]
    );

    // Update the difficulty level for the user whether beginner, intermediate or advance
    const  setDifficultyLevel = React.useCallback(
        (selected: string) => {
            setLevel(selected);
        }
        ,[setLevel]
    );

    // Automatically update the quiz data to display whenever user selectes a new category 
    React.useEffect(() => {
        if(selectedCategory !== '' && difficultyLevel !== ''){
            setSelectedQuizData(selectedCategory, difficultyLevel);
        }
    }, [setSelectedQuizData, selectedCategory, difficultyLevel]);

    return( 
        <MotionDisplayWrapper className='space-y-6'>
            <h1 className='text-center text-sm font-medium'>{`To start the quiz, please choose your preferences`}</h1>
            <div className=''>
                <CategoryAndLevel 
                    category={selectedCategory}
                    level={difficultyLevel}
                    setCategory={filterCatgeory}
                    setDifficultyLevel={setDifficultyLevel}
                />
            </div>
            <div className='flex justify-center p-6'>
                <div className='place-items-center shadow-lg shadow-cyan-300/20 h-[180px] w-[180px] p-4 bg-cyan-400/10 rounded-full'>
                    <Image 
                        src="/readytoTakeQuiz.svg"
                        width={150}
                        height={150}
                        alt='ReadyToTakeQuiz image'
                    />
                </div>
            </div>
            <div className='w-full flex justify-center'>
                <Button variant={'outline'} className='w-full bg-cyan-500/80 hover:bg-opacity-70' onClick={start}>Start</Button>
            </div>
        </MotionDisplayWrapper>
    )
}
