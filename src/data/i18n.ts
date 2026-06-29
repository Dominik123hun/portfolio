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
  aurora: {
    category: { en: 'Marketing Site', hu: 'Marketing oldal', sk: 'Marketingový web' },
    description: {
      en: 'A cinematic brand site with scroll-led storytelling and buttery-smooth motion.',
      hu: 'Filmes márkaoldal görgetésvezérelt történetmeséléssel és vajsima animációval.',
      sk: 'Filmová značková stránka s rozprávaním riadeným skrolovaním a hladkou animáciou.',
    },
  },
  monogram: {
    category: { en: 'Webshop', hu: 'Webáruház', sk: 'E-shop' },
    description: {
      en: 'Headless commerce storefront — fast, conversion-tuned and fully responsive.',
      hu: 'Fejetlen kereskedelmi áruház — gyors, konverzióra hangolt és teljesen reszponzív.',
      sk: 'Headless e-shop — rýchly, ladený na konverzie a plne responzívny.',
    },
  },
  fieldkit: {
    category: { en: 'Web App', hu: 'Webalkalmazás', sk: 'Webová aplikácia' },
    description: {
      en: 'A realtime collaboration app with offline-first sync and a delightful UX.',
      hu: 'Valós idejű együttműködő alkalmazás offline-first szinkronnal és kellemes UX-szel.',
      sk: 'Aplikácia na spoluprácu v reálnom čase s offline-first synchronizáciou a skvelým UX.',
    },
  },
  pulse: {
    category: { en: 'Analytics Dashboard', hu: 'Analitikai irányítópult', sk: 'Analytický dashboard' },
    description: {
      en: 'An analytics dashboard turning billions of events into clear, fast insight.',
      hu: 'Analitikai irányítópult, amely milliárdnyi eseményt világos, gyors betekintéssé alakít.',
      sk: 'Analytický dashboard meniaci miliardy udalostí na jasný a rýchly prehľad.',
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
