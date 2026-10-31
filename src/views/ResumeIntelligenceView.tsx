import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth/mammoth.browser';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
import { ResumeAnalysis } from '../types';
import {
  safeAnalyzeResume,
  TARGET_ROLE_PROFILES,
  evaluateRoleAlignment,
} from '../services/careerService';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Check,
  RotateCcw,
  ArrowRight,
  Target,
  Search,
  Sparkles,
  Briefcase,
  Compass,
  Award,
  TrendingUp,
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

  // Target Role Secondary Evaluation State
  const [selectedRoleKey, setSelectedRoleKey] = useState('full-stack-developer');
  const [activeRoleTitle, setActiveRoleTitle] = useState('Full Stack Developer');
  const [customRoleInput, setCustomRoleInput] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const supported = ['pdf', 'docx', 'txt', 'md'];
    if (!supported.includes(extension)) {
      setError('Unsupported file. Please upload a PDF, Word (.docx), TXT, or Markdown file.');
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Please choose a resume smaller than 10 MB.');
      input.value = '';
      return;
    }

    setError(null);
    setLoading(true);
    setUploadedFileName(null);
    try {
      let extractedText = '';
      if (extension === 'txt' || extension === 'md') {
        extractedText = await file.text();
      } else if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value || '';
      } else if (extension === 'pdf') {
        const data = new Uint8Array(await file.arrayBuffer());
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const pages: string[] = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const pageText = content.items
            .map(item => ('str' in item ? item.str : ''))
            .filter(Boolean)
            .join(' ');
          pages.push(pageText);
        }
        extractedText = pages.join('\n\n');
      }

      extractedText = extractedText.replace(/\u0000/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
      if (extractedText.length < 30) {
        throw new Error(extension === 'pdf'
          ? 'No selectable text was found in this PDF. It may be a scanned image; please use an OCR-enabled PDF or paste the resume text.'
          : 'Not enough readable text was found in this document. Please check the file or paste the resume text.');
      }

      setResumeText(extractedText);
      setUploadedFileName(file.name);
      setError(null);
    } catch (err: any) {
      setResumeText('');
      setUploadedFileName(null);
      setError(err?.message || 'Could not read this resume. Please try another PDF or DOCX file.');
    } finally {
      setLoading(false);
      input.value = '';
    }
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
      // Analyze strictly for overall resume strength without role bias
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

  // Role-independent overall resume quality and readiness
  const score = analysis ? clampScore(analysis.resume_score) : null;
  const readiness = analysis ? clampScore(analysis.readiness) : null;

  // 100% accurate extracted skills list
  const skillsList = analysis?.skills || [];
  const detectedSkillCount = skillsList.length;

  // Role-specific secondary benchmark alignment
  const roleAlignment = evaluateRoleAlignment(
    skillsList,
    analysis?.extracted_text || resumeText,
    activeRoleTitle
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto selection:bg-blue-600 selection:text-white pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className={`w-2 h-2 rounded-full ${hasAnalysis ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
            <span>{hasAnalysis ? 'RESUME AUDIT GENERATED' : 'READY TO AUDIT'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Resume Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evidence-based ATS review of overall resume strength, structure, and verified skills — calculated strictly from your document.
          </p>
        </div>

        {hasAnalysis && onClearAnalysis && (
          <button
            onClick={onClearAnalysis}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Current Audit</span>
          </button>
        )}
      </div>

      {/* UPLOAD & OVERALL STRENGTH SCORE HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Upload Card */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Drag & Drop Area */}
            <label className="flex-1 w-full border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition">
              <Upload className="w-7 h-7 text-blue-600 mb-2" />
              <div className="text-xs font-bold text-slate-800">Upload your resume (PDF / DOCX / TXT)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Maximum file size: 10 MB · Selectable-text PDF supported</div>
              <input type="file" accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={handleFileUpload} className="hidden" />
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
              <span className="text-xs font-semibold text-slate-600">Audit Mode:</span>
              <span className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700">
                Role-Independent Overall Resume Strength
              </span>
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !resumeText.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Resume Strength...</span>
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

        {/* 2 Circular Score Rings (Overall Strength & Readiness) */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Strength</div>
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
                    <span className="text-blue-600">Top Tier Resume Quality</span>
                  ) : score >= 70 ? (
                    <span className="text-emerald-600">Strong Resume Quality</span>
                  ) : (
                    <span className="text-amber-600">Optimization Recommended</span>
                  )
                ) : (
                  <span className="text-slate-400">Awaiting Document</span>
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
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Readiness</div>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
                {readiness !== null ? `${readiness}%` : <span className="text-slate-300 font-normal">-- %</span>}
              </div>
              <div className="text-[11px] font-semibold mt-1">
                {readiness !== null ? (
                  readiness >= 75 ? (
                    <span className="text-emerald-600">Strong Profile Depth</span>
                  ) : (
                    <span className="text-amber-600">Developing Profile Depth</span>
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

      {/* EXTRACTED SKILLS MATRIX (100% ACCURATE AS IN RESUME) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Extracted Skills &amp; Competencies Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accurately extracted directly from your uploaded resume without omissions or assumed skills.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
            {hasAnalysis ? `${skillsList.length} Verified Skills Detected` : 'Awaiting Document Scan'}
          </span>
        </div>
        {hasAnalysis ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {skillsList.map((sk, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold font-mono transition"
              >
                ✓ {sk}
              </span>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            Upload your resume above to extract all detected technical keywords, libraries, tools, and methodologies.
          </div>
        )}
      </div>

      {/* STRENGTHS & AREAS TO IMPROVE (2 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            <span>Identified Resume Strengths</span>
          </h3>
          {analysis ? (
            <div className="space-y-2.5">
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
            <div className="space-y-2.5">
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

      {/* SCORE BREAKDOWN HORIZONTAL BARS & ATS SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Score Breakdown Bars */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-black text-slate-900">Overall Quality Breakdown</h3>
          <div className="space-y-3 pt-1">
            {[
              { name: 'Core Technical Skills', val: analysis ? analysis.score_breakdown.skills : null },
              { name: 'Quantified Evidence & Metrics', val: analysis ? analysis.score_breakdown.achievement_evidence : null },
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
          <h3 className="text-sm font-black text-slate-900">ATS Document Snapshot</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-blue-600">Skills detected</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{hasAnalysis ? detectedSkillCount : '--'}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">Resume sections</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {hasAnalysis ? `${Math.round(((analysis?.score_breakdown?.section_coverage ?? 0) / 100) * 7)}/7` : '--'}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Overall strength counts are derived directly from the document content. Skills indicate confirmed keywords found in the resume text.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEPARATE CONTAINER: TARGET-BASED ROLE EVALUATION & BENCHMARK */}
      {/* ============================================================ */}
      {hasAnalysis && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          {/* Container Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <Target className="w-4 h-4" />
                <span>TARGET-BASED ROLE EVALUATION &amp; BENCHMARK</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Role-Specific Alignment Radar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmark your overall resume skills against specific market requisitions. Your primary resume score remains 100% role-independent.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Active Benchmark: {roleAlignment.roleTitle}
              </span>
            </div>
          </div>

          {/* Quick Role Selector Buttons */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700">Select Target Role to Benchmark:</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TARGET_ROLE_PROFILES).map(([key, prof]) => {
                const isSelected = selectedRoleKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedRoleKey(key);
                      setActiveRoleTitle(prof.title);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span>{prof.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Role Input */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={e => setCustomRoleInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customRoleInput.trim()) {
                      setSelectedRoleKey('custom');
                      setActiveRoleTitle(customRoleInput.trim());
                    }
                  }}
                  placeholder="Or type custom role (e.g., Solutions Architect, SRE, ML Engineer)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50/50"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (customRoleInput.trim()) {
                    setSelectedRoleKey('custom');
                    setActiveRoleTitle(customRoleInput.trim());
                  }
                }}
                disabled={!customRoleInput.trim()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition disabled:opacity-40 cursor-pointer"
              >
                Benchmark Role
              </button>
            </div>
          </div>

          {/* Alignment Metrics & Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
            {/* Role Score Card */}
            <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-blue-900/60 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                    ROLE BENCHMARK
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      roleAlignment.matchScore >= 80
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {roleAlignment.roleReadiness}
                  </span>
                </div>

                <div>
                  <div className="text-3xl font-black font-mono tracking-tight text-white">
                    {roleAlignment.matchScore}%
                  </div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">
                    Fit for {roleAlignment.roleTitle}
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                  {roleAlignment.matchScore >= 80
                    ? 'Your resume strongly aligns with typical industry job specifications for this role.'
                    : 'Solid baseline competencies present. Bridging key recommended skills will further improve application success.'}
                </div>
              </div>

              <div className="relative z-10 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Matched: {roleAlignment.matchedSkills.length} skills</span>
                <span>Gaps: {roleAlignment.missingSkills.length} skills</span>
              </div>
            </div>

            {/* Matched vs Missing Skills Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Matched Competencies</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {roleAlignment.matchedSkills.length} detected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {roleAlignment.matchedSkills.length > 0 ? (
                      roleAlignment.matchedSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold font-mono"
                        >
                          ✓ {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No direct overlap detected with this target profile.</span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-200 mt-2">
                  Found directly in your uploaded resume text.
                </div>
              </div>

              {/* Recommended Gaps */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <Target className="w-4 h-4 text-amber-600" />
                      <span>Target Role Skill Gaps</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      {roleAlignment.missingSkills.length} recommended
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {roleAlignment.missingSkills.length > 0 ? (
                      roleAlignment.missingSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold font-mono"
                        >
                          + {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold">Zero critical skill gaps for this profile!</span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-200 mt-2">
                  Consider highlighting projects or coursework covering these tools.
                </div>
              </div>
            </div>
          </div>

          {/* Tailoring Blueprint Advice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Resume Tailoring Blueprint for {roleAlignment.roleTitle}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roleAlignment.tailoringTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
