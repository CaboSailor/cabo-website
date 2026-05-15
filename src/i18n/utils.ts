import en from './en.json';
import es from './es.json';

const translations: Record<string, any> = { en, es };

export function getLangFromUrl(url: URL): string {
  const [, lang] = url.pathname.split('/');
  if (lang === 'es') return 'es';
  return 'en';
}

export function t(lang: string, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value ?? key;
}

export function getLocalePath(lang: string, path: string): string {
  // Remove any existing /es/ prefix
  const cleanPath = path.replace(/^\/es(\/|$)/, '/');
  const withLocale = lang === 'es' ? `/es${cleanPath === '/' ? '' : cleanPath}` : cleanPath;
  // Normalize to trailing slash so internal links never trigger a 301 hop.
  const match = withLocale.match(/^([^?#]*)([?#].*)?$/);
  const pathPart = match?.[1] ?? withLocale;
  const rest = match?.[2] ?? '';
  if (pathPart === '/' || pathPart.endsWith('/')) return withLocale;
  if (/\.[a-z0-9]+$/i.test(pathPart)) return withLocale;
  return `${pathPart}/${rest}`;
}

export function getAlternateLang(lang: string): string {
  return lang === 'en' ? 'es' : 'en';
}
