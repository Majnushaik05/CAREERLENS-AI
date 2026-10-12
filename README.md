# CareerLens AI - AI Career Intelligence & Recruitment Platform

CareerLens AI is an end-to-end platform featuring AI-powered fake job detection, resume scoring, semantic job matching, skill gap analysis, and automated candidate ranking.

## Architecture

Migrated to a full-stack Node.js 22 runtime:
- **Frontend**: React 19 SPA with Tailwind CSS and Vite
- **Backend**: Express server (`server.ts`) exposing complete CareerLens intelligence API routes
- **AI Integration**: Gemini API (`@google/genai`) for conversational career consulting and executive resume coaching
- **Port**: Runs on port 3000 (`0.0.0.0`)

## Development & Production

```bash
# Install dependencies
npm install

# Start development server (serves frontend & backend on port 3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```

## Features

### Job Seeker Suite
- **Dashboard**: Career overview, resume health score, readiness metrics
- **Resume Intelligence**: Deep ATS section structure analysis, quantified accomplishment detection, skill discovery, and actionable recommendations
- **Pre-Interview Assessment**: Timed technical & domain qualifying tests with immediate scoring
- **AI Mock Interview**: Interactive conversational simulations tailored to candidate background and target company
- **AI Job Match**: Semantic job match comparison against live requisitions
- **Salary Estimation**: Seniority and domain benchmark calculator
- **Career Roadmap**: 5-phase career progression and skill gap bridging milestones
- **Real-Time Job Detection**: Risk analyzer identifying recruitment scam indicators
- **Resume Builder**: Interactive ATS resume builder with instant text export
- **AI Career Assistant**: Conversational guidance on interviews, salaries, and career strategy

### Recruiter Suite
- **Recruiter Dashboard**: Campaign metrics, applicant counts, and funnel status
- **Hiring Campaign**: Requisition builder, criteria thresholds, and passing score configuration
- **Bulk Resume Screening**: Automated cohort ranking against campaign descriptions
- **Shortlisted Candidates**: Talent pool management and candidate profiling
- **Assessment Dispatcher**: Randomized exam link generator with secure tokens
- **Score Vault**: Auditable candidate test results and metrics
- **Interview Pipeline**: Kanban funnel tracking candidate hiring stages
