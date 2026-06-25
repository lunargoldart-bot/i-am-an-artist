import { Link } from 'react-router-dom';
import { Palette, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background/50 border-t border-primary/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gold-gradient rounded-sm flex items-center justify-center">
                <Palette className="w-4 h-4 text-background" />
              </div>
              <span className="font-playfair font-bold text-lg">
                I Am An <span className="text-gold">Artist</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Empowering Zambian artists to showcase, sell, and thrive. 
              Celebrate creativity, culture, and expression across Zambia.
            </p>
            <div className="flex gap-4 mt-4">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="text-muted-foreground hover:text-gold transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-playfair font-semibold text-foreground mb-3">Explore</h4>
            <div className="space-y-2">
              {['Explore', 'Sell Art', 'Host Exhibition', 'Exhibitions', 'Rankings', 'News Feed'].map(item => (
                <div key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">{item}</a>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-playfair font-semibold text-foreground mb-3">For Artists</h4>
            <div className="space-y-2">
              {['Exhibitions', 'Rankings', 'Monetize', 'Courier Partners'].map(item => (
                <div key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">{item}</a>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-playfair font-semibold text-foreground mb-3">Marketplace</h4>
            <div className="space-y-2">
              {['Monetize', 'Courier Partners'].map(item => (
                <div key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">{item}</a>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-playfair font-semibold text-foreground mb-3">Links</h4>
            <div className="space-y-2">
              {['Terms', 'Contact'].map(item => (
                <div key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">{item}</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">© 2026 I Am An Artist. All rights reserved. Prices in Zambian Kwacha (ZMW).</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-gold transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-gold transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-gold transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}