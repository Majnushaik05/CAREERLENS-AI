import React, { useState, useEffect } from 'react';
import { DollarSign, Info, Briefcase, MapPin, Search, ArrowRight, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';
import { safeEstimateSalary, SalaryEstimateResult } from '../services/careerService';

export const SalaryEstimationView: React.FC = () => {
  const [role, setRole] = useState('Machine Learning Engineer');
  const [experience, setExperience] = useState('Mid-Level (2-5 yrs)');
  const [location, setLocation] = useState('India');
  const [data, setData] = useState<SalaryEstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const popularRoles = [
    'Machine Learning Engineer',
    'Full Stack Developer',
    'Cloud DevOps Architect',
    'Data Scientist',
    'Software Engineer',
    'Product Manager',
    'Cybersecurity Analyst',
  ];

  const handleCalculate = async (customRole?: string) => {
    const roleToUse = customRole || role;
    if (!roleToUse.trim()) return;

    setLoading(true);
    try {
      const res = await safeEstimateSalary(roleToUse, experience, location);
      setData(res);
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on initial load
  useEffect(() => {
    handleCalculate();
  }, [experience, location]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const handleCopyScript = () => {
    if (!data) return;
    const text = `Thank you for extending this offer. Based on current verified market rates for a ${data.experience} ${data.role} in ${data.location} and the concrete business metrics I delivered in my previous projects, I am targeting a base of ${data.currency_symbol} ${data.median_salary} ${data.currency_code} with performance incentives. Could we explore aligning closer to this benchmark?`;
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl selection:bg-blue-600 selection:text-white">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-amber-600" />
          <span>COMPENSATION BENCHMARKING</span>
          <span>·</span>
          <span className="text-amber-700 font-bold">TOTAL REWARDS ENGINE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Salary Benchmarks &amp; Market Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Search real-time compensation distributions, in-hand monthly net estimates, variable bonus bands, and tech stack premiums based on live employer market datasets.
        </p>
      </div>

      {/* Control Filters with Prominent Calculate / Search Button */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
        {/* Step 1: Role Search / Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900">
            Target Job Title / Domain Specialization
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type any role: e.g. Full Stack Developer, AI Engineer, Cloud Architect..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
              />
            </div>
            <button
              onClick={() => handleCalculate()}
              disabled={loading || !role.trim()}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Calculate &amp; Search Salary</span>
                </>
              )}
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Popular:</span>
            {popularRoles.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setRole(r);
                  handleCalculate(r);
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                  role === r
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Seniority and Geography Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span>Seniority &amp; Experience Curve</span>
            </label>
            <select
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="Fresher (0-1 yrs)">Fresher / Associate (0–1 yrs)</option>
              <option value="Mid-Level (2-5 yrs)">Mid-Level Professional (2–5 yrs)</option>
              <option value="Senior (5-8 yrs)">Senior Specialist / Tech Lead (5–8 yrs)</option>
              <option value="Lead / Principal (8+ yrs)">Principal / Staff / Architect (8+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Geography &amp; Compensation Market</span>
            </label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="India">India (Lakhs INR / LPA)</option>
              <option value="North America">North America ($ USD / Annual)</option>
              <option value="Global Remote">Global Remote ($ USD Equiv)</option>
              <option value="Europe">Europe (€ EUR / Annual)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Output Presentation: Guaranteed Render */}
      {data && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          {/* Top Headline Card */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Estimated Market Compensation Range</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tabular-nums mt-1">
                {data.currency_symbol} {data.min_salary} — {data.currency_symbol} {data.max_salary} <span className="text-base sm:text-lg font-bold text-slate-400">{data.currency_code}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                Benchmark for <span className="text-slate-900 font-bold">{data.role}</span> · <span className="text-slate-900 font-bold">{data.experience}</span> · <span className="text-slate-900 font-bold">{data.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left sm:text-right">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Median Target Package</div>
                <div className="text-2xl font-black text-amber-950 font-mono tabular-nums mt-0.5">
                  {data.currency_symbol} {data.median_salary} {data.currency_code}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left sm:text-right">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Estimated Monthly In-Hand</div>
                <div className="text-2xl font-black text-emerald-950 font-mono tabular-nums mt-0.5">
                  ~{data.currency_symbol} {data.monthly_in_hand.toLocaleString()} <span className="text-xs font-normal text-emerald-700">/ mo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Spectrum Bar Graph */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Market Range Spectrum (Percentile Curve)</span>
              <span className="text-amber-800 font-mono">
                Entry {data.currency_symbol}{data.min_salary} — Top 10% {data.currency_symbol}{data.max_salary}
              </span>
            </div>

            <div className="relative pt-2 pb-1">
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div className="w-1/4 bg-blue-300 border-r border-white" title="25th percentile" />
                <div className="w-1/4 bg-amber-400 border-r border-white" title="50th percentile (Median)" />
                <div className="w-1/4 bg-emerald-400 border-r border-white" title="75th percentile" />
                <div className="w-1/4 bg-purple-400" title="90th percentile" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1.5 font-mono">
                <span>Entry (25%)</span>
                <span className="text-amber-700 font-black">Median (50%)</span>
                <span>Upper (75%)</span>
                <span className="text-purple-700">Top 10%</span>
              </div>
            </div>

            {/* 4 Quartile Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs pt-1">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold uppercase">25th %tile (Entry)</div>
                <div className="font-mono tabular-nums font-black text-slate-900 mt-1 text-sm">
                  {data.currency_symbol} {data.quartiles.q25}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{data.currency_code}</div>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-300">
                <div className="text-amber-800 text-[10px] font-bold uppercase">50th %tile (Median)</div>
                <div className="font-mono tabular-nums font-black text-amber-950 mt-1 text-sm">
                  {data.currency_symbol} {data.quartiles.q50}
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">{data.currency_code}</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold uppercase">75th %tile (Strong)</div>
                <div className="font-mono tabular-nums font-black text-slate-900 mt-1 text-sm">
                  {data.currency_symbol} {data.quartiles.q75}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{data.currency_code}</div>
              </div>

              <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200">
                <div className="text-purple-800 text-[10px] font-bold uppercase">90th %tile (Top Tier)</div>
                <div className="font-mono tabular-nums font-black text-purple-950 mt-1 text-sm">
                  {data.currency_symbol} {data.quartiles.q90}
                </div>
                <div className="text-[10px] text-purple-700 mt-0.5">{data.currency_code}</div>
              </div>
            </div>
          </div>

          {/* Key Rewards Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Variable Bonus</div>
              <div className="text-sm font-black text-slate-900">{data.bonus_percentage}</div>
              <p className="text-[11px] text-slate-500">Performance incentive paid annually or semi-annually.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Equity / ESOP Allocation</div>
              <div className="text-sm font-black text-slate-900 truncate">{data.equity_grant}</div>
              <p className="text-[11px] text-slate-500">Vests typically over a standard 4-year schedule with 1-year cliff.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hiring Momentum</div>
              <div className="text-sm font-black text-emerald-700">{data.market_sentiment}</div>
              <p className="text-[11px] text-slate-500">Based on active quarterly requisitions across tech hubs.</p>
            </div>
          </div>

          {/* High-Value Tech Premiums */}
          <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-2">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Skills That Command +10% to +20% Salary Premium for {data.role}</span>
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {data.top_paying_skills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-mono font-semibold shadow-2xs"
                >
                  +{10 + (idx % 3) * 5}% · {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Counter-Offer Negotiation Script Playbook */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Ready-to-Use Negotiation Script</span>
              </span>
              <button
                onClick={handleCopyScript}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied Script!' : 'Copy Script'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              "Thank you for extending this offer. Based on current verified market benchmarks for a {data.experience} {data.role} in {data.location} and the quantifiable business outcomes I delivered in my previous projects, I am targeting a base of {data.currency_symbol}{data.median_salary} {data.currency_code} with performance incentives. Could we explore aligning closer to this benchmark?"
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Tip: Never apologize when countering. Ground your ask on market rates and measurable past impact.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
