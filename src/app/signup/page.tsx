"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "../_ui/utils/apiUtils";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    console.log("Attempting signup with:", { email, username, password: "***" });

    try {
      const userData = {
        email,
        password,
        username: username || undefined, // Only send username if provided
        role: "student" // Explicitly set role as student
      };
      
      const response = await authAPI.register(userData);
      console.log("Signup successful");

      // Show success message and redirect to login page instead of storing token
      setError("");
      alert("Account created successfully! Please log in with your credentials.");
      router.push("/login");
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Registration failed");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8">
        <div className="flex justify-center mb-8">
        
            <g>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </g>
         
        </div>
        
        <h1 className="text-3xl font-bold mb-6 text-white text-center">Join today.</h1>
        
        {error && (
          <div className="bg-red-900 border border-red-800 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-4">
            <div>
              <input
                id="email"
                type="email"
                className="w-full p-3 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email Address"
              />
            </div>
            
            <div>
              <input
                id="username"
                type="text"
                className="w-full p-3 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (Optional)"
              />
            </div>
            
            <div>
              <input
                id="password"
                type="password"
                className="w-full p-3 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Password"
              />
            </div>
            
            <div>
              <input
                id="confirmPassword"
                type="password"
                className="w-full p-3 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm Password"
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full p-3 rounded-md bg-white text-black font-bold hover:bg-gray-200 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>
          
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-400">
              Log In
            </Link>
          </p>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-500">
            Are you an administrator?{" "}
            <Link href="/admin/signup" className="text-blue-500 hover:text-blue-400">
              Admin Registration
            </Link>
          </p>
        </div>
      </div>
  
  );
}