import React, { useState, useRef, useEffect } from 'react';
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
  Camera,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  User,
  Sliders,
  ExternalLink,
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
  | 'photo-executive'
  | 'photo-creative-sidebar'
  | 'photo-modern-editorial'
  | 'photo-tech-lead'
  | 'photo-compact-horizon'
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
  category: 'photo' | 'ats';
  styleDesc: string;
  accentColor: string;
  badge: string;
}

// Self-contained, origin-clean 200x200 PNG data URL generator for the default avatar
// (Guaranteed 100% origin-clean canvas without SVG foreignObject or CORS taint)
export const generateDefaultAvatarPng = (): string => {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Dark sleek gradient
    const bg = ctx.createLinearGradient(0, 0, 200, 200);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#1e293b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 200, 200);

    // Accent halo
    ctx.beginPath();
    ctx.arc(100, 85, 46, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.fill();

    // Face / skin
    const skin = ctx.createLinearGradient(80, 50, 120, 120);
    skin.addColorStop(0, '#f8d7b8');
    skin.addColorStop(1, '#e2b992');
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(100, 85, 36, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(100, 75, 38, Math.PI, 0, false);
    ctx.fill();

    // Suit shoulders
    const suit = ctx.createLinearGradient(0, 120, 0, 200);
    suit.addColorStop(0, '#2563eb');
    suit.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = suit;
    ctx.beginPath();
    ctx.moveTo(35, 200);
    ctx.bezierCurveTo(45, 135, 75, 125, 100, 125);
    ctx.bezierCurveTo(125, 125, 155, 135, 165, 200);
    ctx.closePath();
    ctx.fill();

    // White collar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(90, 125);
    ctx.lineTo(110, 125);
    ctx.lineTo(105, 155);
    ctx.lineTo(95, 155);
    ctx.closePath();
    ctx.fill();

    // Red tie
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(97, 130);
    ctx.lineTo(103, 130);
    ctx.lineTo(105, 175);
    ctx.lineTo(100, 182);
    ctx.lineTo(95, 175);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
};

export const ResumeBuilderView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('photo-executive');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<'all' | 'photo' | 'ats'>('photo');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  // Profile Image Upload State (Initialized to clean PNG avatar)
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? generateDefaultAvatarPng() : null;
  });
  const [showPhoto, setShowPhoto] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profileImage) {
      const avatar = generateDefaultAvatarPng();
      if (avatar) setProfileImage(avatar);
    }
  }, [profileImage]);

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
    // 5 DEDICATED PHOTO / HEADSHOT TEMPLATES
    { id: 'photo-executive', name: 'Executive Portrait', category: 'photo', styleDesc: 'Commanding dark navy banner with round framed headshot & executive layout', accentColor: '#0F172A', badge: 'Photo Featured' },
    { id: 'photo-creative-sidebar', name: 'Creative Two-Column Avatar', category: 'photo', styleDesc: 'Deep slate left sidebar with square-round avatar, badges & timeline', accentColor: '#4F46E5', badge: 'Photo Sidebar' },
    { id: 'photo-modern-editorial', name: 'Editorial Modernist Portrait', category: 'photo', styleDesc: 'Crisp magazine layout with upper-right framed portrait & refined typography', accentColor: '#0369A1', badge: 'Photo Portrait' },
    { id: 'photo-tech-lead', name: 'Tech Lead Monogram & Photo', category: 'photo', styleDesc: 'Silicon Valley tech style with active-status photo badge & terminal skills', accentColor: '#0284C7', badge: 'Photo Tech' },
    { id: 'photo-compact-horizon', name: 'Compact Horizon Bio-Card', category: 'photo', styleDesc: 'Emerald bio-card header with integrated photo & high-density two columns', accentColor: '#059669', badge: 'Photo Compact' },

    // 10 CLASSIC ATS TEMPLATES
    { id: 'modern-minimal', name: 'Modern Minimalist', category: 'ats', styleDesc: 'Clean typography, blue rule accents & modern hierarchy', accentColor: '#2563EB', badge: 'Popular' },
    { id: 'executive-corporate', name: 'Executive Corporate', category: 'ats', styleDesc: 'Commanding dark navy header banner & leadership layout', accentColor: '#0F172A', badge: 'Leadership' },
    { id: 'silicon-valley', name: 'Silicon Valley Tech', category: 'ats', styleDesc: 'Monospaced skill tags, modern tech stacks & GitHub callout', accentColor: '#3B82F6', badge: 'Tech' },
    { id: 'two-column-slate', name: 'Two-Column Slate', category: 'ats', styleDesc: 'Sidebar with contacts, skills & education alongside experience', accentColor: '#1E293B', badge: 'Modern' },
    { id: 'emerald-compact', name: 'Emerald Horizon', category: 'ats', styleDesc: 'Forest green highlights, compact density & clean rule dividers', accentColor: '#059669', badge: 'Compact' },
    { id: 'editorial-classic', name: 'Editorial Serif', category: 'ats', styleDesc: 'Refined classic serif typography, centered header & formal balance', accentColor: '#334155', badge: 'Classic' },
    { id: 'nordic-clean', name: 'Nordic Clean', category: 'ats', styleDesc: 'Spacious Scandinavian grid, ice blue subheads & airy borders', accentColor: '#0284C7', badge: 'Spacious' },
    { id: 'financial-consulting', name: 'Consulting & Finance', category: 'ats', styleDesc: 'High-density metric layout with traditional corporate rules', accentColor: '#1E3A8A', badge: 'Corporate' },
    { id: 'contemporary-bold', name: 'Contemporary Bold', category: 'ats', styleDesc: 'Bold geometric header blocks, dual-color skill pills & cards', accentColor: '#7C3AED', badge: 'Creative' },
    { id: 'systems-lead', name: 'Technical Architect', category: 'ats', styleDesc: 'Categorized technical matrix & high-impact architectural accomplishments', accentColor: '#0D9488', badge: 'Architect' },
  ];

  const filteredTemplates = templates.filter(t => {
    if (templateCategoryFilter === 'photo') return t.category === 'photo';
    if (templateCategoryFilter === 'ats') return t.category === 'ats';
    return true;
  });

  // Handle Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setProfileImage(dataUrl);
      setShowPhoto(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const handleUseSampleAvatar = () => {
    setProfileImage(generateDefaultAvatarPng());
    setShowPhoto(true);
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
  };

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

  /**
   * Print Isolation Helper:
   * Generates an isolated hidden iframe containing strictly the resume document HTML
   * and stylesheets, guaranteeing that neither the application navbar, sidebars,
   * nor controls can ever leak into the printed output.
   */
  const printResumeOnly = () => {
    const element = resumeDocumentRef.current || document.getElementById('resume-preview-document');
    if (!element) return;

    const existingIframe = document.getElementById('resume-isolated-print-frame');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'resume-isolated-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      return;
    }

    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(node => node.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${(name.trim() || 'Resume').replace(/\s+/g, '_')}_Resume</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #print-container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              box-shadow: none !important;
              border: none !important;
            }
          </style>
        </head>
        <body>
          <div id="print-container">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Isolated print failed:', e);
      } finally {
        setTimeout(() => iframe.remove(), 2000);
      }
    }, 250);
  };

  /**
   * High-Resolution PDF Download:
   * Captures strictly the #resume-preview-document element with html2canvas and compiles
   * it into a clean, professional vector-crisp PDF document using jsPDF.
   */
  const handleDownloadPdf = async () => {
    const element = resumeDocumentRef.current || document.getElementById('resume-preview-document');
    if (!element) return;
    setGeneratingPdf(true);

    try {
      if ('fonts' in document) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          const docEl = clonedDoc.getElementById('resume-preview-document');
          if (docEl) {
            docEl.style.boxShadow = 'none';
            docEl.style.margin = '0 auto';
            docEl.style.transform = 'none';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
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

      while (heightLeft > 4) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const cleanFileName = `${(name.trim() || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume_${selectedTemplate}.pdf`;
      pdf.save(cleanFileName);
    } catch (err) {
      console.error('Direct PDF rasterization fallback:', err);
      // Fallback prints ONLY the isolated resume in a hidden iframe (never the app screen)
      printResumeOnly();
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    printResumeOnly();
  };

  const skillList = skills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6 max-w-7xl mx-auto selection:bg-blue-600 selection:text-white pb-16">
      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Document Studio · 15 Professional Styles · Photo Templates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Resume Builder &amp; PDF Export Module
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Choose from 5 dedicated photo templates or 10 classic ATS designs. Upload your custom headshot, tailor your career experience, and export as high-resolution PDF or text.
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

      {/* TEMPLATE CHOOSER WITH CATEGORY TABS (Photo Templates & Classic ATS) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Select Design Template ({templates.length} Styles)
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setTemplateCategoryFilter('photo')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                templateCategoryFilter === 'photo'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              <span>Photo Templates (5)</span>
            </button>
            <button
              onClick={() => setTemplateCategoryFilter('ats')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                templateCategoryFilter === 'ats'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Classic ATS (10)</span>
            </button>
            <button
              onClick={() => setTemplateCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                templateCategoryFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (15)
            </button>
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {filteredTemplates.map(tpl => {
            const isSelected = selectedTemplate === tpl.id;
            const isPhotoTpl = tpl.category === 'photo';

            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
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
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        isPhotoTpl
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPhotoTpl && <Camera className="w-2.5 h-2.5" />}
                      <span>{tpl.badge}</span>
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
            <span className="text-[11px] text-slate-400">Live preview updates instantly</span>
          </div>

          {/* DEDICATED PHOTO / HEADSHOT UPLOADER MODULE */}
          <div className="p-4 bg-gradient-to-br from-purple-50/60 to-slate-50 rounded-2xl border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-purple-600" />
                <span>Profile Photo / Headshot</span>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPhoto}
                  onChange={e => setShowPhoto(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Show on Resume</span>
              </label>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />

            <div className="flex items-center gap-4">
              {/* Photo Preview Frame */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl border-2 border-purple-200 overflow-hidden bg-white shadow-2xs flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    title="Remove Photo"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 shadow-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-1 space-y-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{profileImage ? 'Replace Photo' : 'Upload Headshot'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUseSampleAvatar}
                    className="flex-1 py-1 px-2 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-[10px] font-bold text-purple-700 transition flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>Sample Photo</span>
                  </button>

                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="py-1 px-2 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-[10px] font-bold text-slate-500 hover:text-rose-600 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              Supported formats: PNG, JPG, WebP. Headshots appear automatically in the 5 dedicated photo templates and can also be shown in classic designs.
            </p>
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
                <label className="block text-[11px] font-bold text-slate-600 mb-1">GitHub / Portfolio</label>
                <input
                  type="text"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Summary */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Professional Summary
            </div>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Section 3: Technical Competencies */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Core Competencies &amp; Skills (Comma-separated)
            </div>
            <textarea
              rows={2}
              value={skills}
              onChange={e => setSkills(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Section 4: Work Experience */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Work Experience ({experiences.length})
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
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs leading-relaxed bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Education & Certifications */}
          <div className="space-y-3">
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
                  PHOTO TEMPLATE 1: EXECUTIVE PORTRAIT
                  ============================================================== */}
              {selectedTemplate === 'photo-executive' && (
                <div className="text-xs">
                  {/* Executive Dark Header Banner with Framed Headshot */}
                  <div className="bg-slate-950 text-white p-7 sm:p-8 flex items-center gap-6">
                    {showPhoto && profileImage && (
                      <div className="shrink-0">
                        <img
                          src={profileImage}
                          alt={name}
                          crossOrigin="anonymous"
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-3 border-white/90 shadow-md ring-4 ring-blue-500/30"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">{name}</h1>
                      <div className="text-sm font-bold text-sky-400 tracking-wide mt-0.5">{title}</div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300 mt-3 font-medium">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-sky-400" /> {email}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-sky-400" /> {phone}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-sky-400" /> {location}</span>
                        {linkedin && <span>·</span>}
                        {linkedin && <span>{linkedin}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="p-7 sm:p-8 space-y-6">
                    {/* Executive Summary Tinted Card */}
                    <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-slate-950 text-slate-700 leading-relaxed text-xs">
                      {summary}
                    </div>

                    {/* Competencies */}
                    <div className="space-y-2">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1">
                        Core Competencies &amp; Technical Scope
                      </h2>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {skillList.map((sk, idx) => (
                          <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-4">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1">
                        Executive Leadership &amp; Engineering Experience
                      </h2>
                      {experiences.map(exp => (
                        <div key={exp.id} className="space-y-1.5">
                          <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                            <span>{exp.role} · <strong className="text-blue-700">{exp.company}</strong></span>
                            <span className="font-mono text-slate-500 text-[11px] font-normal">{exp.period} | {exp.location}</span>
                          </div>
                          <ul className="list-disc pl-4 text-slate-700 space-y-1 leading-relaxed">
                            {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                              <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Education & Certs */}
                    <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-200">
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1">Education</h2>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">{education}</p>
                      </div>
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1">Certifications</h2>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">{certifications}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  PHOTO TEMPLATE 2: CREATIVE TWO-COLUMN SIDEBAR AVATAR
                  ============================================================== */}
              {selectedTemplate === 'photo-creative-sidebar' && (
                <div className="grid grid-cols-12 min-h-[1020px] text-xs">
                  {/* Left Column: Deep Slate with Portrait Avatar */}
                  <div className="col-span-4 bg-slate-900 text-white p-6 space-y-6">
                    {showPhoto && profileImage && (
                      <div className="flex justify-center">
                        <img
                          src={profileImage}
                          alt={name}
                          crossOrigin="anonymous"
                          className="w-32 h-32 rounded-2xl object-cover border-2 border-indigo-400 shadow-md ring-2 ring-indigo-500/40"
                        />
                      </div>
                    )}

                    <div>
                      <h1 className="text-xl font-black text-white">{name}</h1>
                      <div className="text-indigo-400 font-bold text-xs mt-0.5">{title}</div>
                    </div>

                    <div className="space-y-2 text-[11px] text-slate-300 border-t border-slate-800 pt-3">
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Contact</div>
                      <div>{email}</div>
                      <div>{phone}</div>
                      <div>{location}</div>
                      {linkedin && <div className="truncate">{linkedin}</div>}
                      {github && <div className="truncate">{github}</div>}
                    </div>

                    <div className="space-y-2 border-t border-slate-800 pt-3">
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {skillList.map((sk, idx) => (
                          <span key={idx} className="bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-800 pt-3">
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Education</div>
                      <p className="text-slate-300 text-[11px] whitespace-pre-line leading-relaxed">{education}</p>
                    </div>

                    <div className="space-y-2 border-t border-slate-800 pt-3">
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Certifications</div>
                      <p className="text-slate-300 text-[11px] whitespace-pre-line leading-relaxed">{certifications}</p>
                    </div>
                  </div>

                  {/* Right Column: Main Content */}
                  <div className="col-span-8 p-7 space-y-6">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-600 pb-1">
                        Professional Profile
                      </h2>
                      <p className="text-slate-700 leading-relaxed mt-2 text-xs">{summary}</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xs font-black uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-600 pb-1">
                        Work Experience
                      </h2>
                      {experiences.map(exp => (
                        <div key={exp.id} className="space-y-1.5">
                          <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                            <span className="text-slate-950 font-black">{exp.role}</span>
                            <span className="font-mono text-slate-400 text-[11px]">{exp.period}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-indigo-600">{exp.company} — {exp.location}</div>
                          <ul className="list-disc pl-4 text-slate-700 space-y-1 leading-relaxed">
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
                  PHOTO TEMPLATE 3: EDITORIAL MODERNIST PORTRAIT
                  ============================================================== */}
              {selectedTemplate === 'photo-modern-editorial' && (
                <div className="p-8 sm:p-10 space-y-6 text-xs">
                  {/* Header with Top-Right Portrait Card */}
                  <div className="flex items-start justify-between gap-6 border-b-2 border-sky-800 pb-6">
                    <div className="space-y-2 flex-1">
                      <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950">{name}</h1>
                      <div className="text-sm font-bold text-sky-700 tracking-wide">{title}</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600 text-[11px] pt-1">
                        <span>{email}</span>
                        <span>·</span>
                        <span>{phone}</span>
                        <span>·</span>
                        <span>{location}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-xs pt-2 italic font-serif">
                        &quot;{summary}&quot;
                      </p>
                    </div>

                    {showPhoto && profileImage && (
                      <div className="shrink-0">
                        <img
                          src={profileImage}
                          alt={name}
                          crossOrigin="anonymous"
                          className="w-24 h-32 rounded-lg object-cover border border-slate-300 shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-sky-900">
                      Technical Skills &amp; Domain Expertise
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-sky-50 border border-sky-200 text-sky-900 px-2.5 py-0.5 rounded text-[11px] font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-sky-900">
                      Professional Experience
                    </h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1 border-l-2 border-sky-200 pl-3">
                        <div className="flex justify-between font-bold text-slate-900 text-xs">
                          <span>{exp.role} · <span className="text-sky-700">{exp.company}</span></span>
                          <span className="font-mono text-slate-500 text-[11px] font-normal">{exp.period}</span>
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
                      <h2 className="text-xs font-black uppercase tracking-wider text-sky-900 mb-1">Education</h2>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{education}</p>
                    </div>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-sky-900 mb-1">Certifications</h2>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  PHOTO TEMPLATE 4: TECH LEAD MONOGRAM & PHOTO
                  ============================================================== */}
              {selectedTemplate === 'photo-tech-lead' && (
                <div className="p-8 sm:p-10 space-y-6 text-xs">
                  {/* Top Bar with Status Badge & Photo */}
                  <div className="flex items-center justify-between gap-5 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                      {showPhoto && profileImage && (
                        <div className="relative shrink-0">
                          <img
                            src={profileImage}
                            alt={name}
                            crossOrigin="anonymous"
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                          />
                          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active Candidate" />
                        </div>
                      )}
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight">{name}</h1>
                        <div className="text-blue-600 font-bold text-xs font-mono">{title}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                          <span>{email}</span>
                          <span>·</span>
                          <span>{location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block text-right font-mono text-[11px] text-slate-500 space-y-0.5">
                      <div>{phone}</div>
                      {linkedin && <div className="text-blue-600">{linkedin}</div>}
                      {github && <div className="text-slate-800">{github}</div>}
                    </div>
                  </div>

                  {/* Summary Terminal Card */}
                  <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-1">
                    <div className="text-slate-400 text-[10px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>README.md — Executive Summary</span>
                    </div>
                    <p className="leading-relaxed font-sans text-xs text-slate-100">{summary}</p>
                  </div>

                  {/* Tech Stack Chips */}
                  <div className="space-y-2">
                    <div className="font-mono text-xs font-bold uppercase text-slate-900 flex items-center gap-1">
                      <span>$ competencies --all</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-blue-50 border border-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <div className="font-mono text-xs font-bold uppercase text-slate-900">
                      $ git log --oneline --experience
                    </div>
                    {experiences.map(exp => (
                      <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                          <span>{exp.role} <span className="text-blue-600">@{exp.company}</span></span>
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

                  {/* Education & Certs */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <div className="font-mono text-[11px] font-bold uppercase text-slate-800 mb-1">Education</div>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{education}</p>
                    </div>
                    <div>
                      <div className="font-mono text-[11px] font-bold uppercase text-slate-800 mb-1">Certifications</div>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  PHOTO TEMPLATE 5: COMPACT HORIZON BIO-CARD
                  ============================================================== */}
              {selectedTemplate === 'photo-compact-horizon' && (
                <div className="p-7 sm:p-8 space-y-5 text-xs">
                  {/* Emerald Bio-Card Header */}
                  <div className="bg-emerald-900 text-white p-5 rounded-2xl flex items-center gap-5 shadow-sm">
                    {showPhoto && profileImage && (
                      <img
                        src={profileImage}
                        alt={name}
                        crossOrigin="anonymous"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-300 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-black text-white">{name}</h1>
                        <span className="text-[10px] bg-emerald-800 border border-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          Verified Candidate
                        </span>
                      </div>
                      <div className="text-emerald-300 font-bold text-xs">{title}</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-emerald-100 mt-2">
                        <div>{email}</div>
                        <div>{phone}</div>
                        <div>{location}</div>
                        <div>{linkedin}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-xs border-l-2 border-emerald-600 pl-3">
                    {summary}
                  </p>

                  <div className="space-y-1.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-emerald-950">Technical Stack</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-emerald-950 border-b border-slate-200 pb-1">
                      Work Experience
                    </h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-900 text-xs">
                          <span>{exp.role} · <strong className="text-emerald-700">{exp.company}</strong></span>
                          <span className="font-mono text-slate-400 text-[11px] font-normal">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-4 text-slate-700 space-y-0.5 leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <h2 className="text-[11px] font-black uppercase text-emerald-950 mb-1">Education</h2>
                      <p className="text-slate-700 whitespace-pre-line text-[11px]">{education}</p>
                    </div>
                    <div>
                      <h2 className="text-[11px] font-black uppercase text-emerald-950 mb-1">Certifications</h2>
                      <p className="text-slate-700 whitespace-pre-line text-[11px]">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 6: MODERN MINIMALIST (With optional photo support)
                  ============================================================== */}
              {selectedTemplate === 'modern-minimal' && (
                <div className="p-8 sm:p-10 space-y-6">
                  {/* Header */}
                  <div className="border-b-2 border-blue-600 pb-5 flex items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase">{name}</h1>
                      <div className="text-sm font-bold text-blue-600 mt-0.5 tracking-wide">{title}</div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3 font-medium">
                        <span>{email}</span>
                        <span>·</span>
                        <span>{phone}</span>
                        <span>·</span>
                        <span>{location}</span>
                        {linkedin && <span>·</span>}
                        {linkedin && <span>{linkedin}</span>}
                      </div>
                    </div>
                    {showPhoto && profileImage && (
                      <img
                        src={profileImage}
                        alt={name}
                        crossOrigin="anonymous"
                        className="w-20 h-20 rounded-full object-cover border-2 border-blue-600 shrink-0 shadow-sm"
                      />
                    )}
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Professional Summary
                    </h2>
                    <p className="text-xs leading-relaxed text-slate-700 font-normal">{summary}</p>
                  </div>

                  {/* Skills Grid */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Technical Skills
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skillList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Work Experience
                    </h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1.5">
                        <div className="flex justify-between items-baseline">
                          <span className="font-extrabold text-xs text-slate-950">{exp.role}</span>
                          <span className="text-[11px] font-mono text-slate-500">{exp.period}</span>
                        </div>
                        <div className="text-xs font-bold text-blue-700">{exp.company} — {exp.location}</div>
                        <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1 leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Education & Certs */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1">Education</h2>
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{education}</p>
                    </div>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1">Certifications</h2>
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 7: EXECUTIVE CORPORATE
                  ============================================================== */}
              {selectedTemplate === 'executive-corporate' && (
                <div>
                  <div className="bg-slate-950 text-white p-8">
                    <h1 className="text-3xl font-black uppercase tracking-wider text-white">{name}</h1>
                    <div className="text-sm font-bold text-slate-300 mt-1 uppercase tracking-widest">{title}</div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-4">
                      <span>{email}</span>
                      <span>{phone}</span>
                      <span>{location}</span>
                      <span>{linkedin}</span>
                    </div>
                  </div>

                  <div className="p-8 space-y-6 text-xs">
                    <div className="p-4 bg-slate-50 border-l-4 border-slate-900">
                      <p className="text-slate-800 leading-relaxed font-medium">{summary}</p>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Core Competencies</h2>
                      <div className="flex flex-wrap gap-1.5">
                        {skillList.map((sk, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Career History</h2>
                      {experiences.map(exp => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{exp.role} | {exp.company}</span>
                            <span className="font-mono text-slate-500">{exp.period}</span>
                          </div>
                          <ul className="list-disc pl-4 text-slate-700 space-y-1">
                            {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                              <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                      <div>
                        <h2 className="font-bold text-slate-900 uppercase">Education</h2>
                        <p className="text-slate-700 whitespace-pre-line mt-1">{education}</p>
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-900 uppercase">Certifications</h2>
                        <p className="text-slate-700 whitespace-pre-line mt-1">{certifications}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 8: SILICON VALLEY TECH
                  ============================================================== */}
              {selectedTemplate === 'silicon-valley' && (
                <div className="p-8 sm:p-10 space-y-6 text-xs font-mono">
                  <div className="border-b border-blue-200 pb-4">
                    <h1 className="text-2xl font-black text-slate-900">{name}</h1>
                    <div className="text-blue-600 font-bold text-xs mt-0.5">{title}</div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 mt-2">
                      <span>{email}</span>
                      <span>·</span>
                      <span>{github}</span>
                      <span>·</span>
                      <span>{location}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold uppercase text-[11px] text-blue-700">// ABOUT</div>
                    <p className="text-slate-700 font-sans leading-relaxed text-xs">{summary}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="font-bold uppercase text-[11px] text-blue-700">// STACK</div>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="font-bold uppercase text-[11px] text-blue-700">// LOG</div>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-900 text-xs">
                          <span>{exp.role} @ {exp.company}</span>
                          <span className="text-slate-400 text-[10px]">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-4 text-slate-700 font-sans space-y-1 text-xs leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-[11px]">
                    <div>
                      <div className="font-bold uppercase text-blue-700 mb-1">// EDUCATION</div>
                      <p className="text-slate-700 whitespace-pre-line font-sans">{education}</p>
                    </div>
                    <div>
                      <div className="font-bold uppercase text-blue-700 mb-1">// CERTS</div>
                      <p className="text-slate-700 whitespace-pre-line font-sans">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 9: TWO-COLUMN SLATE
                  ============================================================== */}
              {selectedTemplate === 'two-column-slate' && (
                <div className="grid grid-cols-12 min-h-[1020px] text-xs">
                  <div className="col-span-4 bg-slate-100 p-6 space-y-5 border-r border-slate-200">
                    <div>
                      <h1 className="text-lg font-black text-slate-900">{name}</h1>
                      <div className="text-blue-700 font-bold text-xs mt-0.5">{title}</div>
                    </div>
                    <div className="space-y-1.5 text-slate-600 text-[11px]">
                      <div>{email}</div>
                      <div>{phone}</div>
                      <div>{location}</div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-900">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {skillList.map((sk, idx) => (
                          <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-300 text-[10px]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-900">Education</div>
                      <p className="text-slate-600 text-[11px] whitespace-pre-line">{education}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-900">Certifications</div>
                      <p className="text-slate-600 text-[11px] whitespace-pre-line">{certifications}</p>
                    </div>
                  </div>

                  <div className="col-span-8 p-7 space-y-5">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        Profile
                      </h2>
                      <p className="text-slate-700 leading-relaxed mt-2 text-xs">{summary}</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        Experience
                      </h2>
                      {experiences.map(exp => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                            <span>{exp.role} — {exp.company}</span>
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
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 10: EMERALD COMPACT
                  ============================================================== */}
              {selectedTemplate === 'emerald-compact' && (
                <div className="p-8 space-y-5 text-xs">
                  <div className="border-b-2 border-emerald-600 pb-3">
                    <h1 className="text-2xl font-black uppercase text-slate-900">{name}</h1>
                    <div className="text-emerald-700 font-bold text-xs mt-0.5">{title}</div>
                    <div className="flex flex-wrap gap-4 text-slate-600 text-[11px] mt-2">
                      <span>{email}</span>
                      <span>{phone}</span>
                      <span>{location}</span>
                      <span>{linkedin}</span>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{summary}</p>

                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Key Competencies</h2>
                    <div className="flex flex-wrap gap-1">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Experience History</h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.role} · {exp.company}</span>
                          <span className="font-mono text-slate-400 text-[11px] font-normal">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-4 text-slate-700 space-y-1">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <h2 className="font-bold text-emerald-800 uppercase mb-1">Education</h2>
                      <p className="text-slate-700 whitespace-pre-line">{education}</p>
                    </div>
                    <div>
                      <h2 className="font-bold text-emerald-800 uppercase mb-1">Certifications</h2>
                      <p className="text-slate-700 whitespace-pre-line">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 11: EDITORIAL SERIF
                  ============================================================== */}
              {selectedTemplate === 'editorial-classic' && (
                <div className="p-9 space-y-5 text-xs font-serif">
                  <div className="text-center border-b border-slate-300 pb-4">
                    <h1 className="text-3xl font-normal tracking-wide text-slate-950 uppercase">{name}</h1>
                    <div className="text-slate-600 italic text-sm mt-0.5">{title}</div>
                    <div className="flex justify-center gap-4 text-[11px] text-slate-500 font-sans mt-2">
                      <span>{email}</span>
                      <span>·</span>
                      <span>{phone}</span>
                      <span>·</span>
                      <span>{location}</span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5 font-sans">
                      Executive Summary
                    </h2>
                    <p className="text-slate-800 leading-relaxed text-xs">{summary}</p>
                  </div>

                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5 font-sans">
                      Core Competencies
                    </h2>
                    <p className="text-slate-700 font-sans text-xs leading-relaxed">{skills}</p>
                  </div>

                  <div className="space-y-3.5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5 font-sans">
                      Professional Experience
                    </h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.role}, {exp.company}</span>
                          <span className="font-sans text-slate-500 text-[11px] font-normal">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-4 text-slate-700 font-sans space-y-1 leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <h2 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">Education</h2>
                      <p className="text-slate-700 whitespace-pre-line font-sans">{education}</p>
                    </div>
                    <div>
                      <h2 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">Certifications</h2>
                      <p className="text-slate-700 whitespace-pre-line font-sans">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 12: NORDIC CLEAN
                  ============================================================== */}
              {selectedTemplate === 'nordic-clean' && (
                <div className="p-8 sm:p-10 space-y-6 text-xs">
                  <div className="flex justify-between items-baseline border-b border-slate-200 pb-4">
                    <div>
                      <h1 className="text-2xl font-light tracking-wide text-slate-950 uppercase">{name}</h1>
                      <div className="text-sky-600 font-medium text-xs mt-0.5">{title}</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                      <div>{email}</div>
                      <div>{phone} · {location}</div>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed font-light text-xs">{summary}</p>

                  <div className="space-y-1.5">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Expertise</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skillList.map((sk, idx) => (
                        <span key={idx} className="bg-sky-50 text-sky-900 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-sky-100">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Career</h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.role} <span className="font-light text-slate-500">at {exp.company}</span></span>
                          <span className="font-mono text-slate-400 text-[11px] font-normal">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-4 text-slate-600 space-y-1 leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <h2 className="text-xs font-bold uppercase text-slate-800 mb-1">Education</h2>
                      <p className="text-slate-600 whitespace-pre-line">{education}</p>
                    </div>
                    <div>
                      <h2 className="text-xs font-bold uppercase text-slate-800 mb-1">Certifications</h2>
                      <p className="text-slate-600 whitespace-pre-line">{certifications}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 13: FINANCIAL & CONSULTING
                  ============================================================== */}
              {selectedTemplate === 'financial-consulting' && (
                <div className="p-8 sm:p-10 space-y-4 text-xs font-serif">
                  <div className="text-center border-b-2 border-slate-900 pb-3">
                    <h1 className="text-2xl font-bold uppercase text-slate-950 tracking-wider">{name}</h1>
                    <div className="text-slate-800 font-sans font-semibold text-xs mt-0.5">{title}</div>
                    <div className="text-slate-600 font-sans text-[11px] mt-1">
                      {email} | {phone} | {location} | {linkedin}
                    </div>
                  </div>

                  <div className="space-y-1 font-sans">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      Professional Summary
                    </h2>
                    <p className="text-slate-800 leading-relaxed">{summary}</p>
                  </div>

                  <div className="space-y-1 font-sans">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      Core Competencies
                    </h2>
                    <p className="text-slate-800 leading-relaxed">{skills}</p>
                  </div>

                  <div className="space-y-3 font-sans">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      Professional Experience
                    </h2>
                    {experiences.map(exp => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.company} — {exp.location}</span>
                          <span className="font-mono text-slate-500 font-normal">{exp.period}</span>
                        </div>
                        <div className="italic text-slate-700">{exp.role}</div>
                        <ul className="list-disc pl-4 text-slate-800 space-y-0.5 leading-relaxed">
                          {exp.bullets.split('\n').filter(b => b.trim()).map((b, i) => (
                            <li key={i}>{b.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-200 font-sans">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                      Education &amp; Qualifications
                    </h2>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">{education}</p>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed pt-1">{certifications}</p>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  TEMPLATE 14: CONTEMPORARY BOLD
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
                  TEMPLATE 15: SYSTEMS ARCHITECT
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
