"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const verified = sessionStorage.getItem("verified");
    if (!verified) {
      router.replace("/verify");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Signup failed");
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold">Sign Up</h2>
        <input
          name="username"
          placeholder="Username"
          className="w-full p-3 bg-gray-700 rounded-md"
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          className="w-full p-3 bg-gray-700 rounded-md"
          onChange={handleChange}
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          className="w-full p-3 bg-gray-700 rounded-md"
          onChange={handleChange}
        />
        {error && <p className="text-red-400">{error}</p>}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-md"
        >
          Register
        </button>
      </div>
    </div>
  );
}
