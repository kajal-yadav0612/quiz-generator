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
      localStorage.setItem("isAdmin", "false"); // Explicitly set isAdmin to false for regular users
      if (response.email) {
        localStorage.setItem("email", response.email);
      }

      // Create a custom event with user data
      const loginEvent = new CustomEvent("userLogin", {
        detail: {
          username: response.username,
          email: response.email,
          userId: response.userId,
          isAdmin: false
        }
      });
      window.dispatchEvent(loginEvent);

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
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 bg-gray-100 shadow-md rounded-lg">
        <div className="flex justify-center mb-8">
          <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
          </g>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Student Login</h1>

        {error && (
          <div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <input
                id="identifier"
                type="text"
                className="w-full p-3 rounded-md bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="Email or Username"
              />
            </div>

            <div>
              <input
                id="password"
                type="password"
                className="w-full p-3 rounded-md bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full p-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In as Student"}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>

        <div className="border-t border-gray-300 mt-8 pt-6 text-center">
          <Link href="/admin/login" className="text-blue-600 hover:text-blue-500">
            Login as Admin
          </Link>
        </div>
      </div>
    </div>
  );
}