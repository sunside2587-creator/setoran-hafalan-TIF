<template>
  <div class="student-detail-page d-grid gap-4">
    <section class="student-overview-card student-history-hero">
      <div class="student-overview-main">
        <RouterLink :to="{ name: 'student-detail', params: { nim } }" class="student-back-link">
          &larr; Kembali ke detail mahasiswa
        </RouterLink>
        <div class="student-overview-copy">
          <p class="section-eyebrow mb-2">Riwayat Aktivitas</p>
          <h2 class="h3 fw-bold mb-2">Aktivitas mahasiswa</h2>
          <p class="text-secondary mb-3">
            {{ studentInfo?.nama || 'Mahasiswa' }} - {{ studentInfo?.nim || nim }}
          </p>
          <div class="student-meta-chips">
            <span class="student-meta-chip">{{ totalLogs }} aktivitas</span>
            <span class="student-meta-chip">{{ validationCount }} validasi</span>
            <span class="student-meta-chip">{{ cancelCount }} pembatalan</span>
          </div>
        </div>
      </div>

      <div class="student-overview-actions">
        <button class="btn btn-outline-primary student-refresh-btn" @click="loadDetail" :disabled="isLoading">
          {{ isLoading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>
    </section>

    <div v-if="errorMessage" class="alert alert-danger mb-0">{{ errorMessage }}</div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-secondary mb-0">Memuat riwayat aktivitas mahasiswa...</p>
    </div>

    <template v-else-if="detail">
      <section class="row g-3 align-items-start">
        <div class="col-xl-4">
          <BaseCard>
            <div class="section-heading">
              <div>
                <p class="section-eyebrow mb-2">Ringkasan</p>
                <h3 class="h5 fw-bold mb-1">Info mahasiswa</h3>
                <p class="text-secondary mb-0">Informasi singkat mahasiswa yang sedang Anda lihat.</p>
              </div>
            </div>

            <div class="d-grid gap-3">
              <div class="summary-category-card">
                <div class="mobile-meta-row">
                  <span class="text-secondary">Nama</span>
                  <strong class="text-end">{{ studentInfo.nama }}</strong>
                </div>
              </div>
              <div class="summary-category-card">
                <div class="mobile-meta-row">
                  <span class="text-secondary">NIM</span>
                  <strong class="text-end">{{ studentInfo.nim }}</strong>
                </div>
              </div>
              <div class="summary-category-card">
                <div class="mobile-meta-row">
                  <span class="text-secondary">Dosen PA</span>
                  <strong class="text-end">{{ studentInfo.dosen_pa?.nama || '-' }}</strong>
                </div>
              </div>
              <RouterLink :to="{ name: 'student-detail', params: { nim } }" class="btn btn-outline-primary w-100">
                Kembali ke halaman detail
              </RouterLink>
            </div>
          </BaseCard>
        </div>

        <div class="col-xl-8">
          <BaseCard>
            <div class="section-heading">
              <div>
                <p class="section-eyebrow mb-2">Activity Feed</p>
                <h3 class="h5 fw-bold mb-1">Daftar aktivitas</h3>
                <p class="text-secondary mb-0">Menampilkan riwayat validasi dan pembatalan secara ringkas.</p>
              </div>
            </div>

            <div v-if="!logs.length">
              <EmptyState
                title="Belum ada aktivitas"
                description="Riwayat validasi dan pembatalan akan muncul di halaman ini."
              />
            </div>

            <div v-else class="timeline history-timeline simple-history-list">
              <article v-for="log in logs" :key="log.id" class="timeline-item simple-history-item">
                <div class="simple-history-head">
                  <span :class="`badge text-bg-${log.aksi === 'VALIDASI' ? 'success' : 'danger'}`">
                    {{ log.aksi }}
                  </span>
                  <span class="text-secondary small">{{ formatDateTime(log.timestamp) }}</span>
                </div>
                <p class="fw-semibold simple-history-text">{{ log.keterangan }}</p>
                <p class="text-secondary mb-0">{{ log.dosen_yang_mengesahkan?.nama || '-' }}</p>
              </article>
            </div>
          </BaseCard>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BaseCard from '../components/BaseCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { fetchMahasiswaSetoran } from '../services/api'
import { formatDateTime } from '../utils/format'

const route = useRoute()
const nim = computed(() => route.params.nim)

const isLoading = ref(true)
const errorMessage = ref('')
const detail = ref(null)

const studentInfo = computed(() => detail.value?.data?.info ?? {})
const logs = computed(() => detail.value?.data?.setoran?.log ?? [])
const totalLogs = computed(() => logs.value.length)
const validationCount = computed(() => logs.value.filter((item) => item.aksi === 'VALIDASI').length)
const cancelCount = computed(() => logs.value.filter((item) => item.aksi === 'BATALKAN').length)

async function loadDetail() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    detail.value = await fetchMahasiswaSetoran(nim.value)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDetail)
</script>
