import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Menu, X, Palette, Crown, Bookmark, Mail, Trophy, Package, Frame } from 'lucide-react';

const navLinks = [
  { label: 'Gallery', path: '/gallery' },
  { label: 'Artists', path: '/artists' },
  { label: 'Exhibitions', path: '/exhibitions' },
  { label: 'Marketplace', path: '/marketplace' },
  { label: 'News', path: '/news' },
];

export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="I Am An Artist" className="w-8 h-8" />
            <span className="font-playfair font-bold text-lg text-foreground">
              I Am An <span className="text-gold">Artist</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-inter transition-colors hover:text-gold ${
                  location.pathname === link.path ? 'text-gold' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Elite badge */}
            <div className="flex items-center gap-1.5 bg-gold/10 border border-gold/25 text-gold text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer hover:bg-gold/20 transition-colors">
              <Crown className="w-3 h-3 fill-gold/50" />
              <span>Elite</span>
            </div>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin/artist-registry">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold gap-1.5">
                      Artist Registry
                    </Button>
                  </Link>
                )}
                <Link to="/messages">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold gap-1.5">
                    <Mail className="w-4 h-4" /> Messages
                  </Button>
                </Link>
                <Link to="/wishlist">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold gap-1.5">
                    <Bookmark className="w-4 h-4" /> Wishlist
                  </Button>
                </Link>
                <Link to="/dashboard">
                   <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold">
                     Dashboard
                   </Button>
                 </Link>
                 <Link to="/inventory">
                   <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold gap-1.5">
                     <Package className="w-4 h-4" /> Inventory
                   </Button>
                 </Link>
                 <Link to="/exhibitions/my-exhibitions">
                   <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold gap-1.5">
                     <Frame className="w-4 h-4" /> Galleries
                   </Button>
                 </Link>
                 <Link to="/rewards">
                   <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold gap-1.5">
                     <Trophy className="w-4 h-4" /> Rewards
                   </Button>
                 </Link>
                <Button
                  size="sm"
                  className="gold-gradient text-background font-semibold hover:opacity-90"
                  onClick={() => authService.logout().then(() => window.location.assign('/'))}
                >
                  Sign Out
                </Button>
              </>
            ) : (
                <Button
                  size="sm"
                  className="gold-gradient text-background font-semibold hover:opacity-90"
                  onClick={() => authService.redirectToLogin()}
                >
                  Join Gallery
                </Button>
            )}
          </div>

          {/* Mobile */}
          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-card border-t border-border px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`block text-sm font-inter py-2 transition-colors hover:text-gold ${
                location.pathname === link.path ? 'text-gold' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border space-y-2">
            {user && (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin/artist-registry" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      Artist Registry
                    </Button>
                  </Link>
                )}
                <Link to="/messages" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Mail className="w-4 h-4" /> Messages
                  </Button>
                </Link>
                <Link to="/wishlist" onClick={() => setOpen(false)}>
                   <Button variant="outline" size="sm" className="w-full gap-2">
                     <Bookmark className="w-4 h-4" /> Wishlist
                   </Button>
                 </Link>
                 <Link to="/inventory" onClick={() => setOpen(false)}>
                   <Button variant="outline" size="sm" className="w-full gap-2">
                     <Package className="w-4 h-4" /> Inventory
                   </Button>
                 </Link>
                 <Link to="/exhibitions/my-exhibitions" onClick={() => setOpen(false)}>
                   <Button variant="outline" size="sm" className="w-full gap-2">
                     <Frame className="w-4 h-4" /> Galleries
                   </Button>
                 </Link>
                 <Link to="/rewards" onClick={() => setOpen(false)}>
                   <Button variant="outline" size="sm" className="w-full gap-2">
                     <Trophy className="w-4 h-4" /> Rewards
                   </Button>
                 </Link>
              </>
            )}
            {user ? (
                  <Button size="sm" className="gold-gradient text-background w-full" onClick={() => authService.logout().then(() => window.location.assign('/'))}>
                    Sign Out
                  </Button>
                ) : (
                  <Button size="sm" className="gold-gradient text-background w-full" onClick={() => authService.redirectToLogin()}>
                    Join Gallery
                  </Button>
                )}
          </div>
        </div>
      )}
    </nav>
  );
}