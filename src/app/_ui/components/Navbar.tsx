"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, User } from "../utils/authUtils";

export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get the current user when component mounts
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Quiz App
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex flex-col items-end">
                <span className="font-semibold">{user.username}</span>
                {user.email && <span className="text-xs text-blue-200">{user.email}</span>}
              </div>
              <Link
                href="/report-card"
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-gray-100"
              >
                Report Card
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-x-2">
              <Link
                href="/login"
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-400"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
