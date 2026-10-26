import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Mic,
  Target,
  DollarSign,
  Route,
  ShieldAlert,
  PenTool,
  Bot,
  Megaphone,
  UploadCloud,
  Award,
  Send,
  BarChart3,
  Users,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { CareerLensLogo } from './CareerLensLogo';

interface SidebarProps {
  workspace: 'Job Seeker Workspace' | 'Recruiter Workspace';
  onSelectWorkspace: (ws: 'Job Seeker Workspace' | 'Recruiter Workspace') => void;
  activeTool: string;
  onSelectTool: (tool: string) => void;
  username: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspace,
  onSelectWorkspace,
  activeTool,
  onSelectTool,
  username,
  onLogout,
}) => {
  const isSeeker = workspace === 'Job Seeker Workspace';

  const seekerTools = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Resume Intelligence', icon: FileText },
    { name: 'Pre-Interview Assessment', icon: GraduationCap },
    { name: 'Mock Interview', icon: Mic },
    { name: 'Job Match', icon: Target },
    { name: 'Salary Estimation', icon: DollarSign },
    { name: 'Career Roadmap', icon: Route },
    { name: 'Job Detection', icon: ShieldAlert },
    { name: 'Resume Builder', icon: PenTool },
    { name: 'Career Assistant', icon: Bot },
  ];

  const recruiterTools = [
    { name: 'Recruiter Dashboard', icon: LayoutDashboard },
    { name: 'Hiring Campaign', icon: Megaphone },
    { name: 'Bulk Resume Screening', icon: UploadCloud },
    { name: 'Shortlisted Candidates', icon: Award },
    { name: 'Assessment Dispatcher', icon: Send },
    { name: 'Assessment Results', icon: BarChart3 },
    { name: 'Interview Pipeline', icon: Users },
  ];

  const tools = isSeeker ? seekerTools : recruiterTools;

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-full selection:bg-blue-600 selection:text-white">
      {/* Workspace Context Switcher for mobile screens */}
      <div className="p-3 border-b border-slate-100 lg:hidden">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => onSelectWorkspace('Job Seeker Workspace')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition ${
              isSeeker ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Candidate
          </button>
          <button
            onClick={() => onSelectWorkspace('Recruiter Workspace')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition ${
              !isSeeker ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Recruiter
          </button>
        </div>
      </div>

      {/* Navigation Tools List with subtle framer-motion micro-animations */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>{isSeeker ? 'WORKSPACE MODULES' : 'RECRUITER MODULES'}</span>
          <span className="font-mono text-slate-400 text-[10px]">{tools.length}</span>
        </div>

        <div className="space-y-1.5">
          {tools.map(tool => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.name;
            return (
              <motion.button
                key={tool.name}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectTool(tool.name)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition relative group ${
                  isSelected
                    ? isSeeker
                      ? 'bg-blue-50/90 text-blue-800 border border-blue-300 font-bold shadow-xs'
                      : 'bg-purple-50/90 text-purple-800 border border-purple-300 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 border border-slate-200/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? isSeeker
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="truncate">{tool.name}</span>
                </div>
                
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isSelected
                      ? isSeeker
                        ? 'text-blue-600 translate-x-0.5'
                        : 'text-purple-600 translate-x-0.5'
                      : 'text-slate-300 group-hover:text-slate-400'
                  }`}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom Brand Card with App Logo Emblem & Status */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <CareerLensLogo size="xs" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{username}</div>
              <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Career Lens</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
