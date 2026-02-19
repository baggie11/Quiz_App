import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users,
  User,
  UserPlus,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  Settings,
  CheckCircle,
  LogIn,
  Eye
} from 'lucide-react';

import { SpeechStatusIndicator } from '../components/Accessibility/SpeechStatusIndicator';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTTS } from '../hooks/useTTS';

const QuizVisionHome: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'participant' | 'host' | null>(null);
  const [isHoveringParticipant, setIsHoveringParticipant] = useState(false);
  const [isHoveringHost, setIsHoveringHost] = useState(false);

  const navigate = useNavigate();
  const { speak } = useTTS();

  const participantButtonRef = useRef<HTMLButtonElement>(null);
  const hostCardRef = useRef<HTMLDivElement>(null);
  // const mainContainerRef = useRef<HTMLDivElement>(null);

  const handleParticipantFocus = () => {
    speak("Join as Participant. Press Enter or Space to join a quiz session as a participant.");
  };

  const handleParticipantClick = () => {
    setSelectedRole('participant');
    navigate('/join-session');
  };

  const handleHostSelect = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the main container
    setSelectedRole('host');
    navigate('/auth');
  };

  // Handle clicks anywhere on the page
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Check if the click target is the host card or any of its children
      if (hostCardRef.current && hostCardRef.current.contains(e.target as Node)) {
        return; // Don't redirect if clicking on host card
      }
      
      // If clicking anywhere else (including participant card, navbar, footer, etc.), redirect to participant
      navigate('/join-session');
    };

    // Add the event listener to the document
    document.addEventListener('click', handleGlobalClick);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <SpeechStatusIndicator />
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-2">
              <Eye size={20} className="text-slate-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">Welcome to Shravya</h1>
            <p className="text-sm text-slate-500">Choose how you'd like to get started</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Participant Card */}
            <div 
              className={`transition-all duration-300 ${
                isHoveringParticipant ? '-translate-y-1' : ''
              }`}
              onMouseEnter={() => setIsHoveringParticipant(true)}
              onMouseLeave={() => setIsHoveringParticipant(false)}
            >
              <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Selection Badge */}
                {selectedRole === 'participant' && (
                  <div className="absolute -right-2 -top-2">
                    <div className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
                      <CheckCircle size={12} />
                      Selected
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="mb-4 rounded-xl bg-slate-100 p-3">
                    <User size={24} className="text-slate-700" />
                  </div>

                  <h3 className="mb-1 text-lg font-semibold text-slate-900">Participant</h3>
                  <p className="mb-5 text-xs text-slate-500">
                    Join an existing quiz session using a code
                  </p>

                  {/* Features */}
                  <div className="mb-6 w-full space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
                      <div className="rounded-md bg-white p-1">
                        <ClipboardCheck size={14} className="text-slate-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-medium text-slate-700">Quick Join</p>
                        <p className="text-[10px] text-slate-500">Enter code and start</p>
                      </div>
                    </div>
                   
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
                      <div className="rounded-md bg-white p-1">
                        <UserPlus size={14} className="text-slate-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-medium text-slate-700">Easy Participation</p>
                        <p className="text-[10px] text-slate-500">Simple interface for all</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    ref={participantButtonRef}
                    onFocus={handleParticipantFocus}
                    onClick={handleParticipantClick}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    aria-label="Join as Participant"
                  >
                    <LogIn size={16} />
                    Join as Participant
                  </button>

                  <p className="mt-3 text-[10px] text-slate-400">
                    Press Tab to focus • Space/Enter to select
                  </p>
                </div>
              </div>
            </div>

            {/* Host Card */}
            <div 
              ref={hostCardRef}
              className={`transition-all duration-300 ${
                isHoveringHost ? '-translate-y-1' : ''
              }`}
              onMouseEnter={() => setIsHoveringHost(true)}
              onMouseLeave={() => setIsHoveringHost(false)}
            >
              <div 
                className="relative h-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
                onClick={handleHostSelect}
              >
                {/* Selection Badge */}
                {selectedRole === 'host' && (
                  <div className="absolute -right-2 -top-2">
                    <div className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
                      <CheckCircle size={12} />
                      Selected
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="mb-4 rounded-xl bg-slate-100 p-3">
                    <Users size={24} className="text-slate-700" />
                  </div>

                  <h3 className="mb-1 text-lg font-semibold text-slate-900">Host</h3>
                  <p className="mb-5 text-xs text-slate-500">
                    Create and manage quiz sessions
                  </p>

                  {/* Features */}
                  <div className="mb-6 w-full space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
                      <div className="rounded-md bg-white p-1">
                        <Sparkles size={14} className="text-slate-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-medium text-slate-700">Quiz Builder</p>
                        <p className="text-[10px] text-slate-500">Create custom quizzes</p>
                      </div>
                    </div>
                   
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
                      <div className="rounded-md bg-white p-1">
                        <Settings size={14} className="text-slate-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-medium text-slate-700">Full Control</p>
                        <p className="text-[10px] text-slate-500">Manage settings</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleHostSelect}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowRight size={16} />
                    Continue as Host
                  </button>

                  <p className="mt-3 text-[10px] text-slate-400">
                    Click to continue • Full keyboard support
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Click anywhere except the Host card to join as a participant
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuizVisionHome;