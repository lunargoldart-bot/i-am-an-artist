import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { footerLinks } from '../data/data';

const socials = [
  { icon: Instagram, href: '#' },
  { icon: Twitter, href: '#' },
  { icon: Facebook, href: '#' },
  { icon: Youtube, href: '#' },
];

const linkSections = [
  { title: 'Marketplace', key: 'marketplace' },
  { title: 'For Artists', key: 'forArtists' },
  { title: 'Company', key: 'company' },
  { title: 'Support', key: 'support' },
];

export default function LandingFooter() {
  return (
    <footer className="relative bg-card-white border-t border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="block mb-5">
              <img src="/logo.png" alt="I Am An Artist" className="h-14 w-auto" />
            </Link>
            <p className="text-text-muted text-sm font-inter leading-relaxed mb-6">
              Empowering artists worldwide to showcase, connect, and sell their creative work.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  className="w-9 h-9 rounded-full bg-cream flex items-center justify-center hover:bg-green-primary/10 transition-all text-text-muted hover:text-green-primary"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {linkSections.map(({ title, key }) => (
            <div key={key}>
              <h4 className="text-text-dark text-sm font-semibold font-inter mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {footerLinks[key].map((link) => {
                  const href =
                    link === 'Become an Artist' ? '/login'
                    : link === 'Categories' ? '/categories'
                    : link === 'Collections' ? '/gallery'
                    : link === 'Terms of Service' ? '/terms'
                    : link === 'Privacy Policy' ? '/privacy'
                    : link === 'Cookie Policy' ? '/privacy'
                    : link === 'Marketplace Policies' || link === 'Refund Policy' || link === 'Buyer Policy' || link === 'Seller Policy' ? '/marketplace-policies'
                    : '/explore';
                  return (
                    <li key={link}>
                      <Link
                        to={href}
                        className="text-text-muted text-sm font-inter hover:text-green-primary transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border-light py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted/50 text-xs font-inter">
            &copy; {new Date().getFullYear()} I Am An Artist. All rights reserved.
          </p>
          <p className="text-text-muted/40 text-xs font-inter">
            Crafted with <span className="text-green-primary">&hearts;</span> for artists everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
