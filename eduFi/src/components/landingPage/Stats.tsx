/* eslint-disable */
import { Star, CheckCircle } from "lucide-react";

export default function Stats() {

    return(
        <section id="stats" className="px-4 py-16 md:py-20 bg-white font-mono">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-16">
                    Join the <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">Web3 Revolution</span>
                </h2>
            
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-gradient-to-br from-gray-50 to-cyan-50 p-8 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-center mb-4">
                            <Star className="w-8 h-8 text-yellow-500" />
                            <Star className="w-8 h-8 text-yellow-500" />
                            <Star className="w-8 h-8 text-yellow-500" />
                            <Star className="w-8 h-8 text-yellow-500" />
                            <Star className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
                        <div className="text-gray-600">Average User Rating</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-8 rounded-2xl border border-gray-200">
                        <div className="text-3xl font-bold text-cyan-600 mb-2">98%</div>
                        <div className="text-gray-600">Course Completion Rate</div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>No hidden fees or subscription costs</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Weekly crypto payouts</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Vibrant community & support</span>
                    </div>
                </div>
            </div>
        </section>
    );
}