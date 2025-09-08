import { Trophy, Users, Brain } from "lucide-react";

{/* Features Section */}
export default function Features() {
    return(
        <section className="py-20 px-4 sm:px-6 lg:px-8 dark:bg-neutral-950 dark:font-mono">
            <div className="max-w-7xl border border-black/80 dark:border-none rounded-xl py-8 px-4 mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">Why Choose Learna?</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                    Experience the future of education with our innovative platform
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">AI Tutor</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Learn with our intelligent AI tutor that creates personalized content and quizzes
                    </p>
                    </div>

                    <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Get paid in cryptocurrency for completing learning challenges and quizzes
                    </p>
                    </div>

                    <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Community</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Join a vibrant community of learners and compete with others
                    </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
        // <section id="features" className="px-4 py-16 md:py-20 bg-white font-mono">
        //     <div className="max-w-6xl mx-auto">
        //         <div className="text-center mb-16">
        //             <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
        //                 Why Choose <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">Learna</span>?
        //             </h2>
        //             <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
        //                 The most comprehensive, fun, engaging, and value-oriented learning platform with real crypto rewards
        //             </p>
        //         </div>

        //         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        //             <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
        //             <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
        //                 <Coins className="w-6 h-6 text-white" />
        //             </div>
        //                 <h3 className="text-xl font-bold text-gray-900 mb-4">Earn Real Crypto</h3>
        //                 <p className="text-gray-600 leading-relaxed">
        //                     Get rewarded with $cUSD, $CELO, $GROW and other cryptocurrencies for completing quizzes and achieving milestones.
        //                 </p>
        //             </div>

        //             <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
        //                 <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
        //                     <BookOpen className="w-6 h-6 text-white" />
        //                 </div>
        //                 <h3 className="text-xl font-bold text-gray-900 mb-4">Comprehensive Curriculum</h3>
        //                 <p className="text-gray-600 leading-relaxed">
        //                     From basics to advanced level in different protocols and technologies, learn everything you need to know about specific topic.
        //                 </p>
        //             </div>

        //             <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
        //                 <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
        //                     <Trophy className="w-6 h-6 text-white" />
        //                 </div>
        //                 <h3 className="text-xl font-bold text-gray-900 mb-4">Gamified Learning</h3>
        //                 <p className="text-gray-600 leading-relaxed">
        //                     Optionally compete with others, earn badges, and climb leaderboards while mastering Web3 concepts.
        //                 </p>
        //             </div>

        //             <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
        //                 <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
        //                     <Users className="w-6 h-6 text-white" />
        //                 </div>
        //                 <h3 className="text-xl font-bold text-gray-900 mb-4">Community Driven</h3>
        //                 <p className="text-gray-600 leading-relaxed">
        //                     Join a vibrant community of Web3 enthusiasts and learn from industry experts and peers.
        //                 </p>
        //             </div>

        //             <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
        //                 <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
        //                     <Shield className="w-6 h-6 text-white" />
        //                 </div>
        //                 <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Verified</h3>
        //                 <p className="text-gray-600 leading-relaxed">
        //                     All content is verified by blockchain experts, and your earnings are secured on-chain.
        //                 </p>
        //             </div>

        //             <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
        //                 <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
        //                     <TrendingUp className="w-6 h-6 text-white" />
        //                 </div>
        //                 <h3 className="text-xl font-bold text-gray-900 mb-4">Track Progress</h3>
        //                 <p className="text-gray-600 leading-relaxed">
        //                     Monitor your learning journey with detailed analytics and personalized recommendations.
        //                 </p>
        //             </div>
        //         </div>
        //     </div>
        // </section>