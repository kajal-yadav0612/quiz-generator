"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { fetchQuizQuestions } from "../utils/fetchQuestions";

const subjects = [
  "Mathematics",
  "Science",
  "Social Studies",
  "General Knowledge",
  "Machine Learning",
] as const;

type Subject = typeof subjects[number];

const topicsBySubject: Record<Subject, string[]> = {
  Mathematics: ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry", "Number Theory"],
  Science: ["Physics", "Chemistry", "Biology", "Astronomy", "Earth Science", "Environmental Science"],
  "Social Studies": ["History", "Geography", "Civics", "Economics", "Political Science", "Sociology"],
  "General Knowledge": ["Current Affairs", "Geography", "Arts & Literature", "Sports", "Technology", "Entertainment"],
  "Machine Learning": ["Supervised Learning", "Unsupervised Learning", "Deep Learning", "Neural Networks", "Natural Language Processing", "Computer Vision"],
};

const levels = ["Easy", "Medium", "Hard"] as const;

type Level = typeof levels[number];

export const SubjectSelect = ({ onStartQuiz }: { onStartQuiz: (subject: Subject, level: Level, topic: string) => void }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | "">("");
  const [selectedLevel, setSelectedLevel] = useState<Level | "">("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Reset topic when subject changes
  useEffect(() => {
    setSelectedTopic("");
  }, [selectedSubject]);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleContinue = async () => {
    if (!selectedSubject || !selectedLevel || !selectedTopic) return;
    setLoading(true);

    try {
      const quizQuestions = await fetchQuizQuestions(selectedSubject, selectedLevel, selectedTopic);
      localStorage.setItem("quizQuestions", JSON.stringify(quizQuestions));
      onStartQuiz(selectedSubject, selectedLevel, selectedTopic);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="subject-select"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
      className="w-full h-full flex flex-col p-5 overflow-y-auto bg-gradient-to-br from-brand-background to-brand-background-light rounded-2xl shadow-soft"
      initial="initial"
      animate="animate"
      exit="initial"
    >
      <div className="flex-1 flex flex-col mb-6">
        <h1 className="text-[#E32636] font-bold text-3xl text-center mb-8">
          Customize Your Quiz
        </h1>

        <div className="space-y-6 max-w-md mx-auto w-full">
          {/* Subject Selection Dropdown */}
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-brand-background-dark/20 hover:shadow-lg transition-all duration-300">
            <label htmlFor="subject-select" className="block text-lg font-medium text-brand-neutral-dark mb-2">
              Subject
            </label>
            <div className="relative">
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as Subject)}
                className="w-full p-3 rounded-xl border border-brand-background-dark bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light focus:outline-none appearance-none pr-10 transition-all duration-200"
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-neutral">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Topic Selection Dropdown */}
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-brand-background-dark/20 hover:shadow-lg transition-all duration-300">
            <label htmlFor="topic-select" className="block text-lg font-medium text-brand-neutral-dark mb-2">
              Topic
            </label>
            <div className="relative">
              <select
                id="topic-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!selectedSubject}
                className={`w-full p-3 rounded-xl border ${!selectedSubject ? 'bg-brand-background-dark text-brand-neutral-light cursor-not-allowed' : 'bg-white border-brand-background-dark focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light'} focus:outline-none appearance-none pr-10 transition-all duration-200`}
              >
                <option value="">Select a topic</option>
                {selectedSubject && 
                  topicsBySubject[selectedSubject].map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))
                }
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-neutral">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-brand-background-dark/20 hover:shadow-lg transition-all duration-300">
            <h2 className="text-lg font-medium text-brand-neutral-dark mb-3">Difficulty Level</h2>
            <div className="grid grid-cols-3 gap-3">
              {levels.map((level) => {
                const colors = {
                  Easy: {
                    active: 'bg-brand-secondary-light/20 border-brand-secondary-light text-brand-secondary-dark',
                    inactive: 'border-brand-background-dark hover:border-brand-secondary-light hover:bg-brand-secondary-light/10'
                  },
                  Medium: {
                    active: 'bg-brand-primary-light/20 border-brand-primary-light text-brand-primary-dark',
                    inactive: 'border-brand-background-dark hover:border-brand-primary-light hover:bg-brand-primary-light/10'
                  },
                  Hard: {
                    active: 'bg-brand-accent-light/20 border-brand-accent-light text-brand-accent-dark',
                    inactive: 'border-brand-background-dark hover:border-brand-accent-light hover:bg-brand-accent-light/10'
                  }
                };
                
                const isActive = selectedLevel === level;
                const colorClass = isActive ? colors[level].active : colors[level].inactive;
                
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`p-3 rounded-xl border font-medium transition-all duration-200 ${colorClass}`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button - Fixed at bottom */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-b from-transparent to-brand-background">
        <div className="max-w-md mx-auto w-full">
          <button
            disabled={!selectedSubject || !selectedLevel || !selectedTopic || loading}
            onClick={handleContinue}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-button transition-all duration-200 ${
              !selectedSubject || !selectedLevel || !selectedTopic || loading
                ? 'bg-brand-neutral-light cursor-not-allowed'
                : 'bg-[#E32636] hover:bg-[#E32636]/90 transform hover:-translate-y-1'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Preparing Quiz...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Start Quiz
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
