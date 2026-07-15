import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { formatHKD, formatDate, boardLabel, statusColor, confidenceDot } from '@/lib/ipoUtils';
import { Loader2 } from 'lucide-react';

export default function IPOTable({ ipos, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading IPOs…
      </div>
    );
  }

  if (ipos.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No IPOs found yet. Click <span className="font-medium text-foreground">Scan HKEX</span> to fetch the latest filings.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">Filing Date</th>
            <th className="pb-3 pr-4 font-medium">Issuer</th>
            <th className="pb-3 pr-4 font-medium">Code</th>
            <th className="pb-3 pr-4 font-medium">Board</th>
            <th className="pb-3 pr-4 font-medium">Sponsors / OC</th>
            <th className="pb-3 pr-4 font-medium text-right">IPO Size</th>
            <th className="pb-3 pr-4 font-medium text-right">Market Cap</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {ipos.map((ipo) => (
            <tr
              key={ipo.id}
              className="border-b border-border/40 hover:bg-muted/30 transition-colors group cursor-pointer"
            >
              <td className="py-3 pr-4 text-sm whitespace-nowrap">{formatDate(ipo.filing_date)}</td>
              <td className="py-3 pr-4 max-w-[220px]">
                <Link to={`/ipo/${ipo.id}`} className="block">
                  <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {ipo.issuer_name_en || '—'}
                  </div>
                  {ipo.issuer_name_chi && (
                    <div className="text-xs text-muted-foreground truncate">{ipo.issuer_name_chi}</div>
                  )}
                </Link>
              </td>
              <td className="py-3 pr-4 text-sm font-mono text-muted-foreground">{ipo.stock_code || '—'}</td>
              <td className="py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">{boardLabel(ipo.board)}</td>
              <td className="py-3 pr-4 text-sm max-w-[200px]">
                <div className="truncate text-muted-foreground">{ipo.sponsor_oc_names?.length ? ipo.sponsor_oc_names.join(', ') : '—'}</div>
              </td>
              <td className="py-3 pr-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${confidenceDot(ipo.ipo_size_confidence)}`} />
                  <span className="text-sm font-mono">{formatHKD(ipo.ipo_size_hkd)}</span>
                </div>
              </td>
              <td className="py-3 pr-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${confidenceDot(ipo.market_cap_confidence)}`} />
                  <span className="text-sm font-mono">{formatHKD(ipo.existing_market_cap_hkd)}</span>
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize whitespace-nowrap ${statusColor(ipo.status)}`}>
                  {ipo.status || '—'}
                </span>
              </td>
              <td className="py-3">
                <Link to={`/ipo/${ipo.id}`} className="text-muted-foreground group-hover:text-primary transition-colors block">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
