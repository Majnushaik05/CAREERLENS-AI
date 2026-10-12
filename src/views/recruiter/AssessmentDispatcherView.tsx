import React, { useState } from 'react';
import { Candidate, HiringCampaign } from '../../types';
import { Send, Copy, Check, ExternalLink, Mail, Clock, AlertCircle } from 'lucide-react';

interface AssessmentDispatcherViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
}

export const AssessmentDispatcherView: React.FC<AssessmentDispatcherViewProps> = ({
  campaign,
  candidates,
  onUpdateCandidate,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.id || '');
  const [durationMinutes, setDurationMinutes] = useState(campaign?.duration_minutes || 30);
  const [questionCount, setQuestionCount] = useState(campaign?.question_count || 10);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  const handleGenerateLink = async () => {
    if (!selectedCandidate) return;
    setLoading(true);
    setStatusMsg('');

    try {
      // Generate question bank
      const genRes = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: campaign?.role || 'Software Developer',
          question_count: questionCount,
        }),
      });
      const genData = await genRes.json();

      // Create test record
      const pubRes = await fetch('/api/public/assessment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: campaign?.role || 'Software Developer',
          candidate_id: selectedCandidate.id,
          candidate_name: selectedCandidate.name,
          candidate_email: selectedCandidate.email,
          duration_minutes: durationMinutes,
          questions: genData.questions || [],
        }),
      });

      const pubData = await pubRes.json();
      const fullUrl = `${window.location.origin}${pubData.link}`;
      setGeneratedLink(fullUrl);

      // Update candidate assessment status
      onUpdateCandidate(selectedCandidate.id, {
        assessment_status: 'Sent',
        test_token: pubData.token,
      });

      setStatusMsg(`Assessment successfully generated for ${selectedCandidate.name}!`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
          Create customized, secure pre-employment screening exam links with question randomization and countdown timers.
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
            <p className="text-[11px] text-purple-700 leading-relaxed">
              Candidates can take the assessment directly using this link. Results will immediately stream to the Score Vault.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
