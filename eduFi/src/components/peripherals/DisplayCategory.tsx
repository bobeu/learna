import React from 'react';
import { Button } from '~/components/ui/button';
import CategoryAndLevel from './CategoryAndLevel';
import Image from 'next/image';
import { MotionDisplayWrapper } from './MotionDisplayWrapper';
import useStorage from '../hooks/useStorage';

export default function DisplayCategories() {
    const [selectedCategory, setSelectedCategory] = React.useState<string>('');
    const [difficultyLevel, setLevel] = React.useState<string>('');

    const { setpath, setSelectedQuizData, getFunctions } = useStorage();
    const start = () => {
        if(selectedCategory === '') return alert('Please pick a category');
        if(difficultyLevel === '') return alert('Please pick a level');
        setSelectedQuizData(selectedCategory, difficultyLevel);
    }

    // Update the category when user selects one
    const filterCatgeory = (selected: string) => setSelectedCategory(selected);

    // Update the difficulty level for the user whether beginner, intermediate or advance
    const  setDifficultyLevel = (selected: string) => setLevel(selected);

    React.useEffect(() => {
        getFunctions().clearData();
    }, [getFunctions]);
    return( 
        <MotionDisplayWrapper className='space-y-4 mt-4'>
            <h1 className='text-sm font-medium '>{`To start the quiz, please set your preferences`}</h1>
            <div className=''>
                <CategoryAndLevel 
                    category={selectedCategory}
                    level={difficultyLevel}
                    setCategory={filterCatgeory}
                    setDifficultyLevel={setDifficultyLevel}
                />
            </div>
            <div className='flex justify-center p-'>
                <div className='place-items-center shadow-lg shadow-cyan-300/20 h-[180px] w-[180px] p-4 bg-cyan-400/10 rounded-full'>
                    <Image 
                        src="/readytoTakeQuiz.svg"
                        width={150}
                        height={150}
                        alt='ReadyToTakeQuiz image'
                    />
                </div>
            </div>
            <div className='w-full flex flex-col justify-center gap-1'>
                <Button variant={'outline'} className='w-full bg-cyan-500' onClick={start}>Start</Button>
                <Button variant={'outline'} className='w-full bg-orange-500/30' onClick={() => setpath('home')}>Exit</Button>
            </div>
        </MotionDisplayWrapper>
    )
}
