```tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  Clock,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AssessmentQuestion {
  id?: string;
  question: string;
  options?: string[];
}

interface Assessment {
  id?: string;
  title?: string;
  role?: string;
  candidate_name?: string;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  questions: AssessmentQuestion[];
}

type ViewState =
  | 'loading'
  | 'error'
  | 'instructions'
  | 'waiting'
  | 'active'
  | 'submitting'
  | 'submitted'
  | 'expired';

const API_BASE = '';

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
        2,
        '0'
      )}:${String(remainingSeconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(
        remainingSeconds
      ).padStart(2, '0')}`;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Schedule unavailable';
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const getRemainingSeconds = (dateString: string) => {
  const timestamp = new Date(dateString).getTime();

  if (!Number.isFinite(timestamp)) {
    return 0;
  }

  return Math.max(0, Math.floor((timestamp - Date.now()) / 1000));
};

const getErrorMessage = (data: unknown, fallback: string) => {
  if (
    data &&
    typeof data === 'object' &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message;
  }

  if (
    data &&
    typeof data === 'object' &&
    'error' in data &&
    typeof data.error === 'string'
  ) {
    return data.error;
  }

  return fallback;
};

const PublicAssessmentView: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const token = new URLSearchParams(window.location.search).get('token');

  const loadAssessment = useCallback(async () => {
    if (!token) {
      setErrorMessage(
        'This assessment link is missing its access token. Please contact your recruiter.'
      );
      setViewState('error');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/public/assessment/${encodeURIComponent(token)}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 410) {
          setViewState('expired');
          return;
        }

        throw new Error(
          getErrorMessage(data, 'Unable to load this assessment.')
        );
      }

      const loadedAssessment = (data.assessment || data) as Assessment;

      if (
        !loadedAssessment ||
        !Array.isArray(loadedAssessment.questions) ||
        loadedAssessment.questions.length === 0 ||
        !loadedAssessment.starts_at ||
        !loadedAssessment.ends_at
      ) {
        throw new Error(
          'The assessment data is incomplete. Please contact your recruiter.'
        );
      }

      if (
        !Number.isFinite(new Date(loadedAssessment.starts_at).getTime()) ||
        !Number.isFinite(new Date(loadedAssessment.ends_at).getTime()) ||
        new Date(loadedAssessment.ends_at).getTime() <=
          new Date(loadedAssessment.starts_at).getTime()
      ) {
        throw new Error('The assessment schedule is invalid.');
      }

      setAssessment(loadedAssessment);

      const now = Date.now();
      const start = new Date(loadedAssessment.starts_at).getTime();
      const end = new Date(loadedAssessment.ends_at).getTime();

      if (now >= end) {
        setViewState('expired');
      } else if (now < start) {
        setCountdownSeconds(Math.ceil((start - now) / 1000));
        setViewState('waiting');
      } else {
        setRemainingSeconds(
          Math.min(
            Math.floor(
              (loadedAssessment.duration_minutes || 30) * 60
            ),
            Math.floor((end - now) / 1000)
          )
        );
        setViewState('instructions');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while loading the assessment.'
      );
      setViewState('error');
    }
  }, [token]);

  useEffect(() => {
    void loadAssessment();
  }, [loadAssessment]);

  // Countdown until the scheduled start.
  useEffect(() => {
    if (viewState !== 'waiting' || !assessment) {
      return;
    }

    const timer = window.setInterval(() => {
      const now = Date.now();
      const start = new Date(assessment.starts_at).getTime();
      const end = new Date(assessment.ends_at).getTime();

      if (now >= end) {
        setViewState('expired');
        return;
      }

      if (now >= start) {
        setRemainingSeconds(
          Math.min(
            Math.floor(
              (assessment.duration_minutes || 30) * 60
            ),
            Math.floor((end - now) / 1000)
          )
        );
        setViewState('instructions');
        return;
      }

      setCountdownSeconds(Math.ceil((start - now) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [viewState, assessment]);

  // Exam timer. The backend must independently enforce its deadline.
  useEffect(() => {
    if (viewState !== 'active' || !assessment) {
      return;
    }

    const timer = window.setInterval(() => {
      const now = Date.now();
      const end = new Date(assessment.ends_at).getTime();

      if (now >= end) {
        setRemainingSeconds(0);
        setViewState('expired');
        return;
      }

      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [viewState, assessment]);

  useEffect(() => {
    if (viewState === 'active' && remainingSeconds <= 0) {
      void submitAssessment(true);
    }
    // Submission is intentionally triggered by the timer reaching zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewState, remainingSeconds]);

  const startAssessment = () => {
    if (!assessment) return;

    const now = Date.now();
    const start = new Date(assessment.starts_at).getTime();
    const end = new Date(assessment.ends_at).getTime();

    if (now < start) {
      setViewState('waiting');
      setCountdownSeconds(Math.ceil((start - now) / 1000));
      return;
    }

    if (now >= end) {
      setViewState('expired');
      return;
    }

    setRemainingSeconds(
      Math.min(
        Math.floor((assessment.duration_minutes || 30) * 60),
        Math.floor((end - now) / 1000)
      )
    );

    setViewState('active');
  };

  const submitAssessment = async (automatic = false) => {
    if (!assessment || submitting || viewState === 'submitted') {
      return;
    }

    if (!automatic) {
      const unanswered = assessment.questions.reduce(
        (total, _question, index) =>
          answers[index] ? total : total + 1,
        0
      );

      if (
        unanswered > 0 &&
        !window.confirm(
          `You have ${unanswered} unanswered question(s). Submit anyway?`
        )
      ) {
        return;
      }
    }

    setSubmitting(true);
    setViewState('submitting');

    try {
      const response = await fetch(
        `${API_BASE}/api/public/assessment/${encodeURIComponent(
          token || ''
        )}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: assessment.questions.map((question, index) => ({
              question_id: question.id || String(index),
              answer: answers[index] || '',
            })),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 410) {
          setViewState('expired');
          return;
        }

        throw new Error(
          getErrorMessage(data, 'Submission failed. Please try again.')
        );
      }

      // Do not display score, answer key, or evaluation to the candidate.
      setViewState('submitted');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Submission failed. Please contact your recruiter.'
      );
      setViewState('error');
    } finally {
      setSubmitting(false);
    }
  };

  const chooseAnswer = (answer: string) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: answer,
    }));
  };

  const goToQuestion = (index: number) => {
    if (!assessment) return;

    setCurrentQuestion(
      Math.min(Math.max(index, 0), assessment.questions.length - 1)
    );
  };

  const panelClass =
    'w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9';

  if (viewState === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading assessment...
        </div>
      </main>
    );
  }

  if (viewState === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <section className={panelClass}>
          <AlertCircle className="mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-black text-slate-900">
            Unable to open assessment
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => void loadAssessment()}
            className="mt-6 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white hover:bg-purple-700"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  if (viewState === 'expired') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <section className={panelClass}>
          <Clock className="mb-4 h-10 w-10 text-amber-500" />
          <h1 className="text-2xl font-black text-slate-900">
            Assessment window closed
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This assessment is no longer available. Please contact your
            recruiter if you need assistance.
          </p>
        </section>
      </main>
    );
  }

  if (viewState === 'submitted') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <section className={`${panelClass} text-center`}>
          <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-emerald-500" />
          <h1 className="text-3xl font-black text-slate-900">
            Thank you!
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Your assessment has been submitted successfully. Your
            recruiter will review the results and contact you if needed.
          </p>
          <p className="mt-6 text-sm text-slate-500">
            You may now close this page.
          </p>
        </section>
      </main>
    );
  }

  if (!assessment) {
    return null;
  }

  if (viewState === 'waiting') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <section className={`${panelClass} text-center`}>
          <CalendarClock className="mx-auto mb-5 h-14 w-14 text-purple-600" />
          <h1 className="text-2xl font-black text-slate-900">
            Your assessment is scheduled
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {assessment.role || assessment.title || 'Candidate Assessment'}
          </p>

          <p className="mt-6 text-sm text-slate-500">Starts in</p>
          <p className="mt-2 font-mono text-4xl font-black text-purple-700">
            {formatTime(countdownSeconds)}
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
            <p>
              <strong>Start:</strong> {formatDate(assessment.starts_at)}
            </p>
            <p className="mt-2">
              <strong>End:</strong> {formatDate(assessment.ends_at)}
            </p>
            <p className="mt-2">
              <strong>Duration:</strong> {assessment.duration_minutes}{' '}
              minutes
            </p>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Keep this page open. The assessment will become available
            when the scheduled start time arrives.
          </p>
        </section>
      </main>
    );
  }

  if (viewState === 'instructions') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <section className={panelClass}>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-black text-slate-900">
            Assessment Instructions
          </h1>

          <p className="mt-2 text-slate-600">
            {assessment.role || assessment.title || 'Candidate Assessment'}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Questions</p>
              <p className="mt-1 text-xl font-black text-slate-900">
                {assessment.questions.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Duration</p>
              <p className="mt-1 text-xl font-black text-slate-900">
                {assessment.duration_minutes} min
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Time remaining</p>
              <p className="mt-1 text-xl font-black text-slate-900">
                {formatTime(remainingSeconds)}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
            <p>1. Read every question carefully before answering.</p>
            <p>2. Use the navigation buttons to move between questions.</p>
            <p>3. Review unanswered questions before submitting.</p>
            <p>
              4. Your answers will be submitted when you finish or the
              timer reaches zero.
            </p>
            <p>
              5. Once submitted, you cannot submit this assessment again.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Assessment access is limited to the scheduled exam window.
            Do not refresh or close the page during the exam.
          </div>

          <button
            type="button"
            onClick={startAssessment}
            className="mt-7 w-full rounded-xl bg-purple-600 py-3 font-bold text-white hover:bg-purple-700"
          >
            Start Assessment
          </button>
        </section>
      </main>
    );
  }

  const question = assessment.questions[currentQuestion];
  const answeredCount = Object.keys(answers).filter(
    (key) => answers[Number(key)]
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
              CareerLens AI
            </p>
            <h1 className="mt-1 text-lg font-black text-slate-900">
              {assessment.role || assessment.title || 'Assessment'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Question {currentQuestion + 1} of{' '}
              {assessment.questions.length}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 font-mono text-lg font-black ${
              remainingSeconds <= 60
                ? 'bg-red-50 text-red-700'
                : 'bg-purple-50 text-purple-700'
            }`}
            aria-live="polite"
          >
            <Clock className="h-5 w-5" />
            {formatTime(remainingSeconds)}
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
              Question {currentQuestion + 1}
            </span>

            <span className="text-xs text-slate-500">
              {answeredCount} of {assessment.questions.length} answered
            </span>
          </div>

          <h2 className="text-xl font-bold leading-8 text-slate-900">
            {question.question}
          </h2>

          {Array.isArray(question.options) &&
          question.options.length > 0 ? (
            <div className="mt-7 space-y-3">
              {question.options.map((option, index) => {
                const selected = answers[currentQuestion] === option;

                return (
                  <button
                    key={`${currentQuestion}-${index}`}
                    type="button"
                    onClick={() => chooseAnswer(option)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition ${
                      selected
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                        selected
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-slate-300 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="pt-0.5">{option}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea
              value={answers[currentQuestion] || ''}
              onChange={(event) => chooseAnswer(event.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className="mt-7 w-full rounded-xl border border-slate-300 p-4 text-sm leading-6 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          )}

          <div className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => goToQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {currentQuestion < assessment.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => goToQuestion(currentQuestion + 1)}
                className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white hover:bg-purple-700"
              >
                Next question
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void submitAssessment()}
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit assessment
              </button>
            )}
          </div>
        </section>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          Your responses are submitted to your recruiter for review.
          Do not share your assessment link with others.
        </p>
      </div>
    </main>
  );
};

export default PublicAssessmentView;
```
