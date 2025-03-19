"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface TestInfo {
  testCode: string;
  subject: string;
  topic: string;
  difficulty: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

interface LeaderboardEntry {
  _id: string;
  testCode: string;
  userId: User;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  rank: number;
  timestamp: string;
}

interface LeaderboardData {
  testInfo: TestInfo;
  leaderboard: LeaderboardEntry[];
}

export default function Leaderboard({ params }: { params: { testCode: string } }) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/admin/leaderboard/${params.testCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setLeaderboardData(response.data);
      } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        setError(error.response?.data?.error || "Failed to fetch leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [params.testCode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleBack = () => {
    router.push("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <button
          onClick={handleBack}
          className="bg-brand-light-blue text-white px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!leaderboardData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl mb-4">No data available for this test code.</p>
        <button
          onClick={handleBack}
          className="bg-brand-light-blue text-white px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-brand-light-blue text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Test Leaderboard</h1>
          <button
            onClick={handleBack}
            className="bg-white text-brand-light-blue px-3 py-1 rounded-md text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>
      
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Test Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Test Code</p>
              <p className="font-medium">{leaderboardData.testInfo.testCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium">{leaderboardData.testInfo.subject}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Topic</p>
              <p className="font-medium">{leaderboardData.testInfo.topic}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Difficulty</p>
              <p className="font-medium">{leaderboardData.testInfo.difficulty}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
          
          {leaderboardData.leaderboard.length === 0 ? (
            <p className="text-gray-500">No students have taken this test yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Taken
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboardData.leaderboard.map((entry) => (
                    <tr key={entry._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          #{entry.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.userId.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.userId.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entry.score} / {entry.totalQuestions}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round((entry.score / entry.totalQuestions) * 100)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(entry.timeTaken)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
