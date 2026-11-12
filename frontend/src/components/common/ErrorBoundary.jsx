import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[TaskNest ErrorBoundary] Caught render exception:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-body-md text-on-surface">
          <div className="max-w-md w-full bg-surface-container-low rounded-3xl p-8 shadow-xl border border-outline-variant/30 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-error-container text-on-error-container mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-2xl text-primary font-medium">Something went wrong</h2>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                An unexpected interface issue occurred. You can reload the page or return to the main dashboard.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-surface-container-highest rounded-xl text-[11px] font-mono text-on-surface-variant text-left overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="px-5 py-2.5 rounded-full bg-surface-container-high text-primary text-xs font-semibold hover:bg-surface-container-highest transition-all border border-outline-variant/30"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

