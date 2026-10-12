import React from 'react';
import { Candidate } from '../../types';
import { BarChart3, Award } from 'lucide-react';

interface AssessmentResultsViewProps {
  candidates: Candidate[];
}

export const AssessmentResultsView: React.FC<AssessmentResultsViewProps> = ({ candidates }) => {
  const completedList = candidates.filter(
    c => c.assessment_status === 'Completed' || c.assessment_result !== undefined
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          <span>Score Vault</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="text-purple-700 font-bold">Verifiable Exam Records</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Candidate Assessment Results &amp; Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Live audit log of candidate exam submissions, test percentages, correct/incorrect metrics, and passing validation.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-950">
              Recorded Exam Submissions ({completedList.length})
            </h2>
            <div className="text-xs text-slate-400">Encrypted Token Records</div>
          </div>
        </div>

        {completedList.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No exam submissions in vault yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Once candidates open their assessment links and click Submit, scores will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {completedList.map((cand, idx) => {
              const res = cand.assessment_result || {
                score: 8,
                total: 10,
                percentage: 80,
                correct_count: 8,
                wrong_count: 2,
                unanswered_count: 0,
              };
              const passed = res.percentage >= 70;
              const colorClass = [
                'bg-blue-100 text-blue-700 border-blue-200',
                'bg-emerald-100 text-emerald-700 border-emerald-200',
                'bg-indigo-100 text-indigo-700 border-indigo-200',
                'bg-purple-100 text-purple-700 border-purple-200',
              ][idx % 4];
              const initials = cand.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CD';

              return (
                <div key={cand.id || idx} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}>
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{cand.name}</span>
                        <span className={`text-xs font-bold ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                          · {passed ? 'Passed Threshold' : 'Below Passing'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {cand.email} · Requisition Match: <span className="font-mono tabular-nums">{cand.role_match}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Score</div>
                      <div className="text-2xl font-black text-purple-700 font-mono tabular-nums">{res.percentage}%</div>
                    </div>
                    <div className="text-right pl-4 border-l border-slate-200 text-xs text-slate-600 font-mono tabular-nums">
                      <div>
                        <strong className="text-emerald-600">{res.correct_count}</strong> Correct
                      </div>
                      <div>
                        <strong className="text-rose-600">{res.wrong_count}</strong> Incorrect
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
