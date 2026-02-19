import React, { useState } from "react";
import { AlertCircle, CheckCircle, Clock, Eye, Zap, ZapOff } from "lucide-react";

interface QuestionHeaderProps {
  onPreview: () => void;
  saving: boolean;
  questionsCount?: number;
  unsavedCount?: number;
  sessionCode?: string;
  sessionId?: string;
  lastSaved?: string | null;
  autoSaveEnabled?: boolean;
  onToggleAutoSave?: () => void;
  saveError?: string | null;
  hasUnsavedChanges?: boolean;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  onPreview,
  saving,
  questionsCount = 0,
  unsavedCount = 0,
  sessionCode,
  sessionId,
  lastSaved,
  autoSaveEnabled = false,
  onToggleAutoSave,
  saveError = null,
  hasUnsavedChanges = false,
}) => {
  const [showSaveDetails, setShowSaveDetails] = useState(false);

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatDetailedTime = (timestamp: string | null) => {
    if (!timestamp) return "No saves yet";
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSaveStatusIcon = () => {
    if (saveError) return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
    if (saving) return <Clock className="h-3.5 w-3.5 animate-pulse text-blue-500" />;
    if (hasUnsavedChanges) return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    return <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />;
  };

  const getSaveStatusText = () => {
    if (saveError) return "Save error";
    if (saving) return "Saving";
    if (hasUnsavedChanges) return "Unsaved";
    return "Saved";
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {(sessionCode || sessionId) && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              Session Code{" "}
              <span className="font-mono text-slate-800">
                {sessionCode || `${sessionId?.substring(0, 8)}...`}
              </span>
            </div>
          )}

          <div
            className="relative"
            onMouseEnter={() => setShowSaveDetails(true)}
            onMouseLeave={() => setShowSaveDetails(false)}
          >
            <div className="flex cursor-help items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
              {getSaveStatusIcon()}
              <span
                className={
                  saveError
                    ? "text-red-600"
                    : saving
                      ? "text-blue-600"
                      : hasUnsavedChanges
                        ? "text-amber-600"
                        : "text-emerald-700"
                }
              >
                {getSaveStatusText()}
              </span>
              {lastSaved && !saving && !hasUnsavedChanges && !saveError && (
                <span className="text-slate-500">- {formatTime(lastSaved)}</span>
              )}
            </div>

            {showSaveDetails && (
              <div className="absolute left-0 top-8 z-50 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Save Status</span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {getSaveStatusText()}
                    </span>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-slate-500">Last Saved</div>
                    <div className="text-sm font-medium text-slate-900">
                      {formatDetailedTime(lastSaved || null)}
                    </div>
                  </div>
                  {saveError && (
                    <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                      {saveError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
            {questionsCount} {questionsCount === 1 ? "Question" : "Questions"}
          </div>

          {unsavedCount > 0 && (
            <div className="rounded-lg bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
              {unsavedCount} draft{unsavedCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleAutoSave && (
            <button
              onClick={onToggleAutoSave}
              className={`hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:flex ${
                autoSaveEnabled
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              title={autoSaveEnabled ? "Auto-save enabled" : "Auto-save disabled"}
            >
              {autoSaveEnabled ? <Zap className="h-3.5 w-3.5" /> : <ZapOff className="h-3.5 w-3.5" />}
              <span>Auto-save</span>
            </button>
          )}

          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};