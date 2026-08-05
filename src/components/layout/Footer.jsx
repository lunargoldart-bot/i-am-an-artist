import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

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
                <a key={i} href="#" className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-gold transition-colors">
                  <Icon className="w-5 h-5" />
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

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">© 2026 I Am An Artist. All rights reserved. Prices in Zambian Kwacha (ZMW).</p>
          <div className="flex flex-wrap gap-5 justify-center">
            <a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}