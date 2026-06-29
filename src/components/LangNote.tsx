/**
 * <LangNote /> — a yellow sticky note pinned to the corkboard that acts as the
 * language selector (EN / HU / SK), mapped onto the board with drei <Html>.
 */

import { Html } from '@react-three/drei'
import { LANGS, type Lang } from '../data/i18n'

interface LangNoteProps {
  lang: Lang
  onLang: (l: Lang) => void
}

export function LangNote({ lang, onLang }: LangNoteProps) {
  return (
    <group position={[0.13, 1.14, -1.125]} rotation={[0, 0, -0.04]}>
      <Html transform occlude={false} scale={0.04} zIndexRange={[3, 1]} pointerEvents="auto">
        <div className="lang-note">
          <span className="lang-pin" />
          <div className="lang-note-title">// language</div>
          <div className="lang-note-opts">
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={`lang-opt ${lang === l.code ? 'on' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onLang(l.code)
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </Html>
    </group>
  )
}
