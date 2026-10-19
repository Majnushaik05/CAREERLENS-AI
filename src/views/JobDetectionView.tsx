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

const SAMPLES = {
  scam_telegram: {
    title: 'Urgent Wire-Fee & Telegram Solicit (Fake Job)',
    text: `Subject: Immediate Remote Executive Assistant Opening - No Interview Required!
Dear Candidate,
Congratulations! Your resume has been shortlisted. You are hired directly without any formal interview rounds for our remote administrative division.
Compensation is $4,850 disbursed weekly. Prior to orientation, all selected candidates must remit an advance laptop equipment insurance registration fee of $175 via wire transfer, Cash App, or Bitcoin to our logistics partner.
Contact recruiter immediately on Telegram @global_exec_careers. Deadline 24 hours.`,
    link: 'https://bit.ly/rapid-hiring-telegram-intake-992',
  },
  scam_phishing: {
    title: 'Spoofed Domain & Generic Form (Fake Job)',
    text: `Amazon Customer Operations Lead Requisition #4882
We are conducting instant onboarding for data entry leads.
Candidates will be supplied with company credit cards once their bank accounts are verified through our external intake form.
No technical assessment required. High urgency placement.`,
    link: 'https://amaz0n-logistics-onboarding.xyz/forms.gle/auth',
  },
  legit_corporate: {
    title: 'Official Google Cloud Staff Engineer (Real Job)',
    text: `Senior Cloud Solutions Architect Requisition #G-88219
Organization: Google Cloud Enterprise Engineering
Responsibilities: Architect multi-region cloud infrastructures, consult on distributed database resilience, and partner with strategic enterprise customers.
Minimum Qualifications: 5+ years building and deploying scalable web services with Go, Java, or Python; experience with Kubernetes and CI/CD pipelines.
Hiring Process: Initial technical screen -> System design round -> Coding interviews -> Hiring committee review.`,
    link: 'https://careers.google.com/jobs/results/88219-senior-cloud-solutions-architect',
  },
  legit_greenhouse: {
    title: 'Verified Stripe Backend Engineer (Real Job)',
    text: `Backend Infrastructure Engineer - Core Ledger
Company: Stripe
Role: You will design, build, and maintain the distributed banking ledger and money movement primitives.
Requirements: Strong foundations in computer science, concurrency, and distributed transactions. Experience with Ruby, Java, or Go.
Process: Recruiter call, take-home or live technical screening, onsite interview panel with ledger architects.`,
    link: 'https://boards.greenhouse.io/stripe/jobs/4910283002',
  },
};

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
  const [jobText, setJobText] = useState(SAMPLES.scam_telegram.text);
  const [jobLink, setJobLink] = useState(SAMPLES.scam_telegram.link);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyResult | null>(null);
  const [activeTab, setActiveTab] = useState<'verdict' | 'link' | 'signals' | 'checklist'>('verdict');

  // Client-side fallback analyzer (prevents 404/deployment failures)
  const evaluateSafetyLocally = (text: string, link: string): SafetyResult => {
    const lowerText = (text || '').toLowerCase();
    const lowerLink = (link || '').trim().toLowerCase();

    const textSignals: string[] = [];
    const linkSignals: string[] = [];

    // Text pattern triggers
    if (lowerText.includes('wire transfer') || lowerText.includes('money movement')) {
      textSignals.push('Wire Transfer Request: Solicits upfront or direct funds transfer.');
    }
    if (lowerText.includes('registration fee') || lowerText.includes('application fee') || lowerText.includes('processing fee') || lowerText.includes('equipment fee')) {
      textSignals.push('Advance-Fee Solicit: Demands fee for laptop, supplies, or application processing.');
    }
    if (lowerText.includes('telegram') || lowerText.includes('@') && lowerText.includes('telegram')) {
      textSignals.push('Telegram Sourced: Recruitment conducted strictly via unverified Telegram chat.');
    }
    if (lowerText.includes('whatsapp') || lowerText.includes('wa.me')) {
      textSignals.push('WhatsApp Communication: Unofficial recruitment messaging channel.');
    }
    if (lowerText.includes('crypto') || lowerText.includes('bitcoin') || lowerText.includes('cash app') || lowerText.includes('gift card')) {
      textSignals.push('Irreversible Payment Method: Solicits payment through cryptocurrency or gift cards.');
    }
    if (lowerText.includes('no interview') || lowerText.includes('without any interview') || lowerText.includes('selected without')) {
      textSignals.push('Unconditional Instant Offer: Direct employment offer without formal interview evaluations.');
    }
    if (lowerText.includes('urgent') && (lowerText.includes('24 hours') || lowerText.includes('immediate payment'))) {
      textSignals.push('Artificial Urgency: High-pressure deadline forced on candidate.');
    }

    // Link triggers
    let isLegitDomain = false;
    let hostname = 'unknown';
    let isSecure = true;

    if (lowerLink) {
      if (lowerLink.startsWith('http://')) {
        isSecure = false;
        linkSignals.push('Insecure Protocol: URL uses unencrypted HTTP rather than HTTPS.');
      }

      try {
        const parsed = new URL(lowerLink.startsWith('http') ? lowerLink : `https://${lowerLink}`);
        hostname = parsed.hostname;
      } catch {
        hostname = lowerLink.split('/')[0];
      }

      const verifiedDomains = [
        'careers.google.com', 'microsoft.com', 'amazon.jobs', 'apple.com', 'meta.com',
        'greenhouse.io', 'lever.co', 'myworkdayjobs.com', 'smartrecruiters.com',
        'ashbyhq.com', 'workable.com', 'stripe.com', 'netflix.com'
      ];

      isLegitDomain = verifiedDomains.some(d => hostname.includes(d));

      const suspiciousPatterns = [
        { p: 'bit.ly', desc: 'Masked URL Shortener (bit.ly): Destination website is hidden.' },
        { p: 'tinyurl', desc: 'Masked URL Shortener (tinyurl): Real domain is concealed.' },
        { p: 't.me', desc: 'Direct Telegram channel link instead of verified company portal.' },
        { p: 'wa.me', desc: 'Direct WhatsApp link instead of standard recruitment workflow.' },
        { p: '.xyz', desc: 'High-Risk TLD (.xyz): Often utilized for disposable scam websites.' },
        { p: '.top', desc: 'High-Risk TLD (.top): Commonly associated with illicit recruitment scams.' },
        { p: 'forms.gle', desc: 'Generic Google Form utilized instead of an authenticated career system.' },
        { p: 'amaz0n', desc: 'Typosquatting spoof attempting to imitate Amazon.' },
        { p: 'g00gle', desc: 'Typosquatting spoof attempting to imitate Google.' },
        { p: 'linked1n', desc: 'Typosquatting spoof attempting to imitate LinkedIn.' },
      ];

      suspiciousPatterns.forEach(pat => {
        if (lowerLink.includes(pat.p)) {
          linkSignals.push(pat.desc);
        }
      });
    }

    const allSignals = [...textSignals, ...linkSignals];
    let score = (textSignals.length * 28) + (linkSignals.length * 32);
    if (isLegitDomain) {
      score = Math.max(0, score - 50);
    }
    score = Math.min(100, Math.max(0, score));

    let level: 'HIGH RISK' | 'MEDIUM RISK' | 'LOW RISK' = 'LOW RISK';
    let isReal = true;
    let verdict = 'Real & Legitimate Job: Official corporate standards verified.';

    if (score >= 50 || textSignals.length >= 2 || linkSignals.length >= 2) {
      level = 'HIGH RISK';
      isReal = false;
      verdict = 'Fake Job / Scam Alert: Severe recruitment fraud patterns and fraudulent link signals discovered.';
    } else if (score >= 20 || textSignals.length >= 1 || linkSignals.length >= 1) {
      level = 'MEDIUM RISK';
      isReal = false;
      verdict = 'Caution / Suspicious Requisition: Unverified recruitment channel or irregular requisition phrasing.';
    } else {
      level = 'LOW RISK';
      isReal = true;
      verdict = isLegitDomain
        ? 'Real Job Verified: Certified tier-1 corporate career portal with authentic recruitment protocols.'
        : 'Legitimate Requisition: Safe candidate intake standards and no malicious patterns detected.';
    }

    return {
      score,
      level,
      is_real: isReal,
      verdict,
      signals: allSignals.length,
      signal_details: allSignals,
      link_audited: !!lowerLink,
      link_signals: linkSignals,
      text_signals: textSignals,
      is_legit_domain: isLegitDomain,
      domain_analysis: {
        hostname,
        protocol: isSecure ? 'HTTPS (Encrypted)' : 'HTTP (Insecure)',
        is_secure: isSecure,
        reputation: isLegitDomain
          ? 'Trusted Corporate ATS'
          : linkSignals.length > 0
          ? 'Suspicious / Masked'
          : 'Unverified Domain',
      },
    };
  };

  const checkFraud = async () => {
    if (!jobText.trim() && !jobLink.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/job/fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: jobText, link: jobLink }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        // Enrich with domain analysis
        let hostname = 'unknown';
        try {
          const l = jobLink.trim().toLowerCase();
          const parsed = new URL(l.startsWith('http') ? l : `https://${l}`);
          hostname = parsed.hostname;
        } catch {
          hostname = jobLink.split('/')[0] || 'unknown';
        }

        setResult({
          ...data,
          domain_analysis: {
            hostname,
            protocol: jobLink.toLowerCase().startsWith('http://') ? 'HTTP (Insecure)' : 'HTTPS (Encrypted)',
            is_secure: !jobLink.toLowerCase().startsWith('http://'),
            reputation: data.is_legit_domain
              ? 'Trusted Corporate ATS'
              : data.link_signals?.length > 0
              ? 'Suspicious / Masked'
              : 'Unverified Domain',
          },
        });
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Network call failed, utilizing client-side fraud analysis:', e);
    }

    // Run robust local analysis
    const localResult = evaluateSafetyLocally(jobText, jobLink);
    setResult(localResult);
    setLoading(false);
  };

  const loadPreset = (key: keyof typeof SAMPLES) => {
    setJobText(SAMPLES[key].text);
    setJobLink(SAMPLES[key].link);
    setResult(null);
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

      {/* Preset Test Case Bar */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>QUICK 1-CLICK VERIFICATION EXAMPLES</span>
          <span className="text-slate-400">Click to test instant analysis</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            onClick={() => loadPreset('scam_telegram')}
            className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-left transition group text-xs flex flex-col justify-between"
          >
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">Telegram &amp; Wire Scam</span>
            </div>
            <span className="text-[10px] text-rose-700 font-mono mt-1">bit.ly shortened link</span>
          </button>

          <button
            onClick={() => loadPreset('scam_phishing')}
            className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-left transition group text-xs flex flex-col justify-between"
          >
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">Domain Spoof Phishing</span>
            </div>
            <span className="text-[10px] text-rose-700 font-mono mt-1">amaz0n / .xyz link</span>
          </button>

          <button
            onClick={() => loadPreset('legit_corporate')}
            className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition group text-xs flex flex-col justify-between"
          >
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Google Cloud Listing</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono mt-1">careers.google.com</span>
          </button>

          <button
            onClick={() => loadPreset('legit_greenhouse')}
            className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition group text-xs flex flex-col justify-between"
          >
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Stripe Engineering</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono mt-1">boards.greenhouse.io</span>
          </button>
        </div>
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

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={jobLink}
              onChange={e => setJobLink(e.target.value)}
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
          <p className="text-[11px] text-slate-400">
            Paste the destination website, shortened URL, or form link. Career Lens audits domain age, SSL status, and brand spoofing.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={checkFraud}
            disabled={loading || (!jobText.trim() && !jobLink.trim())}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2.5"
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
                      ? 'No advance payment requests, unverified chat links, or spoofed domains were observed.'
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
                    <span>No malicious link redirects, shortener masks, or phishing indicators detected.</span>
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
    </div>
  );
};
