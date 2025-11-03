const shouldUseDevProxy = import.meta.env.DEV && typeof import.meta.env.VITE_API_BASE_URL === 'undefined'
const resolvedBase = shouldUseDevProxy ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://91.99.58.184:8090')
export const API_BASE_URL = resolvedBase.replace(/\/$/, '')

export const AUTH = {
  scheme: (import.meta.env.VITE_AUTH_SCHEME || 'none').toLowerCase(),
  token: import.meta.env.VITE_AUTH_TOKEN || '',
  user: import.meta.env.VITE_BASIC_USER || '',
  pass: import.meta.env.VITE_BASIC_PASS || '',
}
