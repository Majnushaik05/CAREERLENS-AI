export interface ResumeAnalysis {
  name: string;
  email: string;
  phone: string;
  experience: string;
  resume_score: number;
  readiness: number;
  market_match: number | null;
  skills: string[];
  missing_skills: string[];
  strengths: string[];
  recommendations: string[];
  executive_summary?: string;
  score_breakdown: {
    content_quality: number;
    section_coverage: number;
    skills: number;
    achievement_evidence: number;
    contact_completeness: number;
    target_role_alignment: number | null;
  };
  extracted_text: string;
  target_role?: string;
}

export interface JobMatchResult {
  overall: number;
  matched: string[];
  missing: string[];
  recommended_skills: string[];
  semantic_similarity: number;
  summary: string;
  experience_alignment: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  section?: string;
}

export interface AssessmentResult {
  score: number;
  total: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  score_out_of_100?: number;
  section_breakdown?: Record<string, { total: number; correct: number; percentage: number }>;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resume_score: number;
  role_match: number;
  status: 'Screened' | 'Shortlisted' | 'Assessment Pending' | 'Assessed' | 'Interview Scheduled' | 'Rejected';
  assessment_status: 'Not Sent' | 'Sent' | 'Completed';
  email_status: 'Found' | 'Missing';
  skills: string[];
  missing_skills: string[];
  strengths?: string[];
  recommendations?: string[];
  test_token?: string;
  assessment_result?: AssessmentResult;
  notes?: string;
}

export interface HiringCampaign {
  id: string;
  title: string;
  role: string;
  company: string;
  job_description: string;
  passing_score: number;
  duration_minutes: number;
  question_count: number;
  created_at: string;
}

export interface InterviewQuestionItem {
  question: string;
  answer: string;
}

export interface InterviewScore {
  overall: number;
  communication: number;
  completeness: number;
  evidence: number;
  relevance: number;
  answered: number;
  strengths: string[];
  improvements: string[];
  confidence_index?: number;
  readiness_level?: string;
}
