import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Search, LogOut } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAdminTheme } from '@/lib/AdminTheme';
import { useAuth } from '@/lib/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import GlobalSearch from './GlobalSearch';
import NotificationsPanel from './NotificationsPanel';

export default function AdminHeader() {
  const { theme, toggleTheme } = useAdminTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    await logout(true);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <button
        onClick={() => setSearchOpen(true)}
        className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:max-w-md"
      >
        <Search className="h-5 w-5" />
        <span className="text-left">Search anythingâ€¦</span>
        <kbd className="ml-auto rounded border border-border bg-card px-2 py-1 text-[10px]">Ctrl K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <NotificationsPanel />
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="h-11 w-11">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.profile_image} alt={user?.full_name} />
          <AvatarFallback className="text-xs">
            {(user?.full_name || user?.email || 'A').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out" className="h-11 w-11">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-24 max-w-xl translate-y-0 gap-0 p-0">
          <GlobalSearch onClose={() => setSearchOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}