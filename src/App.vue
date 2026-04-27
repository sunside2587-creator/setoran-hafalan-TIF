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

    <button
      v-if="showMobileHamburger"
      type="button"
      class="mobile-hamburger-btn d-md-none"
      :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
      aria-label="Buka menu navigasi"
      @click="toggleMobileMenu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <Transition name="mobile-menu-fade">
      <div
        v-if="isAuthenticated && isMobileMenuOpen"
        class="mobile-menu-backdrop d-md-none"
        @click="closeMobileMenu"
      ></div>
    </Transition>

    <Transition name="mobile-menu-slide">
      <nav v-if="isAuthenticated && isMobileMenuOpen" class="mobile-drawer-nav d-md-none">
        <div class="mobile-drawer-header">
          <div>
            <p class="section-eyebrow mb-2">Menu</p>
            <h2 class="h5 fw-bold mb-0">Navigasi cepat</h2>
          </div>
          <button type="button" class="mobile-drawer-close" @click="closeMobileMenu" aria-label="Tutup menu">
            ×
          </button>
        </div>

        <div class="mobile-drawer-links">
          <RouterLink
            to="/"
            class="mobile-drawer-link"
            :class="{ active: route.name === 'dashboard' }"
            @click="closeMobileMenu"
          >
            Dashboard
          </RouterLink>
          <button class="mobile-drawer-link mobile-drawer-link-button" @click="handleLogout">
            Logout
          </button>
        </div>
      </nav>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { clearSession, useSessionState } from './services/session'

const router = useRouter()
const route = useRoute()
const session = useSessionState()
const isAuthenticated = computed(() => Boolean(session.value?.access_token))
const isMobileMenuOpen = ref(false)
const showMobileHamburger = ref(false)

let lastScrollY = 0

function syncHamburgerVisibility() {
  if (typeof window === 'undefined') {
    return
  }

  const isMobileViewport = window.innerWidth < 768

  if (!isAuthenticated.value || !isMobileViewport) {
    showMobileHamburger.value = false
    isMobileMenuOpen.value = false
    return
  }

  const currentScrollY = window.scrollY
  const scrollingUp = currentScrollY < lastScrollY
  showMobileHamburger.value = currentScrollY <= 24 || scrollingUp || isMobileMenuOpen.value
  lastScrollY = currentScrollY
}

function handleScroll() {
  syncHamburgerVisibility()
}

function handleResize() {
  syncHamburgerVisibility()
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  syncHamburgerVisibility()
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  syncHamburgerVisibility()
}

function handleLogout() {
  closeMobileMenu()
  clearSession()
  router.push({ name: 'login' })
}

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu()
  }
)

watch(isAuthenticated, () => {
  syncHamburgerVisibility()
})

onMounted(() => {
  lastScrollY = window.scrollY
  syncHamburgerVisibility()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})
</script>
