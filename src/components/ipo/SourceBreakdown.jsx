import { ExternalLink } from 'lucide-react';
import { formatHKD, formatDate } from '@/lib/ipoUtils';
import ConfidenceBadge from './ConfidenceBadge';

export default function SourceBreakdown({ title, subtitle, bestEstimate, confidence, sources }) {
  const srcs = sources || [];
  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-heading font-semibold text-base sm:text-lg">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <ConfidenceBadge confidence={confidence} />
      </div>

      <div className="mb-5 p-4 rounded-lg bg-muted/50 border border-border/50">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Best Estimate</div>
        <div className="text-2xl sm:text-3xl font-heading font-bold font-mono tracking-tight">
          {formatHKD(bestEstimate)}
        </div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Sources Cross-Checked ({srcs.length})
        </div>
        {srcs.length > 0 ? (
          <div className="space-y-1.5">
            {srcs.map((src, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{src.source || 'Unknown source'}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {src.value || '—'}{src.date ? ` • ${formatDate(src.date)}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-mono">{formatHKD(src.value_hkd)}</span>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">No sources available. Run a cross-check to verify.</p>
        )}
      </div>
    </div>
  );
}
