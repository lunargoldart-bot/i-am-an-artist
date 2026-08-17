import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-background/50 border-t border-primary/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2">
            <div className="mb-4">
              <img src="/logo.png" alt="I Am An Artist" className="h-16 w-auto" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Empowering Zambian artists to showcase, sell, and thrive. 
              Celebrate creativity, culture, and expression across Zambia.
            </p>
            <div className="flex gap-5 mt-4">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors" aria-label="Social link">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-playfair font-semibold text-foreground mb-3">Explore</h4>
            <div className="space-y-2">
              <Link to="/explore" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Explore</Link>
              <Link to="/sell" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Sell Art</Link>
              <Link to="/exhibitions" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Exhibitions</Link>
              <Link to="/rankings" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Rankings</Link>
              <Link to="/news" className="block text-sm text-muted-foreground hover:text-primary transition-colors">News Feed</Link>
            </div>
          </div>

          <div>
            <h4 className="font-playfair font-semibold text-foreground mb-3">Marketplace</h4>
            <div className="space-y-2">
              <Link to="/marketplace" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Marketplace</Link>
              <Link to="/categories" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Categories</Link>
              <Link to="/gallery" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Galleries</Link>
              <Link to="/artists" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Artists</Link>
            </div>
          </div>

          <div>
            <h4 className="font-playfair font-semibold text-foreground mb-3">Legal</h4>
            <div className="space-y-2">
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Terms &amp; Conditions</Link>
              <Link to="/marketplace-policies" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Marketplace Policies</Link>
              <Link to="/delete-account" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Account Deletion</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">© {new Date().getFullYear()} I Am An Artist. All rights reserved. Prices in Zambian Kwacha (ZMW).</p>
          <div className="flex flex-wrap gap-5 justify-center">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link to="/marketplace-policies" className="text-sm text-muted-foreground hover:text-primary transition-colors">Policies</Link>
            <Link to="/delete-account" className="text-sm text-muted-foreground hover:text-primary transition-colors">Delete Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}