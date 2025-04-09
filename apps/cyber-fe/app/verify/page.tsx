"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PRESET_CODE = "1234567890";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (code.length === 10) {
      if (code === PRESET_CODE) {
        sessionStorage.setItem("verified", "true");
        setTimeout(() => router.push("/welcome"), 500);
      } else {
        setError(true);
      }
    } else {
      setError(false);
    }
  }, [code, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-6">Enter Access Code</h1>
        <input
          type="text"
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="10-digit code"
          className="w-full p-3 rounded-md bg-gray-700 text-white text-center outline-none focus:ring-2 ring-blue-500"
        />
        {error && (
          <p className="mt-3 text-sm text-red-400">Invalid code. Try again.</p>
        )}
      </div>
    </div>
  );
}
