"use client";
import { motion } from 'framer-motion';
import { Trophy, Users, Brain } from "lucide-react";

{/* Features Section */}
export default function Features() {
    const features = [
        {
            icon: Brain,
            title: "AI Tutor",
            description: "Learn with our intelligent AI tutor that creates personalized content and quizzes",
            delay: 0.1,
        },
        {
            icon: Trophy,
            title: "Earn Rewards",
            description: "Get paid in cryptocurrency for completing learning challenges and quizzes",
            delay: 0.2,
        },
        {
            icon: Users,
            title: "Community",
            description: "Join a vibrant community of learners and compete with others",
            delay: 0.3,
        },
    ];

    return(
        <section className="py-20 px-4 sm:px-6 lg:px-8 dark:bg-[#1a1625] dark:font-mono relative z-10">
            <div className="max-w-7xl border border-neutral-200 dark:border-neutral-700 rounded-xl py-8 px-4 mx-auto bg-white/80 dark:bg-[#252030]/80 backdrop-blur-sm shadow-lg dark:shadow-primary-500/10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-primary-500 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent">
                        Why Choose Learna?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                    Experience the future of education with our innovative platform
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: feature.delay }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="text-center p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-[#252030]/50 backdrop-blur-sm hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-16 h-16 bg-primary-500/20 dark:bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/30"
                                >
                                    <Icon className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
