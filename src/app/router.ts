export type RouterKind = 'browser' | 'hash'

export interface RouterRuntime {
  isNativePlatform: boolean
  protocol: string
}

export function getRouterKind(runtime: RouterRuntime): RouterKind {
  if (runtime.isNativePlatform || runtime.protocol === 'file:') {
    return 'hash'
  }

  return 'browser'
}

export function getCurrentRouterKind() {
  const capacitorBridge = window.Capacitor as
    | {
        isNativePlatform?: () => boolean
      }
    | undefined

  return getRouterKind({
    isNativePlatform: Boolean(capacitorBridge?.isNativePlatform?.()),
    protocol: window.location.protocol,
  })
}
