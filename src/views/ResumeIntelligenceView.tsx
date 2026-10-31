import React, { useState } from 'react';
import { ResumeAnalysis } from '../types';
import { safeAnalyzeResume } from '../services/careerService';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Check,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

interface ResumeIntelligenceViewProps {
  analysis: ResumeAnalysis | null;
  onAnalysisComplete: (result: ResumeAnalysis) => void;
  onClearAnalysis?: () => void;
}

export const ResumeIntelligenceView: React.FC<ResumeIntelligenceViewProps> = ({
  analysis,
  onAnalysisComplete,
  onClearAnalysis,
}) => {
  const [resumeText, setResumeText] = useState(analysis?.extracted_text || '');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['txt', 'md'].includes(extension || '')) {
      setError('For reliable text extraction, upload a .txt or .md file, or paste text copied from your PDF/DOCX resume.');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('The resume text file must be smaller than 2 MB.');
      e.target.value = '';
      return;
    }

    setError(null);
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = String(event.target?.result || '').trim();
      if (!text) {
        setError('No readable text was found in this file. Please paste your resume text.');
        setUploadedFileName(null);
        return;
      }
      setResumeText(text);
    };
    reader.onerror = () => {
      setError('The selected file could not be read. Please try another file or paste the resume text.');
      setUploadedFileName(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAnalyze = async (customText?: string) => {
    const textToSubmit = customText || resumeText;
    if (!textToSubmit.trim()) {
      setError('Please upload a file or paste your resume text to begin analysis.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const data = await safeAnalyzeResume(
        textToSubmit,
        '',
        uploadedFileName || 'candidate_resume.txt'
      );
      onAnalysisComplete(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const hasAnalysis = Boolean(analysis);
  const clampScore = (value: number | null | undefined) =>
    typeof value === 'number' && Number.isFinite(value)
      ? Math.max(0, Math.min(100, Math.round(value)))
      : null;

  const score = analysis ? clampScore(analysis.resume_score) : null;
  const readiness = analysis ? clampScore(analysis.readiness) : null;

  // Skills are extracted only from evidence present in the uploaded resume.
  const skillsList = analysis?.skills || [];
  const detectedSkillCount = skillsList.length;


  return (
    <div className="space-y-6 max-w-7xl mx-auto selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className={`w-2 h-2 rounded-full ${hasAnalysis ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
            <span>{hasAnalysis ? 'AUDIT REPORT GENERATED' : 'READY TO AUDIT'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Resume Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evidence-based ATS review of resume structure, skills, content, and completeness — without assuming a job role.
          </p>
        </div>

        {hasAnalysis && onClearAnalysis && (
          <button
            onClick={onClearAnalysis}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Current Audit</span>
          </button>
        )}
      </div>

      {/* UPLOAD & SCORE HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Upload Card */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Drag & Drop Area */}
            <label className="flex-1 w-full border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition">
              <Upload className="w-7 h-7 text-blue-600 mb-2" />
              <div className="text-xs font-bold text-slate-800">Choose your resume text file (TXT/MD)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">PDF/DOCX: copy the resume text and paste it below</div>
              <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Uploaded File Pill Card */}
            {uploadedFileName && (
              <div className="w-full sm:w-64 p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{uploadedFileName}</div>
                    <div className="text-[10px] text-slate-500">Document ready to audit</div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Resume Content Text</label>
              <span className="text-[11px] text-slate-400">Paste or edit raw resume text</span>
            </div>
            <textarea
              rows={5}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste or review extracted resume text here..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50/40"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Analysis:</span>
              <span className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700">Role-independent ATS review</span>
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !resumeText.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Resume Metrics...</span>
                </>
              ) : (
                <>
                  <span>Run Intelligence Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* 2 Circular Score Rings (Dynamic strictly from analysis) */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Score</div>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
                {score !== null ? (
                  <>
                    {score}<span className="text-sm font-normal text-slate-400">/100</span>
                  </>
                ) : (
                  <span className="text-slate-300 font-normal">-- / 100</span>
                )}
              </div>
              <div className="text-[11px] font-semibold mt-1">
                {score !== null ? (
                  score >= 85 ? (
                    <span className="text-blue-600">Excellent Resume Quality</span>
                  ) : score >= 70 ? (
                    <span className="text-emerald-600">Strong Resume Quality</span>
                  ) : (
                    <span className="text-amber-600">Resume Improvements Recommended</span>
                  )
                ) : (
                  <span className="text-slate-400">Awaiting Analysis</span>
                )}
              </div>
            </div>
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {score !== null && (
                  <path
                    className="text-blue-600 transition-all duration-700"
                    strokeDasharray={`${score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
              </svg>
              <span className="absolute text-xs font-mono font-bold text-blue-700">
                {score !== null ? `${score}%` : '--'}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Career Readiness</div>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
                {readiness !== null ? `${readiness}%` : <span className="text-slate-300 font-normal">-- %</span>}
              </div>
              <div className="text-[11px] font-semibold mt-1">
                {readiness !== null ? (
                  readiness >= 75 ? (
                    <span className="text-emerald-600">Strong Profile Depth</span>
                  ) : (
                    <span className="text-amber-600">Developing Depth</span>
                  )
                ) : (
                  <span className="text-slate-400">Scan to Calculate</span>
                )}
              </div>
            </div>
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {readiness !== null && (
                  <path
                    className="text-emerald-500 transition-all duration-700"
                    strokeDasharray={`${readiness}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
              </svg>
              <span className="absolute text-xs font-mono font-bold text-emerald-700">
                {readiness !== null ? `${readiness}%` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EXTRACTED SKILLS PILLS */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">Extracted Skills Matrix</h2>
          <span className="text-xs text-slate-400">
            {hasAnalysis ? `${skillsList.length} Verified Competencies` : 'Awaiting Document Scan'}
          </span>
        </div>
        {hasAnalysis ? (
          <div className="flex flex-wrap gap-2">
            {skillsList.map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-700 text-xs font-semibold font-mono"
              >
                ✓ {sk}
              </span>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            Upload your resume above to extract all detected technical keywords, libraries, and tools.
          </div>
        )}
      </div>

      {/* STRENGTHS & AREAS TO IMPROVE (2 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            <span>Identified Strengths</span>
          </h3>
          {analysis ? (
            <div className="space-y-2">
              {analysis.strengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-4">
              Strengths will be extracted and confirmed once resume text is evaluated.
            </div>
          )}
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span className="text-amber-500">⚠</span>
            <span>Actionable Areas to Improve</span>
          </h3>
          {analysis ? (
            <div className="space-y-2">
              {analysis.recommendations.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-4">
              Recommendations will automatically generate based on missing sections, action verbs, and quantification.
            </div>
          )}
        </div>
      </div>

      {/* SCORE BREAKDOWN HORIZONTAL BARS & SKILL GAP VERTICAL BAR GRAPH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Score Breakdown Bars */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-black text-slate-900">Resume Quality Breakdown</h3>
          <div className="space-y-3 pt-1">
            {[
              { name: 'Core Technical Skills', val: analysis ? analysis.score_breakdown.skills : null },
              { name: 'Quantified Evidence & ROI', val: analysis ? analysis.score_breakdown.achievement_evidence : null },
              { name: 'Required Section Coverage', val: analysis ? analysis.score_breakdown.section_coverage : null },
              { name: 'Content & Action Verbs', val: analysis ? analysis.score_breakdown.content_quality : null },
              { name: 'Contact & Profile Completeness', val: analysis ? analysis.score_breakdown.contact_completeness : null },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.name}</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {item.val !== null ? `${Math.round(item.val)}/100` : '-- / 100'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${item.val !== null ? item.val : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ATS Snapshot: resume-derived facts only */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900">ATS Detection Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-blue-600">Skills detected</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{hasAnalysis ? detectedSkillCount : '--'}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">Resume sections</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{hasAnalysis ? `${Math.round(((analysis.score_breakdown?.section_coverage ?? 0) / 100) * 7)}/7` : '--'}</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Counts are extracted from the resume text. Skills indicate detected keywords, not verified proficiency. ATS compatibility varies by employer and applicant-tracking system.
          </p>
        </div>
      </div>
    </div>
  );
};
