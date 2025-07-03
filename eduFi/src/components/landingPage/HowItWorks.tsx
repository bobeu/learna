export default function HowItWorks() {

    return(
        <section id="how-it-works" className="px-4 py-16 md:py-20 bg-gradient-to-br from-gray-50 to-cyan-50">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">How It Works</h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                    Start earning crypto in just three simple steps
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
                            <span className="text-2xl font-bold text-white">1</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Get Passkey</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Every week, you will be required to generate a passkey to be able to access learning materials, save your scores, and parkate in weekly payout.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
                            <span className="text-2xl font-bold text-white">2</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Your Path</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Select from beginner-friendly courses or advanced topics like DeFi, libraries, and DAOs.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
                            <span className="text-2xl font-bold text-white">3</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Take Quizzes</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Test your knowledge with interactive quizzes and earn points for correct answers.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
                            <span className="text-2xl font-bold text-white">4</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Save your points</h3>
                        <p className="text-gray-600 leading-relaxed">
                            You should immediately save your scores onchain. Although this is optional, we recommend saving your scores immediately as you cannot take the same quiz twice, and your points may be cleared from the memory.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
                            <span className="text-2xl font-bold text-white">5</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Claim Rewards</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Every weekend, check your dashboard for unclaimed rewards.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}