import { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ScanPanel from '@/components/ipo/ScanPanel';
import IPOStats from '@/components/ipo/IPOStats';
import IPOTable from '@/components/ipo/IPOTable';
import { fetchHKEXListings, crossCheckIPO } from '@/lib/ipoScanner';

export default function Dashboard() {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadIPOs = useCallback(async () => {
    try {
      const data = await base44.entities.IPO.list('-filing_date', 200);
      setIpos(data);
    } catch (err) {
      console.error('Failed to load IPOs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIPOs();
    const unsub = base44.entities.IPO.subscribe(() => loadIPOs());
    return unsub;
  }, [loadIPOs]);

  const handleScan = async () => {
    setScanning(true);
    setProgress({ step: 'fetching', message: 'Scanning HKEX for recent listing applications…' });
    try {
      const listings = await fetchHKEXListings();
      const existing = await base44.entities.IPO.list('-created_date', 500);
      const existingMap = new Map(existing.map((e) => [e.issuer_name_en?.toLowerCase(), e]));

      const toCreate = [];
      const toUpdate = [];

      for (const listing of listings) {
        const key = listing.issuer_name_en?.toLowerCase();
        const match = existingMap.get(key);
        if (match) {
          toUpdate.push({ id: match.id, ...listing });
        } else {
          toCreate.push({ ...listing, last_scanned: new Date().toISOString() });
        }
      }

      if (toCreate.length > 0) {
        await base44.entities.IPO.bulkCreate(toCreate);
      }
      for (const item of toUpdate) {
        await base44.entities.IPO.update(item.id, {
          filing_date: item.filing_date,
          issuer_name_chi: item.issuer_name_chi,
          stock_code: item.stock_code,
          board: item.board,
          status: item.status,
          sponsor_oc_names: item.sponsor_oc_names,
          source_url: item.source_url,
          prospectus_url: item.prospectus_url,
          last_scanned: new Date().toISOString()
        });
      }

      setProgress({ step: 'complete', message: `Scan complete: ${toCreate.length} new, ${toUpdate.length} updated` });
      toast({ title: 'Scan complete', description: `${toCreate.length} new filings, ${toUpdate.length} updated` });
      await loadIPOs();
    } catch (err) {
      toast({ title: 'Scan failed', description: err.message || 'An error occurred', variant: 'destructive' });
    } finally {
      setScanning(false);
      setTimeout(() => setProgress(null), 3000);
    }
  };

  const handleCrossCheckAll = async () => {
    const unchecked = ipos.filter((i) => !i.ipo_size_confidence || i.ipo_size_confidence === 'unverified');
    if (unchecked.length === 0) return;

    setScanning(true);
    for (let i = 0; i < unchecked.length; i++) {
      const ipo = unchecked[i];
      setProgress({
        step: 'cross_checking',
        message: `Cross-checking ${ipo.issuer_name_en}…`,
        current: i + 1,
        total: unchecked.length
      });
      try {
        const result = await crossCheckIPO(ipo);
        await base44.entities.IPO.update(ipo.id, result);
      } catch (err) {
        console.error(`Failed for ${ipo.issuer_name_en}:`, err);
      }
    }
    setProgress({ step: 'complete', message: 'Cross-check complete' });
    toast({ title: 'Cross-check complete', description: 'All IPOs verified across multiple sources.' });
    setScanning(false);
    setTimeout(() => setProgress(null), 3000);
    await loadIPOs();
  };

  const filteredIPOs = useMemo(() => {
    return ipos.filter((ipo) => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        ipo.issuer_name_en?.toLowerCase().includes(q) ||
        ipo.issuer_name_chi?.includes(search) ||
        ipo.stock_code?.includes(search);
      const matchesBoard = boardFilter === 'all' || ipo.board === boardFilter;
      const matchesStatus = statusFilter === 'all' || ipo.status === statusFilter;
      return matchesSearch && matchesBoard && matchesStatus;
    });
  }, [ipos, search, boardFilter, statusFilter]);

  const unverifiedCount = ipos.filter((i) => !i.ipo_size_confidence || i.ipo_size_confidence === 'unverified').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-xl sm:text-2xl tracking-tight">IPO Pipeline Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Automated monitoring of Hong Kong Stock Exchange listing applications with multi-source cross-verification.
        </p>
      </div>

      <ScanPanel
        scanning={scanning}
        progress={progress}
        onScan={handleScan}
        onCrossCheckAll={handleCrossCheckAll}
        totalIPOs={ipos.length}
        unverifiedCount={unverifiedCount}
      />

      <IPOStats ipos={ipos} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by issuer name or stock code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <select
          value={boardFilter}
          onChange={(e) => setBoardFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="all">All Boards</option>
          <option value="main_board">Main Board</option>
          <option value="gem">GEM</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="listed">Listed</option>
          <option value="inactive">Inactive</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <IPOTable ipos={filteredIPOs} loading={loading} />
      </div>
    </div>
  );
}
