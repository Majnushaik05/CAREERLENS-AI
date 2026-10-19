import React, { useState, useRef } from 'react';
import {
  PenTool,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  Printer,
  Sparkles,
  Layers,
  FileText,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string;
}

export type TemplateId =
  | 'modern-minimal'
  | 'executive-corporate'
  | 'silicon-valley'
  | 'two-column-slate'
  | 'emerald-compact'
  | 'editorial-classic'
  | 'nordic-clean'
  | 'financial-consulting'
  | 'contemporary-bold'
  | 'systems-lead';

interface TemplateOption {
  id: TemplateId;
  name: string;
  styleDesc: string;
  accentColor: string;
  badge: string;
}

export const ResumeBuilderView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern-minimal');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  // Resume form state
  const [name, setName] = useState('Alex Morgan');
  const [title, setTitle] = useState('Senior Full Stack Software Engineer');
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [location, setLocation] = useState('San Francisco, CA');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/alexmorgan');
  const [github, setGithub] = useState('github.com/alexmorgan');
  const [summary, setSummary] = useState(
    'Accomplished Software Engineer with 5+ years of experience engineering high-throughput distributed systems, microservices, and reactive web applications. Proven track record reducing API latencies by 38%, scaling architectures across AWS cloud, and mentoring high-velocity engineering teams.'
  );
  const [skills, setSkills] = useState(
    'Python, TypeScript, React, Node.js, FastAPI, PostgreSQL, Redis, Docker, Kubernetes, AWS, System Design, CI/CD, Git, GraphQL, Automated Testing'
  );

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: 'exp-1',
      company: 'Apex Cloud Innovations',
      role: 'Senior Full Stack Engineer',
      period: '2022 – Present',
      location: 'San Francisco, CA',
      bullets:
        'Architected core microservices handling 8.5M daily events; reduced 99th-percentile response latency by 38% via Redis caching.\nLed migration to React and TypeScript micro-frontends, increasing developer deployment velocity by 45%.\nOrchestrated containerized production workflows utilizing Docker, Kubernetes, and automated GitHub Actions pipelines.',
    },
    {
      id: 'exp-2',
      company: 'Horizon Technologies',
      role: 'Full Stack Developer',
      period: '2020 – 2022',
      location: 'Seattle, WA',
      bullets:
        'Engineered 14+ scalable RESTful APIs with Python and PostgreSQL for multi-tenant enterprise telemetry dashboards.\nMentored 4 junior engineers on clean architectural standards, peer reviews, and test-driven development.',
    },
  ]);

  const [education, setEducation] = useState(
    'B.S. in Computer Science — University of California, Berkeley (2016 – 2020)\nHonors: Magna Cum Laude, Dean’s Honor List'
  );

  const [certifications, setCertifications] = useState(
    'AWS Certified Solutions Architect – Associate (2023)\nCertified Kubernetes Application Developer (CKAD)'
  );

  const resumeDocumentRef = useRef<HTMLDivElement>(null);

  const templates: TemplateOption[] = [
    { id: 'modern-minimal', name: 'Modern Minimalist', styleDesc: 'Clean typography, blue rule accents & modern hierarchy', accentColor: '#2563EB', badge: 'Popular' },
    { id: 'executive-corporate', name: 'Executive Corporate', styleDesc: 'Commanding dark navy header banner & leadership layout', accentColor: '#0F172A', badge: 'Leadership' },
    { id: 'silicon-valley', name: 'Silicon Valley Tech', styleDesc: 'Monospaced skill tags, modern tech stacks & GitHub callout', accentColor: '#3B82F6', badge: 'Tech' },
    { id: 'two-column-slate', name: 'Two-Column Slate', styleDesc: 'Sidebar with contacts, skills & education alongside experience', accentColor: '#1E293B', badge: 'Modern' },
    { id: 'emerald-compact', name: 'Emerald Horizon', styleDesc: 'Forest green highlights, compact density & clean rule dividers', accentColor: '#059669', badge: 'Compact' },
    { id: 'editorial-classic', name: 'Editorial Serif', styleDesc: 'Refined classic serif typography, centered header & formal balance', accentColor: '#334155', badge: 'Classic' },
    { id: 'nordic-clean', name: 'Nordic Clean', styleDesc: 'Spacious Scandinavian grid, ice blue subheads & airy borders', accentColor: '#0284C7', badge: 'Spacious' },
    { id: 'financial-consulting', name: 'Consulting & Finance', styleDesc: 'High-density metric layout with traditional corporate rules', accentColor: '#1E3A8A', badge: 'Corporate' },
    { id: 'contemporary-bold', name: 'Contemporary Bold', styleDesc: 'Bold geometric header blocks, dual-color skill pills & cards', accentColor: '#7C3AED', badge: 'Creative' },
    { id: 'systems-lead', name: 'Technical Architect', styleDesc: 'Categorized technical matrix & high-impact architectural accomplishments', accentColor: '#0D9488', badge: 'Architect' },
  ];

  const addExperience = () => {
    setExperiences(prev => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        company: 'New Enterprise Corp',
        role: 'Software Developer',
        period: '2023 – Present',
        location: 'Remote',
        bullets: 'Architected scalable services and improved team metrics.\nCollaborated across cross-functional product and design teams.',
      },
    ]);
  };

  const removeExperience = (id: string) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  const updateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    setExperiences(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  };

  // Plain Text Version for ATS Copy
  const formattedPlainText = `${name.toUpperCase()}
${title}
${email} | ${phone} | ${location}
LinkedIn: ${linkedin} | GitHub: ${github}

PROFESSIONAL SUMMARY
${summary}

TECHNICAL SKILLS
${skills}

PROFESSIONAL EXPERIENCE
${experiences
  .map(
    e => `${e.role.toUpperCase()} — ${e.company} (${e.period})
