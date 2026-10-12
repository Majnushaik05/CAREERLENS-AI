import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle, Search } from 'lucide-react';

const SAMPLE_SCAM = `Subject: Urgent Job Offer - Immediate Remote Assistant
Dear Candidate,
Congratulations! You have been selected without any interview for our executive assistant position.
Payment is $5,000 weekly. Before starting work, you must complete an upfront registration fee of $150 via wire transfer or cryptocurrency to dispatch your company laptop.
Contact us solely on Telegram @hiring_fast_hr. Urgent payment needed within 24 hours.`;

const SAMPLE_LEGIT = `Senior Software Engineer Requisition #1042
Company: Horizon Financial Tech
We are seeking an experienced Backend Engineer to join our core transactions team.
Requirements: 4+ years Python or Java, experience with distributed databases, automated unit testing, and agile collaboration.
Process: Recruiter intro screen -> Technical coding assessment -> System design onsite interview.
Apply via our verified careers portal at horizon.example.com/careers.`;

export const JobDetectionView: React.FC = () => {
  const [jobText, setJobText] = useState(SAMPLE_SCAM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkFraud = async () => {
    if (!jobText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/job/fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: jobText }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          <span>Security &amp; Verification</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="text-rose-600 font-bold">Fraud Pattern Scanner</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Real-Time Fake Job Detection &amp; Safety Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Audit unsolicited recruitment offers, WhatsApp/Telegram solicitations, and suspicious requisition notices for financial advance-fee scams.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900">Job Requisition / Message Content</label>
          <div className="flex gap-2">
            <button
              onClick={() => setJobText(SAMPLE_SCAM)}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
            >
              Load Suspicious Offer
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setJobText(SAMPLE_LEGIT)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
            >
              Load Legitimate Requisition
            </button>
          </div>
        </div>

        <textarea
          rows={7}
          value={jobText}
          onChange={e => setJobText(e.target.value)}
          placeholder="Paste recruitment message, email, or job listing here..."
          className="w-full p-3.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        />

        <button
          onClick={checkFraud}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Scanning Risk Patterns...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Verify Requisition Safety</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl shrink-0 ${
                  result.level === 'HIGH RISK'
                    ? 'bg-rose-100 text-rose-600'
                    : result.level === 'MEDIUM RISK'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {result.level === 'HIGH RISK' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{result.level}</div>
                <h3 className="text-lg font-black text-slate-950 mt-0.5">{result.verdict}</h3>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Score</div>
              <div
                className={`text-3xl font-black font-mono tabular-nums mt-0.5 ${
                  result.score >= 50 ? 'text-rose-600' : result.score >= 20 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {result.score} / 100
              </div>
            </div>
          </div>

          {result.signal_details?.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Discovered High-Risk Patterns ({result.signal_details.length}):
              </h4>
              <div className="space-y-2">
                {result.signal_details.map((sig: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{sig}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-900 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No known scam signals detected. Standard hiring process indicators observed.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
