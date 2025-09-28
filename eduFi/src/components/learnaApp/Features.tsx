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
