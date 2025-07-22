/* eslint-disable */
import React from 'react';
import { Trophy, RotateCcw, Home, Award, Clock, Target, CheckCircle, Share2 } from 'lucide-react';
import useStorage from '../hooks/useStorage';
import RecordPoints from '../transactions/RecordPoints';
import { WarnBeforeClearScoresAndData } from './WarnBeforeClearScores';
import GenerateUserKey from '../peripherals/GenerateUserKey';
// import useProfile from '../hooks/useProfile';
import { Hex } from 'viem';
import { useAccount, useConnect } from 'wagmi';

export const QuizResults = () => {
  const [openDrawer, setDrawer] = React.useState<number>(0);
  const [showWarningBeforeExit, setShowWarning] = React.useState<number>(0);
  const [showGenerateUserKey, setShowGenerateUserKey] = React.useState<boolean>(false);

  const { result, quiz, onBackToHome, setpath } = useStorage();
  const { isConnected, connector, chainId } = useAccount();
  const { connect } = useConnect();

  const toggleDrawer = (arg:number) => setDrawer(arg);
  const backToScores = () => setShowGenerateUserKey(false);
  const { other: { percentage, score, timeSpent, totalPoints }} = result;
  const campaignHash = quiz.id as Hex;

  const handleSaveScores = () => {
    if(!isConnected && connector) {
      if(connector) {
        connect({connector, chainId});
      } else {
        setpath('home');
        return alert("Please ensure you're connected to a wallet");
      }
    } 
    setDrawer(1);
  }

  const getPerformanceMessage = () => {
    // const { percentage } = result;
    if (percentage >= 90) return { 
      message: "Outstanding! 🏆", 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    };
    if (percentage >= 80) return { 
      message: "Excellent! 🥇", 
      color: "text-green-600", 
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    };
    if (percentage >= 70) return { 
      message: "Great job! 🥈", 
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    };
    if (percentage >= 60) return { 
      message: "Good effort! 🥉", 
      color: "text-purple-600", 
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    };
    return { 
      message: "Keep practicing! 💪", 
      color: "text-gray-600", 
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    };
  };

  const performance = getPerformanceMessage();
  const correctAnswers = Object.values(result.answers).filter((answer, index) => {
    return answer.selected === quiz.questions[index]?.correctAnswer
  }).length;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Quiz Results',
        text: `I just scored ${percentage}% on "${quiz.title}" quiz! 🎯`,
        url: window.location.href,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        `I just scored ${percentage}% on "${quiz.title}" quiz! 🎯 ${window.location.href}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {
        showGenerateUserKey? <GenerateUserKey exit={backToScores} campaignHash={campaignHash} /> : 
          <div className="max-w-2xl w-full animate-fade-in">
            {/* Main Results Card */}
            <div className="glass-card rounded-3xl p-8 text-center mb-6">
              {/* Performance Badge */}
              <div className={`inline-flex items-center justify-center w-24 h-24 ${performance.bgColor} ${performance.borderColor} border-2 rounded-full mb-6 animate-bounce-gentle`}>
                <Trophy className={`w-12 h-12 ${performance.color}`} />
              </div>

              <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
              <p className={`text-2xl font-semibold ${performance.color} mb-6`}>
                {performance.message}
              </p>

              {/* Score Display */}
              <div className="bg-brand-gradient rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="text-6xl font-bold mb-2">
                    {percentage}%
                  </div>
                  <div className="text-xl opacity-90 mb-2">
                    {score} out of {totalPoints} points
                  </div>
                  <div className="text-lg opacity-80 capitalize">
                    {quiz.title}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 md:gap-6 mb-8">
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-center mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {correctAnswers}
                  </div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-center mb-3">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {formatTime(timeSpent)}
                  </div>
                  <div className="text-sm text-gray-600">Time Taken</div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {quiz.questions.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleShare}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 
                            text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105
                            flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share To Farcaster</span>
                </button>
                <button
                  // disabled={true}
                  onClick={handleSaveScores}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Save Onchain</span>
                </button>
              </div>

              <button
                onClick={() => setShowWarning(1)}
                className="w-full mt-4 btn-secondary flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>

            {/* Achievement Badge */}
            {percentage >= 80 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center shadow-xl animate-slide-up">
                <Award className="w-8 h-8 mx-auto mb-3" />
                <p className="font-bold text-lg mb-1">🎉 Achievement Unlocked!</p>
                <p className="text-sm opacity-90">Quiz Master - You scored above 80%!</p>
              </div>
            )}
          </div>

      }
       <RecordPoints 
          openDrawer={openDrawer}
          toggleDrawer={toggleDrawer}
          campaignHash={campaignHash}
          useAdmin={false}
        />
        <WarnBeforeClearScoresAndData 
          openDrawer={showWarningBeforeExit}
          toggleDrawer={(arg) => setShowWarning(arg)}
          exit={() => onBackToHome('dashboard')}
          saveScore={handleSaveScores}
        />
    </div>
  );
};