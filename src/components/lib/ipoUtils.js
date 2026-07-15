export function formatHKD(value) {
  if (value == null || isNaN(value)) return '—';
  if (value >= 1e12) return `HK$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `HK$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `HK$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `HK$${(value / 1e3).toFixed(0)}K`;
  return `HK$${value.toFixed(0)}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function confidenceColor(confidence) {
  switch (confidence) {
    case 'high': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'low': return 'text-orange-700 bg-orange-50 border-orange-200';
    default: return 'text-slate-500 bg-slate-50 border-slate-200';
  }
}

export function confidenceDot(confidence) {
  switch (confidence) {
    case 'high': return 'bg-emerald-500';
    case 'medium': return 'bg-amber-500';
    case 'low': return 'bg-orange-500';
    default: return 'bg-slate-300';
  }
}

export function boardLabel(board) {
  switch (board) {
    case 'main_board': return 'Main Board';
    case 'gem': return 'GEM';
    default: return board || '—';
  }
}

export function statusColor(status) {
  switch (status) {
    case 'active': return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'listed': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'inactive': return 'text-slate-500 bg-slate-50 border-slate-200';
    case 'returned': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-slate-500 bg-slate-50 border-slate-200';
  }
}
