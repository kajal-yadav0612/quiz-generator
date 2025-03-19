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

    if (!response.data) {
      throw new Error("API returned no data");
    }

    if (!Array.isArray(response.data)) {
      console.warn("Expected an array, converting to array:", response.data);
      return [response.data];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return [];
  }
};
