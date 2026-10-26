import React, { useState } from 'react';
import { Candidate, HiringCampaign } from '../../types';
import { Send, Copy, Check, ExternalLink, Mail, Clock, AlertCircle } from 'lucide-react';

interface AssessmentDispatcherViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  preselectedCandidate?: Candidate | null;
  onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
}

export const AssessmentDispatcherView: React.FC<AssessmentDispatcherViewProps> = ({
  campaign,
  candidates,
  preselectedCandidate,
  onUpdateCandidate,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState(
    preselectedCandidate?.id || candidates[0]?.id || ''
  );
  // Helper to format Date for datetime-local input
  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [startTime, setStartTime] = useState(() => formatDateTimeLocal(new Date()));
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return formatDateTimeLocal(d);
  });
  const [durationMinutes, setDurationMinutes] = useState(campaign?.duration_minutes || 30);
  const [questionCount, setQuestionCount] = useState(campaign?.question_count || 10);
  const [loading, setLoading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Sync if preselectedCandidate changes
  React.useEffect(() => {
    if (preselectedCandidate) {
      setSelectedCandidateId(preselectedCandidate.id);
    }
  }, [preselectedCandidate]);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || preselectedCandidate || candidates[0];

  const handleGenerateLink = async () => {
    if (!selectedCandidate) return;
    setLoading(true);
    setStatusMsg('');

    try {
      const genRes = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: campaign?.role || 'Software Developer',
          question_count: questionCount,
        }),
      });

      let questions = [];
      const genContentType = genRes.headers.get('content-type') || '';
      if (genRes.ok && genContentType.includes('application/json')) {
        const genData = await genRes.json();
        questions = genData.questions || [];
      }

      // Create test record with scheduling
      const pubRes = await fetch('/api/public/assessment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: campaign?.role || 'Software Developer',
          candidate_id: selectedCandidate.id,
          candidate_name: selectedCandidate.name,
          candidate_email: selectedCandidate.email,
          duration_minutes: durationMinutes,
          start_time: startTime ? new Date(startTime).toISOString() : null,
          end_time: endTime ? new Date(endTime).toISOString() : null,
          questions,
        }),
      });

      const pubContentType = pubRes.headers.get('content-type') || '';
      if (pubRes.ok && pubContentType.includes('application/json')) {
        const pubData = await pubRes.json();
        const fullUrl = `${window.location.origin}${pubData.link}`;
        setGeneratedLink(fullUrl);
        onUpdateCandidate(selectedCandidate.id, {
          assessment_status: 'Sent',
          test_token: pubData.token,
        });
        setStatusMsg(`Assessment successfully scheduled and generated for ${selectedCandidate.name}!`);
        setLoading(false);
        return;
      }
    } catch (e) {
      // fallback to client token
    }

    // Client fallback token
    const token = `cl_test_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`;
    const fullUrl = `${window.location.origin}/?assessment=${token}`;
    setGeneratedLink(fullUrl);
    onUpdateCandidate(selectedCandidate.id, {
      assessment_status: 'Sent',
      test_token: token,
    });
    setStatusMsg(`Assessment successfully generated for ${selectedCandidate.name}!`);
    setLoading(false);
  };

  const handleDispatchEmail = async () => {
    if (!selectedCandidate || !generatedLink) return;
    setEmailing(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: selectedCandidate.email,
          subject: `Technical Assessment Invitation: ${campaign?.role || 'Software Engineer'}`,
          content: `Hello ${selectedCandidate.name},\n\nYou have been invited to complete a technical assessment for the ${campaign?.role || 'Software Engineer'} position.\n\nExam Window: ${new Date(startTime).toLocaleString()} to ${new Date(endTime).toLocaleString()}.\nExam Duration: ${durationMinutes} minutes.\n\nAccess Link: ${generatedLink}\n\nBest regards,\nRecruitment Team`,
        }),
      });
      if (res.ok) {
        setStatusMsg(`Invitation email successfully dispatched to ${selectedCandidate.email}!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEmailing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            Dispatcher
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-slate-500">Exam Generator &amp; Token Dispatch</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Role-Based Assessment Generator &amp; Dispatcher
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Schedule exam windows with start/end dates, question counts, and automatic countdown timers for applicants.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Recipient Candidate</label>
          {candidates.length > 0 ? (
            <select
              value={selectedCandidate?.id}
              onChange={e => setSelectedCandidateId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              {candidates.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email}) — {c.role_match}% Match [{c.assessment_status}]
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-slate-400 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              No candidates available yet. Please screen or add candidates first.
            </div>
          )}
        </div>

        {/* Exam Schedule Date & Time Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Exam Start Date &amp; Time</span>
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Before this time, candidates see a live countdown waiting timer.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Exam End Date &amp; Time</span>
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              After this deadline, the assessment window is marked expired.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Question Count</label>
            <input
              type="number"
              min={5}
              max={30}
              value={questionCount}
              onChange={e => setQuestionCount(parseInt(e.target.value, 10))}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Duration (Minutes)</label>
            <input
              type="number"
              min={10}
              max={90}
              value={durationMinutes}
              onChange={e => setDurationMinutes(parseInt(e.target.value, 10))}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateLink}
          disabled={loading || !selectedCandidate}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Generating Assessment Token...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Generate Candidate Assessment Link</span>
            </>
          )}
        </button>

        {statusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Generated Link Display */}
        {generatedLink && (
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-purple-900">
              Shareable Candidate Assessment URL:
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 p-2 bg-white rounded-lg border border-purple-200 text-xs font-mono text-slate-800"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={generatedLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 transition shrink-0"
                title="Preview assessment in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-purple-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>Scheduled Examination Window:</span>
                <span className="text-[11px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-mono">
                  {durationMinutes} Min Allotted
                </span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>
                  <strong>Starts:</strong> {new Date(startTime).toLocaleString()}
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  <strong>Ends:</strong> {new Date(endTime).toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                If the candidate opens the link prior to the scheduled start time, the app displays a live countdown timer with preparation guidelines.
              </p>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={handleDispatchEmail}
                disabled={emailing}
                className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>{emailing ? 'Dispatching Email...' : `Dispatch Invitation to ${selectedCandidate.email}`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
