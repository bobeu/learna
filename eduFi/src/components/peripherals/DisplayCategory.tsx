import React from 'react';
import { Button } from '~/components/ui/button';
import CategoryAndLevel from './CategoryAndLevel';
import Image from 'next/image';
import { MotionDisplayWrapper } from './MotionDisplayWrapper';
import useStorage from '../hooks/useStorage';
import { Category, DifficultyLevel } from '../utilities';

export default function DisplayCategories() {
    const [selectedCategory, setSelectedCategory] = React.useState<Category>('');
    const [difficultyLevel, setLevel] = React.useState<DifficultyLevel>('');

    const { setpath, clearData, setSelectedQuizData } = useStorage();
    const start = () => {
        if(selectedCategory === '') return alert('Please pick a category');
        if(difficultyLevel === '') return alert('Please pick a level');
        setSelectedQuizData(selectedCategory, difficultyLevel);
    }

    const getCallbacks = React.useCallback(() => {
        const pickCategory = (selected: Category) => setSelectedCategory(selected);
        const  pickLevel = (selected: DifficultyLevel) => setLevel(selected);
        return { pickCategory, pickLevel}
    }, [setSelectedCategory, setLevel]);


    React.useEffect(() => {
        clearData();
    }, [clearData]);

    return( 
        <MotionDisplayWrapper className='space-y-4 mt-4'>
            <h1 className='text-sm font-medium '>{`To start the quiz, please set your preferences`}</h1>
            <div className=''>
                <CategoryAndLevel 
                    category={selectedCategory}
                    level={difficultyLevel}
                    getCallbacks={getCallbacks}
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
