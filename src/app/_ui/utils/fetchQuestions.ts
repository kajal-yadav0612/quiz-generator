import axios from "axios" ;
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const fetchQuizQuestions = async (subject: string, difficulty: string, topic: string) => {
  try {
    // Get the authentication token from localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await axios.post(
      "http://localhost:5000/api/quiz/generate", 
      { subject, topic, difficulty, numQuestions: 15 },
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    console.log("API Response:", response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response format from server");
    }

    return response.data;
  } catch (error: any) {
    console.error("Error in fetchQuizQuestions:", error);
    if (error.response?.status === 500) {
      throw new Error("Server error: Quiz generation failed. Please try again.");
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to fetch quiz questions. Please try again.");
    }
  }
};
