<template>
  <div class="row justify-content-center">
    <div class="col-lg-6 col-xl-5">
      <div class="card border-0 shadow-lg login-card">
        <div class="card-body p-4 p-lg-5">
          <p class="text-uppercase text-primary fw-semibold small mb-2">Autentikasi</p>
          <h2 class="h3 fw-bold mb-3">Masuk ke panel setoran hafalan</h2>
          <p class="text-secondary mb-4">
            Gunakan akun dosen yang memiliki role <strong>dosen</strong> pada layanan autentikasi TIF.
          </p>

          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleSubmit" class="d-grid gap-3">
            <div>
              <label for="username" class="form-label">Username / Email</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-control form-control-lg"
                placeholder="Masukkan username atau email"
                required
              />
            </div>

            <div>
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control form-control-lg"
                placeholder="Masukkan password"
                required
              />
            </div>

            <button type="submit" class="btn btn-primary btn-lg" :disabled="isSubmitting">
              {{ isSubmitting ? 'Sedang masuk...' : 'Masuk' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchUserInfo, login } from '../services/api'
import { saveSession } from '../services/session'

const router = useRouter()
const route = useRoute()

const form = reactive({
  username: '',
  password: ''
})

const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const session = await login(form)
    saveSession(session)

    try {
      const profile = await fetchUserInfo()
      saveSession({ ...session, profile })
    } catch {
      saveSession(session)
    }

    router.push(route.query.redirect || { name: 'dashboard' })
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>
