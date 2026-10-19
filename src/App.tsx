import React, { useState, useEffect } from 'react';
import { ResumeAnalysis, Candidate, HiringCampaign } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingHero } from './components/LandingHero';
import { GatewayPortal } from './components/GatewayPortal';
import { PublicAssessmentView } from './components/PublicAssessmentView';

// Seeker views
import { DashboardView } from './views/DashboardView';
import { ResumeIntelligenceView } from './views/ResumeIntelligenceView';
import { PreInterviewAssessmentView } from './views/PreInterviewAssessmentView';
import { MockInterviewView } from './views/MockInterviewView';
import { JobMatchView } from './views/JobMatchView';
import { SalaryEstimationView } from './views/SalaryEstimationView';
import { CareerRoadmapView } from './views/CareerRoadmapView';
import { JobDetectionView } from './views/JobDetectionView';
import { ResumeBuilderView } from './views/ResumeBuilderView';
import { AIAssistantView } from './views/AIAssistantView';

// Recruiter views
import { RecruiterDashboardView } from './views/recruiter/RecruiterDashboardView';
import { HiringCampaignView } from './views/recruiter/HiringCampaignView';
import { BulkScreeningView } from './views/recruiter/BulkScreeningView';
import { ShortlistedCandidatesView } from './views/recruiter/ShortlistedCandidatesView';
import { AssessmentDispatcherView } from './views/recruiter/AssessmentDispatcherView';
import { AssessmentResultsView } from './views/recruiter/AssessmentResultsView';
import { InterviewPipelineView } from './views/recruiter/InterviewPipelineView';

