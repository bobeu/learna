import React from 'react';
import { Path, quizData, QuizDatum } from '~/dummyData';
import { Button } from './ui/button';
import { MotionDisplayWrapper } from './MotionDisplayWrapper';
import Review from './Review';
import Scores from './Scores';
import DisplayCategories from './DisplayCategory';
import DisplayQuiz from './DisplayQuiz';

export default function App() {
    const[currentPath, setPath] = React.useState<Path>('selectategory');
    const[startQuiz, setStartQuiz] = React.useState<boolean>(false);
    const[showFinishButton, setShowFinishButton] = React.useState<boolean>(false);
    const [indexedAnswer, setIndex] = React.useState<number>(0);
    const [selectedQuizData, setQuizData] = React.useState<{category: string, data: QuizDatum}>({category: '', data: {
        category: '',
        id: 0,
        difficultyLevel: '',
        questions: []
    }});
    
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
                    result = <DisplayCategories 
                        handleStart={() => setpath('quiz')}
                        setSelectedQuizData={setSelectedQuizData}
                    />
                    break;
                case 'review':
                    result = <Review 
                        data={selectedQuizData.data} />
                    break;
                case 'scores':
                    result = <Scores 
                            data={selectedQuizData.data} 
                            setpath={setpath}
                        />
                    break;
                case 'quiz':
                    result = <DisplayQuiz 
                        setpath={setpath}
                        indexedAnswer={indexedAnswer}
                        selectedQuizData={selectedQuizData}
                        handleSelectAnswer={handleSelectAnswer}
                    />
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
    }, [setPath, setStartQuiz, currentPath, setSelectedQuizData, handleSelectAnswer, selectedQuizData, indexedAnswer]);


    

    // if(startQuiz) {
    //     return(
    //         <MotionDisplayWrapper className='space-y-4'>
    //             <div className='w-1/4'>
    //                 <Button variant={'outline'} className='font-mono text-xs py-2' onClick={() => setStartQuiz(!startQuiz)}>Back</Button>
    //             </div>
                // <DisplayQuiz 
                //     indexedAnswer={indexedAnswer}
                //     selectedQuizData={selectedQuizData}
                //     handleSelectAnswer={handleSelectAnswer}
                // />         />
    //     )
    // } else if(showScores) {
    //     return(
    //         <Scores 
    //             data={selectedQuizData.data}
    //         />
    //     );
    // }
               
    //         </MotionDisplayWrapper>
    //     );
    // } else if(review) {
    //     return (
    //         <Review 
    //             data={selectedQuizData.data}
    //

    return(
        <MotionDisplayWrapper className='space-y-4 font-mono'>
            {/* <div className='w-1/4'>
                <Button variant={'outline'} className='font-mono text-xs py-2' onClick={() => setStartQuiz(!startQuiz)}>Back</Button>
            </div> */}
            { renderChildren() }
            {
                showFinishButton && 
                    <div hidden={currentPath === 'scores' || currentPath === 'selectategory'} className='w-full place-items-center space-y-2'>
                        { currentPath !== 'review' && <Button variant={'outline'} onClick={() => setpath('review') } className='w-full font-mono bg-gray-300/30'>Review</Button> }
                        { currentPath !== 'scores' && <Button variant={'outline'} onClick={() => setpath('scores') } className='w-full font-mono bg-cyan-500/50'>View my scores</Button> }
                    </div>
            }
        </MotionDisplayWrapper>
    );
}
