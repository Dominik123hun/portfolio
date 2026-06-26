/**
 * Graceful fallback if WebGL is unavailable or the scene throws on init,
 * so the page degrades to a readable message instead of a blank screen.
 */

import { Component, type ReactNode } from 'react'
import { theme } from '../theme'

interface Props {
  children: ReactNode
}
interface State {
  failed: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Scene failed to initialise:', error)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="fallback">
          <h1>{theme.studioName}</h1>
          <p>
            This experience needs a WebGL-capable browser. Try a recent version
            of Chrome, Edge, Firefox or Safari with hardware acceleration on.
          </p>
          <a className="btn btn-primary" href={`mailto:${theme.contactEmail}`}>
            {theme.ctaButton}
          </a>
        </div>
      )
    }
    return this.props.children
  }
}
