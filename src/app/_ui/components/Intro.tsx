import Image from "next/image";
import { CheckCircle } from "@/ui/icons/CheckCircle";
import { importantToKnow } from "@/ui/content/content";
import { Button } from "./Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface IntroProps {
  onGetStartedClick: () => void;
  onTestCodeSubmit: (testCode: string) => void;
}

export const Intro = ({ onGetStartedClick, onTestCodeSubmit }: IntroProps) => {
  const router = useRouter();
  const [testCode, setTestCode] = useState("");
  const [error, setError] = useState("");
  
  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);
  
  const handleTestCodeSubmit = () => {
    if (!testCode.trim()) {
      setError("Please enter a test code");
      return;
    }
    
    setError("");
    onTestCodeSubmit(testCode.trim());
  };
  
  return (
    <div className="px-5 py-8 flex-1 w-full lg:max-w-4xl mx-auto flex flex-col overflow-hidden">
      <Image
        src="/doodles.svg"
        width={343}
        height={413}
        priority
        className="absolute -bottom-10 right-0 z-0 object-cover pointer-events-none w-[343px] h-[413px] lg:w-[500px] lg:h-[600px]"
        alt="Doodles Illustration"
      />
      <div className="w-full flex flex-col flex-1 items-center z-10">
        <h1 className="text-brand-light-blue font-bold text-[32px] sm:text-4xl">
          Daily Practice Paper (DPP)
        </h1>

        <h3 className="text-gray-800 font-bold text-xl mt-6 sm:text-2xl self-center">
          Things to know before you start:
        </h3>

        <div className="flex flex-col items-start mt-5 sm:mt-10 space-y-5 w-full">
          {importantToKnow.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle />
              <p className="text-sm text-brand-storm-dust font-normal sm:text-xl">
                {item}
              </p>
            </div>
          ))}
        </div>

        {/* Test Code Input Section - Moved below "Things to know" section */}
        <div className="w-full max-w-md mx-auto mt-8 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-black font-bold text-xl mb-3 text-center">
            Enter Test Code
          </h3>
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              placeholder="Enter your test code"
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light-blue"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="flex flex-col w-full mt-4 space-y-3">
            <Button
              block
              size={"small"}
              onClick={handleTestCodeSubmit}
            >
              Start Test
            </Button>
            <a 
              className="text-center text-blue-500 hover:text-blue-700 cursor-pointer"
              onClick={onGetStartedClick}
            >
              Attempt Quiz Without Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
