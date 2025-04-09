"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const verified = sessionStorage.getItem("verified");
    if (!verified) {
      router.replace("/verify");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl text-center space-y-6">
        <h1 className="text-3xl font-bold text-white">Welcome to CyberHive</h1>
        <p className="text-gray-400">Choose your next action:</p>
        <div className="space-y-4">
          <button
            onClick={() => router.push("/signin")}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
