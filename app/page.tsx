import { getProjects } from '@/lib/content';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProjectsSection from '@/components/ProjectsSection';
import JournalSection from '@/components/JournalSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import Cursor from '@/components/Cursor';
import Preloader from '@/components/Preloader';
import MarqueeStrip from '@/components/MarqueeStrip';
import ScrollReveal from '@/components/ScrollReveal';
import BackToTop from '@/components/BackToTop';
import ScrollProgress from '@/components/ScrollProgress';

export default async function Home() {
  const projects = await getProjects();

  return (
    <>
      <Cursor />
      <Preloader />
      <ScrollProgress />
      <ScrollReveal />
      <Header />
      <main id="content">
        <Hero projects={projects} />
        <MarqueeStrip />
        <ProjectsSection projects={projects} />
        <JournalSection />
        <ContactSection />
      </main>
      <Footer />
      <Lightbox projects={projects} />
      <BackToTop />
    </>
  );
}
