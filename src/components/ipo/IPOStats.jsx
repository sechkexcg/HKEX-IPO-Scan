import { TrendingUp, CircleDollarSign, CheckCircle2, Clock } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <div className="text-2xl font-heading font-bold tracking-tight">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export default function IPOStats({ ipos }) {
  const total = ipos.length;
  const active = ipos.filter((i) => i.status === 'active').length;
  const listed = ipos.filter((i) => i.status === 'listed').length;
  const verified = ipos.filter((i) => i.ipo_size_confidence === 'high' || i.market_cap_confidence === 'high').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <StatCard icon={TrendingUp} label="Total Filings" value={total} accent="text-primary" />
      <StatCard icon={Clock} label="Active" value={active} accent="text-blue-500" />
      <StatCard icon={CheckCircle2} label="Listed" value={listed} accent="text-emerald-500" />
      <StatCard icon={CircleDollarSign} label="High Confidence" value={verified} sub="Cross-checked" accent="text-amber-500" />
    </div>
  );
}
