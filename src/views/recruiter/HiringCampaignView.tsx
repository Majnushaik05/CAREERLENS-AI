import React, { useState } from 'react';
import { HiringCampaign } from '../../types';
import { Megaphone, Save, CheckCircle2, Sliders } from 'lucide-react';

interface HiringCampaignViewProps {
  campaign: HiringCampaign | null;
  onSaveCampaign: (campaign: HiringCampaign) => void;
}

export const HiringCampaignView: React.FC<HiringCampaignViewProps> = ({
  campaign,
  onSaveCampaign,
}) => {
  const [role, setRole] = useState(campaign?.role || 'Senior Full Stack Software Engineer');
  const [company, setCompany] = useState(campaign?.company || 'Apex Cloud Innovations');
  const [jobDescription, setJobDescription] = useState(
    campaign?.job_description ||
      `Senior Full Stack Engineer
We are seeking an experienced Full Stack Developer to build and scale distributed microservices and modern React applications.
Required competencies:
• 4+ years Python, FastAPI, and React with TypeScript
• Proficiency in PostgreSQL, Docker containerization, and AWS
• Clean REST API design, CI/CD pipelines, and automated testing`
  );
  const [passingScore, setPassingScore] = useState(campaign?.passing_score || 70);
  const [questionCount, setQuestionCount] = useState(campaign?.question_count || 10);
  const [durationMinutes, setDurationMinutes] = useState(campaign?.duration_minutes || 30);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp: HiringCampaign = {
      id: campaign?.id || `camp_${Date.now()}`,
      title: `${role} at ${company}`,
      role,
      company,
      job_description: jobDescription,
      passing_score: passingScore,
      question_count: questionCount,
      duration_minutes: durationMinutes,
      created_at: campaign?.created_at || new Date().toISOString(),
    };
    onSaveCampaign(newCamp);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            Requisition
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-slate-500">Campaign Management</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Hiring Campaign &amp; Role Requisition Configurator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Specify role expectations, job descriptions, and qualification thresholds used for automated resume screening and assessment generation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Role / Requisition Title</label>
            <input
              type="text"
              required
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Employer / Company Name</label>
            <input
              type="text"
              required
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Full Job Description &amp; Core Requirements
          </label>
          <textarea
            rows={6}
            required
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Passing Match Threshold (%)
            </label>
            <input
              type="number"
              min={40}
              max={95}
              value={passingScore}
              onChange={e => setPassingScore(parseInt(e.target.value, 10))}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Assessment Questions Count
            </label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Test Duration (Minutes)
            </label>
            <input
              type="number"
              min={15}
              max={90}
              value={durationMinutes}
              onChange={e => setDurationMinutes(parseInt(e.target.value, 10))}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Campaign settings saved successfully!</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Settings update immediately for bulk screenings.</div>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Campaign Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
