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
    <footer className="relative bg-[#0D0D0D] border-t border-white/5">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="block mb-5">
              <img src="/logo.png" alt="I Am An Artist" className="w-16 h-16" />
            </Link>
            <p className="text-white/40 text-sm font-inter leading-relaxed mb-6">
              Empowering artists worldwide to showcase, connect, and sell their creative work.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold/20 transition-all text-white/40 hover:text-gold"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {linkSections.map(({ title, key }) => (
            <div key={key}>
              <h4 className="text-white text-sm font-semibold font-inter mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {footerLinks[key].map((link) => (
                  <li key={link}>
                    <Link
                      to={link === 'Become an Artist' ? '/login' : `/explore`}
                      className="text-white/40 text-sm font-inter hover:text-gold transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs font-inter">
            &copy; {new Date().getFullYear()} I Am An Artist. All rights reserved.
          </p>
          <p className="text-white/20 text-xs font-inter">
            Crafted with{' '}
            <span className="text-gold">&hearts;</span> for artists everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
