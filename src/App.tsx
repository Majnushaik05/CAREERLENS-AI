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

  // Navigation History Stack for Browser-style Back & Forward
  const [navHistory, setNavHistory] = useState<Array<{ workspace: 'Job Seeker Workspace' | 'Recruiter Workspace'; tool: string }>>([
    { workspace: 'Job Seeker Workspace', tool: 'Dashboard' }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const navigateTo = (newWorkspace: 'Job Seeker Workspace' | 'Recruiter Workspace', newTool: string) => {
    setWorkspace(newWorkspace);
    setActiveTool(newTool);
    setNavHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const last = trimmed[trimmed.length - 1];
      if (last && last.workspace === newWorkspace && last.tool === newTool) {
        return trimmed;
      }
      return [...trimmed, { workspace: newWorkspace, tool: newTool }];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const handleSelectTool = (tool: string) => {
    navigateTo(workspace, tool);
  };

  const handleSelectWorkspace = (ws: 'Job Seeker Workspace' | 'Recruiter Workspace') => {
    navigateTo(ws, ws === 'Job Seeker Workspace' ? 'Dashboard' : 'Recruiter Dashboard');
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navHistory.length - 1;

  const handleGoBack = () => {
    if (canGoBack) {
      const targetIndex = historyIndex - 1;
      const target = navHistory[targetIndex];
      if (target) {
        setHistoryIndex(targetIndex);
        setWorkspace(target.workspace);
        setActiveTool(target.tool);
      }
    }
  };

  const handleGoForward = () => {
    if (canGoForward) {
      const targetIndex = historyIndex + 1;
      const target = navHistory[targetIndex];
      if (target) {
        setHistoryIndex(targetIndex);
        setWorkspace(target.workspace);
        setActiveTool(target.tool);
      }
    }
  };

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
  const [campaign, setCampaign] = useState<HiringCampaign | null>(() => {
    try {
      const saved = localStorage.getItem('careerlens_hiring_campaign');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSetCampaign = (newCampaign: HiringCampaign | null) => {
    setCampaign(newCampaign);
    try {
      if (newCampaign) {
        localStorage.setItem('careerlens_hiring_campaign', JSON.stringify(newCampaign));
      } else {
        localStorage.removeItem('careerlens_hiring_campaign');
      }
    } catch (err) {
      console.warn('Campaign storage sync error:', err);
    }
  };

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem('careerlens_candidates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSetCandidates = (newCandidates: Candidate[]) => {
    setCandidates(newCandidates);
    try {
      localStorage.setItem('careerlens_candidates', JSON.stringify(newCandidates));
    } catch (err) {
      console.warn('Candidates storage sync error:', err);
    }
  };

  const [candidateToDispatch, setCandidateToDispatch] = useState<Candidate | null>(null);

  const handleUpdateCandidate = (candidateId: string, updates: Partial<Candidate>) => {
    const updated = candidates.map(c => (c.id === candidateId ? { ...c, ...updates } : c));
    handleSetCandidates(updated);
  };

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
          return <SalaryEstimationView analysis={analysis} />;
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
              onNavigate={handleSelectTool}
              onAnalysisComplete={handleSetAnalysis}
              onClearAnalysis={() => handleSetAnalysis(null)}
            />
          );
      }
    } else {
      switch (activeTool) {
        case 'Hiring Campaign':
          return <HiringCampaignView campaign={campaign} onSaveCampaign={handleSetCampaign} />;
        case 'Bulk Resume Screening':
          return (
            <BulkScreeningView
              campaign={campaign}
              candidates={candidates}
              onScreenComplete={handleSetCandidates}
              onUpdateCandidate={handleUpdateCandidate}
              onNavigate={handleSelectTool}
            />
          );
        case 'Shortlisted Candidates':
          return (
            <ShortlistedCandidatesView
              campaign={campaign}
              candidates={candidates}
              onNavigate={handleSelectTool}
              onDispatchTest={cand => {
                setCandidateToDispatch(cand);
                handleSelectTool('Assessment Dispatcher');
              }}
            />
          );
        case 'Assessment Dispatcher':
          return (
            <AssessmentDispatcherView
              campaign={campaign}
              candidates={candidates}
              preselectedCandidate={candidateToDispatch}
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
              onNavigate={handleSelectTool}
              onClearCandidates={() => handleSetCandidates([])}
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
          onSwitchWorkspace={handleSelectWorkspace}
          activeTool={activeTool}
          username={username}
          onLogout={handleLogout}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
        />

        <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto">
          <Sidebar
            workspace={workspace}
            onSelectWorkspace={handleSelectWorkspace}
            activeTool={activeTool}
            onSelectTool={handleSelectTool}
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
