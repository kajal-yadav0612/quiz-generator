"use client";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { Button } from "@/app/_ui/components/Button";
import { authAPI } from "../utils/apiUtils";
import { useRouter } from "next/navigation";

import confettiAnimation from "@/ui/assets/animations/confetti.json";
import { DonutChart } from "./DonutChart";

interface QuizHistoryItem {
  quizId: string;
  topic: string;
  score: number;
  totalQuestions: number;
  date: string;
}

interface ResultProps {  
  results: {
    correctAnswers: number;
    wrongAnswers: number;
    secondsUsed: number;
  };
  totalQuestions: number;
  topic: string;
}

export const Result = ({ results, totalQuestions, topic }: ResultProps) => {
  const { correctAnswers, wrongAnswers, secondsUsed } = results;
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");
  const [resultSaved, setResultSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Save the current quiz result only if not already saved
    const saveQuizResult = async () => {
      if (resultSaved) {
        // If already saved, just fetch the quiz history
        try {
          const userData = await authAPI.getProfile();
          
          if (userData && userData.quizHistory) {
            // Sort by date (newest first)
            const sortedHistory = [...userData.quizHistory].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setQuizHistory(sortedHistory);
          }
        } catch (err: any) {
          console.error("Failed to fetch quiz history:", err);
          setError("Failed to load your quiz history. Please try again later.");
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        // Save the quiz result
        await authAPI.saveQuizResult({
          topic,
          score: correctAnswers,
          totalQuestions
        });
        
        // Mark as saved to prevent duplicate saves
        setResultSaved(true);
        
        // After saving, fetch the updated quiz history
        const userData = await authAPI.getProfile();
        
        if (userData && userData.quizHistory) {
          // Sort by date (newest first)
          const sortedHistory = [...userData.quizHistory].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setQuizHistory(sortedHistory);
        }
      } catch (err: any) {
        console.error("Failed to save quiz result or fetch history:", err);
        setError("Failed to save your quiz result. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    saveQuizResult();
  }, [correctAnswers, totalQuestions, topic, resultSaved]);

  const handleRetry = () => {
    // Restart quiz
    window.location.reload();
  };

  const handleViewReportCard = () => {
    router.push('/report-card');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAverageScore = () => {
    if (quizHistory.length === 0) return 0;
    
    const totalScore = quizHistory.reduce((acc, quiz) => {
      return acc + (quiz.score / quiz.totalQuestions) * 100;
    }, 0);
    
    return Math.round(totalScore / quizHistory.length);
  };

  return (
    <motion.div
      key={"result"}
      variants={{
        initial: {
          background: "#FF6A66",
          clipPath: "circle(0% at 50% 50%)",
        },
        animate: {
          background: "#FF6A66",
          clipPath: "circle(100% at 50% 50%)",
        },
      }}
      className="w-full h-full flex justify-center p-5 overflow-y-auto"
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col text-black font-bold text-[32px] text-center w-full">
        <h1 className="font-bold text-base text-white">Daily Practice Paper Test Results</h1>

        {/* Current Result Box */}
        <div className="mt-6 flex-1 bg-white border border-brand-light-gray rounded-2xl flex flex-col items-center py-7 px-2 ">
          <Lottie
            animationData={confettiAnimation}
            loop={false}
            autoplay={true}
            style={{ width: "170px", height: "170px" }}
          />
          <h3 className="text-brand-midnight text-[32px] font-medium leading-9 mt-4">
            Congratulations!
          </h3>
          <p className="text-brand-midnight text-xl font-normal mt-2">
            You scored
          </p>
          <span className="text-brand-midnight font-medium text-[40px]">
            {`${correctAnswers}/${totalQuestions}`}
          </span>
          <p className="text-brand-midnight text-sm font-normal mt-1">
            correct answers
          </p>

          {/* Charts */}
          <div className="flex items-center mt-4 space-x-4">
            <DonutChart
              className="w-36 h-36"
              total={60 * totalQuestions}
              used={secondsUsed}
              type={"time"}
              data={[
                {
                  label: "Time Used",
                  value: secondsUsed,
                  color: "#374CB7",
                },
                {
                  label: "Time Left",
                  value: 60 * totalQuestions - secondsUsed,
                  color: "#F0F0F0",
                },
              ]}
            />

            <DonutChart
              className="w-36 h-36"
              type={"questions"}
              total={totalQuestions}
              used={correctAnswers}
              data={[
                {
                  label: "Correct",
                  value: correctAnswers,
                  color: "#56C490",
                },
                {
                  label: "Wrong",
                  value: wrongAnswers,
                  color: "#FF6A66",
                },
              ]}
            />
          </div>
        </div>

        {/* Toggle History Button */}
        <Button
          intent={"secondary"}
          size="small"
          block
          className="mt-4"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? "Hide Quiz History" : "Show Quiz History"}
        </Button>

        {/* View Full Report Card Button */}
        <Button
          intent={"secondary"}
          size="small"
          block
          className="mt-4"
          onClick={handleViewReportCard}
        >
          View Full Report Card
        </Button>

        {/* Quiz History Section */}
        {showHistory && (
          <div className="mt-4 bg-white rounded-lg shadow-md p-4 w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Quiz History</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : quizHistory.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No previous quiz history found.</p>
            ) : (
              <>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex flex-wrap justify-between items-center">
                    <div className="mb-2 md:mb-0">
                      <h3 className="text-lg font-semibold text-gray-800">Performance Summary</h3>
                      <p className="text-gray-600 text-sm">Based on {quizHistory.length} quiz{quizHistory.length !== 1 ? 'zes' : ''}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="text-center mr-6">
                        <p className="text-xs text-gray-600">Average Score</p>
                        <p className="text-xl font-bold text-blue-600">{calculateAverageScore()}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Quizzes Taken</p>
                        <p className="text-xl font-bold text-blue-600">{quizHistory.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Topic
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quizHistory.map((quiz) => (
                        <tr key={quiz.quizId} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                            {formatDate(quiz.date)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="text-xs font-medium text-gray-900">{quiz.topic}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="text-xs text-gray-900">{quiz.score} / {quiz.totalQuestions}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              (quiz.score / quiz.totalQuestions) >= 0.7 
                                ? 'bg-green-100 text-green-800' 
                                : (quiz.score / quiz.totalQuestions) >= 0.4 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {Math.round((quiz.score / quiz.totalQuestions) * 100)}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Retry Button */}
        <div className="mt-auto">
          <Button
            intent={"secondary"}
            size="small"
            block
            className="mt-6"
            onClick={handleRetry}
          >
            Try Again
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
