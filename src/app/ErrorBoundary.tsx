import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FreshKeep render failure', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-screen max-w-[430px] flex-col justify-center bg-[var(--app-bg)] px-6 text-center">
          <h1 className="text-2xl font-[800] text-[var(--text-primary)]">FreshKeep 需要重新打开</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[var(--text-secondary)]">
            当前页面遇到异常。你的本机数据仍保存在设备上，可以关闭后重新打开 App。
          </p>
          <button type="button" className="primary-chip mx-auto mt-5 justify-center" onClick={() => window.location.reload()}>
            重新打开
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
