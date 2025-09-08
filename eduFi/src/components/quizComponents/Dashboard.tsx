import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Target, TrendingUp, Star, X, Menu, ChartBar, UserRoundCheck, UserRoundX, LucideBox} from 'lucide-react';
import { FormattedData, QuizResultOuput,UserStats } from '../../../types/quiz';
import { QuizCard } from './QuizCard';
import useStorage from '../hooks/useStorage';
import { Button } from '@/components/ui/button';
import { useAccount } from "wagmi";
import { Hex, hexToString } from 'viem';
import { toBN } from '../utilities';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SelectComponent } from '../peripherals/SelectComponent';
import Image from 'next/image';

const emptyStats = {
  totalQuizzes: 0,
  totalScore: 0,
  averageScore: 0,
  bestScore: 0,
  streak: 0
};

export const DashboardInfo = ({data} : {data: FormattedData}) => {
  const [stats, setStats] = useState<UserStats>(emptyStats);

  const {  appData } = useStorage();
  const { profileQuizzes } = data;
 
  useEffect(() => {
    if (profileQuizzes && profileQuizzes.length > 0) {
      const totalScore = profileQuizzes.reduce((sum, result) => sum + toBN(BigInt(result?.other?.score).toString()).toNumber(), 0);
      const totalPoints = profileQuizzes?.reduce((sum, result) => sum + toBN(BigInt(result?.other?.totalPoints).toString()).toNumber(), 0);
      const averageScore = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
      const bestScore = Math.max(...profileQuizzes.map(result => result.other.percentage));

      setStats({
        totalQuizzes: profileQuizzes.length,
        totalScore,
        averageScore,
        bestScore,
        streak: calculateStreak(profileQuizzes)
      });
    } else {
      setStats(emptyStats);
    }
  }, [profileQuizzes]);

  const calculateStreak = (results: QuizResultOuput[]): number => {
    // Simple streak calculation - consecutive quizzes with 70%+ score
    let streak = 0;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i].other.percentage >= 70) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <div className="">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span className="text-3xl font-bold text-gray-800">{Math.floor(stats.totalScore)}</span>
          </div>
          <p className="text-gray-600 font-medium">Total Points</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <span className="text-3xl font-bold text-gray-800">{stats.totalQuizzes}</span>
          </div>
          <p className="text-gray-600 font-medium">Quizzes Completed</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: `${Math.min((stats.totalQuizzes / 10) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-purple-500" />
            <span className="text-3xl font-bold text-gray-800">{stats.averageScore}%</span>
          </div>
          <p className="text-gray-600 font-medium">Average Score</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-brand-gradient h-2 rounded-full" style={{ width: `${stats.averageScore}%` }}></div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold text-gray-800">{stats.streak}</span>
          </div>
          <p className="text-gray-600 font-medium">Current Streak</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: `${Math.min((stats.streak / 5) * 100, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Recent Results */}
      {profileQuizzes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Results</h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {profileQuizzes?.slice(0, 5).map((result, key) => {
                  const quiz = appData?.quizData?.find(q => q.id === result.other.quizId);
                  return (
                    <div key={key} className="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          result.other.percentage >= 80 ? 'bg-green-100' : 
                          result.other.percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          <Trophy className={`w-6 h-6 ${
                            result.other.percentage >= 80 ? 'text-green-600' : 
                            result.other.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`} />
                        </div>   
                        <div>
                          <h3 className="font-semibold text-gray-800">{quiz?.title || 'Unknown Quiz'}</h3>
                          <p className="text-sm text-gray-600">
                            Completed {hexToString(result.other.completedAt as Hex)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{result.other.percentage}%</div>
                        <div className="text-sm text-gray-600">{result.other.score}/{result.other.totalPoints} pts</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Dashbaord() {
  const { onQuizSelect, setpath, formattedData , sethash, campaignStrings, campaignData, appData } = useStorage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // const { formattedData , setHash: setRequestedHash } = useProfile();
  const { isConnected } = useAccount();
  const allQuizzes = appData.quizData;
  const featuredQuizzes = appData.quizData?.slice(1, 7);

  const setHash = (arg: string) => {
    const found = campaignData.find(q => q.campaign === arg);
    sethash(found?.hash_ as string);
  };

  const backHome = () => {
    setpath('home');
  }

  const toggleOpen = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  return(
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 font-mono">
      {/* Header */}
      <div className="relative z-50 glass-card items-center border-b border-white/20">

        <div className="max-w-7xl flex justify-between mx-auto px-4 py-6">
          <div className="flex items-center cursor-pointer space-x-4">
            <div onClick={backHome} className="w-20 h-20 rounded-lg flex items-center justify-center">
              <Image 
                src="/learna-logo.png"
                alt="Learna Logo"
                width={100}
                height={100}
                className="object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Learna
              </h1>
              <p className="text-gray-600">
                Challenge yourself with engaging quizzes across various topics
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="w-full place-items-center">
              {isConnected && <ConnectButton accountStatus={"avatar"} showBalance={false} chainStatus={"icon"} label="Welcome to Educaster" />}
            </div>
            <div className="px-4 py-4 flex justify-center items-center gap-4">
              <button onClick={() => setpath('stats')} className="flex justify-start items-center gap-1 w-28 h-12 border rounded-xl p-3 text-gray-600 hover:text-cyan-600 transition-colors font-medium">
                <ChartBar className="w-4 h-4 text-pink-500" />
                <span>Stats</span>
              </button>
              <button onClick={() => setpath('setupcampaign')} className="flex justify-start items-center gap-1 w-28 h-12 border rounded-xl p-3 text-gray-600 hover:text-cyan-600 transition-colors font-medium">
                <LucideBox className="w-4 h-4 text-purple-500" />
                <span>Campaign</span>
              </button>
              <button onClick={() => setpath('profile')} className="flex justify-start items-center gap-1 w-28 h-12 border rounded-xl p-3 text-gray-600 hover:text-cyan-600 transition-colors font-medium">
                {
                  isConnected? <UserRoundCheck className="w-4 h-4 text-green-500" /> : <UserRoundX className="w-4 h-4 text-red-500" />
                }
                <span>Profile</span>
              </button>
            </div>
          </div>

           {/* Mobile menu button */}
            <Button 
                className="md:hidden p-2 text-gray-600 hover:text-cyan-600 transition-colors"
                onClick={toggleOpen}
                variant={'outline'}
            >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

          {/* Mobile menu */}
          {isMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg rounded-b-lg z-20 space-y-6">
                <div className='pl-4'>
                  <ConnectButton accountStatus={"avatar"} showBalance={false} chainStatus={"icon"} label="Reconnect" />
                </div>
                  <div className="px-4 py-4 space-y-4">
                    <button onClick={() => setpath('stats')} className="flex justify-center items-center gap-4 text-gray-600 hover:text-cyan-600 transition-colors font-medium">
                      <ChartBar className="w-5 h-5" />
                      <span>Stats</span>
                    </button>
                    <button onClick={() => setpath('setupcampaign')} className="flex justify-center items-center gap-4 text-gray-600 hover:text-cyan-600 transition-colors font-medium">
                      <LucideBox className="w-5 h-5" />
                      <span>Campaign</span>
                    </button>
                    <button onClick={() => setpath('profile')} className="flex justify-center items-center gap-4 text-gray-600 hover:text-cyan-600 transition-colors font-medium">
                      {
                        isConnected? <UserRoundCheck className="w-5 h-5 text-green-500" /> : <UserRoundX className="w-6 h-6 text-red-500" />
                      }
                      <span>Profile</span>
                    </button>
                  </div>
              </div>
          )}
        </div>
      </div>

      {/* Stats card */}
      <div className="my-8">
        <div className="flex justify-between items-center gap-4">
          <div className="w-2/4 flex items-center space-x-3">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-800">Quiz Stats</h2>
          </div>
          <div className='w-2/4'>
            <SelectComponent 
              campaigns={campaignStrings}
              placeHolder='Select campaign'
              setHash={setHash}
              width='w-full'
              contentType='string'
            />
          </div>
        </div>
        <DashboardInfo data={formattedData} />
      </div>

       {/* Featured Quizzes */}
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-8">
          <Star className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Featured Quizzes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredQuizzes?.map((quiz, index) => (
            <div key={quiz.imageUrl?.concat(index.toString())} style={{ animationDelay: `${index * 0.1}s` }}>
              <QuizCard quiz={quiz} onSelect={onQuizSelect} />
            </div>
          ))}
        </div>
      </div>
      
      {/* All Quizzes */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">All Quizzes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allQuizzes?.map((quiz, index) => (
            <div key={quiz.id.concat(index.toString())} style={{ animationDelay: `${index * 0.05}s` }}>
              <QuizCard quiz={quiz} onSelect={onQuizSelect} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}