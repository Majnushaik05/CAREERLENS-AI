import React, { useState } from 'react';
import { Candidate, HiringCampaign } from '../../types';
import { screenBatchCandidatesClientSide } from '../../services/careerService';
import {
  UploadCloud,
  Users,
  Award,
  Sparkles,
  Mail,
  Phone,
  Search,
  Filter,
} from 'lucide-react';

interface BulkScreeningViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  onScreenComplete: (newCandidates: Candidate[]) => void;
  onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
}

const SAMPLE_BATCH_RESUMES = [
  {
    name: 'Alex Chen',
    filename: 'Alex_Chen_Resume.pdf',
    email: 'alex.chen@example.com',
    phone: '+1 555-019-2834',
    text: `Alex Chen
alex.chen@example.com | +1 555-019-2834
Senior Software Developer with 5+ years experience building Python, FastAPI, and React applications.
Skills: Python, TypeScript, React, Node.js, FastAPI, PostgreSQL, Docker, AWS, Redis, Git, CI/CD.
Experience: Led microservices team handling 4.5M requests daily; reduced latency by 35%.`,
  },
  {
    name: 'Marcus Vance',
    filename: 'Marcus_Vance_Resume.pdf',
    email: 'marcus.vance@techdev.net',
    phone: '+1 415-882-9901',
    text: `Marcus Vance
marcus.vance@techdev.net | +1 415-882-9901
Full Stack Developer with 3 years building web apps.
Skills: JavaScript, React, Python, SQL, Git, HTML, CSS, REST API.
Experience: Developed responsive frontends and connected REST APIs with PostgreSQL.`,
  },
  {
    name: 'Elena Rostova',
    filename: 'Elena_Rostova_Resume.pdf',
    email: 'elena.rostova@cloudscale.io',
    phone: '+1 650-332-1144',
    text: `Elena Rostova
elena.rostova@cloudscale.io | +1 650-332-1144
DevOps & Backend Engineer specializing in cloud systems.
Skills: Docker, Kubernetes, AWS, Linux, Python, CI/CD, Terraform, Git.
Experience: Automated infrastructure deployment, achieved 99.99% uptime, configured Prometheus.`,
  },
  {
    name: 'Priya Sharma',
    filename: 'Priya_Sharma_Resume.pdf',
    email: 'priya.sharma@analytics.org',
    phone: '+91 98450-22119',
    text: `Priya Sharma
priya.sharma@analytics.org | +91 98450-22119
Data Analyst & Visualization Specialist.
Skills: SQL, Excel, Power BI, Tableau, Python, Data Analysis, Statistics.
Experience: Built executive business intelligence dashboards and automated SQL reporting.`,
  },
];

export const BulkScreeningView: React.FC<BulkScreeningViewProps> = ({
  campaign,
  candidates,
  onScreenComplete,
  onUpdateCandidate,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRunBatchScreening = async () => {
    setLoading(true);
    const jd = campaign?.job_description || `Software Engineer requiring Python, React, FastAPI, SQL, Docker, and AWS.`;

    try {
      const res = await fetch('/api/recruiter/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jd,
          resumes: SAMPLE_BATCH_RESUMES,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const screenedList: Candidate[] = await res.json();
        onScreenComplete(screenedList);
        setLoading(false);
        return;
      }
    } catch (e) {
      // fallback
    }

    const fallbackList = screenBatchCandidatesClientSide(jd, SAMPLE_BATCH_RESUMES);
    onScreenComplete(fallbackList);
    setLoading(false);
  };

  const toggleShortlist = (cand: Candidate) => {
    const nextStatus = cand.status === 'Shortlisted' ? 'Screened' : 'Shortlisted';
    onUpdateCandidate(cand.id, { status: nextStatus });
  };

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-1">
            <span>Automated Ranking</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span className="text-purple-700 font-bold">Bulk Sieve</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Bulk Candidate Screening &amp; Cohort Ranking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Audit applicant batches against the active requisition:{' '}
            <span className="font-bold text-slate-900">{campaign?.role || 'Software Engineer'}</span>.
          </p>
        </div>

        <button
          onClick={handleRunBatchScreening}
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 shrink-0"
        >
          {loading ? (
            <span>Screening Applicant Batch...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Screen Sample Candidate Cohort</span>
            </>
          )}
        </button>
      </div>

      {/* Screened Candidates Leaderboard */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-950">
              Ranked Candidate Roster ({filteredCandidates.length})
            </h2>
            <div className="text-xs text-slate-400">Sorted by Requisition Semantic Fit</div>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by name, email, or skill..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No candidates screened in current campaign</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Click &quot;Screen Sample Candidate Cohort&quot; above to run automated ranking.
            </p>
            <button
              onClick={handleRunBatchScreening}
              className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition"
            >
              Load &amp; Screen Cohort
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCandidates.map((cand, idx) => {
              const isShortlisted = cand.status === 'Shortlisted';
              const colorClass = [
                'bg-blue-100 text-blue-700 border-blue-200',
                'bg-emerald-100 text-emerald-700 border-emerald-200',
                'bg-purple-100 text-purple-700 border-purple-200',
                'bg-indigo-100 text-indigo-700 border-indigo-200',
                'bg-amber-100 text-amber-700 border-amber-200',
              ][idx % 5];
              const initials = cand.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CD';

              return (
                <div
                  key={cand.id || idx}
                  className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}>
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{cand.name}</span>
                        <span className="text-xs font-mono font-bold tabular-nums text-slate-700">
                          {cand.role_match}% Match
                        </span>
                        {isShortlisted && (
                          <span className="text-[11px] font-bold text-purple-700">
                            · Shortlisted
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{cand.email}</span>
                        <span aria-hidden="true">·</span>
                        <span>{cand.phone}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {cand.skills.slice(0, 6).map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                    <div className="text-right pr-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score Rating</div>
                      <div className="text-base font-black text-slate-950 font-mono tabular-nums">{cand.resume_score} / 100</div>
                    </div>

                    <button
                      onClick={() => toggleShortlist(cand)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isShortlisted
                          ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{isShortlisted ? 'In Shortlist' : 'Shortlist Candidate'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
