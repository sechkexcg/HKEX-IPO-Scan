import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { TrendingUp, LogOut, ExternalLink, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="leading-none">
              <div className="font-heading font-bold text-sm">IPO Sentinel</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">HKEX Monitor</div>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${isDashboard ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Dashboard
            </Link>
            <a
              href="https://www1.hkexnews.hk/app/appindex.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              HKEX Source <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground mr-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="max-w-[160px] truncate">{user?.email}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => logout()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
