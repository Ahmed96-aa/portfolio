import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted faces. Every file is split by unicode-range, so Arabic files download only when
// Arabic glyphs render and the Ruqʿah accent face only on the Arabic page.
import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
// Arabic: Alexandria (one variable file) for headings and interface, IBM Plex Sans Arabic 400 for running text only.
import '@fontsource-variable/alexandria/wght.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/aref-ruqaa/arabic-700.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/print.css';
import { detectInitialLang, LanguageProvider } from './i18n/LanguageProvider';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider initialLang={detectInitialLang()}>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
