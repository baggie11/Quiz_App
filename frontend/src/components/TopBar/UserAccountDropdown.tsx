import React, { useState, useEffect } from 'react';
import { User, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from "react-router-dom";

interface LoggedInUser {
  full_name: string;
  email: string;
  role?: string;
}

const UserAccountDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pl-2 pr-3 transition hover:border-slate-300 hover:bg-slate-50"
        aria-label="User account menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white ring-1 ring-slate-200 transition group-hover:bg-slate-800">
          <User size={16} />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-slate-800">{user.full_name}</p>
          <p className="text-xs text-slate-500">{user.role ?? "Host"}</p>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-lg z-20">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
              <p className="mt-1 text-xs text-slate-500">{user.email}</p>
            </div>
            
            <div className="py-1">
              <button 
                onClick={() => {/* Add navigation */}} 
                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <User size={16} className="mr-3 text-slate-400" />
                My Profile
              </button>
              <button 
                onClick={() => {/* Add navigation */}} 
                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Settings size={16} className="mr-3 text-slate-400" />
                Settings
              </button>
              <button 
                onClick={() => {/* Add navigation */}} 
                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <HelpCircle size={16} className="mr-3 text-slate-400" />
                Help & Support
              </button>
            </div>
            
            <div className="border-t border-slate-100 pt-1">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/auth");
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={16} className="mr-3 text-red-400" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserAccountDropdown;