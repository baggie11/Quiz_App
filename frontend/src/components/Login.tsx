import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/config";
import { LogIn, Eye, EyeOff, Mail, Lock } from "lucide-react";

interface HostLoginProps {
  toggleToSignup: () => void;
}

const HostLogin: React.FC<HostLoginProps> = ({ toggleToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API.node}/api/auth/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Login failed");
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-3">
          <LogIn size={24} className="text-slate-700" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Host Login</h2>
        <p className="mt-1 text-sm text-slate-500">
          Login to create and host quizzes securely
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-3">
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      )}

      {/* Login Form */}
      <div className="space-y-5">
        {/* Email */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail size={16} className="text-slate-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock size={16} className="text-slate-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
            />
            <span className="text-xs text-slate-600">Remember me</span>
          </label>
          <button
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
            onClick={() => alert("Password reset link sent to your email")}
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? (
            <>Logging in...</>
          ) : (
            <>
              <LogIn size={16} />
              Login to Dashboard
            </>
          )}
        </button>

        {/* Signup Link */}
        <div className="pt-4 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{" "}
            <button
              onClick={toggleToSignup}
              className="font-medium text-slate-900 hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostLogin;