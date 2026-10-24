
import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Download,
  FileText,
} from 'lucide-react';

interface AssessmentResult {
  id: string;
  candidate_id?: string;
  candidate_name: string;
  candidate_email?: string;
  role?: string;
  score?: number | null;
  total_questions?: number;
  correct_answers?: number;
  status: 'Submitted' | 'In Progress' | 'Pending' | 'Expired';
  submitted_at?: string;
  duration_minutes?: number;
}

interface AssessmentResultsResponse {
  results?: AssessmentResult[];
  assessments?: AssessmentResult[];
}

const RESULTS_ENDPOINT = '/api/recruiter/assessment-results';

const AssessmentResultsView: React.FC = () => {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadResults = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const response = await fetch(RESULTS_ENDPOINT, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      const data = (await response.json().catch(() => ({}))) as
        | AssessmentResultsResponse
        | { message?: string; error?: string };

      if (!response.ok) {
        const message =
          'message' in data && typeof data.message === 'string'
            ? data.message
            : 'Unable to load assessment results.';

        throw new Error(message);
      }

      const responseData = data as AssessmentResultsResponse;
      const loadedResults =
        responseData.results ?? responseData.assessments ?? [];

      if (!Array.isArray(loadedResults)) {
        throw new Error('The server returned an invalid results format.');
      }

      setResults(loadedResults);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while loading results.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  const submittedResults = results.filter(
    (result) => result.status === 'Submitted'
  );

  const scores = submittedResults
    .map((result) => result.score)
    .filter(
      (score): score is number =>
        typeof score === 'number' &&
        Number.isFinite(score) &&
        score >= 0 &&
        score <= 100
    );

  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        )
      : null;

  const filteredResults = results.filter((result) => {
    const searchableText = [
      result.candidate_name,
      result.candidate_email,
      result.role,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = searchableText.includes(
      searchTerm.toLowerCase().trim()
    );

    const matchesStatus =
      statusFilter === 'All' || result.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (value?: string) => {
    if (!value) return '—';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
  };

  const exportCsv = () => {
    const headers = [
      'Candidate Name',
      'Candidate Email',
      'Role',
      'Status',
      'Score (%)',
      'Correct Answers',
      'Total Questions',
      'Submitted At',
    ];

    const escapeCsv = (value: unknown) => {
      const text = value == null ? '' : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = filteredResults.map((result) => [
      result.candidate_name,
      result.candidate_email ?? '',
      result.role ?? '',
      result.status,
      result.score ?? '',
      result.correct_answers ?? '',
      result.total_questions ?? '',
      result.submitted_at ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'careerlens-assessment-results.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  const statusClass = (status: AssessmentResult['status']) => {
    switch (status) {
      case 'Submitted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Expired':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const StatCard = ({
    title,
    value,
    description,
    icon,
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <div className="rounded-xl bg-purple-50 p-3 text-purple-700">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
            Recruiter Workspace
          </span>

          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
            Assessment Results
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review submitted assessments and candidate performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadResults(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredResults.length === 0}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Unable to retrieve results</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-xs">
              Confirm that the backend endpoint exists and that your
              recruiter account is authorized to access it.
            </p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Assessments"
          value={results.length}
          description="All assessment records returned"
          icon={<FileText className="h-5 w-5" />}
        />

        <StatCard
          title="Submitted"
          value={submittedResults.length}
          description="Completed assessments"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <StatCard
          title="Pending"
          value={
            results.filter(
              (result) =>
                result.status === 'Pending' ||
                result.status === 'In Progress'
            ).length
          }
          description="Awaiting completion"
          icon={<Clock className="h-5 w-5" />}
        />

        <StatCard
          title="Average Score"
          value={averageScore === null ? '—' : `${averageScore}%`}
          description={
            scores.length > 0
              ? `Based on ${scores.length} scored submissions`
              : 'No scored submissions available'
          }
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Candidate Submissions
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredResults.length} record(s) displayed
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search candidate or role"
                aria-label="Search candidates"
                className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-3 text-sm outline-none focus:border-purple-500 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by assessment status"
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-purple-500"
            >
              <option value="All">All statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading assessment results...
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 font-bold text-slate-800">
              No assessment records found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Results will appear here when the backend returns assessment
              records. If candidates have already submitted assessments,
              verify that the recruiter results API returns their submissions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Candidate</th>
                  <th className="px-5 py-4 font-bold">Role</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Score</th>
                  <th className="px-5 py-4 font-bold">Questions</th>
                  <th className="px-5 py-4 font-bold">Submitted</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((result, index) => (
                  <tr
                    key={result.id || `${result.candidate_email}-${index}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        {result.candidate_name || 'Unknown candidate'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {result.candidate_email || 'No email available'}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {result.role || '—'}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                          result.status
                        )}`}
                      >
                        {result.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {result.status === 'Submitted' &&
                      typeof result.score === 'number' &&
                      Number.isFinite(result.score) ? (
                        <span className="font-black text-slate-900">
                          {result.score}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {typeof result.correct_answers === 'number' &&
                      typeof result.total_questions === 'number'
                        ? `${result.correct_answers}/${result.total_questions}`
                        : result.total_questions ?? '—'}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(result.submitted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-500">
        Candidate results should only be available to authenticated,
        authorized recruiters. The backend must enforce access control;
        hiding this page in the frontend is not sufficient.
      </p>
    </div>
  );
};

export default AssessmentResultsView;
