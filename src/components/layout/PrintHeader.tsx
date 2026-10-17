import { profile, site } from '../../content/site';
import { useLanguage } from '../../i18n/LanguageProvider';
import { Monogram } from '../brand/Brand';

/** Only visible on paper: "Print this page" turns the site into a clean two-column résumé. */
export function PrintHeader() {
  const { lang } = useLanguage();
  return (
    <div className="print-only print-header" aria-hidden>
      <Monogram className="print-mono" />
      <div>
        <p className="print-name">{profile.name[lang]}</p>
        <p className="print-title">{profile.title[lang]}</p>
      </div>
      <ul className="print-contact">
        <li>{profile.location[lang]}</li>
        <li dir="ltr">{profile.email}</li>
        <li dir="ltr">{site.url.replace(/^https?:\/\//, '')}</li>
        {profile.socials.map((social) => (
          <li key={social.id} dir="ltr">
            {social.label.en}: {social.handle}
          </li>
        ))}
      </ul>
    </div>
  );
}