export const App: React.FC = () => {
  // Query param check for candidate assessment links
  const [assessmentToken, setAssessmentToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('assessment');
    if (token) {
      setAssessmentToken(token);
    }
  }, []);

  // Auth & Session state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Guest Explorer');
  const [selectedGateway, setSelectedGateway] = useState(false);
  const [workspace, setWorkspace] = useState<'Job Seeker Workspace' | 'Recruiter Workspace'>('Job Seeker Workspace');
  const [activeTool, setActiveTool] = useState('Dashboard');

  // Shared Data States with LocalStorage Persistence
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(() => {
    try {
      const saved = localStorage.getItem('careerlens_resume_analysis');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSetAnalysis = (newAnalysis: ResumeAnalysis | null) => {
    setAnalysis(newAnalysis);
    try {
      if (newAnalysis) {
        localStorage.setItem('careerlens_resume_analysis', JSON.stringify(newAnalysis));
      } else {
        localStorage.removeItem('careerlens_resume_analysis');
      }
    } catch (err) {
      console.warn('Storage sync error:', err);
    }
  };
  const [campaign, setCampaign] = useState<HiringCampaign | null>({
    id: 'camp_init',
    title: 'Senior Full Stack Software Engineer at Apex Cloud Innovations',
    role: 'Senior Full Stack Software Engineer',
    company: 'Apex Cloud Innovations',
    job_description: `Senior Full Stack Engineer
We are seeking an experienced Full Stack Developer to build and scale distributed microservices and modern React applications.
Required competencies:
• 4+ years Python, FastAPI, and React with TypeScript
• Proficiency in PostgreSQL, Docker containerization, and AWS
• Clean REST API design, CI/CD pipelines, and automated testing`,
    passing_score: 70,
    duration_minutes: 30,
    question_count: 10,
    created_at: new Date().toISOString(),
  });

  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // If candidate is accessing via public assessment link (?assessment=token)
  if (assessmentToken) {
    return (
      <PublicAssessmentView
        token={assessmentToken}
        onExit={() => {
          window.location.search = '';
        }}
      />
    );
  }

  // Not logged in -> Landing Hero Screen
  if (!isLoggedIn) {
    return (
      <LandingHero
        onLogin={(name: string) => {
          setUsername(name);
          setIsLoggedIn(true);
          setSelectedGateway(false);
        }}
        onExploreGuest={() => {
          setUsername('Guest Explorer');
          setIsLoggedIn(true);
          setSelectedGateway(false);
        }}
      />
    );
  }

  // Gateway Portal Screen (Choose between Job Seeker and Recruiter)
  if (!selectedGateway) {
    return (
      <GatewayPortal
        username={username}
        onSelectPortal={portal => {
          setWorkspace(portal);
          setActiveTool(portal === 'Job Seeker Workspace' ? 'Dashboard' : 'Recruiter Dashboard');
          setSelectedGateway(true);
        }}
      />
    );
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedGateway(false);
    setUsername('Guest Explorer');
    setWorkspace('Job Seeker Workspace');
    setActiveTool('Dashboard');
  };

  const handleUpdateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const renderActiveTool = () => {
    if (workspace === 'Job Seeker Workspace') {
      switch (activeTool) {
        case 'Resume Intelligence':
          return (
            <ResumeIntelligenceView
              analysis={analysis}
              onAnalysisComplete={handleSetAnalysis}
              onClearAnalysis={() => handleSetAnalysis(null)}
            />
          );
        case 'Pre-Interview Assessment':
          return <PreInterviewAssessmentView />;
        case 'AI Mock Interview':
        case 'Mock Interview':
          return <MockInterviewView analysis={analysis} />;
        case 'AI Job Match':
        case 'Job Match':
          return <JobMatchView analysis={analysis} />;
        case 'Salary Estimation':
          return <SalaryEstimationView />;
        case 'Career Roadmap':
          return <CareerRoadmapView analysis={analysis} />;
        case 'Job Detection':
          return <JobDetectionView />;
        case 'Resume Builder':
          return <ResumeBuilderView />;
        case 'AI Assistant':
        case 'Career Assistant':
          return <AIAssistantView analysis={analysis} />;
        case 'Dashboard':
        default:
          return (
            <DashboardView
              analysis={analysis}
              onNavigate={setActiveTool}
              onAnalysisComplete={handleSetAnalysis}
              onClearAnalysis={() => handleSetAnalysis(null)}
            />
          );
      }
    } else {
      switch (activeTool) {
        case 'Hiring Campaign':
          return <HiringCampaignView campaign={campaign} onSaveCampaign={setCampaign} />;
        case 'Bulk Resume Screening':
          return (
            <BulkScreeningView
              campaign={campaign}
              candidates={candidates}
              onScreenComplete={setCandidates}
              onUpdateCandidate={handleUpdateCandidate}
            />
          );
        case 'Shortlisted Candidates':
          return (
            <ShortlistedCandidatesView
              campaign={campaign}
              candidates={candidates}
              onDispatchTest={cand => {
                setActiveTool('Assessment Dispatcher');
              }}
            />
          );
        case 'Assessment Dispatcher':
          return (
            <AssessmentDispatcherView
              campaign={campaign}
              candidates={candidates}
              onUpdateCandidate={handleUpdateCandidate}
            />
          );
        case 'Assessment Results':
          return <AssessmentResultsView candidates={candidates} />;
        case 'Interview Pipeline':
          return (
            <InterviewPipelineView
              candidates={candidates}
              onUpdateCandidate={handleUpdateCandidate}
            />
          );
        case 'Recruiter Dashboard':
        default:
          return (
            <RecruiterDashboardView
              campaign={campaign}
              candidates={candidates}
              onNavigate={setActiveTool}
              onClearCandidates={() => setCandidates([])}
            />
          );
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Subtle Positional Architecture Graph Background */}
      <div className="fixed inset-0 bg-graph-matrix pointer-events-none opacity-25 z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
        workspace={workspace}
        onSwitchWorkspace={ws => {
          setWorkspace(ws);
          setActiveTool(ws === 'Job Seeker Workspace' ? 'Dashboard' : 'Recruiter Dashboard');
        }}
        activeTool={activeTool}
        username={username}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto">
        <Sidebar
          workspace={workspace}
          onSelectWorkspace={ws => {
            setWorkspace(ws);
            setActiveTool(ws === 'Job Seeker Workspace' ? 'Dashboard' : 'Recruiter Dashboard');
          }}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          username={username}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {renderActiveTool()}
        </main>
      </div>
    </div>
    </div>
  );
};
