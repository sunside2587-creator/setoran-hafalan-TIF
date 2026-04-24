<template>
  <div class="d-grid gap-4">
    <section class="hero-panel rounded-4 p-4 p-lg-5 text-white">
      <div class="row align-items-center g-4">
        <div class="col-lg-8">
          <p class="text-uppercase small fw-semibold mb-2 opacity-75">Dosen PA</p>
          <h2 class="display-6 fw-bold mb-3">Pantau progres setoran hafalan mahasiswa dalam satu panel.</h2>
          <p class="mb-0 opacity-75">
            Cari mahasiswa, lihat progres, lalu buka halaman detail untuk memvalidasi atau membatalkan setoran hafalan.
          </p>
        </div>
        <div class="col-lg-4">
          <BaseCard v-if="dosenInfo">
            <p class="text-uppercase text-secondary small fw-semibold mb-2">Profil Dosen</p>
            <h3 class="h5 fw-bold mb-1">{{ dosenInfo.nama }}</h3>
            <p class="mb-1 text-secondary">{{ dosenInfo.email }}</p>
            <p class="mb-0 text-secondary">NIP {{ dosenInfo.nip }}</p>
          </BaseCard>
        </div>
      </div>
    </section>

    <div v-if="errorMessage" class="alert alert-danger mb-0">{{ errorMessage }}</div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-secondary mb-0">Memuat data mahasiswa PA...</p>
    </div>

    <template v-else-if="dashboard">
      <section class="row g-3">
        <div class="col-md-6 col-xl-3">
          <StatCard
            label="Total Mahasiswa"
            :value="filteredMahasiswa.length"
            help="Jumlah data pada hasil pencarian"
            badge="PA"
            variant="primary"
          />
        </div>
        <div class="col-md-6 col-xl-3">
          <StatCard
            label="Rata-rata Progres"
            :value="`${averageProgress}%`"
            help="Rata-rata persentase setoran"
            badge="Progres"
            variant="success"
          />
        </div>
        <div class="col-md-6 col-xl-3">
          <StatCard
            label="Sudah Aktif Setor"
            :value="activeStudents"
            help="Mahasiswa dengan progres di atas 0%"
            badge="Aktif"
            variant="warning"
          />
        </div>
        <div class="col-md-6 col-xl-3">
          <StatCard
            label="Belum Setor"
            :value="inactiveStudents"
            help="Mahasiswa yang belum memiliki setoran"
            badge="Perlu Follow Up"
            variant="danger"
          />
        </div>
      </section>

      <section class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-lg-6">
              <label class="form-label">Cari mahasiswa</label>
              <input
                v-model="search"
                type="text"
                class="form-control"
                placeholder="Cari nama, NIM, atau email"
              />
            </div>
            <div class="col-md-6 col-lg-3">
              <label class="form-label">Filter angkatan</label>
              <select v-model="angkatan" class="form-select">
                <option value="">Semua angkatan</option>
                <option v-for="item in angkatanOptions" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div class="col-md-6 col-lg-3">
              <label class="form-label">Filter progres</label>
              <select v-model="progressFilter" class="form-select">
                <option value="">Semua progres</option>
                <option value="active">Sudah pernah setor</option>
                <option value="inactive">Belum pernah setor</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section class="row g-3">
        <div class="col-lg-4">
          <BaseCard>
            <h3 class="h5 fw-bold mb-3">Ringkasan angkatan</h3>
            <div class="d-grid gap-2">
              <div
                v-for="item in dashboard.info_mahasiswa_pa.ringkasan"
                :key="item.tahun"
                class="d-flex align-items-center justify-content-between rounded-3 px-3 py-2 bg-body-tertiary"
              >
                <span>Angkatan {{ item.tahun }}</span>
                <span class="badge text-bg-primary">{{ item.total }} mahasiswa</span>
              </div>
            </div>
          </BaseCard>
        </div>

        <div class="col-lg-8">
          <BaseCard>
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h3 class="h5 fw-bold mb-1">Daftar mahasiswa</h3>
                <p class="text-secondary mb-0">Klik detail untuk membuka progres setoran lengkap per mahasiswa.</p>
              </div>
            </div>

            <div v-if="!filteredMahasiswa.length">
              <EmptyState
                title="Data mahasiswa tidak ditemukan"
                description="Coba ubah kata kunci pencarian atau filter yang sedang aktif."
              />
            </div>

            <div v-else class="d-grid gap-3">
              <div class="d-md-none mahasiswa-mobile-list">
                <article v-for="mahasiswa in filteredMahasiswa" :key="mahasiswa.nim" class="mobile-info-card">
                  <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div class="min-w-0">
                      <div class="fw-semibold">{{ mahasiswa.nama }}</div>
                      <div class="text-secondary small">{{ mahasiswa.nim }}</div>
                      <div class="text-secondary small text-break">{{ mahasiswa.email }}</div>
                    </div>
                    <span class="badge text-bg-primary">Angkatan {{ mahasiswa.angkatan }}</span>
                  </div>

                  <div class="d-grid gap-2 small mb-3">
                    <div class="mobile-meta-row">
                      <span class="text-secondary">Semester</span>
                      <strong>{{ mahasiswa.semester }}</strong>
                    </div>
                    <div class="mobile-meta-row">
                      <span class="text-secondary">Terakhir setor</span>
                      <strong>{{ mahasiswa.info_setoran.terakhir_setor }}</strong>
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="d-flex justify-content-between small mb-1">
                      <span>{{ mahasiswa.info_setoran.total_sudah_setor }}/{{ mahasiswa.info_setoran.total_wajib_setor }}</span>
                      <span>{{ mahasiswa.info_setoran.persentase_progres_setor }}%</span>
                    </div>
                    <div class="progress" role="progressbar">
                      <div
                        class="progress-bar"
                        :class="`bg-${progressVariant(mahasiswa.info_setoran.persentase_progres_setor)}`"
                        :style="{ width: `${mahasiswa.info_setoran.persentase_progres_setor}%` }"
                      ></div>
                    </div>
                  </div>

                  <RouterLink
                    :to="{ name: 'student-detail', params: { nim: mahasiswa.nim } }"
                    class="btn btn-outline-primary w-100"
                  >
                    Detail mahasiswa
                  </RouterLink>
                </article>
              </div>

              <div class="table-responsive d-none d-md-block">
                <table class="table align-middle">
                  <thead>
                    <tr>
                      <th>Mahasiswa</th>
                      <th>Angkatan</th>
                      <th>Semester</th>
                      <th>Progres</th>
                      <th>Terakhir setor</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="mahasiswa in filteredMahasiswa" :key="mahasiswa.nim">
                      <td>
                        <div class="fw-semibold">{{ mahasiswa.nama }}</div>
                        <div class="text-secondary small">{{ mahasiswa.nim }}</div>
                        <div class="text-secondary small">{{ mahasiswa.email }}</div>
                      </td>
                      <td>{{ mahasiswa.angkatan }}</td>
                      <td>{{ mahasiswa.semester }}</td>
                      <td style="min-width: 180px;">
                        <div class="d-flex justify-content-between small mb-1">
                          <span>{{ mahasiswa.info_setoran.total_sudah_setor }}/{{ mahasiswa.info_setoran.total_wajib_setor }}</span>
                          <span>{{ mahasiswa.info_setoran.persentase_progres_setor }}%</span>
                        </div>
                        <div class="progress" role="progressbar">
                          <div
                            class="progress-bar"
                            :class="`bg-${progressVariant(mahasiswa.info_setoran.persentase_progres_setor)}`"
                            :style="{ width: `${mahasiswa.info_setoran.persentase_progres_setor}%` }"
                          ></div>
                        </div>
                      </td>
                      <td>{{ mahasiswa.info_setoran.terakhir_setor }}</td>
                      <td class="text-end">
                        <RouterLink
                          :to="{ name: 'student-detail', params: { nim: mahasiswa.nim } }"
                          class="btn btn-outline-primary btn-sm"
                        >
                          Detail
                        </RouterLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </BaseCard>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '../components/BaseCard.vue'
