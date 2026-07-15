import { Radar, Crosshair, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ScanPanel({ scanning, progress, onScan, onCrossCheckAll, totalIPOs, unverifiedCount }) {
  const pct = progress?.total ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-semibold text-sm sm:text-base">Automated HKEX Scan</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fetches latest listing applications from HKEXnews and cross-checks IPO size &amp; market cap across multiple sources.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={onScan} disabled={scanning} className="h-9">
            {scanning && progress?.step === 'fetching' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Radar className="w-4 h-4 mr-2" />
            )}
            Scan HKEX
          </Button>
          <Button onClick={onCrossCheckAll} disabled={scanning || unverifiedCount === 0} variant="outline" className="h-9">
            {scanning && progress?.step === 'cross_checking' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4 mr-2" />
            )}
            Cross-Check All
            {unverifiedCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">
                {unverifiedCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {scanning && progress && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1.5">
              {progress.step === 'complete' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {progress.message}
            </span>
            {progress.total && (
              <span className="font-mono">{progress.current} / {progress.total}</span>
            )}
          </div>
          {progress.total && <Progress value={pct} className="h-1" />}
        </div>
      )}
    </div>
  );
}
