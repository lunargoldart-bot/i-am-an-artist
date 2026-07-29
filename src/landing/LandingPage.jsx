import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import TrustedBy from './components/TrustedBy';
import Categories from './components/Categories';
import WhyChooseUs from './components/WhyChooseUs';
import FeaturedArtwork from './components/FeaturedArtwork';
import ArtistStory from './components/ArtistStory';
import LiveAuctions from './components/LiveAuctions';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
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
    <div className="bg-[#0D0D0D] text-white font-inter overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Categories />
      <WhyChooseUs />
      <FeaturedArtwork />
      <ArtistStory />
      <LiveAuctions />
      <HowItWorks />
      <Testimonials />
      <Newsletter />
      <FinalCTA />
      <LandingFooter />
      <ChatBot />
    </div>
  );
}
