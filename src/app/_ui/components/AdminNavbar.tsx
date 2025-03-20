"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const AdminNavbar = () => {
  const [adminName, setAdminName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("adminToken");
    const name = localStorage.getItem("adminName");
    
    if (token && name) {
      setIsLoggedIn(true);
      setAdminName(name);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    router.push("/admin/login");
  };

  // Only render the navbar if admin is logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <nav className="bg-brand-light-blue text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/admin/dashboard" className="text-xl font-bold">
          EduAI Admin
        </Link>
        
        <div className="flex items-center space-x-4">
          <span>Welcome, {adminName}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-brand-light-blue px-3 py-1 rounded-md text-sm hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
