import React, { useState, useEffect } from 'react';
import { Candidate, HiringCampaign } from '../../types';
import { sanitizeCandidateName } from '../../services/careerService';
import {
  Send,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Clock,
  AlertCircle,
  Building,
  UserCheck,
  Zap,
  RefreshCw,
  Key,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { extractEmail } from '../../services/careerService';

interface AssessmentDispatcherViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  preselectedCandidate?: Candidate | null;
  onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
}

const QUICK_ROLES = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'DevOps & Cloud Engineer',
  'Data Scientist / AI',
  'QA Automation Engineer',
];

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
    d.setHours(d.getHours() + 48);
    return formatDateTimeLocal(d);
  });

  // Hiring Organization & Role Configurations
  const [companyName, setCompanyName] = useState(campaign?.company || 'Apex Technologies');
  const [hiringManager, setHiringManager] = useState('Sarah Jenkins · Lead Technical Recruiter');
  const [targetRole, setTargetRole] = useState(campaign?.role || 'Full Stack Developer');
  const [durationMinutes, setDurationMinutes] = useState(
    Number.isNaN(Number(campaign?.duration_minutes)) || !campaign?.duration_minutes ? 30 : Number(campaign.duration_minutes)
  );
  const [questionCount, setQuestionCount] = useState(
    Number.isNaN(Number(campaign?.question_count)) || !campaign?.question_count ? 10 : Number(campaign.question_count)
  );

  // SendGrid State
  const [sendGridStatus, setSendGridStatus] = useState<{ configured: boolean; from_email: string } | null>(null);
  const [customApiKey, setCustomApiKey] = useState('');
  const [customFromEmail, setCustomFromEmail] = useState('');
  const [showSendGridConfig, setShowSendGridConfig] = useState(false);

  // Extracted recipient email state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailExtractedFromResume, setEmailExtractedFromResume] = useState(false);

  // Execution states
  const [loading, setLoading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'warning' | 'info'; text: string; details?: string } | null>(null);

  // Sync if preselectedCandidate changes
  useEffect(() => {
    if (preselectedCandidate) {
      setSelectedCandidateId(preselectedCandidate.id);
    }
  }, [preselectedCandidate]);

  // Sync with campaign if loaded
  useEffect(() => {
    if (campaign?.company && !companyName) {
      setCompanyName(campaign.company);
    }
    if (campaign?.role && !targetRole) {
      setTargetRole(campaign.role);
    }
  }, [campaign]);

  // Fetch SendGrid API status on mount
  useEffect(() => {
    async function checkSendGrid() {
      try {
        const res = await fetch('/api/sendgrid/status');
        if (res.ok) {
          const data = await res.json();
          setSendGridStatus(data);
          if (data.from_email) {
            setCustomFromEmail(data.from_email);
          }
        }
      } catch {
        setSendGridStatus({ configured: false, from_email: 'careerlenssai@gmail.com' });
      }
    }
    checkSendGrid();
  }, []);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || preselectedCandidate || candidates[0];

  // Auto-extract candidate email from resume text whenever candidate changes
  useEffect(() => {
    if (!selectedCandidate) return;

    let foundEmail = '';
    let isResumeSource = false;

    // Check if candidate already has an explicit extracted_email
    if (selectedCandidate.extracted_email && !selectedCandidate.extracted_email.includes('example.com') && !selectedCandidate.extracted_email.includes('applied.net')) {
      foundEmail = selectedCandidate.extracted_email;
      isResumeSource = true;
    } else if (selectedCandidate.resume_text) {
      const parsed = extractEmail(selectedCandidate.resume_text);
      if (parsed) {
        foundEmail = parsed;
        isResumeSource = true;
      }
    }

    if (!foundEmail && selectedCandidate.email && !selectedCandidate.email.includes('example.com') && !selectedCandidate.email.includes('applied.net')) {
      foundEmail = selectedCandidate.email;
      isResumeSource = false;
    }

    if (!foundEmail) {
      foundEmail = selectedCandidate.email || '';
    }

    setRecipientEmail(foundEmail);
    setEmailExtractedFromResume(isResumeSource);
    setGeneratedLink('');
    setGeneratedToken('');
    setStatusMsg(null);
  }, [selectedCandidateId, selectedCandidate?.resume_text, selectedCandidate?.email]);

  // Helper to create the assessment link on backend
  const createAssessmentOnServer = async (activeEmail: string) => {
    const genRes = await fetch('/api/assessment/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: targetRole.trim(), question_count: questionCount }),
    });
    const genData = await genRes.json().catch(() => ({}));
    if (!genRes.ok) throw new Error(genData.error || 'Could not generate assessment questions.');
    if (!Array.isArray(genData.questions) || genData.questions.length === 0) {
      throw new Error('The assessment generator returned no questions. Please try again.');
    }

    const pubRes = await fetch('/api/public/assessment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: targetRole.trim(),
        company_name: companyName.trim() || 'Hiring Organization',
        hiring_manager: hiringManager.trim() || 'Talent Acquisition Team',
        candidate_id: selectedCandidate.id,
        candidate_name: sanitizeCandidateName(selectedCandidate.name, selectedCandidate.resume_text, undefined, activeEmail),
        candidate_email: activeEmail,
        duration_minutes: durationMinutes,
        start_time: startTime ? new Date(startTime).toISOString() : null,
        end_time: endTime ? new Date(endTime).toISOString() : null,
        questions: genData.questions,
      }),
    });
    const pubData = await pubRes.json().catch(() => ({}));
    if (!pubRes.ok) throw new Error(pubData.error || 'Could not create the candidate assessment link.');
    if (!pubData.token || !pubData.link) throw new Error('The server did not return a valid assessment token.');

    const fullUrl = new URL(pubData.link, window.location.origin).toString();
    setGeneratedLink(fullUrl);
    setGeneratedToken(pubData.token);

    onUpdateCandidate(selectedCandidate.id, {
      email: activeEmail,
      extracted_email: emailExtractedFromResume ? activeEmail : selectedCandidate.extracted_email,
      email_source: emailExtractedFromResume ? 'resume' : 'manual',
      assessment_status: 'Not Sent',
      test_token: pubData.token,
    });

    return { token: pubData.token, link: fullUrl };
  };

  // Generate Link Only (for copying or testing)
  const handleGenerateLinkOnly = async () => {
    if (!selectedCandidate) {
      setStatusMsg({ type: 'warning', text: 'Please select a candidate first.' });
      return;
    }
    if (!targetRole.trim()) {
      setStatusMsg({ type: 'warning', text: 'Enter or select a target role.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    const activeEmail = recipientEmail.trim() || selectedCandidate.email || '';

    try {
      const created = await createAssessmentOnServer(activeEmail);
      setStatusMsg({
        type: 'success',
        text: `Secure assessment link generated for ${selectedCandidate.name}.`,
        details: `Role: ${targetRole} · Company: ${companyName} · ${durationMinutes} minutes. You can preview or copy the link below.`,
      });
    } catch (error: any) {
      setStatusMsg({ type: 'warning', text: error?.message || 'Assessment generation failed.' });
    } finally {
      setLoading(false);
    }
  };

  // Unified Dispatch: Generate & Send via SendGrid
  const handleDispatchEmail = async () => {
    if (!selectedCandidate) {
      setStatusMsg({ type: 'warning', text: 'Please select a candidate before dispatching.' });
      return;
    }
    const targetEmail = (recipientEmail.trim() || selectedCandidate.email || '').trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(targetEmail) || /@(example\.com|applied\.net)$/i.test(targetEmail)) {
      setStatusMsg({ type: 'warning', text: 'Please enter a valid candidate email address before dispatching.' });
      return;
    }

    setEmailing(true);
    setStatusMsg(null);

    try {
      let activeLink = generatedLink;
      let activeToken = generatedToken;

      // Auto-generate assessment link if not already done
      if (!activeLink || !activeToken) {
        const created = await createAssessmentOnServer(targetEmail);
        activeLink = created.link;
        activeToken = created.token;
      }

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: targetEmail,
          to_name: sanitizeCandidateName(selectedCandidate.name, selectedCandidate.resume_text, undefined, targetEmail),
          company_name: companyName.trim() || 'CareerLens Partner',
          hiring_manager: hiringManager.trim() || 'Talent Acquisition Team',
          subject: `${companyName.trim() || 'Hiring Team'} is Hiring: Assessment Invitation for ${targetRole}`,
          role: targetRole.trim(),
          duration_minutes: durationMinutes,
          question_count: questionCount,
          exam_link: activeLink,
          start_time: startTime ? new Date(startTime).toISOString() : null,
          end_time: endTime ? new Date(endTime).toISOString() : null,
          custom_api_key: customApiKey.trim() || undefined,
          custom_from_email: customFromEmail.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Email service returned HTTP ${res.status}.`);
      if (data.status !== 'sent' || data.provider !== 'sendgrid') {
        throw new Error(data.sendgrid_notice || 'SendGrid has not confirmed delivery. Please check SendGrid credentials.');
      }

      onUpdateCandidate(selectedCandidate.id, {
        email: targetEmail,
        assessment_status: 'Sent',
        test_token: activeToken,
        last_dispatched_at: new Date().toISOString(),
        sendgrid_message_id: data.message_id || undefined,
      });

      setStatusMsg({
        type: 'success',
        text: `Invitation delivered to ${targetEmail} via SendGrid!`,
        details: `Message ID: ${data.message_id || 'Accepted'} · ${companyName} · ${targetRole}.`,
      });
    } catch (error: any) {
      setStatusMsg({
        type: 'warning',
        text: error?.message || 'Email dispatch failed. Candidate status was not changed.',
      });
    } finally {
      setEmailing(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto selection:bg-purple-600 selection:text-white pb-12">
      {/* Professional Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Assessment Dispatcher
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">Candidate Email Invitations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Assessment Dispatcher &amp; Candidate Invitations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Configure hiring organization details, review verified candidate resume emails, and dispatch role assessments via SendGrid.
          </p>
        </div>

        {/* Clean SendGrid Status Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800">SendGrid Active</span>
            <span className="text-slate-400 font-mono text-[11px]">({sendGridStatus?.from_email || 'Verified Sender'})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSendGridConfig(!showSendGridConfig)}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Configure SendGrid API credentials"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional SendGrid Credentials Drawer */}
      {showSendGridConfig && (
        <div className="bg-purple-50/60 border border-purple-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-950">
                Custom SendGrid Credentials (Optional Override)
              </h3>
            </div>
            <span className="text-[11px] text-purple-700 font-medium">Default: System API Key Active</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Custom API Key</label>
              <input
                type="password"
                value={customApiKey}
                onChange={e => setCustomApiKey(e.target.value)}
                placeholder="SG.xxxxxxxx..."
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Verified Sender Email</label>
              <input
                type="email"
                value={customFromEmail}
                onChange={e => setCustomFromEmail(e.target.value)}
                placeholder="careerlenssai@gmail.com"
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Message Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold space-y-1 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : statusMsg.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          {statusMsg.details && (
            <div className="text-[11px] font-normal opacity-90 pl-6">
              {statusMsg.details}
            </div>
          )}
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dispatch Configuration Form (7 Columns) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Candidate & Verified Contact */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>1. Candidate &amp; Email Contact</span>
              </h2>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {candidates.length} Available in Roster
              </span>
            </div>

            {candidates.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Candidate</label>
                  <select
                    value={selectedCandidate?.id}
                    onChange={e => setSelectedCandidateId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                  >
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>
                        {sanitizeCandidateName(c.name, c.resume_text, undefined, c.email || c.extracted_email)} · {c.role_match}% Match [{c.assessment_status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">Recipient Email Address</label>
                    {emailExtractedFromResume && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Extracted from Resume
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={e => {
                          setRecipientEmail(e.target.value);
                          setEmailExtractedFromResume(false);
                        }}
                        placeholder="candidate@email.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                    {selectedCandidate?.resume_text && (
                      <button
                        type="button"
                        onClick={() => {
                          const parsed = extractEmail(selectedCandidate.resume_text || '');
                          if (parsed) {
                            setRecipientEmail(parsed);
                            setEmailExtractedFromResume(true);
                          }
                        }}
                        className="px-3 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition shrink-0 flex items-center gap-1 cursor-pointer"
                        title="Re-extract email directly from candidate's uploaded resume"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-extract</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    SendGrid will dispatch the test invitation and private exam token to this email.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                No candidates screened yet. Upload resumes in Bulk Screening first.
              </div>
            )}
          </div>

          {/* Card 2: Hiring Organization Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" />
                <span>2. Hiring Organization &amp; Position</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Candidate Email Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Company Hiring</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Technologies Inc."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Hiring Manager / Recruiter</label>
                <input
                  type="text"
                  value={hiringManager}
                  onChange={e => setHiringManager(e.target.value)}
                  placeholder="e.g. Sarah Jenkins · Talent Team"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Position / Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />

              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTargetRole(r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      targetRole === r
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Exam Blueprint & Schedule */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>3. Assessment Blueprint &amp; Timing</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Auto-scored out of 100</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Question Volume</label>
                <select
                  value={Number.isNaN(questionCount) ? 10 : questionCount}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setQuestionCount(Number.isNaN(val) ? 10 : val);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white cursor-pointer"
                >
                  <option value={5}>5 Questions (Express Screener)</option>
                  <option value={10}>10 Questions (Standard Technical)</option>
                  <option value={15}>15 Questions (Intermediate)</option>
                  <option value={20}>20 Questions (Comprehensive)</option>
                  <option value={30}>30 Questions (In-Depth Technical)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Exam Timer (Minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={Number.isNaN(Number(durationMinutes)) ? '' : durationMinutes}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setDurationMinutes(Number.isNaN(val) ? ('' as any) : val);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>Window Opens</span>
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Window Deadline</span>
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                />
              </div>
            </div>
          </div>

          {/* Unified Primary Dispatch Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDispatchEmail}
              disabled={emailing || loading || !selectedCandidate}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {emailing
                  ? 'Dispatching via SendGrid...'
                  : `Send Assessment via SendGrid to ${recipientEmail || selectedCandidate?.name || 'Candidate'}`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleGenerateLinkOnly}
              disabled={loading || emailing || !selectedCandidate}
              className="py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-purple-50 text-purple-700 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
              title="Generate link without sending email"
            >
              <Layers className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Generate Link Only'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Candidate Email Preview (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Candidate Email Preview</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">SendGrid v3 HTML</span>
            </div>

            {/* Email Meta Info */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold text-[11px]">Subject:</span>
                <span className="font-bold text-slate-900 truncate max-w-[260px]">
                  {companyName} is Hiring: Assessment for {targetRole}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold text-[11px]">From:</span>
                <span className="font-mono text-purple-700 text-[11px]">
                  {companyName} Talent Team &lt;{sendGridStatus?.from_email || 'careerlenssai@gmail.com'}&gt;
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold text-[11px]">To:</span>
                <span className="font-mono text-slate-700 text-[11px]">
                  {selectedCandidate?.name || 'Candidate'} &lt;{recipientEmail || 'candidate@email.com'}&gt;
                </span>
              </div>
            </div>

            {/* Simulated Email Body Preview */}
            <div className="p-5 space-y-4">
              {/* Email Company Banner */}
              <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-purple-900 text-white p-5 rounded-2xl text-center space-y-1 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                  Official Hiring Invitation
                </div>
                <h3 className="text-xl font-black tracking-tight">{companyName}</h3>
                <div className="text-xs text-purple-200 font-medium">
                  Hiring Managed by {hiringManager}
                </div>
              </div>

              {/* Email Content Message */}
              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <p>
                  Dear <strong>{selectedCandidate ? sanitizeCandidateName(selectedCandidate.name, selectedCandidate.resume_text, undefined, recipientEmail || selectedCandidate.email) : 'Candidate'}</strong>,
                </p>
                <p>
                  <strong>{companyName}</strong> is actively recruiting for the <strong>{targetRole}</strong> role. <strong>{hiringManager}</strong> has reviewed your credentials and shortlisted your application for the next evaluation round.
                </p>
              </div>

              {/* Prominent Hiring Requisition Box */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs space-y-2 text-purple-950">
                <div className="text-[10px] font-black uppercase tracking-wider text-purple-800">
                  Hiring Requisition Summary:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Hiring Company:</span>
                    <strong className="text-slate-900">{companyName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Hiring Manager:</span>
                    <strong className="text-slate-900">{hiringManager}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Role:</span>
                    <strong className="text-slate-900">{targetRole}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Evaluation Standard:</span>
                    <strong className="text-slate-900">Strict 100 Marks</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Questions:</span>
                    <strong className="text-slate-900">{questionCount} Questions</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Timed Duration:</span>
                    <strong className="text-slate-900">{durationMinutes} Minutes</strong>
                  </div>
                </div>
              </div>

              {/* Call to Action Button in Email */}
              <div className="pt-1 text-center">
                <div className="inline-block w-full py-3 px-6 rounded-xl bg-purple-700 text-white font-bold text-xs text-center shadow-md shadow-purple-600/20">
                  Launch Technical Assessment &rarr;
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                Automated single-use evaluation token generated by CareerLens AI ATS.
              </div>
            </div>
          </div>

          {/* Generated Link & Direct Candidate Access Card */}
          {generatedLink && (
            <div className="bg-purple-50/80 border border-purple-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Assessment Link Active</span>
                </span>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Token: {generatedToken.slice(0, 12)}...
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 p-2 bg-white rounded-xl border border-purple-200 text-xs font-mono text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs transition shrink-0 inline-flex items-center"
                  title="Open candidate exam portal in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
