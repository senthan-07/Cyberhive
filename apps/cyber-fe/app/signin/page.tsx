"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"signin" | "mfa">("signin");
  const [error, setError] = useState("");
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const verified = sessionStorage.getItem("verified");
    if (!verified) {
      router.replace("/verify");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (step === "signin") {
      setForm({ ...form, [e.target.name]: e.target.value });
    } else {
      setCode(e.target.value);
    }
  };

  const handleSignin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign in failed");
      } else {
        setError("");
        setStep("mfa");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "MFA failed");
      } else {
        localStorage.setItem("token", data.token);
        router.push("/Dashboard");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md space-y-6">
        {step === "signin" ? (
          <>
            <h2 className="text-2xl font-bold">Sign In</h2>
            <input
              name="email"
              placeholder="Email"
              type="email"
              className="w-full p-3 bg-gray-700 rounded-md"
              onChange={handleChange}
              value={form.email}
            />
            <input
              name="password"
              placeholder="Password"
              type="password"
              className="w-full p-3 bg-gray-700 rounded-md"
              onChange={handleChange}
              value={form.password}
            />
            {error && <p className="text-red-400">{error}</p>}
            <button
              onClick={handleSignin}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Send MFA Code
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">Enter MFA Code</h2>
            <input
              name="code"
              placeholder="6-digit code"
              className="w-full p-3 bg-gray-700 rounded-md tracking-widest text-center"
              maxLength={6}
              onChange={handleChange}
              value={code}
            />
            {error && <p className="text-red-400">{error}</p>}
            <button
              onClick={handleVerify}
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-md"
            >
              Verify & Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
