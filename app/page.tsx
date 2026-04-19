import { getProjects } from '@/lib/content';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProjectsSection from '@/components/ProjectsSection';
import JournalSection from '@/components/JournalSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import PageWrapper from '@/components/PageWrapper';

export default async function Home() {
  const projects = await getProjects();

  return (
    <PageWrapper>
      <Header />
      <main id="content">
        <Hero projects={projects} />
        <ProjectsSection projects={projects} />
        <JournalSection />
        <ContactSection />
      </main>
      <Footer />
      <Lightbox projects={projects} />
    </PageWrapper>
  );
}
