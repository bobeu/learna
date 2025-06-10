import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components//ui/button";
import useStorage from "../StorageContextProvider/useStorage";
import RecordPoints from "../transactions/RecordPoints";

const TOTAL_WEIGHT = 100;

export default function Scores() {
    const [openDrawer, setDrawer] = React.useState<number>(0);

    const toggleDrawer = (arg: number) => setDrawer(arg);
    const { data, setpath } = useStorage();
    const { category, difficultyLevel, questions } = data;

    const { 
        totalScores,
            questionSize,
            weightPerQuestion,
            totalAnsweredCorrectly,
            totalAnsweredIncorrectly,
    } = React.useMemo(() => {
        const questionSize = questions.length;
        const weightPerQuestion = Math.floor(TOTAL_WEIGHT / questionSize);
        const totalAnsweredCorrectly = questions.filter(({userAnswer, correctAnswer}) => userAnswer?.label === correctAnswer.label);
        const totalAnsweredIncorrectly = questionSize - totalAnsweredCorrectly.length;
        const totalScores = weightPerQuestion * totalAnsweredCorrectly.length;

        return{
            totalScores,
            questionSize,
            weightPerQuestion,
            totalAnsweredCorrectly,
            totalAnsweredIncorrectly,
        }
    }, [questions]);


    return(
        <MotionDisplayWrapper className="space-y-4 font-mono">
            <h3 className="text-center text-2xl ">Score card</h3>
            <div className="space-y-2">
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Total questions</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{questionSize}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Weight per question</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{weightPerQuestion}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Category</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{category}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Difficulty Level</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{difficultyLevel}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Correct answers</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{totalAnsweredCorrectly.length}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Incorrect answers</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{totalAnsweredIncorrectly}</h3>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="flex flex-col justify-center items-center space-y-2 bg-cyan-500/50 h-[150px] w-[150px] rounded-full text-sm place-items-center">
                    <h3>Scores</h3>
                    <h3 className="text-4xl">{`${totalScores}%`}</h3>
                </div>
            </div>
            <div className="flex justify-center items-center gap-1 w-full">
                <Button variant={'outline'} className="w-full bg-cyan-500 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Save My Scores</Button>
                <Button onClick={() => setpath('selectategory')} variant={'outline'} className="w-full bg-orange-500/50 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Exit</Button>
            </div>
            <RecordPoints 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                points={totalScores}
            />
        </MotionDisplayWrapper>
    );
}