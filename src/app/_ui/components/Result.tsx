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
  subject: string;
  testCode?: string;
}

export const Result = ({ results, totalQuestions, topic, subject, testCode }: ResultProps) => {
  const { correctAnswers, wrongAnswers, secondsUsed } = results;
  const [error, setError] = useState("");
  const [resultSaved, setResultSaved] = useState(false);
  const router = useRouter();
  
  // Calculate score percentage for progress bar
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const timePercentage = Math.round((secondsUsed / (60 * totalQuestions)) * 100);

  useEffect(() => {
    // Save the current quiz result
    const saveQuizResult = async () => {
      try {
        setError("");  // Clear any previous errors
        
        if (!resultSaved) {
          // Generate a test code if not provided
          const quizTestCode = testCode || Math.random().toString(36).substr(2, 9);
          
          console.log("Saving quiz result with test code:", quizTestCode);
          const response = await authAPI.saveQuizResult({
            subject,
            topic,
            score: correctAnswers,
            totalQuestions,
            timeTaken: secondsUsed,
            testCode: quizTestCode
          });
          
          console.log("Quiz result saved successfully:", response);
          setResultSaved(true);
        }
      } catch (err: any) {
        console.error("Error in quiz result handling:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.response?.data?.error || "Failed to handle quiz result. Please try again later.");
      }
    };

    saveQuizResult();
  }, []); // Only run once when component mounts

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
    return 0;
  };

  // Get feedback based on score
  const getFeedback = () => {
    if (scorePercentage >= 80) return "Excellent work!";
    if (scorePercentage >= 60) return "Good job!";
    if (scorePercentage >= 40) return "Keep practicing!";
    return "Don't give up!";
  };

  return (
    <motion.div
      key={"result"}
      variants={{
        initial: {
          background: "linear-gradient(135deg, #FF6A66 0%, #FF9A8B 100%)",
          clipPath: "circle(0% at 50% 50%)",
        },
        animate: {
          background: "linear-gradient(135deg, #FF6A66 0%, #FF9A8B 100%)",
          clipPath: "circle(100% at 50% 50%)",
        },
      }}
      className="w-full h-full flex justify-center p-5 overflow-y-auto"
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col text-black font-bold text-center w-full max-w-2xl mx-auto">
        <div className="bg-white/20 backdrop-blur-sm py-3 px-4 rounded-xl">
          <h1 className="font-bold text-xl text-white">Daily Practice Paper Test Results</h1>
        </div>

        {/* Current Result Box */}
        <div className="mt-6 flex-1 bg-white border border-brand-light-gray rounded-2xl shadow-lg flex flex-col items-center py-7 px-4">
          <div className="relative">
            <Lottie
              animationData={confettiAnimation}
              loop={false}
              autoplay={true}
              style={{ width: "170px", height: "170px" }}
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              {topic}
            </div>
          </div>
          
          <h3 className="text-brand-midnight text-3xl font-bold mt-4">
            {getFeedback()}
          </h3>
          
          {/* <div className="mt-6 w-full px-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-lg font-medium text-gray-700">Score</span>
              <span className="text-lg font-medium text-gray-700">{scorePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  scorePercentage >= 70 ? 'bg-green-500' : 
                  scorePercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
                style={{ width: `${scorePercentage}%` }}
              ></div>
            </div>
            <p className="text-center text-3xl font-bold text-gray-800 mt-3">{correctAnswers}/{totalQuestions}</p>
            <p className="text-center text-sm font-normal text-gray-500">correct answers</p>
          </div> */}

          {/* Charts */}
          <div className="flex flex-wrap items-center justify-center mt-6 gap-6">
            <div className="flex flex-col items-center">
              <DonutChart
                className="w-32 h-32"
                total={60 * totalQuestions}
                used={secondsUsed}
                type={"time"}
                data={[
                  {
                    label: "Time Used",
                    value: secondsUsed,
                    color: "#4F46E5",
                  },
                  {
                    label: "Time Left",
                    value: 60 * totalQuestions - secondsUsed,
                    color: "#F0F0F0",
                  },
                ]}
              />
              <div className="mt-2 text-center">
                <p className="text-sm font-semibold text-gray-700">Time Used</p>
                <p className="text-xs text-gray-500">{timePercentage}% of available time</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <DonutChart
                className="w-32 h-32"
                type={"questions"}
                total={totalQuestions}
                used={correctAnswers}
                data={[
                  {
                    label: "Correct",
                    value: correctAnswers,
                    color: "#10B981",
                  },
                  {
                    label: "Wrong",
                    value: wrongAnswers,
                    color: "#EF4444",
                  },
                ]}
              />
              <div className="mt-2 text-center">
                <p className="text-sm font-semibold text-gray-700">Questions</p>
                <p className="text-xs text-gray-500">{correctAnswers} correct, {wrongAnswers} wrong</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Container */}
        <div className="mt-6 grid gap-3">
          {/* View Full Report Card Button */}
          <Button
            intent="primary"
            size="medium"
            block
            className="bg-gradient-to-r from-[#374CB7] to-[#4E61D8] hover:from-[#2a3b8e] hover:to-[#3a4ab8] text-white rounded-xl shadow-md font-medium flex items-center justify-center py-3.5"
            onClick={handleViewReportCard}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            View Full Report Card
          </Button>

          {/* Try Again Button */}
          <Button
            intent="primary"
            size="medium"
            block
            className="bg-gradient-to-r from-[#3EAA78] to-[#56C490] hover:from-[#35926A] hover:to-[#45A277] text-white rounded-xl shadow-md font-medium flex items-center justify-center py-3.5"
            onClick={handleRetry}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </Button>
        </div>
      </div>
    </motion.div>
  );
};