import { Zap, ArrowRight, LucideBox } from "lucide-react";
import useStorage from "../hooks/useStorage";
import React from "react";
import { useAccount } from "wagmi";

export default function Hero({handleClick} : {handleClick: () => void}) {
    const [learners, setLearners] = React.useState<number>(0);
    const [rewards, setRewards] = React.useState<number>(0);
    const [quizzes, setQuizzes] = React.useState<number>(0);

    const { setpath } = useStorage();
    const { isConnected } = useAccount();

    const goToSetupCampaign = () => {
        if(!isConnected) {
            alert("Please connect a wallet");
        } else{
            setpath('setupcampaign');
        }
    }

    React.useEffect(() => {
        if(learners < 50000 || rewards < 500000 || quizzes < 1000) {
            const timer = setInterval(() => {
                setLearners(prev => prev + 1);
                setRewards(prev => prev + 2);
                setQuizzes(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [learners, quizzes, rewards]);

    // bg-gradient-to-br from-gray-50 to-cyan-50
    return(
        <section className="mx-auto bg-[url('/learna-image-2.png')] bg-no-repeat relative px-4 py-12 md:py-20 text-center font-mono">
            <div className="">
                <div className="mb-8">
                    <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-cyan-200 mb-6 shadow-sm">
                        <Zap className="w-4 h-4 text-cyan-600 mr-2" />
                        <span className="text-cyan-700 text-sm font-medium">New Education Revolution</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {"Learn, Grow, Have Fun!"}
                        </span>
                        <br />
                        <span className="text-gray-900">Earn Crypto.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-800 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Master technologies, protocols, subjects, tools, architectures, libraries including web3 fundamentals through interactive quizzes. 
                        Earn real cryptocurrency rewards as you build your knowledge and skills.
                    </p>
                </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button onClick={handleClick} className="flex justify-center items-center group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
                    <a href="#connect" className="text-white hover:text-cyan-600 transition-colors font-medium">Start Learning</a>                        
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={goToSetupCampaign} className="group border-2 border-cyan-500 md:border-white text-cyan-600 md:text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-cyan-500 hover:text-white transition-all duration-300">
                    <span className="flex items-center justify-center">
                        <LucideBox className="w-5 h-5 mr-2" />
                        Fund A Campaign
                    </span>
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-cyan-600 mb-2">{learners}+</div>
                    <div className="text-white text-sm md:text-base">Learners</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">${`${rewards}k+`}</div>
                    <div className="text-white text-sm md:text-base">Rewards Paid</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-pink-600 mb-2">{quizzes}+</div>
                    <div className="text-white text-sm md:text-base">Quizzes</div>
                </div>
            </div>
            </div>
        </section>
    );
}