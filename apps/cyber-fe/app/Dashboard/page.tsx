"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const verified = sessionStorage.getItem("verified");
    const token = localStorage.getItem("token");

    if (!verified || !token) {
      router.replace("/verify");
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("verified");
    router.push("/welcome");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative px-4 py-6">
      {/* Top Left */}
      <div className="absolute top-4 left-6 text-2xl font-bold">Dashboard</div>

      {/* Top Right */}
      <div className="absolute top-4 right-6">
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Sign Out
        </button>
      </div>

      {/* Center Buttons */}
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <button
          onClick={() => {
            sessionStorage.setItem("fromDashboard", "true");
            setTimeout(() => {
                router.push("/ids");
              }, 50);
        }}
          className="w-60 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-lg font-medium"
        >
          Go to IDS
        </button>
        <button
          onClick={() => {
            router.push("/scanner?from=dashboard");

          }}
          className="w-60 py-3 bg-green-600 hover:bg-green-700 rounded-md text-lg font-medium"
        >
          Go to Scanner
        </button>
        <button
          onClick={() => router.push("/chat?from=Dashboard")}
          className="w-60 py-3 bg-purple-600 hover:bg-purple-700 rounded-md text-lg font-medium"
        >
          Go to Chat
        </button>
        <button
          onClick={() => router.push("/vuln?from=Dashboard")}
          className="w-60 py-3 bg-red-600 hover:bg-red-700 rounded-md text-lg font-medium"
        >
          Go to Image Scanner
        </button>
      </div>
    </div>
  );
}
