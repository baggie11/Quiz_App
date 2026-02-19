import React from "react";
import { ArrowRight, Calendar, Edit3, Trash2, Copy } from "lucide-react";
import { type Session } from "../../types";

interface SessionCardProps {
  session: Session;
  onDelete: (sessionId: string) => void;
  getSessionStatus: (session: Session) => {
    text: string;
    color: string;
  };
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onDelete, getSessionStatus }) => {
  const status = getSessionStatus(session);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <article className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      {/* Header with Title and Arrow */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-slate-700">
            {session.title || "Untitled Session"}
          </h3>
          <div className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${status.color}`}>
            {status.text}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 text-slate-400 transition group-hover:bg-slate-100 group-hover:text-slate-600">
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-2">
        {session.start_date && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="rounded-md bg-slate-100 p-1">
              <Calendar size={14} className="text-slate-500" />
            </div>
            <span className="text-xs font-medium text-slate-500">Starts:</span>
            <span className="text-xs text-slate-700">{formatDate(session.start_date)}</span>
          </div>
        )}
        {session.end_date && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="rounded-md bg-slate-100 p-1">
              <Calendar size={14} className="text-slate-500" />
            </div>
            <span className="text-xs font-medium text-slate-500">Ends:</span>
            <span className="text-xs text-slate-700">{formatDate(session.end_date)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5">
          <Copy size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500">
            Code: <span className="font-mono text-slate-700">{session.sessionId || `${session.id.substring(0, 6)}...`}</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
          <Edit3 size={14} className="text-slate-400" />
          <span>Edit</span>
        </div>
      </div>

      {/* Delete Button */}
      <div className="absolute right-5 top-5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(session.id);
          }}
          className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </article>
  );
};

export default SessionCard;