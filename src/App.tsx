import { useLanguage } from './i18n/LanguageProvider';
import { useDepth } from './motion/useDepth';
import { useSiteMotion } from './motion/useSiteMotion';
import { BrandDefs } from './components/brand/Brand';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PrintHeader } from './components/layout/PrintHeader';
import { Hero } from './components/hero/Hero';
import { Marquee } from './components/hero/Marquee';
import { Work } from './components/sections/Work';
import { Services } from './components/sections/Services';
import { Process } from './components/sections/Process';
import { Stack } from './components/sections/Stack';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';
import { CommandPalette } from './components/palette/CommandPalette';
import { Toaster } from './components/ui/Toaster';

export function App() {
  const { t } = useLanguage();
  useSiteMotion();
  useDepth();

  return (
    <>
      <BrandDefs />
      <a className="skip-link" href="#main">
        {t.a11y.skip}
      </a>
      <Header />
      <PrintHeader />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Marquee />
        <Work />
        <Services />
        <Process />
        <Stack />
        <About />
        <Contact />
      </main>
      <Footer />
      <CommandPalette />
      <Toaster />
    </>
  );
}
