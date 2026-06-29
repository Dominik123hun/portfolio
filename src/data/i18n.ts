/**
 * ─────────────────────────────────────────────────────────────────────────
 *  i18n — English / Hungarian / Slovak.
 * ─────────────────────────────────────────────────────────────────────────
 *  UI strings + per-project category/description translations. Project titles
 *  stay as-is (brand names). Edit the strings here for real copy.
 */

import { projects } from './projects'

export type Lang = 'en' | 'hu' | 'sk'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hu', label: 'HU' },
  { code: 'sk', label: 'SK' },
]

export const ui: Record<Lang, Record<string, string>> = {
  en: { hint: 'click the monitor', back: 'back to the room', open: 'OPEN' },
  hu: { hint: 'kattints a monitorra', back: 'vissza a szobába', open: 'MEGNYIT' },
  sk: { hint: 'klikni na monitor', back: 'späť do miestnosti', open: 'OTVORIŤ' },
}

/** Count-aware "items" word (EN/SK pluralize; HU stays singular after a numeral). */
export function itemsLabel(n: number, lang: Lang): string {
  if (lang === 'hu') return 'ELEM'
  if (lang === 'sk') return n === 1 ? 'POLOŽKA' : n < 5 ? 'POLOŽKY' : 'POLOŽIEK'
  return n === 1 ? 'ITEM' : 'ITEMS'
}

type LangText = Record<Lang, string>
interface ProjectI18n {
  category: LangText
  description: LangText
}

/** Translations keyed by project id. */
export const projectI18n: Record<string, ProjectI18n> = {
  'penzion-jolan': {
    category: { en: 'Hotel Website', hu: 'Szálláshely weboldal', sk: 'Hotelový web' },
    description: {
      en: 'A clean, mobile-friendly website for a guesthouse — rooms, rates and contact with a quick path to booking.',
      hu: 'Letisztult, mobilbarát weboldal egy panziónak — szobák, árak és elérhetőség, gyors foglalási lehetőséggel.',
      sk: 'Čistá, mobilná webová stránka pre penzión — izby, ceny a kontakt s rýchlou cestou k rezervácii.',
    },
  },
}

/** Resolve a project's translated category/description with a graceful fallback. */
export function projectText(id: string, lang: Lang) {
  const t = projectI18n[id]
  const p = projects.find((x) => x.id === id)
  return {
    category: t?.category[lang] ?? p?.category ?? '',
    description: t?.description[lang] ?? p?.description ?? '',
  }
}
