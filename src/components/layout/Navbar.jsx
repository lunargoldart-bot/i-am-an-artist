import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Menu, X, Crown, Bookmark, Mail, Trophy, Package, Frame, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/CartContext';

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
  const { count } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/">
            <img src="/logo.png" alt="I Am An Artist" className="h-14 w-auto" />
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
            <Link to="/cart" className="relative text-muted-foreground hover:text-gold transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>
            {/* Elite badge */}
            <div className="flex items-center gap-1.5 bg-gold/10 border border-gold/25 text-gold text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer hover:bg-gold/20 transition-colors">
              <Crown className="w-4 h-4 fill-gold/50" />
              <span>Elite</span>
            </div>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin/artist-registry">
            <Button variant="ghost" size="default" className="text-muted-foreground hover:text-gold">
                      Artist Registry
                    </Button>
                  </Link>
                )}
                <Link to="/messages">
                  <Button variant="ghost" className="text-muted-foreground hover:text-gold gap-2">
                    <Mail className="w-5 h-5" /> Messages
                  </Button>
                </Link>
                <Link to="/wishlist">
    <Button variant="ghost" className="text-muted-foreground hover:text-gold gap-2">
                  <Bookmark className="w-5 h-5" /> Wishlist
                </Button>
                </Link>
                <Link to="/dashboard">
 <Button variant="ghost" className="text-muted-foreground hover:text-gold">
                      Dashboard
                    </Button>
                 </Link>
                 <Link to="/inventory">
 <Button variant="ghost" className="text-muted-foreground hover:text-gold gap-2">
                      <Package className="w-5 h-5" /> Inventory
                    </Button>
                 </Link>
                 <Link to="/exhibitions/my-exhibitions">
 <Button variant="ghost" className="text-muted-foreground hover:text-gold gap-2">
                      <Frame className="w-5 h-5" /> Galleries
                    </Button>
                 </Link>
                 <Link to="/rewards">
<Button variant="ghost" className="text-muted-foreground hover:text-gold gap-2">
                  <Trophy className="w-5 h-5" /> Rewards
                </Button>
                 </Link>
                <Button
                  size="default"
                  className="gold-gradient text-background font-semibold hover:opacity-90"
                  onClick={() => authService.logout().then(() => window.location.assign('/'))}
                >
                  Sign Out
                </Button>
              </>
            ) : (
                <Button
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
          <div className="md:hidden bg-card border-t border-border px-4 py-5 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`block text-base font-inter py-3 transition-colors hover:text-gold ${
                location.pathname === link.path ? 'text-gold' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border space-y-2">
            <Link to="/cart" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full gap-2 relative">
                <ShoppingCart className="w-5 h-5" /> Cart {count > 0 && `(${count})`}
              </Button>
            </Link>
            {user && (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin/artist-registry" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Artist Registry
                    </Button>
                  </Link>
                )}
                <Link to="/messages" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="w-5 h-5" /> Messages
                  </Button>
                </Link>
                <Link to="/wishlist" onClick={() => setOpen(false)}>
                   <Button variant="outline" className="w-full gap-2">
                     <Bookmark className="w-5 h-5" /> Wishlist
                   </Button>
                 </Link>
                 <Link to="/inventory" onClick={() => setOpen(false)}>
                   <Button variant="outline" className="w-full gap-2">
                     <Package className="w-5 h-5" /> Inventory
                   </Button>
                 </Link>
                 <Link to="/exhibitions/my-exhibitions" onClick={() => setOpen(false)}>
                   <Button variant="outline" className="w-full gap-2">
                     <Frame className="w-5 h-5" /> Galleries
                   </Button>
                 </Link>
                 <Link to="/rewards" onClick={() => setOpen(false)}>
                   <Button variant="outline" className="w-full gap-2">
                     <Trophy className="w-5 h-5" /> Rewards
                   </Button>
                 </Link>
              </>
            )}
            {user ? (
                  <Button className="gold-gradient text-background w-full" onClick={() => authService.logout().then(() => window.location.assign('/'))}>
                    Sign Out
                  </Button>
                ) : (
                  <Button className="gold-gradient text-background w-full" onClick={() => authService.redirectToLogin()}>
                    Join Gallery
                  </Button>
                )}
          </div>
        </div>
      )}
    </nav>
  );
}