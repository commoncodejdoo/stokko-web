import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar.component';
import { Topbar } from './topbar.component';
import {
  CommandPalette,
  useCommandPaletteShortcut,
} from './command-palette.component';

export function AppShell() {
  useCommandPaletteShortcut();
  return (
    <div className="flex h-screen w-full bg-bg text-text overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
