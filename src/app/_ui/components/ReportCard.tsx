"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { authAPI } from "../utils/apiUtils";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

interface QuizHistoryItem {
  quizId: string;
  topic: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export const ReportCard = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        setLoading(true);
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
    };

    fetchQuizHistory();
  }, []);

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

  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl mx-auto p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Performance Report Card</h2>
        <Button intent="secondary" size="small" onClick={handleBackToHome}>
          Back to Home
        </Button>
      </div>
      
      {quizHistory.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">You haven't taken any quizzes yet.</p>
          <p className="mt-2 text-blue-600">Start a quiz to see your results here!</p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap justify-between items-center">
              <div className="mb-2 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800">Performance Summary</h3>
                <p className="text-gray-600">Based on {quizHistory.length} quiz{quizHistory.length !== 1 ? 'zes' : ''}</p>
              </div>
              <div className="flex items-center">
                <div className="text-center mr-6">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600">{calculateAverageScore()}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Quizzes Taken</p>
                  <p className="text-2xl font-bold text-blue-600">{quizHistory.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizHistory.map((quiz) => (
                  <tr key={quiz.quizId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quiz.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quiz.topic}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quiz.score} / {quiz.totalQuestions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
    </motion.div>
  );
};