Location: ${e.location}
${e.bullets
  .split('\n')
  .filter(b => b.trim())
  .map(b => `• ${b.trim()}`)
  .join('\n')}`
  )
  .join('\n\n')}

EDUCATION
${education}

CERTIFICATIONS
${certifications}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedPlainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([formattedPlainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}_Resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // High-Quality PDF Export Module
  const handleDownloadPdf = async () => {
    if (!resumeDocumentRef.current) return;
    setGeneratingPdf(true);

    try {
      const element = resumeDocumentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const totalPdfHeight = canvasHeight / ratio;

      let heightLeft = totalPdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 5) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save(`${name.replace(/\s+/g, '_')}_Resume_${selectedTemplate}.pdf`);
    } catch (err) {
      console.warn('HTML2Canvas export fallback:', err);
      window.print();
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to split skill string into individual clean tags
  const skillList = skills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6 max-w-7xl mx-auto selection:bg-blue-600 selection:text-white pb-12">
      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Document Studio · Multi-Template Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Resume Builder &amp; PDF Export Module
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Choose from 10 professional resume designs. Format your career profile, experience milestones, and technical competencies, then download as high-resolution PDF or text.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export .txt</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            title="Native print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            {generatingPdf ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 10+ PROFESSIONAL TEMPLATE SELECTOR CAROUSEL / GRID */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Select Reference Design (10 Professional Styles)
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Active: {templates.find(t => t.id === selectedTemplate)?.name}
          </span>
        </div>

        {/* Horizontal Scrollable Template Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {templates.map(tpl => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: tpl.accentColor }}
                    />
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tpl.badge}
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900 leading-snug">
                    {tpl.name}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-tight">
                    {tpl.styleDesc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
                  <span className={isSelected ? 'text-blue-700' : 'text-slate-400'}>
                    {isSelected ? '✓ Selected' : 'Choose'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DUAL WORKSPACE: LEFT EDITOR FORM | RIGHT LIVE TEMPLATE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: EDITOR FORM (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">Resume Data Inputs</h3>
            <span className="text-[11px] text-slate-400">Live preview updates automatically</span>
          </div>

          {/* Section 1: Contact & Header */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Header &amp; Contact Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Role Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">GitHub / URL</label>
                <input
                  type="text"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Professional Summary */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Executive Summary
            </div>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Concise overview of your career accomplishments, core domains, and impact..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Section 3: Technical Skills */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Core Competencies &amp; Skills
              </div>
              <span className="text-[10px] text-slate-400">Comma-separated</span>
            </div>
            <textarea
              rows={2}
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="e.g. Python, TypeScript, React, PostgreSQL, Docker, AWS..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:border-blue-500 font-mono text-[11px]"
            />
          </div>

          {/* Section 4: Work Experience */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Professional Experience ({experiences.length})
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Position #{idx + 1}
                    </span>
                    {experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove position"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={e => updateExperience(exp.id, { role: e.target.value })}
                      placeholder="Role Title"
                      className="p-2 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={e => updateExperience(exp.id, { company: e.target.value })}
                      placeholder="Company Name"
                      className="p-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.period}
                      onChange={e => updateExperience(exp.id, { period: e.target.value })}
                      placeholder="2022 – Present"
                      className="p-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={exp.location}
                      onChange={e => updateExperience(exp.id, { location: e.target.value })}
                      placeholder="City, Country / Remote"
                      className="p-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Key Accomplishments (One bullet per line)
                    </label>
                    <textarea
                      rows={3}
                      value={exp.bullets}
                      onChange={e => updateExperience(exp.id, { bullets: e.target.value })}
                      placeholder="Quantifiable achievements with metrics..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Education & Certifications */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              5. Education &amp; Certifications
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Education</label>
              <textarea
                rows={2}
                value={education}
                onChange={e => setEducation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Certifications &amp; Accreditations</label>
              <textarea
                rows={2}
                value={certifications}
                onChange={e => setCertifications(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE HIGH-RESOLUTION DOCUMENT PREVIEW (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>Live PDF Document Renderer</span>
            </div>
            <span>Standard Letter / A4 Format</span>
          </div>

          {/* Render Container for HTML2Canvas */}
          <div className="bg-slate-200/70 p-2 sm:p-5 rounded-3xl border border-slate-300/80 shadow-inner overflow-x-auto flex justify-center">
            <div
              id="resume-preview-document"
              ref={resumeDocumentRef}
              className="w-full max-w-[760px] bg-white shadow-2xl transition-all duration-300 min-h-[1020px] text-slate-900 select-text"
              style={{
                fontFamily:
                  selectedTemplate === 'editorial-classic'
                    ? 'Georgia, Cambria, serif'
                    : 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              {/* ==============================================================
                  TEMPLATE 1: MODERN MINIMALIST
                  ============================================================== */}
              {selectedTemplate === 'modern-minimal' && (
                <div className="p-8 sm:p-10 space-y-6">
                  {/* Header */}
                  <div className="border-b-2 border-blue-600 pb-5">
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase">{name}</h1>
                    <div className="text-sm font-bold text-blue-600 mt-0.5 tracking-wide">{title}</div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3 font-medium">
                      <span>{email}</span>
                      <span>·</span>
                      <span>{phone}</span>
                      <span>·</span>
                      <span>{location}</span>
                      <span>·</span>
                      <span>{linkedin}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest text-blue-800">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest text-blue-800">
                      Core Competencies
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest text-blue-800">
                      Professional Experience
                    </h2>
                    <div className="space-y-4">
                      {experiences.map(exp => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-slate-900">{exp.role}</span>
                            <span className="font-mono text-slate-500 text-[11px]">{exp.period}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-blue-700 font-semibold">
                            <span>{exp.company}</span>
                            <span className="text-slate-400 font-normal">{exp.location}</span>
                          </div>
                          <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1 pt-1 leading-relaxed">
                            {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                              <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education & Certifications */}
                  <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                    <div className="space-y-1">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest text-blue-800">Education</h2>
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{education}</p>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest text-blue-800">Certifications</h2>
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 2: EXECUTIVE CORPORATE
                  ============================================================== */}
              {selectedTemplate === 'executive-corporate' && (
                <div>
                  <div className="bg-slate-950 text-white p-8 sm:p-10">
                    <h1 className="text-3xl font-serif font-black tracking-wide text-white uppercase">{name}</h1>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-300 mt-1">{title}</div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-4 font-mono">
                      <span>{email}</span>
                      <span>|</span>
                      <span>{phone}</span>
                      <span>|</span>
                      <span>{location}</span>
                    </div>
                  </div>

                  <div className="p-8 sm:p-10 space-y-6">
                    <div className="space-y-1 border-b border-slate-200 pb-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-serif">Executive Profile</h2>
                      <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
                    </div>

                    <div className="space-y-2 border-b border-slate-200 pb-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-serif">Key Competencies</h2>
                      <p className="text-xs text-slate-800 leading-relaxed font-semibold">{skills}</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-serif">Executive Career History</h2>
                      {experiences.map(exp => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-950">
                            <span>{exp.role} — {exp.company}</span>
                            <span className="font-mono text-slate-500">{exp.period}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 italic">{exp.location}</div>
                          <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1 leading-relaxed pt-1">
                            {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                              <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-200">
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-serif">Education</h2>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{education}</p>
                      </div>
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-serif">Credentials</h2>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{certifications}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 3: SILICON VALLEY TECH
                  ============================================================== */}
              {selectedTemplate === 'silicon-valley' && (
                <div className="p-8 sm:p-10 space-y-6 font-mono text-xs">
                  <div className="border-b border-slate-300 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-black text-slate-950 tracking-tight font-sans">{name}</h1>
                      <div className="text-xs text-blue-600 font-bold tracking-normal">{title}</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                      <div>{email} · {phone}</div>
                      <div>{location} · {github}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      $ cat about_me.txt
                    </div>
                    <p className="text-[11px] font-sans text-slate-700 leading-relaxed">{summary}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      $ echo $TECH_STACK
                    </div>
                    <div className="flex flex-wrap gap-1 font-sans">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono">
                      $ git log --experience
                    </div>
                    {experiences.map(exp => (
                      <div key={exp.id} className="border-l-2 border-blue-500 pl-3.5 space-y-1 py-0.5">
                        <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                          <span>{exp.role} @ {exp.company}</span>
                          <span className="font-mono text-[11px] text-slate-400 font-normal">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-1 leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 font-sans text-[11px]">
                    <div>
                      <div className="font-mono font-bold text-slate-900 mb-1">$ cat education</div>
                      <p className="text-slate-700 whitespace-pre-line">{education}</p>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-slate-900 mb-1">$ cat certifications</div>
                      <p className="text-slate-700 whitespace-pre-line">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 4: TWO-COLUMN SLATE
                  ============================================================== */}
              {selectedTemplate === 'two-column-slate' && (
                <div className="grid grid-cols-12 min-h-[1020px]">
                  {/* Left Column (4 cols) */}
                  <div className="col-span-4 bg-slate-900 text-slate-200 p-6 space-y-6 text-xs">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mb-3">
                        {name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h1 className="text-lg font-black text-white leading-tight">{name}</h1>
                      <div className="text-[11px] text-blue-400 font-semibold mt-1">{title}</div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-800 text-[11px]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact</div>
                      <div>{email}</div>
                      <div>{phone}</div>
                      <div>{location}</div>
                      <div className="truncate text-blue-400">{linkedin}</div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {skillList.map((sk, idx) => (
                          <span key={idx} className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Education</div>
                      <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">{education}</p>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Certifications</div>
                      <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">{certifications}</p>
                    </div>
                  </div>

                  {/* Right Column (8 cols) */}
                  <div className="col-span-8 p-7 space-y-6 text-xs">
                    <div className="space-y-1.5">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        Executive Overview
                      </h2>
                      <p className="text-slate-700 leading-relaxed text-xs">{summary}</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        Experience &amp; Accomplishments
                      </h2>
                      {experiences.map(exp => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between items-baseline font-bold text-slate-900">
                            <span>{exp.role}</span>
                            <span className="font-mono text-slate-400 text-[11px]">{exp.period}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-blue-700">{exp.company} · {exp.location}</div>
                          <ul className="list-disc pl-4 text-slate-700 space-y-1 leading-relaxed pt-1">
                            {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                              <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 5: EMERALD HORIZON
                  ============================================================== */}
              {selectedTemplate === 'emerald-compact' && (
                <div className="p-8 sm:p-10 space-y-5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-emerald-600 gap-2">
                    <div>
                      <h1 className="text-3xl font-black text-slate-950 tracking-tight">{name}</h1>
                      <div className="text-emerald-700 font-bold text-xs uppercase tracking-wide mt-0.5">{title}</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                      <div>{email} · {phone}</div>
                      <div>{location} · {linkedin}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                      Summary Profile
                    </h2>
                    <p className="text-slate-700 leading-relaxed">{summary}</p>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                      Technical Capabilities
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <h2 className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                      Professional Experience
                    </h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{exp.role} — <span className="text-emerald-700">{exp.company}</span></span>
                          <span className="font-mono text-slate-500 text-[11px]">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-4 text-slate-700 space-y-1 leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-200">
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-emerald-800 mb-1">Education</h2>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{education}</p>
                    </div>
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-emerald-800 mb-1">Certifications</h2>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 6: EDITORIAL CLASSIC
                  ============================================================== */}
              {selectedTemplate === 'editorial-classic' && (
                <div className="p-9 sm:p-11 space-y-6 text-xs leading-relaxed font-serif">
                  <div className="text-center space-y-1.5 border-b border-slate-300 pb-5">
                    <h1 className="text-3xl font-black text-slate-950 tracking-wide uppercase">{name}</h1>
                    <div className="text-xs uppercase tracking-widest text-slate-600 font-sans">{title}</div>
                    <div className="text-[11px] text-slate-500 font-sans pt-1">
                      {location} · {phone} · {email} · {linkedin}
                    </div>
                  </div>

                  <div className="space-y-1 text-center max-w-xl mx-auto">
                    <p className="italic text-slate-700">{summary}</p>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-200 pt-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans text-center">
                      Areas of Expertise
                    </h2>
                    <p className="text-center font-sans text-[11px] text-slate-800">{skills}</p>
                  </div>

                  <div className="space-y-4 border-t border-slate-200 pt-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">
                      Experience
                    </h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-950 font-sans">
                          <span>{exp.role}, {exp.company}</span>
                          <span className="font-normal text-slate-500">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-5 text-slate-700 space-y-1">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-6 border-t border-slate-200 pt-3 font-sans">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-1">Education</h2>
                      <p className="text-slate-700 whitespace-pre-line text-[11px]">{education}</p>
                    </div>
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-1">Certifications</h2>
                      <p className="text-slate-700 whitespace-pre-line text-[11px]">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 7: NORDIC CLEAN
                  ============================================================== */}
              {selectedTemplate === 'nordic-clean' && (
                <div className="p-9 sm:p-12 space-y-7 text-xs">
                  <div className="space-y-2 border-b border-sky-100 pb-5">
                    <h1 className="text-3xl font-extralight text-slate-950 tracking-tight">{name}</h1>
                    <div className="text-xs font-semibold text-sky-700 tracking-wider uppercase">{title}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 font-light">
                      <span>{email}</span>
                      <span>·</span>
                      <span>{phone}</span>
                      <span>·</span>
                      <span>{location}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">About</h2>
                    <p className="text-slate-600 leading-relaxed font-light">{summary}</p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Competencies</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-sky-50 text-sky-800 px-2.5 py-0.5 rounded-full text-[11px] font-normal">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">History</h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1 pl-3 border-l border-sky-200">
                        <div className="flex justify-between text-xs font-semibold text-slate-900">
                          <span>{exp.role} — <span className="text-sky-700 font-normal">{exp.company}</span></span>
                          <span className="font-mono text-slate-400 text-[10px]">{exp.period}</span>
                        </div>
                        <ul className="text-slate-600 space-y-1 leading-relaxed list-disc pl-4 text-[11px]">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-3 border-t border-sky-100">
                    <div>
                      <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Education</h2>
                      <p className="text-slate-600 whitespace-pre-line font-light">{education}</p>
                    </div>
                    <div>
                      <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Certifications</h2>
                      <p className="text-slate-600 whitespace-pre-line font-light">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 8: CONSULTING & FINANCE
                  ============================================================== */}
              {selectedTemplate === 'financial-consulting' && (
                <div className="p-8 sm:p-10 space-y-5 text-xs">
                  <div className="text-center pb-3 border-b-2 border-slate-900">
                    <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-950">{name}</h1>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">{title}</div>
                    <div className="text-[11px] text-slate-600 mt-1 font-mono">
                      {location} | {phone} | {email} | {linkedin}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      Professional Overview
                    </h2>
                    <p className="text-slate-700 leading-relaxed">{summary}</p>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      Core Skills &amp; Domain Expertise
                    </h2>
                    <p className="text-slate-800 font-medium">{skills}</p>
                  </div>

                  <div className="space-y-3.5">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      Professional Engagements
                    </h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-950">
                          <span>{exp.company} — {exp.location}</span>
                          <span className="font-mono text-slate-600 text-[11px]">{exp.period}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-700 italic">{exp.role}</div>
                        <ul className="list-disc pl-4 text-slate-700 space-y-1 leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-200">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      Education &amp; Qualifications
                    </h2>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">{education}</p>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed pt-1">{certifications}</p>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 9: CONTEMPORARY BOLD
                  ============================================================== */}
              {selectedTemplate === 'contemporary-bold' && (
                <div className="p-8 sm:p-10 space-y-6 text-xs">
                  <div className="bg-purple-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{name}</h1>
                      <div className="text-purple-200 font-bold text-xs mt-0.5">{title}</div>
                    </div>
                    <div className="text-left sm:text-right text-[11px] text-purple-200 space-y-0.5">
                      <div>{email}</div>
                      <div>{phone} · {location}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100">
                    <p className="text-purple-950 leading-relaxed font-medium">{summary}</p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-purple-900">Competencies</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-white border border-purple-200 text-purple-900 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-purple-900">Career Trajectory</h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="p-4 rounded-xl border border-slate-200 space-y-1.5 hover:border-purple-200 transition">
                        <div className="flex justify-between items-baseline font-black text-slate-900 text-xs">
                          <span>{exp.role} · <span className="text-purple-700">{exp.company}</span></span>
                          <span className="font-mono text-slate-400 text-[11px] font-normal">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-4 text-slate-700 space-y-1 leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <h2 className="text-xs font-bold text-slate-900 uppercase mb-1">Education</h2>
                      <p className="text-slate-700 whitespace-pre-line text-[11px]">{education}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <h2 className="text-xs font-bold text-slate-900 uppercase mb-1">Certifications</h2>
                      <p className="text-slate-700 whitespace-pre-line text-[11px]">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 10: SYSTEMS ARCHITECT
                  ============================================================== */}
              {selectedTemplate === 'systems-lead' && (
                <div className="p-8 sm:p-10 space-y-5 text-xs">
                  <div className="border-b-2 border-teal-600 pb-4">
                    <div className="flex justify-between items-baseline">
                      <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">{name}</h1>
                      <span className="text-[10px] font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        SYSTEMS ARCHITECTURE PROFILE
                      </span>
                    </div>
                    <div className="text-teal-700 font-bold text-xs mt-0.5">{title}</div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 font-mono mt-2">
                      <span>{email}</span>
                      <span>·</span>
                      <span>{phone}</span>
                      <span>·</span>
                      <span>{location}</span>
                      <span>·</span>
                      <span>{github}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                      Architectural Vision &amp; Scope
                    </div>
                    <p className="text-slate-700 leading-relaxed">{summary}</p>
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-teal-50/50 rounded-xl border border-teal-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal-900">
                      Technologies, Frameworks &amp; Protocols
                    </div>
                    <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-white border border-teal-200 text-teal-900 px-2 py-0.5 rounded font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                      Engineering History &amp; Architectural Milestones
                    </div>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.role} | <span className="text-teal-700">{exp.company}</span></span>
                          <span className="font-mono text-slate-500 text-[11px]">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-4 text-slate-700 space-y-1 leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800 mb-1">Education</div>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{education}</p>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800 mb-1">Certifications</div>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
