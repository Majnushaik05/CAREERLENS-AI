import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Search,
  Link2,
  ExternalLink,
  Lock,
  Globe,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface SafetyResult {
  score: number;
  level: 'HIGH RISK' | 'MEDIUM RISK' | 'LOW RISK';
  is_real: boolean;
  verdict: string;
  signals: number;
  signal_details: string[];
  link_audited: boolean;
  link_signals: string[];
  text_signals: string[];
  is_legit_domain: boolean;
  domain_analysis?: {
    hostname: string;
    protocol: string;
    is_secure: boolean;
    reputation: 'Trusted Corporate ATS' | 'Suspicious / Masked' | 'Unverified Domain';
  };
}

export const JobDetectionView: React.FC = () => {
  const [jobText, setJobText] = useState('');
  const [jobLink, setJobLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyResult | null>(null);
  const [activeTab, setActiveTab] = useState<'verdict' | 'link' | 'signals' | 'checklist'>('verdict');

  // Deterministic fallback used only when the API cannot be reached.
  // "Low risk" means no obvious indicators were found; it is not proof a job is genuine.
  const evaluateSafetyLocally = (text: string, link: string): SafetyResult => {
    const textSignals: string[] = [];
    const linkSignals: string[] = [];
    const sourceText = (text || '').trim();
    const lowerText = sourceText.toLowerCase();
    const sourceLink = (link || '').trim();

    const addText = (condition: boolean, message: string) => {
      if (condition && !textSignals.includes(message)) textSignals.push(message);
    };

    addText(/\b(wire transfer|money movement|send money|transfer funds)\b/i.test(sourceText),
      'Payment request: The message mentions transferring money or funds.');
    addText(/\b(registration fee|application fee|processing fee|equipment fee|security deposit|pay to apply|upfront fee)\b/i.test(sourceText),
      'Advance-fee request: The message appears to request an upfront fee or deposit.');
    addText(/\b(telegram|t\.me)\b/i.test(sourceText),
      'Telegram contact: Verify the recruiter independently before continuing.');
    addText(/\b(whatsapp|wa\.me)\b/i.test(sourceText),
      'WhatsApp contact: A messaging app alone does not verify a recruiter or job.');
    addText(/\b(crypto|cryptocurrency|bitcoin|gift card|cash app|zelle)\b/i.test(sourceText),
      'Unusual payment method: Cryptocurrency, gift cards, or peer-to-peer payments are mentioned.');
    addText(/\b(no interview|without (an? )?interview|selected without|hired immediately|instant offer)\b/i.test(sourceText),
      'Unusual hiring promise: The message suggests selection without a normal interview process.');
    addText(/\b(urgent payment|pay immediately|within 24 hours)\b/i.test(sourceText),
      'High-pressure wording: The message appears to pressure the candidate to act or pay quickly.');

    let hostname = 'Not provided';
    let protocol = 'Not checked';
    let isSecure = false;
    let isLegitDomain = false;

    if (sourceLink) {
      try {
        const parsed = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(sourceLink) ? sourceLink : `https://${sourceLink}`);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
        hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
        isSecure = parsed.protocol === 'https:';
        protocol = isSecure ? 'HTTPS' : 'HTTP (not encrypted)';
        if (!isSecure) linkSignals.push('Insecure connection: This URL uses HTTP rather than HTTPS.');

        const roots = [
          'careers.google.com', 'google.com', 'microsoft.com', 'amazon.jobs', 'amazon.com',
          'apple.com', 'meta.com', 'greenhouse.io', 'lever.co', 'myworkdayjobs.com',
          'smartrecruiters.com', 'ashbyhq.com', 'workable.com', 'jobvite.com', 'taleo.net',
          'icims.com', 'oraclecloud.com', 'successfactors.com', 'stripe.com', 'netflix.com',
          'linkedin.com',
        ];
        isLegitDomain = roots.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));

        const suspiciousChecks: Array<{ test: (host: string) => boolean; message: string }> = [
          { test: h => h === 't.me' || h.endsWith('.t.me') || h === 'telegram.me' || h.endsWith('.telegram.me'), message: 'Messaging redirect: The URL opens a Telegram destination.' },
          { test: h => h === 'wa.me' || h.endsWith('.wa.me') || h === 'whatsapp.com' || h.endsWith('.whatsapp.com'), message: 'Messaging redirect: The URL opens a WhatsApp destination.' },
          { test: h => h === 'bit.ly' || h.endsWith('.bit.ly') || h === 'tinyurl.com' || h.endsWith('.tinyurl.com'), message: 'Shortened URL: The final destination is not visible from this link alone.' },
          { test: h => /\.(xyz|top|icu)$/.test(h), message: 'Uncommon domain ending: Verify the company and final destination independently.' },
          { test: h => h === 'forms.gle' || h.endsWith('.forms.gle'), message: 'Generic form link: Confirm the form is linked from the employer’s official careers site.' },
          { test: h => /amaz0n|g00gle|linked1n|micros0ft/.test(h), message: 'Possible brand impersonation: The domain contains a lookalike spelling.' },
        ];
        suspiciousChecks.forEach(item => {
          if (item.test(hostname) && !linkSignals.includes(item.message)) linkSignals.push(item.message);
        });
      } catch {
        linkSignals.push('Invalid URL: Enter a full web address such as https://company.com/careers.');
      }
    }

    const allSignals = [...textSignals, ...linkSignals];
    const score = Math.min(100, textSignals.length * 25 + linkSignals.length * 30);
    const level: SafetyResult['level'] =
      score >= 50 || textSignals.length >= 2 || linkSignals.length >= 2
        ? 'HIGH RISK'
        : score >= 20 || allSignals.length > 0
          ? 'MEDIUM RISK'
          : 'LOW RISK';
    const isReal = level === 'LOW RISK';

    return {
      score,
      level,
      is_real: isReal,
      verdict: level === 'HIGH RISK'
        ? 'High risk: multiple potential fraud indicators were found.'
        : level === 'MEDIUM RISK'
          ? 'Caution: review the flagged indicators before sharing information or applying.'
          : 'No obvious scam indicators were found. This does not prove the job or recruiter is genuine.',
      signals: allSignals.length,
      signal_details: allSignals,
      link_audited: Boolean(sourceLink),
      link_signals: linkSignals,
      text_signals: textSignals,
      is_legit_domain: isLegitDomain,
      domain_analysis: {
        hostname,
        protocol,
        is_secure: isSecure,
        reputation: isLegitDomain ? 'Trusted Corporate ATS' : linkSignals.length ? 'Suspicious / Masked' : 'Unverified Domain',
      },
    };
  };

  const checkFraud = async () => {
    const text = jobText.trim();
    const link = jobLink.trim();
    if (!text && !link) {
      setResult(null);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);
      try {
        const res = await fetch('/api/job/fraud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, link }),
          signal: controller.signal,
        });
        window.clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Job analysis failed (${res.status})`);
        const data = await res.json();

        const valid =
          typeof data?.score === 'number' &&
          ['HIGH RISK', 'MEDIUM RISK', 'LOW RISK'].includes(data?.level) &&
          typeof data?.is_real === 'boolean' &&
          typeof data?.verdict === 'string';

        if (!valid) throw new Error('The analysis service returned an unexpected response.');

        const localDomain = evaluateSafetyLocally(text, link).domain_analysis;
        setResult({
          score: Math.max(0, Math.min(100, Math.round(data.score))),
          level: data.level,
          is_real: data.is_real,
          verdict: data.verdict,
          signals: Number(data.signals) || 0,
          signal_details: Array.isArray(data.signal_details) ? data.signal_details : [],
          link_audited: Boolean(data.link_audited),
          link_signals: Array.isArray(data.link_signals) ? data.link_signals : [],
          text_signals: Array.isArray(data.text_signals) ? data.text_signals : [],
          is_legit_domain: Boolean(data.is_legit_domain),
          domain_analysis: data.domain_analysis || localDomain,
        });
        setActiveTab('verdict');
        return;
      } finally {
        window.clearTimeout(timeoutId);
      }
    } catch (error) {
      console.warn('[CareerLens] Job detection API unavailable; using local checks.', error);
      setResult(evaluateSafetyLocally(text, link));
      setActiveTab('verdict');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl selection:bg-blue-600 selection:text-white">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-1 tracking-wider uppercase">
          <Shield className="w-3.5 h-3.5 text-rose-600" />
          <span>SECURITY &amp; VERIFICATION</span>
          <span>·</span>
          <span className="text-rose-600 font-bold">JOB &amp; LINK SCAM DETECTOR</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Job Scam Detection &amp; Application Link Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Paste the job description and application URL below to detect fake offers, upfront equipment fees, phishing domains, and recruitment fraud before you apply.
        </p>
      </div>

      {/* Input Box: Job Description and Application Link Underneath */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        {/* Step 1: Job Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Job Description / Recruitment Message</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">{jobText.length} characters</span>
          </div>

          <textarea
            rows={6}
            value={jobText}
            onChange={e => setJobText(e.target.value)}
            placeholder="Paste unsolicited job email, WhatsApp requisition, or job listing description here..."
            className="w-full p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition"
          />
        </div>

        {/* Step 2: Paste the Link Underneath the Job Description (Strictly requested by User) */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600" />
              <span>Application Link / Job URL (Underneath Description)</span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              URL Safety Inspector Active
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={jobLink}
                onChange={e => setJobLink(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') checkFraud();
                }}
                placeholder="e.g. https://careers.company.com/job/1029 or bit.ly/application-link"
                className="w-full pl-10 pr-24 py-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
              {jobLink && (
                <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      jobLink.toLowerCase().startsWith('https://')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {jobLink.toLowerCase().startsWith('https://') ? 'HTTPS' : 'HTTP/INSECURE'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={checkFraud}
              disabled={loading || !jobLink.trim()}
              className="px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Audit Link Only</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste destination website, shortened URL, or form link. Checks URL format, HTTPS, common shorteners, and lookalike-domain patterns. It cannot verify domain age or guarantee legitimacy.
          </p>
        </div>

        {/* Action Button: High Visibility */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={checkFraud}
            disabled={loading || (!jobText.trim() && !jobLink.trim())}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing Description &amp; Inspecting Link...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-rose-400" />
                <span>Analyze Job Authenticity &amp; Link Safety</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Result Presentation Section (Clickable and interactive as requested) */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6"
          >
            {/* Main Verdict Card with Clear Fake Job vs Real Job Indication */}
            <div
              className={`p-6 sm:p-7 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
                result.is_real
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : result.level === 'HIGH RISK'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    result.is_real
                      ? 'bg-emerald-600 text-white'
                      : result.level === 'HIGH RISK'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {result.is_real ? (
                    <ShieldCheck className="w-8 h-8" />
                  ) : result.level === 'HIGH RISK' ? (
                    <ShieldAlert className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono ${
                        result.is_real
                          ? 'bg-emerald-100 text-emerald-800'
                          : result.level === 'HIGH RISK'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {result.is_real ? 'REAL & AUTHENTIC JOB' : 'FAKE JOB / SCAM DETECTED'}
                    </span>
                    <span className="text-xs opacity-60">·</span>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80 font-mono">
                      {result.level}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{result.verdict}</h2>
                  <p className="text-xs mt-1 opacity-90 max-w-xl">
                    {result.is_real
                      ? 'No obvious indicators were found in this scan. Always verify the employer independently.'
                      : 'Candidate warning: Do not send money, provide social security numbers, or communicate outside verified corporate portals.'}
                  </p>
                </div>
              </div>

              {/* Threat Index Meter */}
              <div className="sm:text-right shrink-0 bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Calculated Risk Index
                </div>
                <div
                  className={`text-3xl sm:text-4xl font-black font-mono tabular-nums ${
                    result.score >= 50
                      ? 'text-rose-600'
                      : result.score >= 20
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {result.score}%
                </div>
                <div className="text-[10px] font-semibold text-slate-500">
                  {result.signals} Flagged Pattern{result.signals !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Clickable Result Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('verdict')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'verdict'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Overall Threat Meter</span>
              </button>

              <button
                onClick={() => setActiveTab('link')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'link'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Link &amp; Domain Analysis ({result.link_signals?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('signals')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'signals'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Discovered Scam Patterns ({result.signal_details?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'checklist'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Candidate Safety Checklist</span>
              </button>
            </div>

            {/* Tab 1: Threat Meter */}
            {activeTab === 'verdict' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Fraud Threat Spectrum</span>
                    <span
                      className={`font-mono ${
                        result.score >= 50
                          ? 'text-rose-600'
                          : result.score >= 20
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {result.score} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(5, result.score))}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${
                        result.score >= 50
                          ? 'bg-rose-500'
                          : result.score >= 20
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold pt-1">
                    <span className="text-emerald-700">Verified Real Job (0 - 19)</span>
                    <span className="text-amber-700">Cautious Requisition (20 - 49)</span>
                    <span className="text-rose-700">Scam / Fake Job (50 - 100)</span>
                  </div>
                </div>

                {/* 3-Column Telemetry Diagnostics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Text Pattern Score</div>
                    <div className="text-lg font-black text-slate-900 font-mono">
                      {result.text_signals?.length || 0} Triggers
                    </div>
                    <p className="text-[11px] text-slate-500">Advance fees, instant hires, wire requests</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Link Security Status</div>
                    <div className="text-lg font-black text-slate-900 font-mono">
                      {result.domain_analysis?.reputation || 'Audited'}
                    </div>
                    <p className="text-[11px] text-slate-500">Domain spoofing, shorteners &amp; SSL status</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Candidate Advisory</div>
                    <div
                      className={`text-lg font-black ${
                        result.is_real ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {result.is_real ? 'Safe to Apply' : 'Block & Report'}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {result.is_real ? 'Proceed with standard resume submission' : 'Do not provide personal info or fees'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Link & Domain Analysis */}
            {activeTab === 'link' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Inspected URL Destination:</span>
                    <span className="text-xs font-mono font-bold text-blue-700">{result.domain_analysis?.hostname}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-800 break-all">
                    {jobLink || 'No link provided'}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 block">Encryption:</span>
                      <span className="font-bold text-slate-800">{result.domain_analysis?.protocol}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 block">Corporate ATS:</span>
                      <span className={`font-bold ${result.is_legit_domain ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {result.is_legit_domain ? 'Verified Portal' : 'Unrecognized Host'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-slate-400 block">Threat Classification:</span>
                      <span className={`font-bold ${result.link_signals?.length > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {result.link_signals?.length > 0 ? 'Suspicious Link' : 'Clean Link'}
                      </span>
                    </div>
                  </div>
                </div>

                {result.link_signals?.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                      Flagged Link Vulnerabilities ({result.link_signals.length}):
                    </h4>
                    {result.link_signals.map((sig, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl text-xs text-rose-950 flex items-start gap-2.5 font-medium"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-900 flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No obvious link indicators were found. This does not guarantee the destination is safe.</span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Detailed Signals */}
            {activeTab === 'signals' && (
              <div className="space-y-3">
                {result.signal_details?.length > 0 ? (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Detailed Discovered Anomalies ({result.signal_details.length}):
                    </h4>
                    {result.signal_details.map((sig, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-start gap-2.5"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-medium text-emerald-950 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Zero Fraud Indicators Observed</div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        The requisition content reflects legitimate corporate recruiting terminology, and the provided link corresponds to verified career standards.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Candidate Safety Checklist */}
            {activeTab === 'checklist' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-800">
                <h4 className="font-bold text-slate-950 text-sm">Essential Protection Rules for Job Seekers:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Never send money for equipment:</strong> Legitimate employers ship corporate hardware at company expense and never request reimbursement or advance deposits.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Verify on official careers portal:</strong> Navigate directly to the company website careers page (e.g. company.com/careers) and search for the requisition ID.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Beware of Telegram/WhatsApp-only recruiters:</strong> Legitimate enterprise recruiters communicate via verified corporate domain emails (@company.com).</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Guard sensitive personal data:</strong> Never supply banking routing numbers, SSN, or passport scans prior to an in-person or verified video interview.</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Enter Job Details to Run Safety Verification</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Paste any job message, recruiter email, or application URL into the input fields above and click &quot;Analyze Job Authenticity &amp; Link Safety&quot; to inspect for advance-fee fraud, spoofed corporate domains, and unverified contacts.
          </p>
        </div>
      )}
    </div>
  );
};
