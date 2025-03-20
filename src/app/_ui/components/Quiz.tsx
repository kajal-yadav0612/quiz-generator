import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fetchQuizQuestions } from "../utils/fetchQuestions"; // Import Gemini fetch function
import { Button } from "@/ui/components/Button";
import { OptionList } from "./OptionList";
import { formatTime } from "../utils/formatTime";
import { useRouter } from "next/navigation";
import { Result } from "./Result";
import { authAPI } from "../utils/apiUtils"; // Import authAPI
import {
  playCorrectAnswer,
  playWrongAnswer,
  playQuizEnd,
} from "../utils/playSound";
import axios from "axios";

// Define props type
interface QuizProps {
  selectedSubject: string;
  selectedLevel: string;
  selectedTopic: string;
  testCode?: string;
}

const TIME_LIMIT = 60; // 1 minute per question

export const Quiz = ({
  selectedSubject,
  selectedLevel,
  selectedTopic,
  testCode = "",
}: QuizProps) => {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [timePassed, setTimePassed] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(-1);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [results, setResults] = useState({
    correctAnswers: 0,
    wrongAnswers: 0,
    secondsUsed: 0,
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);

  // Update the QuizQuestion interface to include id property
  interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }

  // Load questions from localStorage
  useEffect(() => {
    const storedQuestions = localStorage.getItem("quizQuestions");
    if (storedQuestions && testCode) {
      setQuizQuestions(JSON.parse(storedQuestions));
      localStorage.removeItem("quizQuestions"); // Clear after loading
      setLoading(false);
    } else {
      fetchQuestions();
    }
  }, [selectedSubject, selectedLevel, selectedTopic, testCode]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/api/quiz/generate",
        {
          subject: selectedSubject,
          difficulty: selectedLevel,
          topic: selectedTopic,
          testCode: testCode || undefined, // Only send testCode if it exists
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Handle different response formats based on whether a test code was used
      if (testCode && response.data && response.data.questions) {
        // When using test code, questions are in response.data.questions
        setQuizQuestions(response.data.questions);
      } else if (response.data) {
        // When not using test code, questions are directly in response.data
        setQuizQuestions(response.data);
      } else {
        setError("Failed to load questions. Please try again.");
      }
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      setError(
        error.response?.data?.error || "Failed to load questions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const setupTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimePassed((prevTimePassed) =>
        prevTimePassed > TIME_LIMIT ? TIME_LIMIT : prevTimePassed + 1
      );
    }, 1000);
  };

  useEffect(() => {
    if (quizFinished) return;
    setupTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizFinished]);

  useEffect(() => {
    if (quizFinished || timePassed <= TIME_LIMIT) return;
    if (selectedAnswerIndex === -1) {
      setResults((prev) => ({
        ...prev,
        //secondsUsed: prev.secondsUsed + TIME_LIMIT,
        wrongAnswers: prev.wrongAnswers + 1,
      }));
    }
    handleNextQuestion();
    setTimePassed(0);
  }, [timePassed]);

  const handleNextQuestion = () => {
    setSelectedAnswerIndex(-1);
    if (activeQuestion + 1 < quizQuestions.length) {
      setActiveQuestion((prev) => prev + 1);
      setSelectedAnswerIndex(-1);
      setTimePassed(0); // Reset timer
      setupTimer();
    } else {
      playQuizEnd();
      // Save the quiz result before showing the result screen
      const saveResult = async () => {
        try {
          // Calculate total time taken in seconds
          const totalTimeTaken = results.secondsUsed + timePassed;
          
          console.log("Submitting quiz result:", {
            subject: selectedSubject,
            topic: selectedTopic,
            score: results.correctAnswers,
            totalQuestions: quizQuestions.length,
            testCode,
            timeTaken: totalTimeTaken,
          });
          
          await authAPI.saveQuizResult({
            subject: selectedSubject,
            topic: selectedTopic,
            score: results.correctAnswers,
            totalQuestions: quizQuestions.length,
            testCode: testCode || undefined,  // Include test code if available
            timeTaken: totalTimeTaken,  // Include time taken in seconds
          });
          console.log("Quiz result saved successfully");
        } catch (error: any) {
          console.error("Failed to save quiz result:", error.response?.data || error);
        } finally {
          setQuizFinished(true);
        }
      };
      saveResult();
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    clearInterval(timerRef.current!);
    setSelectedAnswerIndex(answerIndex);
    const correctAnswer = quizQuestions[activeQuestion]?.correctAnswer;
    const selectedAnswer = quizQuestions[activeQuestion]?.options[answerIndex];

    if (correctAnswer === selectedAnswer) {
      playCorrectAnswer();
      setResults((prev) => ({
        ...prev,
        secondsUsed: prev.secondsUsed + timePassed,
        correctAnswers: prev.correctAnswers + 1,
      }));
      setIsCorrectAnswer(true);
    } else {
      playWrongAnswer();
      setResults((prev) => ({
        ...prev,
        secondsUsed: prev.secondsUsed + timePassed,
        wrongAnswers: prev.wrongAnswers + 1,
      }));
      setIsCorrectAnswer(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const saveTestScore = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      // Calculate score
      const score = quizQuestions.reduce((total, question) => {
        return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
      }, 0);
      // Save score to the server
      await axios.post(
        "http://localhost:5000/api/quiz/save-score",
        {
          testCode,
          score,
          totalQuestions: quizQuestions.length,
          timeTaken: timeSpent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error saving test score:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-light-blue mx-auto"></div>
          <p className="mt-4 text-brand-light-blue">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <Result
        results={results}
        totalQuestions={quizQuestions.length}
        topic={selectedSubject}
      />
    );
  }

  if (quizQuestions.length === 0 || !quizQuestions[activeQuestion]) {
    return <p>Loading questions...</p>;
  }

  const { question, options } = quizQuestions[activeQuestion];

  return (
    <motion.div
      key={"countdown"}
      variants={{
        initial: { background: "#FF6A66", clipPath: "circle(0% at 50% 50%)" },
        animate: { background: "#ffffff", clipPath: "circle(100% at 50% 50%)" },
      }}
      className="w-full h-full flex justify-center p-5"
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col text-black font-bold text-[32px] text-center w-full">
        <h1 className="font-bold text-base text-brand-light-blue">
          Daily Practice Paper Test
        </h1>

        <div className="mt-6 rounded-2xl border border-brand-light-gray px-7 py-4 w-full mb-1">
          <h3 className="text-black font-medium text-sm">
            Question {activeQuestion + 1} / {quizQuestions.length}
          </h3>
          <h4 className="text-brand-midnight font-medium text-base mt-[34px]">
            {question}
          </h4>
        </div>
        <div className="flex justify-center items-center w-full mt-[18px]">
          <span className="text-brand-mountain-mist text-xs font-normal">
            {formatTime(timePassed)}
          </span>
          <div className="relative flex-1 h-3 bg-[#F0F0F0] mx-1 rounded-full">
            <motion.div
              className="absolute top-0 left-0 h-full bg-brand-light-blue rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(timePassed / TIME_LIMIT) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <span className="text-brand-mountain-mist text-xs font-normal">
            {formatTime(TIME_LIMIT)}
          </span>
        </div>

        <OptionList
          activeQuestion={quizQuestions[activeQuestion]}
          options={options}
          selectedAnswerIndex={selectedAnswerIndex}
          onAnswerSelected={handleSelectAnswer}
          isCorrectAnswer={isCorrectAnswer}
        />

        <div className="mt-auto w-full z-10">
          <Button
            disabled={selectedAnswerIndex === -1}
            block
            size="small"
            onClick={handleNextQuestion}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
};