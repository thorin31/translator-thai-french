export const LANGUAGES = {
  de: { name: 'Allemand',  flag: '🇩🇪' },
  en: { name: 'Anglais',   flag: '🇬🇧' },
  es: { name: 'Espagnol',  flag: '🇪🇸' },
  fr: { name: 'Français',  flag: '🇫🇷' },
  lo: { name: 'Laotien',   flag: '🇱🇦' },
  ru: { name: 'Russe',     flag: '🇷🇺' },
  th: { name: 'Thaï',      flag: '🇹🇭' },
}

export const LANGUAGE_LIST = Object.entries(LANGUAGES)
  .map(([code, info]) => ({ code, ...info }))
  .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
