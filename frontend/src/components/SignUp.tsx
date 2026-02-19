import React, { useState } from "react";
import { UserPlus, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { API } from "../api/config";

interface HostSignupProps {
  toggleToLogin: () => void;
}

const HostSignup: React.FC<HostSignupProps> = ({ toggleToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSignup = async () => {
    const { fullName, email, password, confirmPassword } = formData;
    
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API.node}/api/auth/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }
      
      setSuccess("Account created successfully! You can now log in.");
      
      // Clear form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
      });

      // Auto switch to login after 2 seconds
      setTimeout(() => {
        toggleToLogin();
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-3">
          <UserPlus size={24} className="text-slate-700" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Create Host Account</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sign up to start creating and hosting interactive quizzes
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-3">
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs text-emerald-600">{success}</p>
        </div>
      )}

      {/* Signup Form */}
      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail size={16} className="text-slate-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock size={16} className="text-slate-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
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

        {/* Confirm Password */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock size={16} className="text-slate-400" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? (
            "Creating Account..."
          ) : (
            <>
              <UserPlus size={16} />
              Create Account
            </>
          )}
        </button>

        {/* Login Link */}
        <div className="pt-4 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <button
              onClick={toggleToLogin}
              className="font-medium text-slate-900 hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostSignup;