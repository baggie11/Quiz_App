import React, { useState } from "react";
import HostLogin from "../components/Login";
import HostSignup from "../components/SignUp";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const HostAuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleToSignup = () => setIsLogin(false);
  const toggleToLogin = () => setIsLogin(true);

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {isLogin ? "Welcome Back" : "Get Started"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin 
              ? "Login to access your host dashboard" 
              : "Create an account to start hosting quizzes"}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={toggleToLogin}
              className={`w-28 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={toggleToSignup}
              className={`w-28 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="mx-auto w-full max-w-md">
          {isLogin ? (
            <HostLogin toggleToSignup={toggleToSignup} />
          ) : (
            <HostSignup toggleToLogin={toggleToLogin} />
          )}
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default HostAuthPage;