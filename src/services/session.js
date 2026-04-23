import { ref } from 'vue'

const STORAGE_KEY = 'setoran-hafalan-session'
const sessionState = ref(readStoredSession())

function readStoredSession() {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function getSession() {
  return sessionState.value
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  sessionState.value = session
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
  sessionState.value = null
}

export function getAccessToken() {
  return getSession()?.access_token ?? ''
}

export function useSessionState() {
  return sessionState
}
