import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, CheckCircle2, Radio, Calendar, Clock, Filter } from "lucide-react";
import { type Session } from "../../types";
import SessionCard from "./SessionCard";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { API } from "../../api/config";

interface AllSessionsPageProps {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

type StatusId = "all" | "draft" | "upcoming" | "livenow" | "completed" | "notscheduled";

const FILTERS: ReadonlyArray<{ id: StatusId; label: string }> = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "upcoming", label: "Upcoming" },
  { id: "livenow", label: "Live Now" },
  { id: "completed", label: "Completed" },
  { id: "notscheduled", label: "Not Scheduled" },
];

const AllSessionsPage: React.FC<AllSessionsPageProps> = ({ sessions, setSessions }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<StatusId>("all");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API.node}/api/session`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await response.json();

        if (response.ok && json.success) {
          setSessions(json.sessions);
        } else {
          console.error("Failed to fetch sessions:", json.message);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [setSessions]);

  const getSessionStatus = (session: Session) => {
    const now = new Date();
    const start = session.start_date ? new Date(session.start_date) : null;
    const end = session.end_date ? new Date(session.end_date) : null;

    if (session.draft) {
      return { text: "Draft", color: "bg-slate-100 text-slate-700" };
    }
    if (!start) {
      return { text: "Not Scheduled", color: "bg-slate-100 text-slate-700" };
    }
    if (end && now > end) {
      return { text: "Completed", color: "bg-emerald-100 text-emerald-700" };
    }
    if (now >= start && (!end || now <= end)) {
      return { text: "Live Now", color: "bg-rose-100 text-rose-700" };
    }
    if (now < start) {
      return { text: "Upcoming", color: "bg-amber-100 text-amber-700" };
    }
    return { text: "Active", color: "bg-indigo-100 text-indigo-700" };
  };

  const filteredSessions = sessions.filter((session) => {
    if (filterStatus === "all") return true;
    const status = getSessionStatus(session);
    return status.text.toLowerCase().replace(" ", "") === filterStatus;
  });

  const liveCount = sessions.filter((s) => getSessionStatus(s).text === "Live Now").length;
  const upcomingCount = sessions.filter((s) => getSessionStatus(s).text === "Upcoming").length;
  const completedCount = sessions.filter((s) => getSessionStatus(s).text === "Completed").length;

  const handleSessionClick = (sessionId: string) => {
    navigate(`/session/${sessionId}/questions`);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const confirmed = window.confirm("Delete this session? This will remove its questions and participants.");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API.node}/api/session/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete session");
      }

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("Delete session error:", error);
      alert("Failed to delete session. Please try again.");
    }
  };

  if (loading) return <LoadingSpinner message="Loading sessions..." />;

  if (!sessions.length) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Calendar size={24} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No sessions yet</h2>
          <p className="mt-1 text-sm text-slate-500">Create your first session to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">All Sessions</h1>
        <p className="mt-1 text-sm text-slate-500">
          {filteredSessions.length} visible of {sessions.length} total
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-rose-100 p-2">
              <Radio size={16} className="text-rose-600" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Live Now</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{liveCount}</p>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-100 p-2">
              <CalendarClock size={16} className="text-amber-600" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Upcoming</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{upcomingCount}</p>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 p-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Completed</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{completedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Status:</span>
        </div>
        {FILTERS.map((status) => (
          <button
            key={status.id}
            onClick={() => setFilterStatus(status.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
              filterStatus === status.id
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSessions.map((session) => (
            <div key={session.id} onClick={() => handleSessionClick(session.id)} className="cursor-pointer">
              <SessionCard
                session={session}
                onDelete={handleDeleteSession}
                getSessionStatus={getSessionStatus}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Clock size={24} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No sessions match this filter</h3>
          <p className="mt-1 text-xs text-slate-500">Try selecting a different status.</p>
          <button
            onClick={() => setFilterStatus("all")}
            className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
};

export default AllSessionsPage;