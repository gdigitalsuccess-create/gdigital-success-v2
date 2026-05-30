'use client';
import { useEffect } from 'react';
import UrgencyBar from '@/components/UrgencyBar';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import ContactForm from '@/components/ContactForm';
import {
  TechnoStrip, About, Marches, Services, SolutionsIA,
  AgentIASpotlight, CarteNFCSpotlight, Pourquoi, Packs, Portfolio, CaseStudies, Temoignages,
  Offre, Process, Engagements, FAQ, WhatsAppFloat, Footer,
} from '@/components/Sections';

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    // Fallback : rendre visible tout élément déjà dans le viewport au chargement
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('visible');
      });
    }, 300);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <UrgencyBar />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <TechnoStrip />
        <About />
        <Marches />
        <Services />
        <SolutionsIA />
        <AgentIASpotlight />
        <CarteNFCSpotlight />
        <Pourquoi />
        <Packs />
        <Portfolio />
        <CaseStudies />
        <Temoignages />
        <Offre />
        <Process />
        <Engagements />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
