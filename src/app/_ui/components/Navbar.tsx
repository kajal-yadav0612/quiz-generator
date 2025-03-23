"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, logout, User } from "../utils/authUtils";
import { Button } from "./Button";

interface ExtendedUser extends User {
  isAdmin?: boolean;
}

export const Navbar = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // List of paths where navbar should not appear
  const hiddenPaths = ['/login', '/signup', '/admin/login'];

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

  // Don't render navbar for admin, non-logged in users, or on login/signup pages
  if (!user || user.isAdmin || hiddenPaths.includes(pathname)) {
    return null;
  }

  return (
    <nav className="bg-white text-brand-bittersweet p-4 shadow-sm">
      <div className="container mx-auto flex justify-end items-center">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="font-semibold text-brand-bittersweet">{user.username}</span>
            {user.email && <span className="text-xs text-gray-500">{user.email}</span>}
          </div>
          <Button
            intent="primary"
            size="small"
            onClick={() => router.push('/report-card')}
          >
            Report Card
          </Button>
          <Button
            intent="primary"
            size="small"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};
