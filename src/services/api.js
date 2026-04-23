import { clearSession, getAccessToken } from './session'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.tif.uin-suska.ac.id'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/setoran-dev/v1'
const API_KEY = import.meta.env.VITE_API_KEY || ''
const KC_URL = import.meta.env.VITE_KC_URL || 'https://id.tif.uin-suska.ac.id'
const KC_REALM = import.meta.env.VITE_KC_REALM || 'dev'
const KC_CLIENT_ID = import.meta.env.VITE_KC_CLIENT_ID || 'setoran-mobile-dev'
const KC_CLIENT_SECRET =
  import.meta.env.VITE_KC_CLIENT_SECRET || 'aqJp3xnXKudgC7RMOshEQP7ZoVKWzoSl'

function appendApiKey(url) {
  if (!API_KEY) {
    return url
  }

  url.searchParams.set('apikey', API_KEY)
  return url
}

function normalizeError(status, payload, fallbackMessage) {
  const message = payload?.message || payload?.error_description || fallbackMessage
  return new Error(message)
}

async function parseResponse(response) {
  const text = await response.text()
  let payload = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { message: text }
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearSession()
    }

    throw normalizeError(response.status, payload, 'Terjadi kesalahan saat memproses request.')
  }

  return payload
}

export async function login({ username, password }) {
  const url = new URL(`${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`)
  const form = new URLSearchParams({
    client_id: KC_CLIENT_ID,
    client_secret: KC_CLIENT_SECRET,
    grant_type: 'password',
    username,
    password,
    scope: 'openid profile email'
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form
  })

  return parseResponse(response)
}

export async function fetchUserInfo() {
  const response = await fetch(`${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/userinfo`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  })

  return parseResponse(response)
}

async function apiFetch(path, options = {}) {
  const url = appendApiKey(new URL(`${API_URL}${API_BASE_PATH}${path}`))
  const token = getAccessToken()
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  return parseResponse(response)
}

export function fetchPaSaya() {
  return apiFetch('/dosen/pa-saya')
}

export function fetchMahasiswaSetoran(nim) {
  return apiFetch(`/mahasiswa/setoran/${nim}`)
}

export function submitSetoran(nim, payload) {
  return apiFetch(`/mahasiswa/setoran/${nim}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function deleteSetoran(nim, payload) {
  return apiFetch(`/mahasiswa/setoran/${nim}`, {
    method: 'DELETE',
    body: JSON.stringify(payload)
  })
}
