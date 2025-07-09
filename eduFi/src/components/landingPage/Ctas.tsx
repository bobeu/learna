import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import useStorage from "../hooks/useStorage";

export default function Ctas() {
    const { setpath } = useStorage();
    const goToDashboard = () => {
        setpath('dashboard');
    }
    
    return(
        <section className="px-4 py-16 md:py-20 bg-gradient-to-br from-gray-50 to-cyan-50">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                    Ready to Start <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">Gathering knowledge</span>?
                </h2>
                <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Join thousands of learners who are already earning crypto while mastering the future of technology
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={goToDashboard} variant={'outline'} className="group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
                        <span className="flex items-center justify-center">
                            Get Started Free
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Button>
                    <Button variant={'outline'} className="border-2 border-gray-300 text-gray-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-300">
                        <a href="#how-it-works" className="text-gray-600 hover:text-cyan-600 transition-colors font-medium">Learn More</a>
                    </Button>
                </div>
            </div>
        </section>
    );
}