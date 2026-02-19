import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../TopBar/TopBar';
import CreateSessionForm from '../CreateSession/CreateSessionForm';
import AllSessionsPage from '../AllSessions/AllSessionsPage';
import LoadingSpinner from '../Shared/LoadingSpinner';
import { type UserType, type Session } from '../../types';
import Footer from '../Footer';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("sessions"); // Changed from "new-session" to "sessions"
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  if (loading) return <LoadingSpinner message="Checking authorization..." />;
  if (!user || !token) return (
    <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-red-600">
      ❌ Not authorized to access this page
    </div>
  );

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
      case "new-session":
        return <CreateSessionForm addSession={(newSession) => setSessions(prev => [newSession, ...prev])} />;
      case "sessions":
        return <AllSessionsPage sessions={sessions} setSessions={setSessions} />;
      case "questions":
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Question Bank</h1>
            <p className="text-gray-600">Question bank page content goes here...</p>
          </div>
        );
      case "participants":
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Participants</h1>
            <p className="text-gray-600">Participants page content goes here...</p>
          </div>
        );
      case "analytics":
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics</h1>
            <p className="text-gray-600">Analytics page content goes here...</p>
          </div>
        );
      case "settings":
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
            <p className="text-gray-600">Settings page content goes here...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <div className="flex min-h-screen w-full flex-col lg:pl-72">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 px-4 py-6 lg:px-8">
            {renderContent()}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;