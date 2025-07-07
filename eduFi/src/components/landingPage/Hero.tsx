import { Zap, ArrowRight, Play } from "lucide-react";
import { Button } from "~/components/ui/button";
import useStorage from "../hooks/useStorage";

export default function Hero({handleClick} : {handleClick: () => void}) {
    // const { setpath } = useStorage();
    // const goToDashboard = () => {
    //     setpath('dashboard');
    // }

    return(
        <section className="relative px-4 py-12 md:py-20 text-center bg-gradient-to-br from-gray-50 to-cyan-50">
            <div className="max-w-4xl mx-auto">
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
                    <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Master technologies, protocols, subjects, tools, architectures, libraries including web3 fundamentals through interactive quizzes. 
                        Earn real cryptocurrency rewards as you build your knowledge and skills.
                    </p>
                </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button onClick={handleClick} className="flex justify-center items-center group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
                    <a href="#connect" className="text-white hover:text-cyan-600 transition-colors font-medium">Start Learning</a>                        
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button disabled className="group border-2 border-cyan-500 text-cyan-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-cyan-500 hover:text-white transition-all duration-300">
                    <span className="flex items-center justify-center">
                        <Play className="w-5 h-5 mr-2" />
                        Watch Demo
                    </span>
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-cyan-600 mb-2">50K+</div>
                    <div className="text-gray-500 text-sm md:text-base">Learners</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">$500K+</div>
                    <div className="text-gray-500 text-sm md:text-base">Rewards Paid</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-pink-600 mb-2">1000+</div>
                    <div className="text-gray-500 text-sm md:text-base">Quizzes</div>
                </div>
            </div>
            </div>
        </section>
    );
}