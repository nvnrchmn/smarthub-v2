import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui', textAlign: 'center' }}>
          <p style={{ color: '#dc2626' }}>Terjadi kesalahan.</p>
          <button onClick={() => location.reload()} style={{ padding: '8px 16px', background: '#1B6B4A', color: '#fff', border: 'none', borderRadius: 8 }}>
            Muat ulang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
