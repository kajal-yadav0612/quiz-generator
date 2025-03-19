"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReportCard } from "../_ui/components/ReportCard";
import { isAuthenticated } from "../_ui/utils/authUtils";

export default function ReportCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      <div className="container mx-auto px-4">
        <ReportCard />
      </div>
    </div>
  );
}
