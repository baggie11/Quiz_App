import React from "react";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { speak } from "../services/speech/tts";

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center">
              <h1 
                className="text-2xl font-bold tracking-tight text-slate-900"
                style={{ fontFamily: '"Sora", "Outfit", "Avenir Next", "Segoe UI", sans-serif' }}
              >
                Shravya
              </h1>
            </Link>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200"></div>

            {/* Organization Logos */}
            <div className="flex items-center gap-3">
              {/* SSN Logo */}
              <div className="flex h-10 w-12 items-center justify-center overflow-hidden rounded-md border border-slate-100 bg-white p-1">
                <img
                  src="/images/ssn-logo.png"
                  alt="SSN Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              {/* MeitY Logo */}
              <div className="flex h-10 w-24 items-center justify-center overflow-hidden rounded-md border border-slate-100 bg-white p-1">
                <img
                  src="/images/meity.png"
                  alt="MeitY Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Host Login Button */}
          <Link
            to="/auth"
            tabIndex={0}
            onFocus={() => speak("Host Login")}
            className="flex items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <LogIn size={16} />
            <span>Host Login</span>
          </Link>

        </div>
      </div>
    </header>
  );
};

export default Navbar;