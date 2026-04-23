<template>
  <div class="app-shell">
    <header class="app-header sticky-top">
      <div class="container py-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
        <div>
          <RouterLink to="/" class="text-decoration-none app-brand">
            <h1 class="h4 mb-1 fw-bold brand-title">Setoran Hafalan</h1>
          </RouterLink>
          <p class="text-secondary mb-0 small">Panel dosen pembimbing akademik untuk monitoring dan validasi hafalan.</p>
        </div>
        <nav class="app-nav d-none d-md-flex align-items-center gap-2" v-if="isAuthenticated">
          <RouterLink to="/" class="btn btn-outline-primary">Dashboard</RouterLink>
          <button class="btn btn-primary" @click="handleLogout">Logout</button>
        </nav>
      </div>
    </header>

    <main class="container app-main py-4 py-lg-5">
      <RouterView />
    </main>

    <nav v-if="isAuthenticated" class="mobile-bottom-nav d-md-none">
      <RouterLink to="/" class="mobile-bottom-link" :class="{ active: route.name === 'dashboard' }">
        <span class="mobile-bottom-icon">DB</span>
        <span>Dashboard</span>
      </RouterLink>
      <button class="mobile-bottom-link border-0 bg-transparent" @click="handleLogout">
        <span class="mobile-bottom-icon">OUT</span>
        <span>Logout</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { clearSession, useSessionState } from './services/session'

const router = useRouter()
const route = useRoute()
const session = useSessionState()
const isAuthenticated = computed(() => Boolean(session.value?.access_token))

function handleLogout() {
  clearSession()
  router.push({ name: 'login' })
}
</script>
