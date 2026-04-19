import { getProjects } from '@/lib/content';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProjectsSection from '@/components/ProjectsSection';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import Cursor from '@/components/Cursor';
import Preloader from '@/components/Preloader';
import ScrollProgress from '@/components/ScrollProgress';
import BackToTop from '@/components/BackToTop';

export default async function Home() {
  const projects = await getProjects();

  return (
    <>
      <Cursor />
      <Preloader />
      <ScrollProgress />
      <Header />
      <main id="content">
        <Hero projects={projects} />
        <ProjectsSection projects={projects} />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <Lightbox projects={projects} />
      <BackToTop />
    </>
  );
}
