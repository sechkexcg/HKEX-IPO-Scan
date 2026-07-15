import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Crosshair, Loader2, Calendar, Building2, Users, Hash } from 'lucide-react';
import { formatDate, formatDateTime, boardLabel, statusColor } from '@/lib/ipoUtils';
import SourceBreakdown from '@/components/ipo/SourceBreakdown';
import { crossCheckIPO } from '@/lib/ipoScanner';

export default function IPODetail() {
  const { id } = useParams();
  const [ipo, setIpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [crossChecking, setCrossChecking] = useState(false);

  const loadIPO = useCallback(async () => {
    try {
      const data = await base44.entities.IPO.get(id);
      setIpo(data);
    } catch (err) {
      console.error('Failed to load IPO:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadIPO();
  }, [loadIPO]);

  const handleCrossCheck = async () => {
    setCrossChecking(true);
    try {
      const result = await crossCheckIPO(ipo);
      await base44.entities.IPO.update(ipo.id, result);
      setIpo({ ...ipo, ...result });
      toast({ title: 'Cross-check complete', description: 'IPO size and market cap verified across multiple sources.' });
    } catch (err) {
      toast({ title: 'Cross-check failed', description: err.message, variant: 'destructive' });
    } finally {
      setCrossChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ipo) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">IPO not found.</p>
        <Link to="/" className="text-primary text-sm hover:underline mt-2 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColor(ipo.status)}`}>{ipo.status}</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">{boardLabel(ipo.board)}</span>
              {ipo.stock_code && <span className="text-xs font-mono text-muted-foreground">{ipo.stock_code}</span>}
            </div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl tracking-tight">{ipo.issuer_name_en}</h1>
            {ipo.issuer_name_chi && <div className="text-base text-muted-foreground mt-1">{ipo.issuer_name_chi}</div>}
          </div>
          <Button onClick={handleCrossCheck} disabled={crossChecking} variant="outline" className="shrink-0">
            {crossChecking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crosshair className="w-4 h-4 mr-2" />}
            {crossChecking ? 'Cross-Checking…' : 'Cross-Check Now'}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
          <InfoItem icon={Calendar} label="Filing Date" value={formatDate(ipo.filing_date)} />
          <InfoItem icon={Hash} label="Stock Code" value={ipo.stock_code || 'Not assigned'} />
          <InfoItem icon={Building2} label="Board" value={boardLabel(ipo.board)} />
          <InfoItem icon={Users} label="Last Scanned" value={formatDateTime(ipo.last_scanned)} />
        </div>

        {ipo.sponsor_oc_names?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Sponsors & Overall Coordinators</div>
            <div className="flex flex-wrap gap-2">
              {ipo.sponsor_oc_names.map((name, i) => (
                <span key={i} className="text-sm px-3 py-1 rounded-lg bg-muted/60 border border-border/50 font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {(ipo.source_url || ipo.prospectus_url) && (
          <div className="mt-6 pt-6 border-t border-border/50 flex flex-wrap gap-3">
            {ipo.source_url && (
              <a href={ipo.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> View on HKEXnews
              </a>
            )}
            {ipo.prospectus_url && (
              <a href={ipo.prospectus_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> Application Proof / Prospectus
              </a>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SourceBreakdown
          title="IPO Size"
          subtitle="Total offering amount cross-checked across multiple financial sources"
          bestEstimate={ipo.ipo_size_hkd}
          confidence={ipo.ipo_size_confidence}
          sources={ipo.ipo_size_sources}
        />
        <SourceBreakdown
          title="Existing Market Cap"
          subtitle="Market capitalisation cross-checked across multiple financial sources"
          bestEstimate={ipo.existing_market_cap_hkd}
          confidence={ipo.market_cap_confidence}
          sources={ipo.market_cap_sources}
        />
      </div>

      {ipo.notes && (
        <div className="mt-6 p-4 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
          {ipo.notes}
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
