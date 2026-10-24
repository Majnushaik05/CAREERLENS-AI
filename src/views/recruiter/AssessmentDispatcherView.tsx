
import React, { useEffect, useState } from 'react';
import { Candidate, HiringCampaign } from '../../types';
import {
  Send,
  Copy,
  Check,
  ExternalLink,
  CalendarClock,
} from 'lucide-react';

interface AssessmentDispatcherViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  preselectedCandidate?: Candidate | null;
  onUpdateCandidate: (
    candidateId: string,
    updates: Partial<Candidate>
  ) => void;
}

export const AssessmentDispatcherView: React.FC<
  AssessmentDispatcherViewProps
> = ({
  campaign,
  candidates,
  preselectedCandidate,
  onUpdateCandidate,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState(
    preselectedCandidate?.id || candidates[0]?.id || ''
  );

  const [durationMinutes, setDurationMinutes] = useState(
    campaign?.duration_minutes || 30
  );

  const [questionCount, setQuestionCount] = useState(
    campaign?.question_count || 10
  );

  const toLocalInput = (date: Date) => {
    const adjusted = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );

    return adjusted.toISOString().slice(0, 16);
  };

  const [startsAt, setStartsAt] = useState(
    toLocalInput(new Date(Date.now() + 60 * 60 * 1000))
  );

  const [endsAt, setEndsAt] = useState(
    toLocalInput(new Date(Date.now() + 3 * 60 * 60 * 1000))
  );

  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (preselectedCandidate) {
      setSelectedCandidateId(preselectedCandidate.id);
    }
  }, [preselectedCandidate]);

  const selectedCandidate =
    candidates.find((candidate) => candidate.id === selectedCandidateId) ||
    preselectedCandidate ||
    candidates[0];

  const handleGenerateLink = async () => {
    if (!selectedCandidate) {
      setStatusMsg('Please select a candidate first.');
      return;
    }

    if (
      !Number.isInteger(questionCount) ||
      questionCount < 5 ||
      questionCount > 30
    ) {
      setStatusMsg('Question count must be between 5 and 30.');
      return;
    }

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 10 ||
      durationMinutes > 90
    ) {
      setStatusMsg('Duration must be between 10 and 90 minutes.');
      return;
    }

    const startTime = new Date(startsAt).getTime();
    const endTime = new Date(endsAt).getTime();

    if (
      !startsAt ||
      !endsAt ||
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      startTime <= Date.now() ||
      endTime <= startTime
    ) {
      setStatusMsg(
        'Choose a future start time and an end time after the start.'
      );
      return;
    }

    setLoading(true);
    setStatusMsg('');
    setGeneratedLink('');

    try {
      const role = campaign?.role?.trim() || 'Software Developer';

      // Generate questions for the selected role.
      const questionResponse = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          question_count: questionCount,
        }),
      });

      if (!questionResponse.ok) {
        throw new Error('Could not generate assessment questions.');
      }

      const questionData = await questionResponse.json();
      const questions = questionData.questions;

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('The server returned no assessment questions.');
      }

      // Create the assessment on the backend.
      const assessmentResponse = await fetch(
        '/api/public/assessment/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role,
            candidate_id: selectedCandidate.id,
            candidate_name: selectedCandidate.name,
            candidate_email: selectedCandidate.email,
            duration_minutes: durationMinutes,
            starts_at: new Date(startsAt).toISOString(),
            ends_at: new Date(endsAt).toISOString(),
            questions,
          }),
        }
      );

      if (!assessmentResponse.ok) {
        throw new Error('The server could not create the assessment.');
      }

      const assessmentData = await assessmentResponse.json();

      if (!assessmentData.token || !assessmentData.link) {
        throw new Error(
          'The server did not return a valid assessment link.'
        );
      }

      const fullUrl = new URL(
        assessmentData.link,
        window.location.origin
      ).toString();

      setGeneratedLink(fullUrl);

      onUpdateCandidate(selectedCandidate.id, {
        assessment_status: 'Sent',
        test_token: assessmentData.token,
      });

      setStatusMsg(
        `Assessment created successfully for ${selectedCandidate.name}.`
      );
    } catch (error) {
      setStatusMsg(
        error instanceof Error
          ? error.message
          : 'Unable to create the assessment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatusMsg(
        'Could not copy automatically. Select the link and copy it manually.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
            Dispatcher
          </span>
          <span className="text-xs text-slate-500">
            Exam Generator &amp; Scheduling
          </span>
        </div>

        <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          Role-Based Assessment Dispatcher
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Create assessments for individual candidates, set the exam
          window, and generate a shareable assessment link.
        </p>
      </header>

      <section className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <label
            htmlFor="candidate"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Select candidate
          </label>

          <select
            id="candidate"
            value={selectedCandidateId}
            onChange={(event) =>
              setSelectedCandidateId(event.target.value)
            }
            disabled={candidates.length === 0}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm"
          >
            {candidates.length === 0 && (
              <option value="">No candidates available</option>
            )}

            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} ({candidate.email}) —{' '}
                {candidate.assessment_status || 'Not sent'}
              </option>
            ))}
          </select>

          {candidates.length === 0 && (
            <p className="mt-2 text-xs text-amber-700">
              Screen resumes or add candidates before dispatching an
              assessment.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="questionCount"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Number of questions
            </label>

            <input
              id="questionCount"
              type="number"
              min={5}
              max={30}
              step={1}
              value={questionCount}
              onChange={(event) =>
                setQuestionCount(Number(event.target.value))
              }
              className="w-full rounded-xl border border-slate-300 p-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="duration"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Duration (minutes)
            </label>

            <input
              id="duration"
              type="number"
              min={10}
              max={90}
              step={1}
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(Number(event.target.value))
              }
              className="w-full rounded-xl border border-slate-300 p-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-purple-100 bg-purple-50/60 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <CalendarClock className="h-5 w-5 text-purple-600" />
            Exam schedule
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startsAt"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Exam starts
              </label>

              <input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                min={toLocalInput(new Date())}
                onChange={(event) => setStartsAt(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="endsAt"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Exam ends
              </label>

              <input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                min={startsAt || toLocalInput(new Date())}
                onChange={(event) => setEndsAt(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
              />
            </div>
          </div>

          <p className="text-xs leading-5 text-slate-600">
            Candidates should see a countdown before the start time.
            The backend must reject attempts before the start and after
            the expiry time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateLink}
          disabled={loading || !selectedCandidate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Generating assessment...' : 'Generate assessment link'}
        </button>

        {statusMsg && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {generatedLink && (
          <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
            <h2 className="text-sm font-bold text-purple-900">
              Candidate assessment link
            </h2>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                readOnly
                value={generatedLink}
                aria-label="Generated assessment URL"
                className="min-w-0 flex-1 rounded-lg border border-purple-200 bg-white p-3 font-mono text-xs"
              />

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 rounded-lg border border-purple-200 bg-white px-4 py-3 text-sm font-bold text-purple-700 hover:bg-purple-100"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copied' : 'Copy link'}
              </button>

              <a
                href={generatedLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center rounded-lg bg-purple-600 px-4 py-3 text-white hover:bg-purple-700"
                aria-label="Preview assessment"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <p className="text-xs leading-5 text-purple-800">
              Share this link with the selected candidate. The server
              must enforce the exam schedule, single-use submission,
              and recruiter-only result access.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AssessmentDispatcherView;
