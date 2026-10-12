import React, { useState } from 'react';
import { DollarSign, Info, Briefcase, MapPin } from 'lucide-react';

export const SalaryEstimationView: React.FC = () => {
  const [role, setRole] = useState('Software Developer');
  const [experience, setExperience] = useState('Mid-Level (2-5 yrs)');
  const [location, setLocation] = useState('India');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchEstimate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/salary/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, experience, location }),
      });
      const resData = await res.json();
      setData(resData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEstimate();
  }, [role, experience, location]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          <span>Market Intelligence</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="text-amber-700 font-bold">Compensation Benchmarking</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Salary Benchmarks &amp; Market Total Rewards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Estimate indicative compensation distributions for your domain specialization, seniority curve, and regional geography.
        </p>
      </div>

      {/* Control Filters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Role Specialization</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="Software Developer">Software Developer</option>
              <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Finance Analyst">Finance Analyst</option>
              <option value="HR Specialist">HR Specialist</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Seniority Tier</label>
            <select
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="Fresher (0-1 yrs)">Fresher (0-1 yrs)</option>
              <option value="Mid-Level (2-5 yrs)">Mid-Level (2-5 yrs)</option>
              <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
              <option value="Lead / Principal (8+ yrs)">Lead / Principal (8+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Market Geography</label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="India">India (LPA)</option>
              <option value="Global Remote">Global Remote (USD Equiv)</option>
              <option value="North America">North America ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Output Display */}
      {data && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Base Band</div>
              <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tabular-nums mt-1">
                ₹ {data.min_lpa} LPA — ₹ {data.max_lpa} LPA
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {role} · {experience} · {location}
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Median Market Target</div>
              <div className="text-2xl font-black text-amber-700 font-mono tabular-nums mt-1">
                ~₹ {Math.round(((data.min_lpa + data.max_lpa) / 2) * 10) / 10} LPA
              </div>
            </div>
          </div>

          {/* Visual Spectrum Bar Graph */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Market Range Spectrum</span>
              <span className="text-amber-700 font-mono">₹ {data.min_lpa}L — ₹ {data.max_lpa}L</span>
            </div>
            
            <div className="relative pt-2 pb-1">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="w-1/4 bg-blue-200 border-r border-white" title="25th percentile" />
                <div className="w-1/4 bg-amber-300 border-r border-white" title="50th percentile (Median)" />
                <div className="w-1/4 bg-emerald-300 border-r border-white" title="75th percentile" />
                <div className="w-1/4 bg-purple-300" title="90th percentile" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>Entry/Min</span>
                <span>25%</span>
                <span className="text-amber-700 font-black">Median (50%)</span>
                <span>75%</span>
                <span>Top 10%</span>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-800 pt-2">Compensation Quartile Distribution</div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold">25th %tile</div>
                <div className="font-mono tabular-nums font-bold text-slate-800 mt-1">₹ {data.min_lpa} LPA</div>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                <div className="text-amber-800 text-[10px] font-bold">50th %tile</div>
                <div className="font-mono tabular-nums font-bold text-amber-900 mt-1">₹ {Math.round(((data.min_lpa * 0.4 + data.max_lpa * 0.6)) * 10) / 10} LPA</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold">75th %tile</div>
                <div className="font-mono tabular-nums font-bold text-slate-800 mt-1">₹ {Math.round(((data.min_lpa * 0.2 + data.max_lpa * 0.8)) * 10) / 10} LPA</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold">90th %tile</div>
                <div className="font-mono tabular-nums font-bold text-slate-800 mt-1">₹ {data.max_lpa} LPA</div>
              </div>
            </div>
          </div>

          {/* Advice notes */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {data.note}
            </p>
          </div>

          {/* Negotiation Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 text-xs mb-1">1. Quantify Past ROI</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ground your target numbers on verifiable revenue generated, latency reduced, or engineering throughput delivered.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 text-xs mb-1">2. Architecture Premium</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Distributed systems, AI model deployment, and cloud infrastructure experience command upper quartile rates.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 text-xs mb-1">3. Evaluate Total Rewards</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Look beyond base salary to evaluate performance incentives, equity grants, remote allowances, and continuous learning budgets.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
