import { Coins, BookOpen, Trophy, Users, Shield, Stars } from "lucide-react";
import useStorage from "../hooks/useStorage";
import { toBN } from "../utilities";
import { CampaignCard } from "./CampaignCard";
import { CAMPAIGNS } from "../../../hashes";
import React from "react";

export default function Campaigns() {
    const { weekData, weekId, appData, onQuizSelect, setpath } = useStorage();
    const cwd = weekData[toBN(weekId).toNumber()];

    const onCampaignSelect = React.useCallback((campaignName: string) => {
        const quiz = appData.quizData?.filter(({title}) => title.toLowerCase() === campaignName.toLowerCase());
        if(quiz && quiz.length > 0) {
            onQuizSelect(quiz[0]);
            setpath('quiz');
        } else {
            return alert(`Quiz title not match campaign ${campaignName}`)
        }
    }, [appData]);

    return(
        <section id="features" className="px-4 py-16 md:py-20 bg-white space-y-3">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <div className="flex items-center space-x-3 mb-8">
                        <Stars className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-2xl font-bold text-gray-800">Current Week Campaigns</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {
                            cwd?.campaigns.map((campaign, index) => {
                                const campaignName = CAMPAIGNS[index];
                                return (
                                    <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                                        <CampaignCard 
                                            campaign={campaign} 
                                            onSelect={() => onCampaignSelect(campaignName)} 
                                            campaignName={campaignName}
                                        />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>


                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Why Choose <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">Educaster</span>?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        The most comprehensive, fun, engaging, and value-oriented learning platform with real crypto rewards
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                        <Coins className="w-6 h-6 text-white" />
                    </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Earn Real Crypto</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Get rewarded with $cUSD, $CELO, $GROW and other cryptocurrencies for completing quizzes and achieving milestones.
                        </p>
                    </div>

                    <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Comprehensive Curriculum</h3>
                        <p className="text-gray-600 leading-relaxed">
                            From basics to advanced level in different protocols and technologies, learn everything you need to know about specific topic.
                        </p>
                    </div>

                    <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Gamified Learning</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Optionally compete with others, earn badges, and climb leaderboards while mastering Web3 concepts.
                        </p>
                    </div>

                    <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Community Driven</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Join a vibrant community of Web3 enthusiasts and learn from industry experts and peers.
                        </p>
                    </div>

                    <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Verified</h3>
                        <p className="text-gray-600 leading-relaxed">
                            All content is verified by blockchain experts, and your earnings are secured on-chain.
                        </p>
                    </div>

                    {/* <div className="group bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Track Progress</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Monitor your learning journey with detailed analytics and personalized recommendations.
                        </p>
                    </div> */}
                </div>
            </div>
        </section>
    );
}