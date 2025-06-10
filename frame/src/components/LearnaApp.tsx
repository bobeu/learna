import React from 'react';
import { Path, quizData, QuizDatum } from '~/dummyData';
import { Button } from './ui/button';
import { MotionDisplayWrapper } from './peripherals/MotionDisplayWrapper';
import Review from './peripherals/Review';
import Scores from './peripherals/Scores';
import DisplayCategories from './peripherals/DisplayCategory';
import DisplayQuiz from './peripherals/DisplayQuiz';
import { useFrame } from './providers/FrameProvider';
import { StorageContextProvider } from './StorageContextProvider';

export default function LearnaApp() {
    const[currentPath, setPath] = React.useState<Path>('selectategory');
    const[showFinishButton, setShowFinishButton] = React.useState<boolean>(false);
    const [indexedAnswer, setIndex] = React.useState<number>(0);
    const [messages, setMessage] = React.useState<string[]>([]);
    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const [selectedQuizData, setQuizData] = React.useState<{category: string, data: QuizDatum}>({category: '', data: {
        category: '',
        id: 0,
        difficultyLevel: '',
        questions: []
    }});
    
    const { context } = useFrame();
    
  const setmessage = (arg: string) => arg === ''? setMessage([]): setMessage((prev) => [...prev, arg]);
  const setError = (arg:string) => setErrorMessage(arg);
  const callback = (arg: {message?: string, errorMessage?: string}) => {
    if(arg.message) setmessage(arg.message);
    if(arg.errorMessage) setErrorMessage(arg.errorMessage);
  };

    // Update quiz data whenever an update to category is received
    const setSelectedQuizData = React.useCallback(
        (selected: string, level: string) => {
            const filtered = quizData.filter(({category, difficultyLevel}) => category === selected && level === difficultyLevel);
            console.log("selectedQuizData", filtered)
            if(filtered.length > 0) {
                setQuizData({category: selected, data: filtered[0]});
            }
    }, [quizData, setQuizData]);
    
    // Update the quiz data each time an user selects an answer
    const handleSelectAnswer = React.useCallback(({label, value} : {label: string, value: string}) => {
        const questionSize = selectedQuizData.data.questions.length;
        setQuizData(({data, category}) => {
            data.questions[indexedAnswer].userAnswer = {label, value};
            return {
                category,
                data
            }
        });
        setIndex((prev) => {
            let newIndex = prev + 1;
            if(newIndex === (questionSize)) {
                // setPreview(true);
                newIndex = prev;
                setShowFinishButton(true);
            }
            return newIndex;
        });
    }, [setQuizData, setIndex, setShowFinishButton, selectedQuizData]);

    // set the node to display
    const {setpath, renderChildren} = React.useMemo(() => {
        const setpath = (arg: Path) => setPath(arg);
        const renderChildren = () => {
            let result = <></>
            switch (currentPath) {
                case 'selectategory':
                    result = <DisplayCategories />
                    break;
                case 'review':
                    result = <Review />
                    break;
                case 'scores':
                    result = <Scores />
                    break;
                case 'quiz':
                    result = <DisplayQuiz />
                    break;
                default:
                    break;
            }
            return result;
        }

        return {
            setpath,
            renderChildren
        }
    }, [setPath, currentPath]);

    return(
        <StorageContextProvider
            value={{
                handleStart: () => setpath('quiz'),
                setSelectedQuizData,
                data: selectedQuizData.data,
                handleSelectAnswer,
                indexedAnswer,
                selectedQuizData,
                setpath,
                messages,
                setError,
                setmessage,
                errorMessage
            }}
        >
            <div 
                style={{
                    paddingTop: context?.client.safeAreaInsets?.top ?? 10,
                    paddingBottom: context?.client.safeAreaInsets?.bottom ?? 10,
                    paddingLeft: context?.client.safeAreaInsets?.left ?? 10,
                    paddingRight: context?.client.safeAreaInsets?.right ?? 10,
                }}
                className="relative w-[300px] mx-auto"
            >
                <MotionDisplayWrapper className='w-full flex justify-center uppercase text-sm text-center space-y-4 pb-4'>
                    <h1 className='h-[80px] w-[80px] flex justify-center items-center bg-cyan-500/30 rounded-full font-mono'><span className='italic text-4xl font-black text-cyan-800'>L</span><span className='font-mono'>earna</span></h1>
                </MotionDisplayWrapper>
                <MotionDisplayWrapper className='space-y-4 font-mono'>
                    { renderChildren() }
                    {
                        showFinishButton && 
                            <div hidden={currentPath === 'scores' || currentPath === 'selectategory'} className='w-full place-items-center space-y-2'>
                                { currentPath !== 'review' && <Button variant={'outline'} onClick={() => setpath('review') } className='w-full font-mono bg-gray-300/30'>Review</Button> }
                                { currentPath !== 'scores' && <Button variant={'outline'} onClick={() => setpath('scores') } className='w-full font-mono bg-cyan-500/50'>View my scores</Button> }
                            </div>
                    }
                </MotionDisplayWrapper>
            </div>
        </StorageContextProvider>

    );
}
