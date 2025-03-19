"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "../_ui/utils/apiUtils";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Attempting login with:", { identifier });

    try {
      const response = await authAPI.login({ identifier, password });
      console.log("Login successful");

      // Store token and user info in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("username", response.username);
      localStorage.setItem("userId", response.userId);
      if (response.email) {
        localStorage.setItem("email", response.email);
      }

      // Redirect to home page
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Login failed");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-2 text-center">Student Login</h1>
        <p className="text-center text-gray-600 mb-6">Login to take quizzes and view your results</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="identifier">
              Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="your.email@example.com or username"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In as Student"}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <Link href="/signup" className="text-blue-600 hover:text-blue-800">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
        
        <div className="text-center mt-2">
          <Link href="/admin/login" className="text-blue-600 hover:text-blue-800">
            Login as Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
