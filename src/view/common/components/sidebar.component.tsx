import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Warehouse,
  Package,
  Truck,
  Users,
  Settings,
  Edit3,
  Search,
  ChevronRight,
  Building2,
  LucideIcon,
  LogOut,
  ArrowLeftRight,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/view/common/store/auth-store';
import { analytics } from '@/view/common/analytics';
import { useCommandPalette } from './command-palette.component';
import { ROLE_LABELS_HR } from '@/domain/common/role';
import { Avatar } from './avatar.component';
import { Kbd } from './kbd.component';
import { BrandGlyph } from './brand-glyph.component';
import { cn } from '@/view/common/utils/cn';

interface NavEntry {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  kbd?: string;
}

interface NavGroup {
  label?: string;
  entries: NavEntry[];
}

const GROUPS: NavGroup[] = [
  {
    entries: [
      { to: '/', label: 'Početna', icon: Home, kbd: 'G H' },
      { to: '/warehouses', label: 'Skladišta', icon: Warehouse },
      { to: '/articles', label: 'Artikli', icon: Package },
      { to: '/suppliers', label: 'Dobavljači', icon: Building2 },
      { to: '/procurements', label: 'Nabave', icon: Truck },
    ],
  },
  {
    label: 'Operacije',
    entries: [
      { to: '/transfers', label: 'Premještaj robe', icon: ArrowLeftRight },
      { to: '/corrections', label: 'Korekcija zaliha', icon: Edit3 },
      { to: '/shifts', label: 'Obračun smjene', icon: Calendar },
    ],
  },
  {
    label: 'Uvidi',
    entries: [{ to: '/analytics', label: 'Analitika prodaje', icon: BarChart3 }],
  },
  {
    label: 'Tim',
    entries: [
      { to: '/users', label: 'Korisnici', icon: Users },
      { to: '/settings', label: 'Postavke', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  const handleLogout = () => {
    analytics.reset();
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-[244px] bg-panel border-r border-border flex flex-col h-full shrink-0">
      {/* Workspace header (read-only — single org) */}
      <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-border">
        <BrandGlyph size={24} />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold truncate">
            {organization?.name ?? 'Stokko'}
          </div>
          <div className="text-2xs text-muted truncate">
            {user ? ROLE_LABELS_HR[user.role] : ''}
          </div>
        </div>
      </div>

      {/* Search trigger — opens command palette (⌘K) */}
      <div className="px-2.5 pt-2.5 pb-1">
        <button
          type="button"
          onClick={() => useCommandPalette.getState().setOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 w-full bg-card-hi border border-border rounded-md text-muted text-2xs hover:text-text transition-colors cursor-pointer"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Pretraži…</span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-1">
        {GROUPS.map((group, gi) => (
          <div key={gi} className="mb-2">
            {group.label && (
              <div className="px-2.5 pt-3 pb-1.5 text-[11px] font-medium text-faint uppercase tracking-wider">
                {group.label}
              </div>
            )}
            <div className="flex flex-col gap-px">
              {group.entries.map((entry) => (
                <NavLink
                  key={entry.to}
                  to={entry.to}
                  end={entry.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors',
                      isActive
                        ? 'bg-accent-soft text-accent font-medium'
                        : 'text-text hover:bg-card-hi',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <entry.icon
                        size={15}
                        className={cn(isActive ? 'text-accent' : 'text-muted')}
                      />
                      <span className="flex-1">{entry.label}</span>
                      {entry.badge && (
                        <span className="text-2xs text-accent bg-accent-soft px-1.5 rounded-full">
                          {entry.badge}
                        </span>
                      )}
                      {entry.kbd && !isActive && <Kbd>{entry.kbd}</Kbd>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-2.5 border-t border-border flex items-center gap-2.5">
        <Avatar initials={user?.initials() ?? '·'} tone="accent" size={28} />
        <div className="flex-1 min-w-0">
          <div className="text-2xs font-medium truncate">{user?.fullName() ?? '—'}</div>
          <div className="text-2xs text-muted truncate">{user?.email ?? ''}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Odjavi se"
          className="text-muted hover:text-text p-1 rounded-md"
        >
          <LogOut size={14} />
        </button>
        <button
          type="button"
          aria-label="Korisničke postavke"
          className="text-muted hover:text-text p-1 rounded-md"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </aside>
  );
}
