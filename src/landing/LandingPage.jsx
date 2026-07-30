import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import WhyChooseUs from './components/WhyChooseUs';
import FeaturedArtwork from './components/FeaturedArtwork';
import Categories from './components/Categories';
import SellYourArt from './components/SellYourArt';
import LiveAuctions from './components/LiveAuctions';
import ArtistStory from './components/ArtistStory';
import Testimonials from './components/Testimonials';
import HowItWorks from './components/HowItWorks';
import Newsletter from './components/Newsletter';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';
import ChatBot from './components/ChatBot';
import './landing.css';

export default function LandingPage() {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="bg-cream text-text-dark font-inter overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustedBy />
      <WhyChooseUs />
      <FeaturedArtwork />
      <Categories />
      <SellYourArt />
      <LiveAuctions />
      <ArtistStory />
      <Testimonials />
      <HowItWorks />
      <Newsletter />
      <FinalCTA />
      <LandingFooter />
      <ChatBot />
    </div>
  );
}
