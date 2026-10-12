import React, { useState } from 'react';
import { PenTool, Download, Copy, Check, Plus, Trash2, Eye } from 'lucide-react';

export const ResumeBuilderView: React.FC = () => {
  const [name, setName] = useState('Alex Chen');
  const [email, setEmail] = useState('alex.chen@example.com');
  const [phone, setPhone] = useState('+1 555-019-2834');
  const [location, setLocation] = useState('San Francisco, CA');
  const [title, setTitle] = useState('Senior Full Stack Software Engineer');
  const [summary, setSummary] = useState(
    'Dedicated Full Stack Software Engineer with 4+ years of experience building high-throughput web applications with React, TypeScript, and FastAPI. Proven background optimizing system performance and mentoring teams.'
  );
  const [skills, setSkills] = useState('Python, TypeScript, React, Node.js, FastAPI, PostgreSQL, Docker, AWS, Git, CI/CD');
  const [experiences, setExperiences] = useState([
    {
      company: 'CloudWave Systems',
      role: 'Senior Software Developer',
      period: '2022 – Present',
      bullets: 'Led microservices development handling 4.5M daily requests; reduced latency by 35% with Redis caching.',
    },
    {
      company: 'Nexus Tech',
      role: 'Software Engineer',
      period: '2020 – 2022',
      bullets: 'Built client dashboards with React and TypeScript, improving user retention by 28%.',
    },
  ]);
  const [education, setEducation] = useState('B.S. in Computer Science — UC Berkeley (2016 – 2020)');
  const [copied, setCopied] = useState(false);

  const formattedText = `${name.toUpperCase()}
${email} | ${phone} | ${location}
Title: ${title}

PROFESSIONAL SUMMARY
${summary}

TECHNICAL SKILLS
${skills}

EXPERIENCE
${experiences
  .map(
    e => `${e.role} — ${e.company} (${e.period})
• ${e.bullets}`
  )
  .join('\n\n')}

EDUCATION
${education}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}_Resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addExperience = () => {
    setExperiences(prev => [
      ...prev,
      { company: 'Company Name', role: 'Software Engineer', period: '2023 – Present', bullets: 'Delivered core projects with measurable impact.' },
    ]);
  };

  const removeExperience = (idx: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-1">
            <span>Document Studio</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span className="text-blue-600 font-bold">Structured ATS Builder</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            ATS-Optimized Resume Creator &amp; Formatter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Compose clean, standardized professional resume records and export immediate plain-text ATS versions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Profile &amp; Header
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Executive Summary</label>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Technical Skills (Comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Experience History</label>
              <button
                onClick={addExperience}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {experiences.map((exp, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Role #{idx + 1}</span>
                  {experiences.length > 1 && (
                    <button
                      onClick={() => removeExperience(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={e => {
                      const updated = [...experiences];
                      updated[idx].role = e.target.value;
                      setExperiences(updated);
                    }}
                    placeholder="Role"
                    className="p-2 rounded-lg border border-slate-300 text-xs"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={e => {
                      const updated = [...experiences];
                      updated[idx].company = e.target.value;
                      setExperiences(updated);
                    }}
                    placeholder="Company"
                    className="p-2 rounded-lg border border-slate-300 text-xs"
                  />
                  <input
                    type="text"
                    value={exp.period}
                    onChange={e => {
                      const updated = [...experiences];
                      updated[idx].period = e.target.value;
                      setExperiences(updated);
                    }}
                    placeholder="Period"
                    className="p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  value={exp.bullets}
                  onChange={e => {
                    const updated = [...experiences];
                    updated[idx].bullets = e.target.value;
                    setExperiences(updated);
                  }}
                  placeholder="Key quantified achievements..."
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Education</label>
            <input
              type="text"
              value={education}
              onChange={e => setEducation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        {/* Live Document Preview Panel */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Document Layout Preview</span>
          </div>

          <div className="flex-1 p-6 bg-slate-50 border border-slate-200/80 rounded-xl overflow-y-auto max-h-[600px] font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
            {formattedText}
          </div>
        </div>
      </div>
    </div>
  );
};
