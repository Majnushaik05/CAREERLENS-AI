import React, { useState, useRef } from 'react';
import { Candidate, HiringCampaign } from '../../types';
import { extractResumeSkills, screenBatchCandidatesClientSide } from '../../services/careerService';
import {
  UploadCloud,
  Users,
  Award,
  Sparkles,
  Mail,
  Phone,
  Search,
  Filter,
  FileText,
  Trash2,
  Send,
  Download,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface BulkScreeningViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  onScreenComplete: (newCandidates: Candidate[]) => void;
  onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
  onNavigate?: (tool: string) => void;
}

interface StagedResume {
  id: string;
  filename: string;
  size: number;
  name: string;
  email: string;
  phone: string;
  text: string;
}

export const BulkScreeningView: React.FC<BulkScreeningViewProps> = ({
  campaign,
  candidates,
  onScreenComplete,
  onUpdateCandidate,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [stagedFiles, setStagedFiles] = useState<StagedResume[]>([]);
  const [pasteBatchText, setPasteBatchText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract candidate name from raw text
  const parseCandidateName = (text: string, fallback: string): string => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines.slice(0, 5)) {
      if (line.length > 2 && line.length < 40 && !line.includes('@') && !line.includes('http') && !line.toLowerCase().includes('resume')) {
        return line.replace(/^[#*\-•\s]+/, '').trim();
      }
    }
    return fallback.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  };

  // Helper to extract email
  const parseCandidateEmail = (text: string): string => {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return emailMatch ? emailMatch[0].toLowerCase() : '';
  };

  // Helper to extract phone
  const parseCandidatePhone = (text: string): string => {
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    return phoneMatch ? phoneMatch[0] : '';
  };

  // Identity keys deliberately avoid name-only matching: two different people may share a name.
  // A duplicate is the same normalized email, phone, or complete normalized resume content.
  const getCandidateKeys = (email: string, phone: string, text: string): string[] => {
    const keys: string[] = [];
    const normEmail = (email || '').toLowerCase().trim();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const normalizedText = (text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');

    if (normEmail && !/(?:example\.com|applied\.net)$/.test(normEmail)) keys.push(`email:${normEmail}`);
    if (cleanPhone.length >= 7) keys.push(`phone:${cleanPhone}`);
    // Content matching catches renamed/reformatted duplicate uploads when contact details are absent.
    if (normalizedText.length >= 80) keys.push(`content:${normalizedText}`);
    return keys;
  };

  const getCandidateKeysFromCandidate = (candidate: Candidate): string[] =>
    getCandidateKeys(candidate.email || candidate.extracted_email || '', candidate.phone || '', candidate.resume_text || '');

  // Handle multi-file selection with instant deduplication
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    const newStaged: StagedResume[] = [];
    let duplicateCount = 0;

    // Track existing staged keys
    const seenSignatures = new Set<string>([
      ...candidates.flatMap(getCandidateKeysFromCandidate),
      ...stagedFiles.flatMap(f => getCandidateKeys(f.email, f.phone, f.text)),
    ]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const textContent = await readFileAsText(file);
        const name = parseCandidateName(textContent, file.name);
        const email = parseCandidateEmail(textContent);
        const phone = parseCandidatePhone(textContent);
        const identityKeys = getCandidateKeys(email, phone, textContent);

        if (identityKeys.some(key => seenSignatures.has(key))) {
          duplicateCount++;
          continue;
        }

        identityKeys.forEach(key => seenSignatures.add(key));
        newStaged.push({
          id: `staged_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
          filename: file.name,
          size: file.size,
          name,
          email,
          phone,
          text: textContent,
        });
      } catch (err) {
        console.warn(`Failed to read ${file.name}:`, err);
      }
    }

    if (newStaged.length > 0) {
      setStagedFiles(prev => [...prev, ...newStaged]);
      if (duplicateCount > 0) {
        setSuccessMessage(`Loaded ${newStaged.length} unique resume(s). Filtered out ${duplicateCount} duplicate submission(s).`);
      } else {
        setSuccessMessage(`Loaded ${newStaged.length} resume(s). Ready for bulk screening.`);
      }
      setTimeout(() => setSuccessMessage(null), 4000);
    } else if (duplicateCount > 0) {
      setErrorMessage(`All ${duplicateCount} selected file(s) are identical duplicates of already uploaded resumes. Only 1 unique profile is retained.`);
      setTimeout(() => setErrorMessage(null), 5000);
    }

    // Reset input so same files can be re-selected if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => {
        let text = (ev.target?.result as string) || '';
        // Extract plain strings from PDF structure if raw PDF
        if (text.includes('%PDF-')) {
          const chunks: string[] = [];
          const matches = text.match(/\(([^()]+)\)/g) || [];
          for (const m of matches) {
            const s = m.slice(1, -1).trim();
            if (s.length > 1 && !/^[\x00-\x1F]+$/.test(s)) chunks.push(s);
          }
          if (chunks.length > 5) text = chunks.join(' ');
        }
        text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s{2,}/g, ' ').trim();
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const removeStagedFile = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearStagedFiles = () => {
    setStagedFiles([]);
  };

  // Parse pasted batch resumes (separated by `---` or double line breaks) with deduplication
  const handleParsePastedBatch = () => {
    if (!pasteBatchText.trim()) {
      setErrorMessage('Please paste at least one candidate resume into the box.');
      return;
    }

    const rawBlocks = pasteBatchText
      .split(/\n\s*---\s*\n|\n{3,}/)
      .map(b => b.trim())
      .filter(b => b.length > 30);

    if (rawBlocks.length === 0) {
      setErrorMessage('Could not detect distinct resumes. Separate candidate resumes with --- or empty lines.');
      return;
    }

    const seenSignatures = new Set<string>([
      ...candidates.flatMap(getCandidateKeysFromCandidate),
      ...stagedFiles.flatMap(f => getCandidateKeys(f.email, f.phone, f.text)),
    ]);

    const newStaged: StagedResume[] = [];
    let dupCount = 0;

    rawBlocks.forEach((block, idx) => {
      const name = parseCandidateName(block, `Candidate ${stagedFiles.length + idx + 1}`);
      const email = parseCandidateEmail(block);
      const phone = parseCandidatePhone(block);
      const identityKeys = getCandidateKeys(email, phone, block);

      if (identityKeys.some(key => seenSignatures.has(key))) {
        dupCount++;
        return;
      }
      identityKeys.forEach(key => seenSignatures.add(key));

      newStaged.push({
        id: `pasted_${Date.now()}_${idx}`,
        filename: `${name.replace(/\s+/g, '_')}_Resume.txt`,
        size: block.length,
        name,
        email,
        phone,
        text: block,
      });
    });

    if (newStaged.length > 0) {
      setStagedFiles(prev => [...prev, ...newStaged]);
      setPasteBatchText('');
      setActiveTab('upload');
      if (dupCount > 0) {
        setSuccessMessage(`Parsed ${newStaged.length} unique resume(s). Omitted ${dupCount} duplicate(s).`);
      } else {
        setSuccessMessage(`Parsed ${newStaged.length} candidate resume(s) from pasted text!`);
      }
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(`All pasted blocks were identical duplicates of existing candidates.`);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Run bulk screening against the campaign job description
  const handleRunBatchScreening = async () => {
    if (stagedFiles.length === 0) {
      setErrorMessage('Please upload or paste resume files before running bulk screening.');
      return;
    }

    const jd = campaign?.job_description || `Software Engineer requiring strong technical fundamentals, system design, modern frameworks, databases, and problem solving.`;

    setLoading(true);
    setErrorMessage(null);

    const payloadResumes = stagedFiles.map(f => ({
      name: f.name,
      filename: f.filename,
      email: f.email,
      phone: f.phone,
      text: f.text,
    }));

    // Keep the existing roster unchanged and reject incoming duplicates rather than
    // overwriting a previously screened candidate or counting them twice.
    const mergeUniqueCandidates = (incoming: Candidate[]): Candidate[] => {
      const seen = new Set<string>(candidates.flatMap(getCandidateKeysFromCandidate));
      const merged: Candidate[] = [...candidates];
      for (const candidate of incoming) {
        const keys = getCandidateKeysFromCandidate(candidate);
        if (keys.some(key => seen.has(key))) continue;
        keys.forEach(key => seen.add(key));
        merged.push(candidate);
      }
      return merged.sort((a, b) => b.role_match - a.role_match);
    };

    try {
      const res = await fetch('/api/recruiter/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jd,
          resumes: payloadResumes,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const screenedList: Candidate[] = await res.json();
        const merged = mergeUniqueCandidates(screenedList);
        onScreenComplete(merged);
        setStagedFiles([]);
        setLoading(false);
        setSuccessMessage(`Screening complete: ${merged.length - candidates.length} new unique candidate(s) added. Existing candidates and duplicate resumes were excluded. Total roster: ${merged.length}.`);
        setTimeout(() => setSuccessMessage(null), 3500);
        return;
      }
    } catch (e) {
      console.warn('API screening fallback to client parser:', e);
    }

    // Client fallback with strict regex catalog
    const fallbackList = screenBatchCandidatesClientSide(jd, payloadResumes);
    const merged = mergeUniqueCandidates(fallbackList);
    onScreenComplete(merged);
    setStagedFiles([]);
    setLoading(false);
    setSuccessMessage(`Screening complete: ${merged.length - candidates.length} new unique candidate(s) added. Existing candidates and duplicate resumes were excluded. Total roster: ${merged.length}.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDeduplicateRoster = () => {
    const seen = new Set<string>();
    const unique: Candidate[] = [];
    for (const candidate of candidates) {
      const keys = getCandidateKeysFromCandidate(candidate);
      if (keys.some(key => seen.has(key))) continue;
      keys.forEach(key => seen.add(key));
      unique.push(candidate);
    }
    const removed = candidates.length - unique.length;
    onScreenComplete(unique);
    setSuccessMessage(removed > 0
      ? `Cleaned roster: removed ${removed} duplicate record(s). ${unique.length} unique candidate(s) retained.`
      : `Roster verified: ${unique.length} candidate(s) retained; no duplicates found.`);
    setTimeout(() => setSuccessMessage(null), 3500);
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

  const handleExportCSV = () => {
    if (candidates.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Role Match %', 'Score', 'Status', 'Skills'];
    const rows = candidates.map(c => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      c.role_match,
      c.resume_score,
      `"${c.status}"`,
      `"${c.skills.join(', ')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `screened_candidates_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto selection:bg-purple-600 selection:text-white pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>BULK APPLICANT SCREENING &amp; COHORT RANKING</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Bulk Candidate Resume Screening
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {campaign ? (
              <>
                Screening against active campaign:{' '}
                <strong className="text-slate-900">{campaign.role}</strong> ({campaign.company})
              </>
            ) : (
              <>
                No active campaign selected.{' '}
                <button
                  onClick={() => onNavigate && onNavigate('Hiring Campaign')}
                  className="text-purple-600 font-bold hover:underline"
                >
                  Configure Hiring Campaign →
                </button>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {candidates.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Select Multiple Resumes</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.doc,.md"
            onChange={handleFilesSelected}
            className="hidden"
          />
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* BATCH INGESTION CONTROLS (Multi-File Dropzone & Text Ingestion) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        {/* Tab switch between File Upload and Text Paste */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'upload'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Upload Multiple Resume Files ({stagedFiles.length})
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'paste'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Paste Batch Resumes
            </button>
          </div>

          {stagedFiles.length > 0 && (
            <button
              onClick={clearStagedFiles}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold transition"
            >
              Clear Staged ({stagedFiles.length})
            </button>
          )}
        </div>

        {activeTab === 'upload' ? (
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const input = fileInputRef.current;
                  if (input) {
                    input.files = e.dataTransfer.files;
                    handleFilesSelected({ target: input } as any);
                  }
                }
              }}
              className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-purple-50/20 transition group text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Drop multiple candidate resumes here, or <span className="text-purple-600 underline">browse files</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select 1 to 50+ resume files at once (.pdf, .txt, .docx, .md). Genuine candidate skills and contacts will be parsed.
              </p>
            </div>

            {/* Staged Resumes Queue */}
            {stagedFiles.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Staged Resumes Ready for Screening ({stagedFiles.length})</span>
                  <span className="text-slate-400 font-normal">Click &apos;Execute Screening&apos; below to audit against campaign</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                  {stagedFiles.map((file, idx) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{file.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{file.filename} · {Math.round(file.size / 1024)} KB</div>
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          removeStagedFile(file.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition shrink-0"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleRunBatchScreening}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Evaluating Applicant Batch Against JD...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Execute Bulk Screening ({stagedFiles.length} Resumes)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Paste Batch Resumes (Separate multiple resumes with <code className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-700">---</code>)
            </label>
            <textarea
              rows={8}
              value={pasteBatchText}
              onChange={e => setPasteBatchText(e.target.value)}
              placeholder="Candidate Name&#10;candidate@email.com | +1 555-0123&#10;Skills: Python, React, PostgreSQL, Docker...&#10;Experience: ...&#10;&#10;---&#10;&#10;Second Candidate Name&#10;second@email.com&#10;Skills: TypeScript, AWS, Node.js..."
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <div className="flex justify-end">
              <button
                onClick={handleParsePastedBatch}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1.5"
              >
                <span>Parse &amp; Stage Resumes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screened Candidates Leaderboard */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-950">
              Ranked Candidate Roster ({filteredCandidates.length})
            </h2>
            <div className="text-xs text-slate-400">Sorted by Requisition Semantic Fit</div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {candidates.length > 0 && (
              <>
                <button
                  onClick={handleDeduplicateRoster}
                  title="Remove duplicate submissions and keep only unique candidate profiles"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Filter className="w-3.5 h-3.5 text-purple-600" />
                  <span>Deduplicate</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
              </>
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by name, email, or skill..."
              className="w-full sm:w-56 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-14 border-2 border-dashed border-slate-200 rounded-2xl">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No candidates screened yet</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4 max-w-md mx-auto">
              Upload candidate resumes above using the multi-file selector or drag-and-drop zone to run genuine NLP screening against your campaign.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition inline-flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Select Resume Files</span>
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
                        <span className="text-xs font-mono font-bold tabular-nums text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {cand.role_match}% Match
                        </span>
                        {isShortlisted && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Shortlisted
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{cand.email}</span>
                        </span>
                        {cand.phone && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{cand.phone}</span>
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {cand.skills.map((sk, sIdx) => (
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