import EmptyState from '../components/EmptyState.vue'
import StatCard from '../components/StatCard.vue'
import { fetchPaSaya } from '../services/api'
import { progressVariant } from '../utils/format'

const isLoading = ref(true)
const errorMessage = ref('')
const dashboard = ref(null)
const search = ref('')
const angkatan = ref('')
const progressFilter = ref('')

const dosenInfo = computed(() => {
  if (!dashboard.value) {
    return null
  }

  return {
    nip: dashboard.value.nip,
    nama: dashboard.value.nama,
    email: dashboard.value.email
  }
})

const mahasiswaList = computed(() => dashboard.value?.info_mahasiswa_pa?.daftar_mahasiswa ?? [])

const angkatanOptions = computed(() => {
  const years = new Set(mahasiswaList.value.map((item) => item.angkatan))
  return [...years].sort((a, b) => Number(b) - Number(a))
})

const filteredMahasiswa = computed(() => {
  return mahasiswaList.value.filter((item) => {
    const keyword = search.value.trim().toLowerCase()
    const matchesKeyword =
      !keyword ||
      [item.nama, item.nim, item.email].some((field) => field.toLowerCase().includes(keyword))

    const matchesAngkatan = !angkatan.value || item.angkatan === angkatan.value
    const progress = item.info_setoran.persentase_progres_setor
    const matchesProgress =
      !progressFilter.value ||
      (progressFilter.value === 'active' && progress > 0) ||
      (progressFilter.value === 'inactive' && progress === 0)

    return matchesKeyword && matchesAngkatan && matchesProgress
  })
})

const averageProgress = computed(() => {
  if (!filteredMahasiswa.value.length) {
    return 0
  }

  const total = filteredMahasiswa.value.reduce(
    (sum, item) => sum + item.info_setoran.persentase_progres_setor,
    0
  )

  return Math.round(total / filteredMahasiswa.value.length)
})

const activeStudents = computed(
  () => filteredMahasiswa.value.filter((item) => item.info_setoran.persentase_progres_setor > 0).length
)

const inactiveStudents = computed(
  () => filteredMahasiswa.value.filter((item) => item.info_setoran.persentase_progres_setor === 0).length
)

async function loadDashboard() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchPaSaya()
    dashboard.value = response.data
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDashboard)
</script>
