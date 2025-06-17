import * as React from "react"
import { categories, difficultyLevels } from "~/dummyData"
import { Button } from "~/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function CategoryAndLevel( {category, level, setCategory, setDifficultyLevel} : {category: string, level: string, setCategory: (arg: string) => void, setDifficultyLevel: (arg: string) => void}) {
    const [showCategory, setShowCategory] = React.useState<boolean>(false);
    const [showLevel, setShowLevel] = React.useState<boolean>(false);

    const handleSetLevel = (difLevel: string) => {
        setDifficultyLevel(difLevel);
        setShowLevel(false);
    };

    const handleSetCategory = (category: string) => {
        setCategory(category);
        setShowCategory(false);
    };

    return (
        <div className="space-y-2">
            <div className="relative w-full flex flex-col">
                <Button variant={'outline'} onClick={() => setShowCategory(!showCategory)} className={`w-full flex justify-between bg-cyan-500/10 text-purple-500`}>
                    <h3>{category && category !== ''? category : 'Select a category'}</h3>
                    { showCategory? <ChevronDown /> : <ChevronRight />}
                </Button>
                <div hidden={!showCategory} className="absolute w-full border font-medium rounded-lg bg-white p-2 space-y-2 z-50">
                    <h3 className="pl-4 pb-2 text-purple-900 text-sm border-b">Categories</h3>
                    <div>
                        {
                            categories.map((category) => (
                                <Button variant={'ghost'} key={category} className="w-full flex justify-start text-cyan-700 hover:text-purple-800" onClick={() => handleSetCategory(category)}>
                                    {category}
                                </Button>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="relative w-full flex flex-col">
                <Button variant={'outline'} onClick={() => setShowLevel(!showLevel)} className={`w-full flex justify-between bg-cyan-500/5 text-purple-600`}>
                    <h3>{level && level !== ''? level : 'Choose a level'}</h3>
                    { showLevel? <ChevronDown /> : <ChevronRight />}
                </Button>
                <div hidden={!showLevel} className="absolute w-full border font-medium rounded-lg bg-white p-2 space-y-2 z-50">
                    <h3 className="pl-4 pb-2 text-cyan-700 text-sm border-b">Levels</h3>
                    <div>
                        {
                            difficultyLevels.map((difLevel) => (
                                <Button variant={'ghost'} key={difLevel} className="w-full flex justify-start text-cyan-500" onClick={() => handleSetLevel(difLevel)}>
                                    {difLevel}
                                </Button>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
