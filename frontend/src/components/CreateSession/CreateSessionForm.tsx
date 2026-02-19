import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Tag, Clock, Users, Target, Link, ChevronLeft } from 'lucide-react';
import { type Session } from '../../types';

interface CreateSessionFormProps {
  addSession?: (newSession: Session) => void;
  redirectToBuilder?: boolean;
}

const CreateSessionForm: React.FC<CreateSessionFormProps> = ({ 
  addSession, 
  redirectToBuilder = true
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sessionName: '',
    quizTopic: '',
    duration: '',
    maxParticipants: '',
    passmark: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.sessionName.trim()) {
      setError("Session name is required");
      return false;
    }

    if (!formData.quizTopic.trim()) {
      setError("Quiz topic is required");
      return false;
    }

    if (!formData.startDate) {
      setError("Start date is required");
      return false;
    }

    if (!formData.endDate) {
      setError("End date is required");
      return false;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setError("Start date cannot be in the past");
      return false;
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date");
      return false;
    }

    if (!formData.duration) {
      setError("Test duration is required");
      return false;
    }

    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration <= 0) {
      setError("Duration must be a positive number");
      return false;
    }

    if (duration > 1440) {
      setError("Duration cannot exceed 24 hours (1440 minutes)");
      return false;
    }

    if (!formData.maxParticipants) {
      setError("Max participants is required");
      return false;
    }

    const maxParticipants = parseInt(formData.maxParticipants);
    if (isNaN(maxParticipants) || maxParticipants <= 0) {
      setError("Max participants must be a positive number");
      return false;
    }

    if (!formData.passmark) {
      setError("Pass mark is required");
      return false;
    }

    const passmark = parseInt(formData.passmark);
    if (isNaN(passmark) || passmark < 0 || passmark > 100) {
      setError("Pass mark must be between 0 and 100");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const startDateTime = new Date(formData.startDate);
      const [startHours, startMinutes] = (formData.startTime || '00:00').split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
      
      const endDateTime = new Date(formData.endDate);
      const [endHours, endMinutes] = (formData.endTime || '23:59').split(':');
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 59, 999);

      const payload = {
        title: formData.sessionName.trim(),
        quiz_topic: formData.quizTopic.trim(),
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        duration: parseInt(formData.duration),
        max_participants: parseInt(formData.maxParticipants),
        pass_mark: parseInt(formData.passmark),
        draft: false,
      };

      const response = await fetch(`http://localhost:3000/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        const newSession = { ...data.data, draft: false };
        setSuccess("Session created successfully! Redirecting to question builder...");
        
        if (addSession) addSession(newSession);
        localStorage.setItem('currentSessionId', data.data?.id);
        
        if (redirectToBuilder && data.data?.id) {
          setTimeout(() => navigate(`/session/${data.data.id}/questions`), 1500);
        } else {
          setTimeout(() => {
            setFormData({
              sessionName: '',
              quizTopic: '',
              duration: '',
              maxParticipants: '',
              passmark: '',
              startDate: '',
              startTime: '',
              endDate: '',
              endTime: '',
            });
            setSuccess(null);
          }, 2000);
        }
      } else {
        setError(data.message || "Failed to create session");
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Create New Quiz Session</h1>
        <p className="text-sm text-slate-500 mt-1">Set up a new quiz session with timing, duration, and settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Details Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4 flex items-center gap-2">
            <Tag size={14} /> Session Details
          </h2>

          <div className="space-y-4">
            {/* Session Name */}
            <div>
              <label htmlFor="sessionName" className="block text-sm font-medium text-slate-700 mb-1.5">
                Session Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="sessionName"
                name="sessionName"
                value={formData.sessionName}
                onChange={handleChange}
                placeholder="e.g., Introduction to Calculus"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                required
              />
            </div>

            {/* Quiz Topic */}
            <div>
              <label htmlFor="quizTopic" className="block text-sm font-medium text-slate-700 mb-1.5">
                Quiz Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="quizTopic"
                name="quizTopic"
                value={formData.quizTopic}
                onChange={handleChange}
                placeholder="e.g., Mathematics"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                required
              />
            </div>

            {/* Duration & Max Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Duration (min) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="60"
                    min="1"
                    max="1440"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Max Participants <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    placeholder="50"
                    min="1"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pass Mark */}
            <div>
              <label htmlFor="passmark" className="block text-sm font-medium text-slate-700 mb-1.5">
                Pass Mark (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Target size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  id="passmark"
                  name="passmark"
                  value={formData.passmark}
                  onChange={handleChange}
                  placeholder="70"
                  min="0"
                  max="100"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timing Details Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4 flex items-center gap-2">
            <Calendar size={14} /> Timing Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={today}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                required
              />
            </div>

            {/* Start Time */}
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1.5">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1.5">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || today}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                required
              />
            </div>

            {/* End Time */}
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1.5">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                required
              />
            </div>
          </div>
        </div>

        {/* Session Join Code */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4 flex items-center gap-2">
            <Link size={14} /> Session Details
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Session Join Code
            </label>
            <input
              type="text"
              value="Generated after creation"
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Error and Success Messages */}
        {(error || success) && (
          <div className={`rounded-xl border p-4 ${
            error 
              ? 'border-red-200 bg-red-50 text-red-700' 
              : 'border-green-200 bg-green-50 text-green-700'
          }`}>
            <p className="text-sm">{error || success}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Session'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSessionForm;